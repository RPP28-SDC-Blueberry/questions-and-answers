const expect = require('chai').expect;
const supertest = require('supertest')
const mongoose = require('mongoose')

const app = require('../../server/api.js')
const helper = require('./testHelper.js')
const request = supertest(app);

// before(function() {
//   if (process.env.NODE_ENV !== 'test') {
//     console.error('SKIPPING all tests because the NODE_ENV is not a test env\n');
//     this.skip();
//   }
// });

after(async function() {
  const response = await helper.deleteAllQuestionsForProductId('500100');
  mongoose.connection.close();
});

// For unit/integration tests, we'll operate in the 500000 set of product_ids
// Reads:   500000 - 500099 -- no updates to be made here to ensure stable results
// Creates: 500100 - 500199 -- creates and updates here

describe('List questions', function() {

  // Read range: 500000 - 500099
  // Eventually, we'll build a test db that's seeded every run

  it('Should be 3 questions returned for product_id 500000', async function () {

    const response = await request
      .get('/qa/questions')
      .query({ product_id: '500000'})
    expect(response.status).to.equal(200);
    expect(response.body.product_id).to.equal('500000');
    expect(response.body.results).to.have.lengthOf(3);
  })

  it('Sending in a null product_id should return no results', async function () {
    const response = await request
      .get('/qa/questions')
      .query({ product_id: null})
    expect(response.status).to.equal(200);
    expect(response.body.product_id).to.equal('');
    expect(response.body.results).to.have.lengthOf(0);
  })

  it('Validate the question ids for product_id 500005', async function () {

    const response = await request
      .get('/qa/questions')
      .query({ product_id: '500005'})
    let questions = response.body.results.map(q => {
      return q.question_id;
    });
    expect(response.status).to.equal(200);
    expect(response.body.product_id).to.equal('500005');
    expect(questions).to.have.lengthOf(3);
    expect(questions).to.eql([
      '610655218d6f85d5b6a1f1fc',
      '610655218d6f85d5b6a1f1fd',
      '610655218d6f85d5b6a1f1fe'
    ]);
  })
})

describe('List answers', function() {

  it('Should be 2 answers returned for a specific question', async function () {
    const questionId = '610655218d6f85d5b6a1f1fe';
    const response = await request
      .get(`/qa/questions/${questionId}/answers`)
    let answers = response.body.results.map(a => {
      return a.answer_id;
    });
    expect(response.status).to.equal(200);
    expect(response.body.question).to.equal(questionId);
    expect(response.body.results).to.have.lengthOf(2);
    expect(answers).to.eql([
      '610649f68d6f85d5b6528b50',
      '610649f68d6f85d5b6528b51'
    ]);
  })
});


