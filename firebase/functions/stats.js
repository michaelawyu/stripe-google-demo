// The Firebase function for streaming data to Google BigQuery.
'use strict';

const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('firebase-functions');
const utils = require('./utils');
const exampleEvents = require('example_events');

const UPSTREAM_TOPIC = functions.config().pubsub.fulfillment_downstream_topic;
const BIGQUERY_DATASET = functions.config().bigquery.dataset;
const ORDER_TABLE = 'orders';

const bigQueryClient = new BigQuery();

module.exports = functions.pubsub.topic(UPSTREAM_TOPIC).onPublish(async (message, context) => {
  const orderProcessed = exampleEvents.Orderprocessed.Event.fromJSON(message.json);

  const orderData = utils.extractOrderData(orderProcessed);
  await bigQueryClient
    .dataset(BIGQUERY_DATASET)
    .table(ORDER_TABLE)
    .insert(orderData);
});
