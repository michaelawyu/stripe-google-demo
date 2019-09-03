// The Cloud Function for delivering confirmation emails via SendGrid.
'use strict';

const Firestore = require('@google-cloud/firestore');
const { PubSub } = require('@google-cloud/pubsub');
const sendgrid = require('@sendgrid/mail');
const utils = require('./utils');
const exampleEvents = require('example_events');

// EVENT_COLLECTION: The Firestore collection for persisting incoming events.
// EVENT_MAX_AGE: The TTL of events.
// DOWNSTREAM_TOPIC: The Cloud Pub/Sub topic for unfulfilled orders.
// DLQ: The DLQ for orders that cannot be fulfilled.
// ENDPOINT_SECRET: A secret for verifying Stripe webhook events.
const EVENT_COLLECTION = 'processedPaymentEvents';
const EVENT_MAX_AGE = 60000;
const DOWNSTREAM_TOPIC = process.env.DOWNSTREAM_TOPIC;
const DLQ = process.env.DLQ;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

const firestoreClient = new Firestore();
const pubSubClient = new PubSub();
sendgrid.setApiKey(SENDGRID_API_KEY);

// A wrapper for rejecting dead-lettered events.
module.exports = async function (pubSubEvent, context) {
  try {
    return await sendEmail(pubSubEvent, context);
  } catch (err) {
    console.log(err.message);
    // Stripe webhook events are delivered via HTTP. Here it is wrapped in
    // a Cloud Event and rejected to DLQ via Cloud Pub/Sub.
    const data = Buffer.from(pubSubEvent.data, 'base64').toString();
    const orderProcessed = exampleEvents.OrderProcessed.Event.fromJSON(data);
    await utils.publishEvent(pubSubClient, DLQ, orderProcessed);
  }
};

async function sendEmail (pubSubEvent, context) {
  const data = Buffer.from(pubSubEvent.data, 'base64').toString();
  const orderProcessed = exampleEvents.OrderProcessed.Event.fromJSON(data);

  // Rejects stale events.
  utils.checkForExpiredEvents('RFC3339', orderProcessed.time, EVENT_MAX_AGE);
  // Checks if the event is duplicated.
  await utils.guaranteeExactlyOnceDelivery(firestoreClient, EVENT_COLLECTION, orderProcessed.id, data);

  const orderId = orderProcessed.data.orderId;
  const email = orderProcessed.data.email;
  const paymentErrType = orderProcessed.data.paymenterrtype;
  const paymentErrMessage = orderProcessed.data.paymenterrmessage;
  const emailMessage = utils.prepareEmailMessage(orderId, email, paymentErrType, paymentErrMessage);

  try {
    await sendgrid.send(emailMessage);
  } catch (err) {
    throw Error(`SENDGRID_ERROR: ${err.message}`);
  }

  // Emits an emailSent event.
  const emailSent = utils.createEmailSentEvent(orderId, email);
  await utils.publishEvent(pubSubClient, DOWNSTREAM_TOPIC, emailSent);
}
