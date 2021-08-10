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
        { duration: '5s', target: 2500 },
        { duration: '5s', target: 2500 },
        { duration: '5s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
};

export default function () {

  // generate a random product id and get all of the questions it
  const productId = generateRandomProductId();
  let res = http.get(`http://localhost:3000/qa/questions?product_id=${productId}`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}
