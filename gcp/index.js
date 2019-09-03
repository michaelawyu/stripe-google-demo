'use strict';

// A Cloud Function for fulfilling orders.
// See gcp/fulfillment.js for the source code.
exports.fulfillment = require('./fulfillment');

// A Cloud Function for rejecting orders.
// See firebase/functions.cancallation.js for the source code.
exports.cancellation = require('./cancellation');

// A Cloud Function for delivering receipts via SendGrid.
// See gcp/email.js for the source code.
exports.email = require('./email');

// Cloud Functions for streaming event data to Google BigQuery.
// See gcp/stats.js for the source code.
exports.stats = require('./stats');
