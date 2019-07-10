var stripe = Stripe('YOUR-API-KEY');
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

function stripePayButtonClicked () {
  stripe.createToken(card).then(function (result) {
    if (result.error) {
      let errorElement = document.getElementById('cardErrors');
      errorElement.textContent = result.error.message;
    } else {
      stripeTokenHandler(result.token);
    }
  });
}

function stripeTokenHandler (token) {
  let email = document.getElementById('emailInput').value;

  let paymentForm = document.getElementById('paymentForm');
  let hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'stripeToken');
  hiddenInput.setAttribute('value', token.id);
  paymentForm.appendChild(hiddenInput);

  document.getElementById('email').value = email;

  paymentForm.submit();
}
