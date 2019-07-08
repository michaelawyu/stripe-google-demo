import datetime
import json
import random
import uuid

products = [
    {
        'id': 1,
        'name': 'Example Product #1',
        'price': 5
    },
    {
        'id': 2,
        'name': 'Example Product #2',
        'price': 150
    },
    {
        'id': 3,
        'name': 'Example Product #3',
        'price': 42
    },
    {
        'id': 4,
        'name': 'Example Product #4',
        'price': 7
    },
    {
        'id': 5,
        'name': 'Example Product #5',
        'price': 12
    },
    {
        'id': 6,
        'name': 'Example Product #6',
        'price': 60
    }
]

def prepare_incoming_payment_event(stripe_token):
    product = products[random.randint(0, 5)]
    count = random.randint(1, 10)
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
