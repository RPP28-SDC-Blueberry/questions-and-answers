
const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: String
});

const answerSchema = new mongoose.Schema({
  body: String,
  date: { type: Date, default: Date.now },
  answerer_name: String,
  answerer_email: String,
  helpfulness: {type: Number, default: 0 },
  photos: [photoSchema],
  photoUrls: [String],
  reported: { type: Boolean, index: true, default: false }
});

const questionSchema = new mongoose.Schema({
  product_id: { type: String, index: true },
  question_body: String,
  question_date: { type: Date, default: Date.now },
  asker_name: String,
  asker_email: String,
  question_helpfulness: {type: Number, default: 0 },
  reported: { type: Boolean, index: true, default: false },
  answers: [answerSchema]
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