describe('Adds and updates', function() {

  // Write range: 500100 - 500199
  // Eventually, we'll build a test db that's seeded every run

  it('Add a question', async function () {

    const newQuestion = {
      "product_id": "500100",
      "body": "Is it from France?",
      "name": "lincoln",
      "email": "iamlincoln@mailinator.com"
    };

    const postedQuestion = await request
      .post('/qa/questions')
      .send(newQuestion)
    expect(postedQuestion.status).to.equal(201);
    expect(postedQuestion.body).to.be.empty;

    const findQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(findQuestion.status).to.equal(200);
    expect(findQuestion.body.product_id).to.equal('500100');
    expect(findQuestion.body.results).to.have.lengthOf(1);
  })

  it('Add an answer', async function () {

    const productId = '500100';
    let foundQuestion;

    // find the question to add an answer to
    foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: productId })
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);

    // post the answer
    const questionId = foundQuestion.body.results[0].question_id;
    const newAnswer = {
      "body": "No it's from space.",
      "name": "douglas",
      "email": "doug.e.fresh@mailinator.com",
      "photos": [
        "https://dummyimage.com/200x154.png/111/aa",
        "https://dummyimage.com/259x238.png/222/bb",
        "https://dummyimage.com/783x522.png/333/cc"
      ]
    };
    const postedAnswer = await request
      .post(`/qa/questions/${questionId}/answers`)
      .send(newAnswer)
    expect(postedAnswer.status).to.equal(201);
    expect(postedAnswer.body).to.be.empty;

    // get the answer that was posted
    const foundAnswer = await request
      .get(`/qa/questions/${questionId}/answers`)
    expect(foundAnswer.status).to.equal(200);
    expect(foundAnswer.body.question).to.equal(questionId);
    expect(foundAnswer.body.results).to.have.lengthOf(1);
    expect(foundAnswer.body.results[0].photos).to.have.lengthOf(3);
    expect(foundAnswer.body.results[0].answerer_name).to.equal('douglas');

    // confirm that search still works for the question
    // this test exists because if the question is malformed, list_questions will break (trust me)
    foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);

  })

  it('Mark question helpful', async function () {

    // find the question to mark as helpful
    let foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);

    const questionId = foundQuestion.body.results[0].question_id;
    const beforeHelpfulCount = foundQuestion.body.results[0].question_helpfulness;

    const markedHelpful = await request
      .put(`/qa/questions/${questionId}/helpful`)
    expect(markedHelpful.status).to.equal(204);
    expect(markedHelpful.body).to.be.empty;

    // get the question again and test values
    foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);
    expect(foundQuestion.body.results[0].question_helpfulness).to.equal(beforeHelpfulCount + 1);
  })

  it('Mark answer helpful', async function () {

    this.timeout(6000); //ugh, need to address

    // find the question with the answer
    const foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);

    // get the answer for the question
    const questionId = foundQuestion.body.results[0].question_id;
    let foundAnswer = await request
      .get(`/qa/questions/${questionId}/answers`)
    expect(foundAnswer.status).to.equal(200);
    expect(foundAnswer.body.question).to.equal(questionId);
    expect(foundAnswer.body.results).to.have.lengthOf(1);

    const answerId = foundAnswer.body.results[0].answer_id;
    const beforeHelpfulCount = foundAnswer.body.results[0].helpfulness;

    // mark the answer as helpful
    const markedHelpful = await request
      .put(`/qa/answers/${answerId}/helpful`)
    expect(markedHelpful.status).to.equal(204);
    expect(markedHelpful.body).to.be.empty;

    // get the answer again and test values
    foundAnswer = await request
      .get(`/qa/questions/${questionId}/answers`)
    expect(foundAnswer.status).to.equal(200);
    expect(foundAnswer.body.question).to.equal(questionId);
    expect(foundAnswer.body.results).to.have.lengthOf(1);
    expect(foundAnswer.body.results[0].helpfulness).to.equal(beforeHelpfulCount + 1);
  })

  it('Report answer', async function () {

    this.timeout(6000); //ugh, need to address

    // find the question with the answer
    const foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);

    // get the answer for the question
    const questionId = foundQuestion.body.results[0].question_id;
    let foundAnswer = await request
      .get(`/qa/questions/${questionId}/answers`)
    expect(foundAnswer.status).to.equal(200);
    expect(foundAnswer.body.question).to.equal(questionId);
    expect(foundAnswer.body.results).to.have.lengthOf(1);

    const answerId = foundAnswer.body.results[0].answer_id;

    // report the answer
    const reportedAnswer = await request
      .put(`/qa/answers/${answerId}/report`)
    expect(reportedAnswer.status).to.equal(204);
    expect(reportedAnswer.body).to.be.empty;

    // attempt to get the answer but it should not return
    foundAnswer = await request
      .get(`/qa/questions/${questionId}/answers`)
    expect(foundAnswer.status).to.equal(200);
    expect(foundAnswer.body.question).to.equal(questionId);
    expect(foundAnswer.body.results).to.have.lengthOf(0);
  })

  it('Report question', async function () {

    this.timeout(6000); //ugh, need to address

    // find the question
    let foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(1);

    const questionId = foundQuestion.body.results[0].question_id;

    // report the questoin
    const reportedQuestion = await request
      .put(`/qa/questions/${questionId}/report`)
    expect(reportedQuestion.status).to.equal(204);
    expect(reportedQuestion.body).to.be.empty;

    // attempt to get the question but it should not return
    foundQuestion = await request
      .get('/qa/questions')
      .query({ product_id: '500100'})
    expect(foundQuestion.status).to.equal(200);
    expect(foundQuestion.body.product_id).to.equal('500100');
    expect(foundQuestion.body.results).to.have.lengthOf(0);
  })


});





