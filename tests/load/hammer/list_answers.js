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

  db.questions.find().limit(-1).skip(Math.random() * 1000000);

  let res = http.get('http://localhost:3000/qa/questions/610656858d6f85d5b6b76b8e/answers?page=1&count=10');
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
  sleep(1);

}
