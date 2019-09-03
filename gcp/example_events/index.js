module.exports = {
  OrderProcessed: {
    Event: require('./OrderProcessed/OrderProcessed'),
    DataClasses: {
      Data: require('./OrderProcessed/Data'),
    }
  },
  EmailSent: {
    Event: require('./EmailSent/EmailSent'),
    DataClasses: {
      Data: require('./EmailSent/Data'),
    }
  },
  StripeWebhookEventRejected: {
    Event: require('./StripeWebhookEventRejected/StripeWebhookEventRejected'),
    DataClasses: {
      Data: require('./StripeWebhookEventRejected/Data'),
    }
  },
};
