// The Firebase function for streaming data to Google BigQuery.
'use strict';

const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('firebase-functions');
const utils = require('./utils');

const UPSTREAM_TOPIC = functions.config().pubsub.email_downstream_topic;
const BIGQUERY_DATASET = functions.config().bigquery.dataset;
const INVOICE_TABLE = 'invoices';

let bigQueryClient = new BigQuery();

module.exports = functions.pubsub.topic(UPSTREAM_TOPIC).onPublish(async (message, context) => {
  let eventTimestamp = context.timestamp;
  let order;
  let sendMessageResponse;
  try {
    order = message.json.order;
    sendMessageResponse = message.json.sendMessageResponse;
  } catch (err) {
    console.log(`INVALID_MESSAGE_FORMAT: ${message.json}.`);
    return;
  }

  let invoiceData = utils.extractInvoiceData(eventTimestamp, order, sendMessageResponse);
  await bigQueryClient
    .dataset(BIGQUERY_DATASET)
    .table(INVOICE_TABLE)
    .insert(invoiceData);
});
