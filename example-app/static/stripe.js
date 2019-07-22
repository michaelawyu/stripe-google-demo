var stripe = Stripe('YOUR-API_KEY');
var elements = stripe.elements();
var style = {
  base: {
    color: '#32325d',
    lineHeight: '18px',
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#aab7c4'
    }
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

var card = elements.create('card', { style: style });
card.mount('#cardElement');

card.addEventListener('change', function (event) {
  var displayError = document.getElementById('cardErrors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

function stripePayButtonClicked() {
  let stripePayButton = document.getElementById('stripePayButton');
  let clientSecret = stripePayButton.dataset.secret;
  let email = document.getElementById('emailInput').value;

  let payment = stripe.handleCardPayment(clientSecret, card, {
    payment_method_data: {
      billing_details: {
        email: email
      }
    },
    receipt_email: email
  });
  payment.then(result => {
    if (result.error) {
      window.alert(`We are having trouble processing your payment at this momenmt. (${result.error})`);
    } else {
      window.location.href = '/paymentSucceeded';
    }
  });
}
