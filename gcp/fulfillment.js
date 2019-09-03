// The Cloud Function for processing successful payment intents via Stripe.
'use strict';

const Firestore = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');
const utils = require('./utils');

// EVENT_COLLECTION: The Firestore collection for persisting incoming events.
// EVENT_MAX_AGE: The TTL of events.
// DOWNSTREAM_TOPIC: The Cloud Pub/Sub topic for successfully fulfilled orders.
// DLQ: The DLQ for orders that cannot be fulfilled.
// ENDPOINT_SECRET: A secret for verifying Stripe webhook events.
const EVENT_COLLECTION = 'fulfilledPaymentIntents';
const EVENT_MAX_AGE = 60000;
const DOWNSTREAM_TOPIC = process.env.DOWNSTREAM_TOPIC;
const DLQ = process.env.DLQ;
const ENDPOINT_SECRET = process.env.ENDPOINT_SECRET;

const SOURCE = 'functions/fulfillment';

const firestoreClient = new Firestore();
const pubSubClient = new PubSub();

// A dummy empty function for fulfilling orders.
function fulfillOrder (order) {}

// A wrapper for rejecting dead-lettered events.
module.exports = async function (req, res) {
  try {
    return await fulfill(req, res);
  } catch (err) {
    console.log(err.message);
    // Stripe webhook events are delivered via HTTP. Here it is wrapped in
    // a Cloud Event and rejected to DLQ via Cloud Pub/Sub.
    const stripeWebhookEventRejected = utils.createStripeWebhookEventRejectedEvent(SOURCE, req.headers, req.body, err.message);
    await utils.publishEvent(pubSubClient, DLQ, stripeWebhookEventRejected);
    res.status(400).end();
  }
};

async function fulfill (req, res) {
  // Extracts the Stripe webhook event from the incoming HTTP request.
  const event = utils.extractStripeEvent(req, ENDPOINT_SECRET);

  // Checks if the event is a payment_intent.succeeded Stripe webhook event.
  if (event.type !== 'payment_intent.succeeded') {
    throw Error(`INVALID_STRIPE_EVENT: ${event}`);
  }
  const paymentIntent = event.data.object;

  // Rejects stale events.
  utils.checkForExpiredEvents('POSIX', paymentIntent.created, EVENT_MAX_AGE);
  // Checks if the event is duplicated.
  await utils.guaranteeExactlyOnceDelivery(firestoreClient, EVENT_COLLECTION, paymentIntent.id, JSON.stringify(paymentIntent));

  // Fulfills the order.
  const orderId = paymentIntent.metadata.order_id;
  try {
    fulfillOrder(orderId);
  } catch (err) {
    throw Error(`FULFILLMENT_FAILED: ${err.message}`);
  }

  // Emits an orderprocessed event.
  const email = paymentIntent.receipt_email;

  console.log(`Successfully fulfilled order ${orderId}`);
  const orderProcessed = utils.createOrderProcessedEvent('functions/fulfillment', orderId, email, 'NONE', '');
  await utils.publishEvent(pubSubClient, DOWNSTREAM_TOPIC, orderProcessed);
  res.status(200).end();
}
