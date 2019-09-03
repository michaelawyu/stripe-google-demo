// A collection of utility functions for this demo.
const stripe = require('stripe');

const exampleEvents = require('example_events');

// Extracts a Stripe webhook event from the incoming HTTP request.
exports.extractStripeEvent = function (req, endpointSecret) {
  const stripeSignature = req.headers['stripe-signature'];
  const reqBody = req.rawBody;

  let event;
  try {
    event = stripe.webhooks.constructEvent(reqBody, stripeSignature, endpointSecret);
  } catch (err) {
    throw Error(`FAILED_TO_CONSTRUCT_EVENT: ${err}`);
  }

  return event;
};

// Publishes an event to a Pub/Sub topic.
exports.publishEvent = async function publishEvent (pubSubClient, topic, event) {
  const data = Buffer.from(event.toJSON());
  return pubSubClient.topic(topic).publish(data);
};

// Checks if an event has expired.
exports.checkForExpiredEvents = function (format, eventTimestamp, maxAge) {
  let age;
  switch (format) {
    case 'RFC3339':
      age = Date.now() - Date.parse(eventTimestamp);
      break;
    case 'POSIX':
      age = Date.now() - eventTimestamp * 1000;
      break;
    default:
      throw Error('INVALID_TIMESTAMP');
  }
  if (age > maxAge) {
    throw Error('EXPIRED_EVENT');
  }
};

// Checks if an event is duplicated.
exports.guaranteeExactlyOnceDelivery = async function (firestoreClient, collection, eventId, context) {
  const ref = firestoreClient.collection(collection).doc(eventId);
  return firestoreClient.runTransaction(async t => {
    const doc = await t.get(ref);
    if (!doc.exists) {
      await t.set(ref, { context: context });
    } else {
      throw Error('DUPLICATE_EVENT');
    }
  });
};

// Prepares an email message.
exports.prepareEmailMessage = function (orderId, email, paymentErrType, paymentErrMessage) {
  const message = {};
  message.from = 'no-reply@example.com';
  message.to = email;

  switch (paymentErrType) {
    case 'CARD_ERROR':
      message.subject = 'We have a payment problem';
      message.text = `We cannot process your order ${orderId} at this moment as your card is declined: ${paymentErrMessage}`;
      break;
    case 'INTERNAL':
      message.subject = 'We have a payment problem';
      message.text = `We cannot process your order ${orderId} at this moment. Please contact customer service.`;
      break;
    default:
      message.subject = 'Your order will arrive soon';
      message.text = `We are processing your order ${orderId} now.`;
  }

  return message;
};

// Creates stripeWebhookEventRejected events.
exports.createStripeWebhookEventRejectedEvent = function (source, headers, body, errMessage) {
  const stripeWebhookEventRejectedData = new exampleEvents.StripeWebhookEventRejected.DataClasses.Data({
    header: headers,
    body: body,
    errMessage: errMessage
  });

  const stripeWebhookEventRejected = new exampleEvents.StripeWebhookEventRejected.Event({
    source: source,
    data: stripeWebhookEventRejectedData
  });

  return stripeWebhookEventRejected;
};

// Creates orderProcessed events.
exports.createOrderProcessedEvent = function (source, orderId, email, paymentErrType, paymentErrMessage) {
  const orderProcessedData = new exampleEvents.OrderProcessed.DataClasses.Data({
    orderId: orderId,
    email: email,
    paymentErrType: paymentErrType,
    paymentErrMessage: paymentErrMessage
  });

  const orderProcessed = new exampleEvents.OrderProcessed.Event({
    source: source,
    data: orderProcessedData
  });
  return orderProcessed;
};

// Creates emailSent events.
exports.createEmailSentEvent = function (orderId, email) {
  const emailSentData = new exampleEvents.EmailSent.DataClasses.Data({
    orderId: orderId,
    email: email
  });

  const emailSent = new exampleEvents.EmailSent.Event({
    data: emailSentData
  });
  return emailSent;
};

// Extracts orderId, time, and status from an orderprocessed event.
exports.extractOrderData = function (orderProcessed) {
  const orderEntry = [];

  const orderId = orderProcessed.data.orderId;
  const timestamp = orderProcessed.time;
  let orderStatus;
  switch (orderProcessed.source) {
    case 'functions/fulfillment':
      orderStatus = 'fulfilled';
      break;
    case 'functions/cancellation':
      orderStatus = 'cancelled';
      break;
    default:
      orderStatus = 'unknown';
      break;
  }

  orderEntry.push({
    orderId: orderId,
    timestamp: timestamp,
    status: orderStatus
  });

  return orderEntry;
};
