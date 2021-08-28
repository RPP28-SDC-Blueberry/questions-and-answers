const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const db = require('../db/queries.js')
const redis = require('./redis.js')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// list questions
app.get('/qa/questions', async (req, res, next) => {
  try {
    let productId = req.query.product_id;
    if (!productId) {
      res.status(404).send();
    } else {
      const redisRecord = await redis.get(req.url);
      if (redisRecord) {
        res.send(JSON.parse(redisRecord));
      } else {
        let pageNumber = !req.query.page ? 1 : Math.max(Number(req.query.page), 1);
        let itemsPerPage = !req.query.count ? 5 : Math.max(Number(req.query.count), 0);
        const productQuestions = await db.listQuestions(productId, pageNumber, itemsPerPage);
        let responseBody = {};
        responseBody.product_id = productId;
        responseBody.results = productQuestions;
        const setRedis = await redis.set(req.url, JSON.stringify(responseBody));
        res.send(responseBody);
      }
    }
   } catch (error) {
    next(error)
  }
});

// // list questions
// app.get('/qa/questions', async (req, res, next) => {
//   try {
//     let productId = req.query.product_id;
//     if (!productId) {
//       res.status(404).send();
//     } else {
//       let pageNumber = !req.query.page ? 1 : Math.max(Number(req.query.page), 1);
//       let itemsPerPage = !req.query.count ? 5 : Math.max(Number(req.query.count), 0);
//       const productQuestions = await db.listQuestions(productId, pageNumber, itemsPerPage);
//       let responseBody = {};
//       responseBody.product_id = productId;
//       responseBody.results = productQuestions;
//       res.send(responseBody);
//     }
//   } catch (error) {
//     next(error)
//   }
// });

// list answers
app.get('/qa/questions/:question_id/answers', async (req, res, next) => {
  try {
    let questionId = req.params.question_id;
    if (!questionId) {
      res.status(404).send();
    } else {
      let pageNumber = !req.query.page ? 1 : Math.max(Number(req.query.page), 1);
      let itemsPerPage = !req.query.count ? 5 : Math.max(Number(req.query.count), 1);
      const questionAnswers = await db.listAnswers(questionId, pageNumber, itemsPerPage);
      let responseBody = {};
      responseBody.question = questionId;
      responseBody.page = pageNumber;
      responseBody.count = itemsPerPage;  // Matches the Atelier API behavior
      responseBody.results = questionAnswers;
      res.send(responseBody);
    }
  } catch (error) {
    next(error)
  }
});

// add a question
app.post('/qa/questions', async (req, res, next) => {
  try {
    let questionDetails = req.body;
    const newQuestion = await db.addQuestion(questionDetails);
    res.append('Created-Record-Id', newQuestion);
    res.status(201).send();
  } catch (error) {
    next(error)
  }
});

// add an answer
app.post('/qa/questions/:question_id/answers', async (req, res, next) => {
  try {
    let questionId = req.params.question_id;
    let answerDetails = req.body;
    const newAnswer = await db.addAnswer(questionId, answerDetails);
    res.append('Created-Record-Id', newAnswer);
    res.status(201).send();
  } catch (error) {
    next(error)
  }
});

// mark question as helpful
app.put('/qa/questions/:question_id/helpful', async (req, res, next) => {
  try {
    let questionId = req.params.question_id;
    const updateResponse = await db.markQuestionHelpful(questionId);
    res.status(204).send();
  } catch (error) {
    next(error)
  }
});

// report question
app.put('/qa/questions/:question_id/report', async (req, res, next) => {
  try {
    let questionId = req.params.question_id;
    const updateResponse = await db.reportQuestion(questionId);
    res.status(204).send();
  } catch (error) {
    next(error)
  }
});

// mark answer as helpful
app.put('/qa/answers/:answer_id/helpful', async (req, res, next) => {
  try {
    let answerId = req.params.answer_id;
    const updateResponse = await db.markAnswerHelpful(answerId);
    res.status(204).send();
  } catch (error) {
    next(error)
  }
});

// report answer
app.put('/qa/answers/:answer_id/report', async (req, res, next) => {
  try {
    let answerId = req.params.answer_id;
    const updateResponse = await db.reportAnswer(answerId);
    res.status(204).send();
  } catch (error) {
    next(error)
  }
});

// loaderio endpoint
app.get('/loaderio*', (req, res, next) => {
  res.send(req.url.substring(1, req.url.length - 1));
})

// test redis set
app.get('/redistest/:key/:value', async (req, res, next) => {
  try {
    let key = req.params.key;
    let value = req.params.value;
    const setResponse = await redis.set(key, value);
    const getResponse = await redis.get(key);
    res.send(getResponse);
  } catch (error) {
    next(error)
  }
})

// Invalid route yields a 404
app.use(function (req, res, next) {
  res.status(404).send("Resource not found")
})

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack)
  res.status(error.status || 500)
  res.json({
    status: error.status,
    message: error.message,
    stack: error.stack
  })
})

// app.listen(3000)
module.exports = app