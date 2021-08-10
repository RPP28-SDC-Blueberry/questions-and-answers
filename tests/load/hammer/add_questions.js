import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomProductId } from '../helpers/helpers.js';

export let options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 1500 },
        { duration: '5s', target: 1500 },
        { duration: '5s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
};

export default function () {

  // generate a random product id and add a question for it
  var productId = generateRandomProductId();
  var url = 'http://localhost:3000/qa/questions';
  var payload = JSON.stringify({
    "product_id": productId,
    "body": 'Is this from load testing?',
    "name": 'k6-q-creator',
    "email": 'iamk6qcreator@mailinator.com'
  });

  var params = {
    headers: { 'Content-Type': 'application/json' },
  };

  let res = http.post(url, payload, params);
  check(res, {
    'is status 201': (r) => r.status === 201,
  });
  sleep(1);

}