// The Cloud Function for streaming orderProcessed events to Google BigQuery.
'use strict';

const { BigQuery } = require('@google-cloud/bigquery');
const utils = require('./utils');
const exampleEvents = require('example_events');

const BIGQUERY_DATASET = process.env.BIGQUERY_DATASET;
const ORDER_TABLE = 'orders';

const bigQueryClient = new BigQuery();

module.exports = async function (pubSubEvent, context) {
  const data = Buffer.from(pubSubEvent.data, 'base64').toString();
  const orderProcessed = exampleEvents.Orderprocessed.Event.fromJSON(data);

  const orderData = utils.extractOrderData(orderProcessed);
  await bigQueryClient
    .dataset(BIGQUERY_DATASET)
    .table(ORDER_TABLE)
    .insert(orderData);
};
