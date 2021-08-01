const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sdcqa', {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

const photoSchema = new mongoose.Schema({
  url: String
});

const answerSchema = new mongoose.Schema({
  body: String,
  date: Date,
  answerer_name: String,
  answerer_email: String,
  helpfulness: Number,
  photos: [photoSchema],
  photoUrls: [String],
  reported: Boolean
});

const questionSchema = new mongoose.Schema({
  product_id: { type: String, index: true },
  question_body: String,
  question_date: Date,
  asker_name: String,
  asker_email: String,
  question_helpfulness: Number,
  reported: { type: Boolean, index: true },
  answers: [answerSchema]
});

questionSchema.virtual('question_id').get(function() {
  return this._id;
});

const Question = mongoose.model('Question', questionSchema);


async function listQuestions(product_id, page, count) {

  const pipeline = [

    { $match: {
      product_id: product_id,
      reported: false
    }},

    { $project: {
      _id: 0,
      question_id: "$_id",
      question_body: 1,
      question_date: 1,
      asker_name: 1,
      question_helpfulness: 1,
      reported: 1,
      answers: {
        $arrayToObject: {
          $map: {
            input: "$answers",
            as: "answer",
            in: {
              k: { $toString: "$$answer._id" },
              v: {
                id: "$$answer._id",
                body: "$$answer.body",
                date: "$$answer.date",
                answerer_name: "$$answer.answerer_name",
                helpfulness: "$$answer.helpfulness",
                photos: "$$answer.photoUrls"
              }
            }
          }
        }
      }
    }}

  ]

  try {
    let docs = await Question.aggregate(pipeline);
    return docs;
  } catch (error) {
    console.error(error);
  }

}

exports.listQuestions = listQuestions;
