const uuidv4 = require('uuid/v4');

async function publishEvent (pubSubClient, topic, event) {
  const data = Buffer.from(JSON.stringify(event));
  return pubSubClient.topic(topic).publish(data);
}

exports.publishEvent = publishEvent;

exports.checkForExpiredEvents = function (eventTimestamp, maxAge) {
  let age = Date.now() - Date.parse(eventTimestamp);
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

exports.preparePaymentProcessedEvent = function (eventTraceParent, order, charge, chargeErr) {
  let paymentProcessedEvent = {
    traceparent: eventTraceParent,
    order: order,
    charge: charge,
    chargeErr: chargeErr
  };
  return paymentProcessedEvent;
};

exports.prepareEmailMessage = function (order, charge, chargeErr) {
  let message = {};
  message.from = 'no-reply@example.com';
  message.to = order.email;
  if (chargeErr && Object.keys(chargeErr) !== 0) {
    message.subject = 'Your order cannot be processed';
    if (chargeErr.type === 'StripeCardError') {
      message.text = `We cannot process your order ${order.id} at this moment as your card is declined: ${chargeErr.message}`;
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

exports.extractPaymentData = function (timestamp, order, charge, chargeErr) {
  let paymentData = {
    orderId: order.id,
    chargeId: charge.id,
    status: 'SUCCESS',
    timestamp: timestamp
  };
  if (chargeErr && Object.keys(chargeErr) !== 0) {
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
  if (sendMessageResponse && Object.keys(sendMessageResponse) !== 0) {
    invoiceData.status = 'INVOICE SENT';
  }
  return [invoiceData];
};
