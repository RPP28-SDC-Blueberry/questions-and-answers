const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const db = require('./db/models.js')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// list questions
app.get('/qa/questions', (req, res) => {
  db.listQuestions(req.query.product_id, Number(req.query.page), Number(req.query.count))
    .then(results => {
      res.send(results);
    })
    .catch(err => {
      res.send(err);
    })
});

// list answers
app.get('/qa/questions/:question_id/answers', (req, res) => {
  // product_id, page, count
  let questionId = req.params.question_id;
  res.send(`GET /qa/questions/${questionId}/answers`);
});

// add a question
app.post('/qa/questions', (req, res) => {
  let question = req.body;
  res.send(req.body);
});

// add an answer
app.post('/qa/questions/:question_id/answers', (req, res) => {
  res.send('POST /qa/questions/:question_id/answers');
});

// mark question as helpful
app.put('/qa/questions/:question_id/helpful', (req, res) => {
  res.send('PUT /qa/questions/:question_id/helpful');
});

// report question
app.put('/qa/questions/:question_id/report', (req, res) => {
  res.send('PUT /qa/questions/:question_id/report');
});

// mark answer as helpful
app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  res.send('PUT /qa/answers/:answer_id/helpful');
});

// report answer
app.put('/qa/answers/:answer_id/report', (req, res) => {
  res.send('PUT /qa/answers/:answer_id/report');
});

app.listen(3000)