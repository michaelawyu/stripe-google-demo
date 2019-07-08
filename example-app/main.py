import os

from flask import Flask, render_template, request
from google.cloud import pubsub_v1

import utils

GCLOUD_PROJECT_ID = os.environ.get('GOOGLE_CLOUD_PROJECT')
PUBSUB_TOPIC = os.environ.get('PUBSUB_TOPIC')

app = Flask(__name__)
publisher = pubsub_v1.PublisherClient()

topic_path = publisher.topic_path(GCLOUD_PROJECT_ID, PUBSUB_TOPIC)

@app.route('/')
def display_payment_form():
    return render_template('index.html')

@app.route('/charge', methods=['POST'])
def charge():
    stripe_token = request.form['stripeToken']
    print(stripe_token)
    incoming_payment_event = utils.prepare_incoming_payment_event(stripe_token)
    utils.publish_incoming_payment_event(publisher, topic_path, incoming_payment_event)
    return "Your order is being processed."

if __name__ == '__main__':
    app.debug = True
    app.run(port=8080)