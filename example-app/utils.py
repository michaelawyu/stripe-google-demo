import datetime
import json
import random
import uuid

def prepare_incoming_payment_event(product_id, count, stripe_token, products):
    product = products[product_id - 1]
    return {
        'order': {
            'id': uuid.uuid4().hex,
            'amount': product['price'] * count * 100,
            'currency': 'usd',
            'email': '',
            'products': [{
                'id': product['id'],
                'name': product['name'],
                'count': count,
                'price': product['price']
            }]
        },
        'token': stripe_token
    }

def publish_incoming_payment_event(publisher, topic, event):
    data = json.dumps(event).encode('utf-8')
    future = publisher.publish(topic, data)
    future.result()
