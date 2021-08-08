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

export default function () {

  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);
}
