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

answerSchema.virtual('answer_id_new').get(function() {
  return this._id;
});

// answerSchema.set('toObject', { virtuals: true });
answerSchema.set('toJSON', { virtuals: true });

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
  ];

  try {
    let docs = await Question.aggregate(pipeline);
    return docs;
  } catch (error) {
    return error;
  }
}

async function listAnswers(question_id, page, count) {

  const pipeline = [

    { $match: {
      _id: mongoose.Types.ObjectId(question_id),
      reported: false
    }},

    // { $unwind: "$answers" },
    { $unwind: { path: "$answers", preserveNullAndEmptyArrays: true } },

    { $replaceRoot: {
      newRoot: {
        answer_id: "$answers._id",
        body: "$answers.body",
        date: "$answers.date",
        answerer_name: "$answers.answerer_name",
        helpfulness: "$answers.helpfulness",
        photos: "$answers.photoUrls"
      }
    }}
  ];

  try {
    let docs = await Question.aggregate(pipeline);
    return docs;
  } catch (error) {
    return error;
  }

}

exports.listQuestions = listQuestions;
exports.listAnswers = listAnswers;
