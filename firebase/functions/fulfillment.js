// The Firebase function for processing fulfilled payment intents via Stripe.
'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');
const utils = require('./utils');

const EVENT_COLLECTION = 'fulfilledPaymentIntents';
const EVENT_MAX_AGE = 60000;
const DOWNSTREAM_TOPIC = functions.config().pubsub.fulfillment_downstream_topic;
const DLQ = functions.config().pubsub.fulfillment_dlq;
const ENDPOINT_SECRET = functions.config().stripe.fulfillment_endpoint_secret;

let firestoreClient = admin.firestore();
let pubSubClient = new PubSub();

function fulfillOrder (order) {}

module.exports = functions.https.onRequest(async (req, res) => {
  let event;
  try {
    event = utils.extractStripeEvent(req, ENDPOINT_SECRET);
  } catch (err) {
    res.status(400).end();
  }

  if (event.type !== 'payment_intent.succeeded') {
    console.log(`INVALID_STRIPE_EVENT: ${event}`);
    res.status(400).end();
  }
  let paymentIntent = event.data.object;

  try {
    utils.checkForExpiredEvents('POSIX', paymentIntent.created, EVENT_MAX_AGE);
    await utils.guaranteeExactlyOnceDelivery(firestoreClient, EVENT_COLLECTION, paymentIntent.id, paymentIntent.created, {});
  } catch (err) {
    let errorMessage = `FAILED_CHECKS: ${err}`;
    utils.handleError(errorMessage, pubSubClient, DLQ, { id: paymentIntent.id });
    res.status(200).end();
  }

  let orderId = paymentIntent.metadata.order_id;
  let order = await utils.getOrder(firestoreClient, orderId);
  try {
    fulfillOrder(order);
  } catch (err) {
    let errorMessage = `FAILED_TO_FULFILL_ORDER: ${err}`;
    await utils.handleError(errorMessage, pubSubClient, DLQ, order);
  }

  const paymentProcessedEvent = utils.preparePaymentProcessedEvent('', order, paymentIntent, {});
  await utils.publishEvent(pubSubClient, DOWNSTREAM_TOPIC, paymentProcessedEvent);
  res.status(200).end();
});
