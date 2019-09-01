

// Import secrets if defined
var secrets = null;
try {
  secrets = require('./secrets.json');
} catch(e) {}

// Code from https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-onchange-event-in-react-js
function setValueToInput(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  nativeInputValueSetter.call(input, value);
  var ev2 = new Event('input', { bubbles: true});
  input.dispatchEvent(ev2);
}

const interval = 1000;
var keepGoing = true;

setInterval(function() {
  if (! secrets) { return; };
  if (! keepGoing) { return; };
  const inputs = document.querySelectorAll(".login-page__input input");
  if (! inputs) { return; };
  if (inputs) {
    keepGoing = false;
    setValueToInput(inputs[0], secrets.host);
    setValueToInput(inputs[1], secrets.token);
  }
}, interval);
