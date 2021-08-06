const expect = require('chai').expect;
const app = require('../server/api.js')
const supertest = require('supertest')
const request = supertest(app);
const mongoose = require('mongoose')

after(function() {
  mongoose.connection.close();
});

// For unit/integration tests, we'll operate in the 500000 set of product_ids
// Range for reads: 500000 - 500100; no updates to be made here to ensure stable results


describe('Reads', function() {

  // For reads, we'll leave the 500000 - 500100 range alone for stable counts
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

describe('Answer reads', function() {

  it('Should be 2 answer returned for a specific question', async function () {

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

// describe('Create ', function() {
//   // app.post('/qa/questions', async (req, res, next) => {
// });





