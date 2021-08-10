import http from 'k6/http';
import { SharedArray } from "k6/data";
import { sleep, check } from 'k6';

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '30s',
      preAllocatedVUs: 500, // how large the initial pool of VUs would be
      maxVUs: 1500, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};

var data = new SharedArray("questionIds", function() {
  var f = JSON.parse(open("../helpers/q_ids.json"));
  return f;
});

export default function () {

  // pick a random question id from the list (data) and report it
  var randomQuestion = data[Math.floor(Math.random() * data.length)];
  var qId = randomQuestion.question_id;
  var url = `http://localhost:3000/qa/questions/${qId}/report`;

  let res = http.put(url);
  check(res, {
    'is status 204': (r) => r.status === 204,
  });
  sleep(1);
}
