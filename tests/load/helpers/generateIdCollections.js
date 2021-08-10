const mongoose = require('mongoose');
const Question = require('../../../db/models.js')

const mongooseConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

// mongoose.connect('mongodb://localhost:27017/sdcqa', mongooseConnectionOptions)
//   .catch(err => {
//     console.error('Error connecting to mongodb:', err);
//   });

const questionPipeline = [

  { $match: {
    product_id: { $gte: '900000' },
    reported: false
  }},

  { $project: {
    _id: "$_id",
    question_id: {$toString: "$_id"},
    product_id: "$product_id"
  }},

  { $out: 'test_question_ids' }

];

const answerPipeline = [

  { $match: {
    product_id: { $gte: '900000' },
    reported: false
  }},

  { $unwind: { path: "$answers", preserveNullAndEmptyArrays: false } },

  { $match: { "answers.reported": false }},

  { $replaceRoot: {
    newRoot: {
      _id: "$answers._id",
      answer_id: { $toString: "$answers._id"},
      question_id: { $toString: "$_id"},
    }
  }},

  { $out: 'test_answer_ids' }

];

async function generateList() {

  try {

    console.log('\n' + 'Aggregating...');

    // let questions = await Question.aggregate(questionPipeline).allowDiskUse(true);
    // console.log('\n' + 'Working on questions...');
    // console.log('Done with questions!');

    // let answers = await Question.aggregate(answerPipeline).allowDiskUse(true);
    // console.log('\n' + 'Working on answers...');
    // console.log('Done with answers!');

    return '\n' + 'Aggregation complete!';

  } catch(error) {
    console.error('Problem:', error);
    return '\n' + error;
  }

}

generateList()
  .then(resp => {
    console.log(resp);
  })
  .catch(err => {
    console.log(err);
  })
