# User-provided variables
export STRIPE_API_KEY="YOUR-STRIPE-API-KEY"
export STRIPE_FULFILLMENT_ENDPOINT_SECRET="YOUR-FULFILLMENT-ENDPOINT-SECRET"
export STRIPE_CANCELLATION_ENDPOINT_SECRET="YOUR-CANCELLATION-ENDPOINT-SECRET"
export SENDGRID_API_KEY="YOUR-SENDGRID-API-KEY"
# Pre-defined variables
export FULFILLMENT_DOWNSTREAM_TOPIC="processedOrders"
export CANCELLATION_DOWNSTREAM_TOPIC="processedOrders"
export EMAIL_DOWNSTREAM_TOPIC="sentEmails"
export FULFILLMENT_DLQ="fulfillmentDLQ"
export CANCELLATION_DLQ="cancellationDLQ"
export EMAIL_DLQ="emailDLQ"
export BIGQUERY_DATASET="example"
export BIGQUERY_DATASET_LOCATION="US"
# Create the Pub/Sub topics
gcloud pubsub topics create $FULFILLMENT_DOWNSTREAM_TOPIC
gcloud pubsub topics create $EMAIL_DOWNSTREAM_TOPIC
gcloud pubsub topics create $FULFILLMENT_DLQ
gcloud pubsub topics create $CANCELLATION_DLQ
gcloud pubsub topics create $EMAIL_DLQ
# Create the BigQuery dataset and tables
bq --location=$BIGQUERY_DATASET_LOCATION --disable_ssl_validation mk --dataset $BIGQUERY_DATASET
bq --disable_ssl_validation mk --table $BIGQUERY_DATASET.orders orderId:STRING,timestamp:TIMESTAMP,status:STRING
# Deploy the Cloud Functions
cd gcp
gcloud functions deploy fulfillment --runtime nodejs8 --trigger-http --set-env-vars=DOWNSTREAM_TOPIC=$FULFILLMENT_DOWNSTREAM_TOPIC,DLQ=$FULFILLMENT_DLQ,ENDPOINT_SECRET=$STRIPE_FULFILLMENT_ENDPOINT_SECRET
gcloud functions deploy cancellation --runtime nodejs8 --trigger-http --set-env-vars=DOWNSTREAM_TOPIC=$CANCELLATION_DOWNSTREAM_TOPIC,DLQ=$CANCELLATION_DLQ,ENDPOINT_SECRET=$STRIPE_CANCELLATION_ENDPOINT_SECRET
gcloud functions deploy email --runtime nodejs8 --trigger-topic=$FULFILLMENT_DOWNSTREAM_TOPIC --set-env-vars=DOWNSTREAM_TOPIC=$EMAIL_DOWNSTREAM_TOPIC,DLQ=$EMAIL_DLQ,SENDGRID_API_KEY=$SENDGRID_API_KEY
gcloud functions deploy stats --runtime nodejs8 --trigger-topic=$FULFILLMENT_DOWNSTREAM_TOPIC --set-env-vars=BIGQUERY_DATASET=$BIGQUERY_DATASET
