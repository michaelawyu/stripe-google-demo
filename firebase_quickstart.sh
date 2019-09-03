# User-provided variables
export STRIPE_API_KEY="YOUR-STRIPE-API-KEY"
export STRIPE_FULFILLMENT_ENDPOINT_SECRET="YOUR-FULFILLMENT-ENDPOINT-SECRET"
export STRIPE_CANCELLATION_ENDPOINT_SECRET="YOUR-CANCELLATION-ENDPOINT-SECRET"
export SENDGRID_API_KEY="YOUR-SENDGRID-API-KEY"
export FIREBASE_PROJECT="YOUR-FIREBASE-PROJECT"
# Pre-defined variables
export PAYMENT_DOWNSTREAM_TOPIC="processedPayments"
export EMAIL_DOWNSTREAM_TOPIC="sentEmailNotifications"
export FULFILLMENT_DLQ="fulfillmentDLQ"
export CANCELLATION_DLQ="cancellationDLQ"
export EMAIL_DLQ="failedEmailNotifications"
export BIGQUERY_DATASET="example"
export BIGQUERY_DATASET_LOCATION="US"
# Set environment variables for Firebase functions
firebase functions:config:set pubsub.fulfillment_downstream_topic=$PAYMENT_DOWNSTREAM_TOPIC \
                              pubsub.cancellation_downstream_topic=$PAYMENT_DOWNSTREAM_TOPIC \
                              pubsub.email_downstream_topic=$EMAIL_DOWNSTREAM_TOPIC \
                              pubsub.fulfillment_dlq=$FULFILLMENT_DLQ \
                              pubsub.cancellation_dlq=$CANCELLATION_DLQ \
                              pubsub.email_dlq=$EMAIL_DLQ \
                              bigquery.dataset=$BIGQUERY_DATASET \
                              stripe.api_key=$STRIPE_API_KEY \
                              stripe.fulfillment_endpoint_secret=$STRIPE_FULFILLMENT_ENDPOINT_SECRET \
                              stripe.cancellation_endpoint_secret=$STRIPE_CANCELLATION_ENDPOINT_SECRET \
                              sendgrid.api_key=$SENDGRID_API_KEY \
                              --project $FIREBASE_PROJECT
# Create the Pub/Sub topics
gcloud pubsub topics create $PAYMENT_DOWNSTREAM_TOPIC
gcloud pubsub topics create $EMAIL_DOWNSTREAM_TOPIC
gcloud pubsub topics create $FULFILLMENT_DLQ
gcloud pubsub topics create $CANCELLATION_DLQ
gcloud pubsub topics create $EMAIL_DLQ
# Create the BigQuery dataset and tables
bq --location=$BIGQUERY_DATASET_LOCATION --disable_ssl_validation mk --dataset $BIGQUERY_DATASET
bq --disable_ssl_validation mk --table $BIGQUERY_DATASET.orders orderId:STRING,timestamp:TIMESTAMP,status:STRING
# Deploy the Firebase functions
cd firebase/functions && npm install && firebase deploy --only functions --project $FIREBASE_PROJECT
