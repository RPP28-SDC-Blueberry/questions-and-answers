const mongoose = require('mongoose');
const fs = require('fs');

const mongooseConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

mongoose.connect('mongodb://localhost:27017/sdcqatest', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

const questionIdSchema = new mongoose.Schema({
  question_id: String,
  product_id: String
},
{ collection: 'test_question_ids' }
);

const answerIdSchema = new mongoose.Schema({
  answer_id: String,
  question_id: String
},
{ collection: 'test_answer_ids' }
);

const QuestionId = mongoose.model('QuestionId', questionIdSchema);
const AnswerId = mongoose.model('AnswerId', answerIdSchema);

async function getQuestionIds() {
  try {
    let result = {};
    result.keys = ['question_id'];
    result.values = [];
    const questions = await QuestionId.find({}).limit(74000);
    questions.forEach(doc => {
      result.values.push([doc.question_id]);
    });
    return result;
  } catch (error) {
    return error;
  }
}

async function getAnswerIds() {
  try {
    let result = {};
    result.keys = ['answer_id'];
    result.values = [];
    const questions = await AnswerId.find({}).limit(94000);
    questions.forEach(doc => {
      result.values.push([doc.answer_id]);
    });
    return result;
  } catch (error) {
    return error;
  }
}

getQuestionIds()
  .then(resp => {
    fs.writeFileSync('loader_q_ids.json', JSON.stringify(resp));
    console.log('Questions complete!');
  })
  .catch(err => {
    console.log(err);
  })

getAnswerIds()
  .then(resp => {
    fs.writeFileSync('loader_a_ids.json', JSON.stringify(resp));
    console.log('Answers complete!');
  })
  .catch(err => {
    console.log(err);
  })
