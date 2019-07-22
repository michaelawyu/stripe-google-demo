// The Firebase function for processing the payments via Stripe.
'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');
const stripe = require('stripe');
const utils = require('./utils');

const EVENT_COLLECTION = 'incomingPaymentEvents';
const EVENT_MAX_AGE = 60000;
const UPSTREAM_TOPIC = functions.config().pubsub.payment_upstream_topic;
const DOWNSTREAM_TOPIC = functions.config().pubsub.payment_downstream_topic;
const DLQ = functions.config().pubsub.payment_dlq;
const STRIPE_API_KEY = functions.config().stripe.api_key;

let firestoreClient = admin.firestore();
let pubSubClient = new PubSub();
let stripeClient = stripe(STRIPE_API_KEY);

module.exports = functions.pubsub.topic(UPSTREAM_TOPIC).onPublish(async (message, context) => {
  let eventId = context.eventId;
  let eventTimestamp = context.timestamp;
  let eventTraceParent;
  let order;
  let stripeToken;
  try {
    eventTraceParent = message.json.traceparent;
    order = message.json.order;
    stripeToken = message.json.token;
  } catch (err) {
    let errorMessage = `INVALID_MESSAGE_FORMAT: ${message.json}`;
    utils.handleError(errorMessage, pubSubClient, DLQ, message.json);
    return;
  }

  let idempotenceKey;
  try {
    utils.checkForExpiredEvents('RFC3339', eventTimestamp, EVENT_MAX_AGE);
    idempotenceKey = await utils.guaranteeExactlyOnceDelivery(firestoreClient,
      EVENT_COLLECTION, eventId, eventTimestamp, message.json);
  } catch (err) {
    let errorMessage = `FAILED_CHECKS: ${err}`;
    utils.handleError(errorMessage, pubSubClient, DLQ, message.json);
    return;
  }

  let charge;
  let chargeErr;
  try {
    charge = await stripeClient.charges.create({
      amount: order.amount,
      currency: order.currency,
      description: `Charge for order ${order.id} from ${order.email}`,
      source: stripeToken
    }, {
      idempotency_key: idempotenceKey
    });
  } catch (err) {
    chargeErr = {};
    switch (err.type) {
      case 'StripeCardError':
        chargeErr.type = err.type;
        chargeErr.message = err.message;
        break;
      default:
        chargeErr.type = 'INTERNAL';
        let errorMessage = `STRIPE_ERROR: ${err}`;
        utils.handleError(errorMessage, pubSubClient, DLQ, message.json);
        break;
    }
  }

  const paymentProcessedEvent = utils.preparePaymentProcessedEvent(eventTraceParent, order, charge, chargeErr);
  await utils.publishEvent(pubSubClient, DOWNSTREAM_TOPIC, paymentProcessedEvent);
});
