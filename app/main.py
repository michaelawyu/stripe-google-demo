import os

from flask import Flask, render_template, request
import random

from products import products
import utils

GCLOUD_PROJECT_ID = os.environ.get('GOOGLE_CLOUD_PROJECT')

app = Flask(__name__)

@app.route('/')
def display_payment_form():
    product_id = random.randint(0, 5)
    count = random.randint(1, 10)
    order = utils.prepare_order(product_id, count, products)
    client_secret = utils.create_stripe_payment_intent(order)
    return render_template('checkout.html', order=order, client_secret=client_secret)

@app.route('/paymentSucceeded')
def charge():
    return render_template('charge.html')

if __name__ == '__main__':
    app.debug = True
    app.run(port=8080)