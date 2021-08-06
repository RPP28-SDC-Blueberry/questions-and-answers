const mongoose = require('mongoose');
const Question = require('./models.js')
const db = require('./connection.js')

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

async function addQuestion(questionDetails) {
  try {
    const newQuestion = new Question ({
      product_id: questionDetails.product_id,
      question_body: questionDetails.body,
      asker_name: questionDetails.name,
      asker_email: questionDetails.email,
    });
    const result = await newQuestion.save();
    return;
  } catch (error) {
    return error;
  }
}

async function addAnswer(questionId, answerDetails) {
  try {

    questionId = mongoose.Types.ObjectId(questionId);
    const parentQuestion = await Question.findById(questionId);

    const newAnswer = parentQuestion.answers.create({
      body: answerDetails.body,
      answerer_name: answerDetails.name,
      answerer_email: answerDetails.email
    });

    answerDetails.photos.forEach(url => {
      const newPhoto = newAnswer.photos.create({
        url: url
      });
      newAnswer.photos.push(newPhoto);
      newAnswer.photoUrls.push(url);
    });

    parentQuestion.answers.push(newAnswer);
    const result = await parentQuestion.save();
    return;
  } catch (error) {
    return error;
  }
}

async function markQuestionHelpful(questionId) {
  try {
    questionId = mongoose.Types.ObjectId(questionId);
    const foundQuestion = await Question.findOne({ _id: questionId });
    foundQuestion.question_helpfulness = foundQuestion.question_helpfulness + 1;
    const result = await foundQuestion.save();
    return;
  } catch (error) {
    return error;
  }
}

async function reportQuestion(questionId) {
  try {
    questionId = mongoose.Types.ObjectId(questionId);
    const foundQuestion = await Question.findOne({ _id: questionId });
    foundQuestion.reported = true;
    const result = await foundQuestion.save();
    return;
  } catch (error) {
    return error;
  }
}

async function markAnswerHelpful(answerId) {
  try {
    const result = await Question.findOneAndUpdate(
      { 'answers._id': answerId },
      { $inc: { 'answers.$.helpfulness': 1 } }
    );
    return;
  } catch (error) {
    return error;
  }
}

async function reportAnswer(answerId) {
  try {
    const result = await Question.findOneAndUpdate(
      { 'answers._id': answerId },
      { 'answers.$.reported': true }
    );
    return;
  } catch (error) {
    return error;
  }
}

module.exports = {
  listQuestions,
  listAnswers,
  addQuestion,
  addAnswer,
  markQuestionHelpful,
  reportQuestion,
  markAnswerHelpful,
  reportAnswer
};
