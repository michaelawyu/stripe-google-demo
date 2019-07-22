// The Firebase function for streaming data to Google BigQuery.
'use strict';

const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('firebase-functions');
const utils = require('./utils');

const UPSTREAM_TOPIC = functions.config().pubsub.fulfillment_downstream_topic;
const BIGQUERY_DATASET = functions.config().bigquery.dataset;
const SALES_TABLE = `sales`;
const PAYMENT_TABLE = `payments`;

let bigQueryClient = new BigQuery();

module.exports = functions.pubsub.topic(UPSTREAM_TOPIC).onPublish(async (message, context) => {
  let eventTimestamp = context.timestamp;
  let order;
  let paymentIntent;
  let paymentIntentError;
  try {
    order = message.json.order;
    paymentIntent = message.json.paymentIntent;
    paymentIntentError = message.json.paymentIntentError;
  } catch (err) {
    console.log(`INVALID_MESSAGE_FORMAT: ${message.json}.`);
    return;
  }

  let salesData = utils.extractSalesData(eventTimestamp, order);
  await bigQueryClient
    .dataset(BIGQUERY_DATASET)
    .table(SALES_TABLE)
    .insert(salesData);

  let paymentData = utils.extractPaymentData(eventTimestamp, order, paymentIntent, paymentIntentError);
  await bigQueryClient
    .dataset(BIGQUERY_DATASET)
    .table(PAYMENT_TABLE)
    .insert(paymentData);
});
