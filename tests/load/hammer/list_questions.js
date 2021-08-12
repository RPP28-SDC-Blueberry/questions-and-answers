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

  // generate a random product id and get all of the questions it
  const productId = generateRandomProductId();
  let res = http.get(`http://localhost:3000/qa/questions?product_id=${productId}`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}
