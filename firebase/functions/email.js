// The Firebase function for delivering receipts via SendGrid.
'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');
const sendgrid = require('@sendgrid/mail');
const utils = require('./utils');

const EVENT_COLLECTION = 'processedPaymentEvents';
const EVENT_MAX_AGE = 60000;
const UPSTREAM_TOPIC = functions.config().pubsub.fulfillment_downstream_topic;
const DOWNSTREAM_TOPIC = functions.config().pubsub.email_downstream_topic;
const DLQ = functions.config().pubsub.email_dlq;
const SENDGRID_API_KEY = functions.config().sendgrid.api_key;

let firestoreClient = admin.firestore();
let pubSubClient = new PubSub();
sendgrid.setApiKey(SENDGRID_API_KEY);

module.exports = functions.pubsub.topic(UPSTREAM_TOPIC).onPublish(async (message, context) => {
  let eventId = context.eventId;
  let eventTimestamp = context.timestamp;
  let eventTraceParent;
  let order;
  let paymentIntent;
  let paymentIntentError;
  try {
    eventTraceParent = message.json.traceparent;
    order = message.json.order;
    paymentIntent = message.json.paymentIntent;
    paymentIntentError = message.json.paymentIntentError;
  } catch (err) {
    let errorMessage = `INVALID_MESSAGE_FORMAT: ${message.json}`;
    utils.handleError(errorMessage, pubSubClient, DLQ, message.json);
    return;
  }

  try {
    utils.checkForExpiredEvents('RFC3339', eventTimestamp, EVENT_MAX_AGE);
    await utils.guaranteeExactlyOnceDelivery(firestoreClient,
      EVENT_COLLECTION, eventId, eventTimestamp, message.json);
  } catch (err) {
    let errorMessage = `FAILED_CHECKS: ${err}`;
    utils.handleError(errorMessage, pubSubClient, DLQ, message.json);
    return;
  }

  let emailMessage = utils.prepareEmailMessage(order, paymentIntent, paymentIntentError);
  let sendMessageResponse;
  try {
    sendMessageResponse = await sendgrid.send(emailMessage);
  } catch (err) {
    let errorMessage = `SENDGRID_ERROR: ${err}`;
    utils.handleError(errorMessage, pubSubClient, DLQ, message.json);
    return;
  }

  const emailNotificationSentEvent = utils.prepareEmailNotificationSentEvent(eventTraceParent, order, sendMessageResponse);
  await utils.publishEvent(pubSubClient, DOWNSTREAM_TOPIC, emailNotificationSentEvent);
});
