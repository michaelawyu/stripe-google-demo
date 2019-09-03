'use strict';

const admin = require('firebase-admin');

admin.initializeApp();

// A Firebase Function for fulfilling orders.
// See firebase/functions/fulfillment.js for the source code.
exports.fulfillment = require('./fulfillment');

// A Firebase Function for rejecting orders.
// See firebase/functions.cancallation.js for the source code.
exports.cancellation = require('./cancellation');

// A Firebase Function for delivering receipts via SendGrid.
// See firebase/functions/email.js for the source code.
exports.email = require('./email');

// Firebase Functions for streaming event data to Google BigQuery.
// See firebase/functions/stats.js for the source code.
exports.stats = require('./stats');
