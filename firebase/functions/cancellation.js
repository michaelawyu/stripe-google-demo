// The Firebase function for processing failed payment intents via Stripe.
'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');
const utils = require('./utils');

// EVENT_COLLECTION: The Firestore collection for persisting incoming events.
// EVENT_MAX_AGE: The TTL of events.
// DOWNSTREAM_TOPIC: The Cloud Pub/Sub topic for unfulfilled orders.
// DLQ: The DLQ for orders that cannot be fulfilled.
// ENDPOINT_SECRET: A secret for verifying Stripe webhook events.
const EVENT_COLLECTION = 'failedPaymentIntents';
const EVENT_MAX_AGE = 60000;
const DOWNSTREAM_TOPIC = functions.config().pubsub.cancellation_downstream_topic;
const DLQ = functions.config().pubsub.cancellation_dlq;
const ENDPOINT_SECRET = functions.config().stripe.cancellation_endpoint_secret;

const SOURCE = 'functions/cancellation';

const firestoreClient = admin.firestore();
const pubSubClient = new PubSub();

// A dummy empty function for rejecting orders.
function rejectOrder (order) {}

// A wrapper for rejecting dead-lettered events.
module.exports = functions.https.onRequest(async (req, res) => {
  try {
    return await cancel(req, res);
  } catch (err) {
    console.log(err.message);
    // Stripe webhook events are delivered via HTTP. Here it is wrapped in
    // a Cloud Event and rejected to DLQ via Cloud Pub/Sub.
    const stripeWebhookEventRejected = utils.createStripeWebhookEventRejectedEvent(SOURCE, req.headers, req.body, err.message);
    await utils.publishEvent(pubSubClient, DLQ, stripeWebhookEventRejected);
    res.status(400).end();
    return Promise.resolve();
  }
});

async function cancel (req, res) {
  // Extracts the Stripe webhook event from the incoming HTTP request.
  const event = utils.extractStripeEvent(req, ENDPOINT_SECRET);

  // Checks if the event is a payment_intent.payment_failed Stripe webhook event.
  if (event.type !== 'payment_intent.payment_failed') {
    throw Error(`INVALID_STRIPE_EVENT: ${event}`);
  }
  const paymentIntent = event.data.object;

  // Rejects stale events.
  utils.checkForExpiredEvents('POSIX', paymentIntent.created, EVENT_MAX_AGE);
  // Checks if the event is duplicated.
  await utils.guaranteeExactlyOnceDelivery(firestoreClient, EVENT_COLLECTION, paymentIntent.id, JSON.stringify(paymentIntent));

  // Rejects the order.
  const orderId = paymentIntent.metadata.order_id;
  try {
    rejectOrder(orderId);
  } catch (err) {
    throw Error(`REJECTION_FAILED: ${err.message}`);
  }

  const email = paymentIntent.receipt_email;
  // Reveals the error to the customer only when it is an card error.
  let paymentErrType;
  let paymentErrMessage;
  if (paymentIntent.last_payment_error && Object.keys(paymentIntent.last_payment_error).length !== 0) {
    if (paymentIntent.last_payment_error.type === 'card_error') {
      paymentErrType = 'CARD_ERROR';
    } else {
      paymentErrType = 'INTERNAL';
    }
    paymentErrMessage = paymentIntent.last_payment_error.message;
  }
  // Emits an orderprocessed event.
  const orderProcessed = utils.createOrderProcessedEvent('functions/cancellation', orderId, email, paymentErrType, paymentErrMessage);
  await utils.publishEvent(pubSubClient, DOWNSTREAM_TOPIC, orderProcessed);
  res.status(200).end();
}
