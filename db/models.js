const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  _id: mongoose.ObjectId,
  product_id: { type: String, index: true },
  question_body: String,
  question_date: Date,
  asker_name: String,
  asker_email: String,
  question_helpfulness: Number,
  reported: { type: Boolean, index: true },
  answers: [{
    _id: mongoose.ObjectId,
    body: String,
    date: Date,
    answerer_name: String,
    answerer_email: String,
    helpfulness: Number,
    photos: [String],
    reported: Boolean
  }]
});

// schema.virtual('question_id').get(function() {
//   return this._id;
// });

mongoose.connect('mongodb://localhost:27017/sdcqa', {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

  const Question = mongoose.model('Question', schema);


  async function listQuestions(product_id, page, count) {

    try {
      let docs = await Question.aggregate()
        .match({ product_id: product_id })
        .exec()
      return docs;
    } catch (error) {
      console.error(error);
    }

  }

exports.listQuestions = listQuestions;
