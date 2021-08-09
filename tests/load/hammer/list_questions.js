import http from 'k6/http';
import { sleep, check } from 'k6';

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

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

export default function () {
  const productId = getRandomInt(900000, 1000000);
  let res = http.get(`http://localhost:3000/qa/questions?product_id=${productId}`);
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}
