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
    firebase login
    ```

    Follow the instructions on the screen to continue.

7. Authenticate Cloud SDK:

    ```
    gcloud config set project YOUR-PROJECT-ID
    ```

    Replace `YOUR-PROJECT-ID` with the ID of your Firebase project.

Click **Next** to continue.

## Deploy the functions

1. Open `quickstart.sh` from the file explorer on the left side.

2. Edit the first two lines of the file. Replace `YOUR-STRIPE-API-KEY` and
`YOUR-SENDGRID-API-KEY` with values of your own.

3. Run the following command to deploy the functions:

    ```
    ./quickstart.sh
    ```

    It may take a few minutes to complete the operations.

Click **Next** to continue.

## Try it out

Run the command below to start an example to incorporates the payment process:

```
cd ~/stripe-google-demo
python main.py
```

Click the Web Preview Buttion (<walkthrough-web-preview-icon></walkthrough-web-preview-icon>)
on the top right of the screen to open the web app.

You may use the VISA card `4242 4242 4242 4242` to make the purchase. Pick any
future date as the expiration date, any 3-digit number as the CVC, and any
5-digit number as the zip code. You should see a confirmation email in your
inbox soon.

Click **Next** to continue.

## Congratulations

<walkthrough-conclusion-trophy></walkthrough-conclusion-trophy>

You have deployed the demo.

The service also features integration with Google BigQuery and Google Data
Studio to help you monitor, analyze, and visualize
the workflow; to set it up, see <walkthrough-editor-open-file filepath="stripe-google-demo/data-analytics.md" text="Set up Google BigQuery and Google Data Studio"></walkthrough-editor-open-file>.

