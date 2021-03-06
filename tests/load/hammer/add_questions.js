import http from 'k6/http';
import { sleep, check } from 'k6';
import { generateRandomProductId } from '../helpers/helpers.js';

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '30s',
      rate: 1000,
      preAllocatedVUs: 500, // how large the initial pool of VUs would be
      maxVUs: 1500, // if the preAllocatedVUs are not enough, we can initialize more
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