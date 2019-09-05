# Stripe + Firebase/Google Cloud Platform Demo

## Getting started

This tutorial will help you deploy the [Stripe + Firebase/GCP demo](https://github.com/michaelawyu/stripe-google-demo)
to your Firebase/GCP project.

The demo showcases an event-driven service that processes payments and
receipt delivery automatically with **virtually unlimited scalability,
auto retry, and data analytics integration**.
It uses the following products and services:

* [Stripe](https://stripe.com/)
* [Firebase Functions (Cloud Functions for Firebase)](https://firebase.google.com/docs/functions)
* [Cloud Firestore](https://firebase.google.com/docs/firestore/)
* [Cloud Pub/Sub](https://cloud.google.com/pubsub)
* [Google BigQuery](https://cloud.google.com/bigquery)
* [Google Data Studio](https://datastudio.google.com/)
* [SendGrid](https://sendgrid.com)

It takes approximately 10 minutes to complete the tutorial.

Click **Start** to continue.

## Setup

1. [Set up Stripe](https://stripe.com/). In the [Stripe Dashboard](https://dashboard.stripe.com),
get your **test API keys**. Write down both the publishable key and the secret key.

2. Create a new Firebase project.

    Open the [Firebase Console](https://console.firebase.google.com/). Click
    **Add Project**, then follow the instructions on the screen to create
    a Firebase project.

    Your Firebase project, by default, uses the Spark plan, which limits
    outgoing network traffic. As a result, you may not be able to connect to
    third-party APIs such as Stripe. To upgrade your plan, click the **Settings**
    button on the left navigation menu in the Firebase console, and click
    **Usage and Billing**. Switch to the **Details & Settings** tab, and
    click **Modify plan**. Pick a plan other than Spark, such as the pay-as-you-go
    Blaze plan. Your usage of this demo should be eligible for the Firebase/GCP
    Free Tier regardless of the plan you choose.

3. Enable Cloud Firestore.

    In the Firebase Console, select **Database** from the left navigation lane,
    the click **Create Database**. Choose a mode and a location for your
    database. It is recommended that you use **Locked Mode** and **us-central**
    for this tutorial. Click **Done**.

4. [Enable the APIs](https://pantheon.corp.google.com/flows/enableapi?apiid=pubsub,bigquery).

    Cloud Console will ask for your project ID. Choose the same one as
    your Firebase project created earlier in the list.

5. [Set up SendGrid](https://sendgrid.com).

6. Authenticate the Firebase CLI:

    ```
    firebase login --no-localhost
    ```

    Follow the instructions on the screen to continue.

7. Authenticate Cloud SDK:

    ```
    gcloud config set project YOUR-PROJECT-ID
    ```

    Replace `YOUR-PROJECT-ID` with the ID of your Firebase project.

Click **Next** to continue.

## Set up Stripe Webhooks

1. Open [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks).

2. Click **Add Endpoint**.

    Type in `https://us-central1-[YOUR-FIREBASE-PROJECT].cloudfunctions.net/fulfillment`
    as the the endpoint URL. Replace `[YOUR-FIREBASE-PROJECT]` with the ID of your
    Firebase project. Use the lastest API version, and add
    `payment_intent.succeeded` as the event to send. Click **Add Endpoint**.

3. In the endpoint details page, click **Click to Reveal** to reveal to the signing secret.
Write down the secret. This is the secret for the fulfillment endpoint.

4. Return to the Webhooks page. Repeat the steps above and add another endpoint.

    Type in `https://us-central1-[YOUR-FIREBASE-PROJECT].cloudfunctions.net/cancellation`
    as the the endpoint URL. Replace `[YOUR-FIREBASE-PROJECT]` with the ID of your
    Firebase project. Use the lastest API version, and add
    `payment_intent.payment_failed` as the event to send. Click **Add Endpoint**.

    Similarly, reveal the signing secret of the new endpoint. This is the
    secret for the cancellation endpoint.

## Deploy the functions

1. Open `quickstart.sh` from the file explorer on the left side.

2. Edit the first two lines of the file. Replace `YOUR-STRIPE-API-KEY`,
`YOUR-FIREBASE-PROJECT`, `YOUR-SENDGRID-API-KEY`, `YOUR-FULFILLMENT-ENDPOINT-SECRET`
and `YOUR-CANCELLATION-ENDPOINT-SECRET` with values of your own.

3. Run the following command to deploy the functions:

    ```
    ./firebase_quickstart.sh
    ```

    It may take a few minutes to complete the operations.

Click **Next** to continue.

## Try it out

First, open `app/static/stripe.js` in the file explorer. Replace
`YOUR-API-KEY` with the value of your Stripe **public** API key.

Run the command below to start the example app that incorporates the payment process:

```
cd ~/stripe-google-demo/example-app
pip3 install -r requirements.txt
python3 main.py
```

If you are running this tutorial in Cloud Shell, click the Web Preview Buttion (<walkthrough-web-preview-icon></walkthrough-web-preview-icon>)
on the top right of the screen, then click **Preview on Port 8080** to open
the web app. Otherwise, open your browser and go to `localhost:8080`.

You may use the VISA card `4242 4242 4242 4242` to make the purchase. Pick any
future date as the expiration date, any 3-digit number as the CVC, and any
5-digit number as the zip code. You should see a confirmation email in your
inbox soon. The charge should also be visible in the Stripe dashboard.

Click **Next** to continue.

## Congratulations

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You have deployed the demo.
