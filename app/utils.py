import datetime
import json
import os
import random
import uuid

from google.cloud import firestore
import stripe

STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

firestore_client = firestore.Client()
stripe.api_key = STRIPE_API_KEY

def prepare_order(product_id, count, products):
    product = products[int(product_id)]
    order = {
        'id': uuid.uuid4().hex,
        'amount': int(product['price']) * int(count) * 100,
        'currency': 'usd',
        'products': [{
            'id': product['id'],
            'name': product['name'],
            'count': count,
            'price': product['price']
        }]
    }
    firestore_client.collection('orders').document(order['id']).set(order)
    return order

def create_stripe_payment_intent(order):
    intent = stripe.PaymentIntent.create(
        amount=order['amount'],
        currency=order['currency'],
        payment_method_types=['card'],
        metadata={
            'order_id': order['id'],
        }
    )
    return intent["client_secret"]