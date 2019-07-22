const stripe = require('stripe');
const uuidv4 = require('uuid/v4');

exports.extractStripeEvent = function (req, endpointSecret) {
  let stripeSignature = req.headers['stripe-signature'];
  let reqBody = req.rawBody;

  let event;
  try {
    event = stripe.webhooks.constructEvent(reqBody, stripeSignature, endpointSecret);
  } catch (err) {
    let errorMessage = `FAILED_TO_CONSTRUCT_EVENT: ${err}`;
    console.log(errorMessage);
    throw Error(errorMessage);
  }

  return event;
};

async function publishEvent (pubSubClient, topic, event) {
  const data = Buffer.from(JSON.stringify(event));
  return pubSubClient.topic(topic).publish(data);
}

exports.publishEvent = publishEvent;

exports.getOrder = async function (firestoreClient, orderId) {
  let ref = firestoreClient.collection('orders').doc(orderId);
  let order = await ref.get();
  if (!order.exists) {
    let errorMessage = `ORDER_NOT_FOUND: ${orderId}`;
    console.log(errorMessage);
    throw Error(errorMessage);
  } else {
    return order.data();
  }
};

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
      throw Error(`Timestamp format is invalid.`);
  }
  if (age > maxAge) {
    throw Error(`Event has expired.`);
  }
};

exports.guaranteeExactlyOnceDelivery = async function (firestoreClient, collection, eventId, eventTimestamp, event) {
  let idempotenceKey = uuidv4();

  let ref = firestoreClient.collection(collection).doc(eventId);
  return firestoreClient.runTransaction(async t => {
    let doc = await t.get(ref);
    if (!doc.exists) {
      await t.set(ref, Object.assign(event, { timestamp: eventTimestamp, idempotenceKey: idempotenceKey }));
      return idempotenceKey;
    } else {
      return doc.data().idempotenceKey;
    }
  });
};

exports.handleError = async function (message, pubSubClient, topic, event) {
  console.log(message);
  await publishEvent(pubSubClient, topic, event);
};

exports.preparePaymentProcessedEvent = function (eventTraceParent, order, paymentIntent, paymentIntentError) {
  let paymentProcessedEvent = {
    traceparent: eventTraceParent,
    order: order,
    paymentIntent: paymentIntent,
    paymentIntentError: paymentIntentError
  };
  return paymentProcessedEvent;
};

exports.prepareEmailMessage = function (order, paymentIntent, paymentIntentError) {
  let message = {};
  message.from = 'no-reply@example.com';
  message.to = paymentIntent.receipt_email;
  if (paymentIntentError && Object.keys(paymentIntentError).length !== 0) {
    message.subject = 'We have a payment problem';
    if (paymentIntentError.type === 'StripeCardError') {
      message.text = `We cannot process your order ${order.id} at this moment as your card is declined: ${paymentIntentError.message}`;
    } else {
      message.text = `We cannot process your order ${order.id} at this moment. Please contact customer service.`;
    }
  } else {
    message.subject = 'Your order will arrive soon';
    message.text = `We are processing your order ${order.id} now.`;
  }
  return message;
};

exports.prepareEmailNotificationSentEvent = function (eventTraceParent, order, sendMessageResponse) {
  let emailNotificationSentEvent = {
    traceParent: eventTraceParent,
    order: order,
    sendMessageResponse: sendMessageResponse
  };
  return emailNotificationSentEvent;
};

exports.extractSalesData = function (timestamp, order) {
  let salesData = [];
  let products = order.products;
  products.forEach(product => {
    salesData.push({
      productId: product.id,
      productName: product.name,
      count: product.count,
      price: product.price,
      timestamp: timestamp
    });
  });
  return salesData;
};

exports.extractPaymentData = function (timestamp, order, paymentIntent, paymentIntentError) {
  let paymentData = {
    orderId: order.id,
    paymentIntentId: paymentIntent.id,
    status: 'SUCCESS',
    timestamp: timestamp
  };
  if (paymentIntentError && Object.keys(paymentIntentError).length !== 0) {
    paymentData.status = 'FAILED';
  }
  return [paymentData];
};

exports.extractInvoiceData = function (timestamp, order, sendMessageResponse) {
  let invoiceData = {
    orderId: order.id,
    status: 'INVOICE NOT SENT',
    timestamp: timestamp
  };
  if (sendMessageResponse && Object.keys(sendMessageResponse).length !== 0) {
    invoiceData.status = 'INVOICE SENT';
  }
  return [invoiceData];
};
