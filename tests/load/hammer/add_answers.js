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

  // pick a random question id from the list (data) and add an answer (and gen some random photo urls)
  var randomQuestion = data[Math.floor(Math.random() * data.length)];
  var qId = randomQuestion.question_id;
  var photo1 = Math.floor(Math.random() * 1000).toString() + '/' + Math.floor(Math.random() * 1000).toString();
  var photo2 = Math.floor(Math.random() * 2000).toString() + '/' + Math.floor(Math.random() * 2000).toString();
  var photo3 = Math.floor(Math.random() * 3000).toString() + '/' + Math.floor(Math.random() * 3000).toString();
  var url = `http://localhost:3000/qa/questions/${qId}/answers`;
  var payload = JSON.stringify({
    "body": "Maybe. Why do you ask?",
    "name": "nunya",
    "email": "nunya.biz@mailinator.com",
    "photos": [
      `https://dummyimage.com/200x154.png/aaa/${photo1}`,
      `https://dummyimage.com/259x238.png/bbb/${photo2}`,
      `https://dummyimage.com/783x522.png/ccc/${photo3}`
    ]
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
