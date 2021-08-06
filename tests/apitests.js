const expect = require('chai').expect;

const app = require('../server/api.js')
const supertest = require('supertest')
const request = supertest(app);
const mongoose = require('mongoose')

after(function() {
  mongoose.connection.close();
});

// For reads, we'll leave the 500000 - 500999 range alone so we can rely on stable counts

describe('Reads', function() {

  it('Should be 3 questions returned for product_id 500000', async function () {

    const response = await request
      .get('/qa/questions')
      .query({ product_id: '500000'})
    expect(response.status).to.equal(200);
    expect(response.body.product_id).to.equal('500000');
    expect(response.body.results).to.have.lengthOf(3);
  })

  it('Sending in a null should return no results', async function () {
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
      q.question_id;
    })
    expect(response.status).to.equal(200);
    expect(response.body.product_id).to.equal('500005');
    expect(response.body.results).to.have.lengthOf(3);
  })



})

