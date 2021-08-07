const mongoose = require('mongoose');
const Question = require('./models.js')
const db = require('./connection.js')

// TESTING HELPERS

async function deleteAllQuestionsForProductId(product_id) {
  try {
    let result = await Question.deleteMany({product_id: product_id})
    return result;
  } catch (error) {
    return error;
  }
}

module.exports = {
  deleteAllQuestionsForProductId,
};

