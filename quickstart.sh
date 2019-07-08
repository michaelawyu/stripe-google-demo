# User-provided variables
export STRIPE_API_KEY="YOUR-STRIPE-API-KEY"
export SENDGRID_API_KEY="YOUR-SENDGRID-API-KEY"
# Pre-defined variables
export PAYMENT_UPSTREAM_TOPIC="incomingPayments"
export PAYMENT_DOWNSTREAM_TOPIC="processedPayments"
export EMAIL_DOWNSTREAM_TOPIC="sentEmailNotifications"
export PAYMENT_DLQ="failedPayments"
export EMAIL_DLQ="failedEmailNotifications"
export BIGQUERY_DATASET="example"
export BIGQUERY_DATASET_LOCATION="US"
# Set environment variables for Firebase functions
firebase functions:config:set pubsub.payment_upstream_topic=$PAYMENT_UPSTREAM_TOPIC \
                              pubsub.payment_downstream_topic=$PAYMENT_DOWNSTREAM_TOPIC \
                              pubsub.email_downstream_topic=$EMAIL_DOWNSTREAM_TOPIC \
                              pubsub.payment_dlq=$PAYMENT_DLQ \
                              pubsub.email_dlq=$EMAIL_DLQ \
                              bigquery.dataset=$BIGQUERY_DATASET \
                              stripe.api_key=$STRIPE_API_KEY \
                              sendgrid.api_key=$SENDGRID_API_KEY
# Create the Pub/Sub topics
gcloud pubsub topics create $PAYMENT_UPSTREAM_TOPIC
gcloud pubsub topics create $PAYMENT_DOWNSTREAM_TOPIC
gcloud pubsub topics create $EMAIL_DOWNSTREAM_TOPIC
gcloud pubsub topics create $PAYMENT_DLQ
gcloud pubsub topics create $EMAIL_DLQ
# Create the BigQuery dataset and tables
bq --location=$BIGQUERY_DATASET_LOCATION mk --dataset $BIGQUERY_DATASET
bq mk --table $BIGQUERY_DATASET.sales productId:STRING,productName:String,count:FLOAT,price:FLOAT,timestamp:TIMESTAMP
bq mk --table $BIGQUERY_DATASET.payments orderId:STRING,chargeId:STRING,status:STRING,timestamp:TIMESTAMP
bq mk --table $BIGQUERY_DATASET.invoices orderId:STRING,status:STRING,timestamp:TIMESTAMP
# Deploy the Firebase functions
cd firebase/functions && firebase deploy --only functions
