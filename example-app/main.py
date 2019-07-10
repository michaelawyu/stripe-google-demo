import os

from flask import Flask, render_template, request
from google.cloud import pubsub_v1
import random

from products import products
import utils

GCLOUD_PROJECT_ID = os.environ.get('GOOGLE_CLOUD_PROJECT')
PUBSUB_TOPIC = 'incomingPayments'

app = Flask(__name__)
publisher = pubsub_v1.PublisherClient()

topic_path = publisher.topic_path(GCLOUD_PROJECT_ID, PUBSUB_TOPIC)

@app.route('/')
def display_payment_form():
    product = products[random.randint(0, 5)]
    count = random.randint(1, 10)
    return render_template('checkout.html', product=product, count=count, total=product['price']*count)

@app.route('/charge', methods=['POST'])
def charge():
    product_id = request.form['productId']
    count = request.form['count']
    stripe_token = request.form['stripeToken']
    incoming_payment_event = utils.prepare_incoming_payment_event(product_id, count, stripe_token, products)
    utils.publish_incoming_payment_event(publisher, topic_path, incoming_payment_event)
    return render_template('charge.html')

if __name__ == '__main__':
    app.debug = True
    app.run(port=8080)