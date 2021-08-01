const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sdcqa', {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });


// End-solution schemas
// - - - - - - - - - - - - - - - - - - - - - - - - - -

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


// Imported data schemas
// - - - - - - - - - - - - - - - - - - - - - - - - - -

const importedQuestionSchema = new mongoose.Schema({
  id : { type: Number, index: true },
  product_id : Number,
  body :  String,
  date_written : Number,
  asker_name :  String,
  asker_email :  String,
  reported : Number,
  helpful : Number
},
{ collection: 'staged_questions' });

const importedAnswerSchema = new mongoose.Schema({
	id : { type: Number, index: true },
	question_id : { type: Number, index: true },
	body : String,
	date_written : Date,
	answerer_name : String,
	answerer_email : String,
	reported : Number,
	helpful : Number
},
{ collection: 'staged_answers' });

const importedAnswersPhotoSchema = new mongoose.Schema({
  id : { type: Number, index: true },
  answer_id : { type: Number, index: true },
  url : String
},
{ collection: 'staged_answers_photos' });


// Intermediate state schemas
// - - - - - - - - - - - - - - - - - - - - - - - - - -

const intermediatePhotoSchema = new mongoose.Schema({
  answer_id: { type: Number, index: true },
  url: String
});

const intermediateAnswerSchema = new mongoose.Schema({
  question_id: { type: Number, index: true },
  body: String,
  date: Date,
  answerer_name: String,
  answerer_email: String,
  helpfulness: Number,
  photos: [photoSchema],
  photoUrls: [String],
  reported: Boolean
});


// Models
// - - - - - - - - - - - - - - - - - - - - - - - - - -

const importedPhotos = mongoose.model('ImportedAnswersPhoto', importedAnswersPhotoSchema);
const importedAnswers = mongoose.model('ImportedAnswer', importedAnswerSchema);
const importedQuestions = mongoose.model('ImportedQuestion', importedQuestionSchema);
const intermediatePhotos = mongoose.model('IntermediatePhoto', intermediatePhotoSchema);
const intermediateAnswers = mongoose.model('IntermediateAnswer', intermediateAnswerSchema);
const Question = mongoose.model('Question', questionSchema);


// Pipeline Definition - Photos
// - - - - - - - - - - - - - - - - - - - - - - - - - -

const photoPipeline = [

  { $match: { answer_id: { $lte: 500 } } },

  { $sort: { answer_id: 1, id: 1 } },

  { $unset: ['_id', 'id'] },

  { $out: 'intermediatephotos' }

];


// Pipeline Definition - Answers
// - - - - - - - - - - - - - - - - - - - - - - - - - -

const answerPipeline = [

  { $match: { id: { $lte: 500 } } },

  { $sort: { question_id: 1, id: 1 } },

  { $lookup: {
    from: 'intermediatephotos',
    let: { answer_id: '$id' },
    pipeline: [
      { $match: { $expr: { $eq: [ '$answer_id', '$$answer_id' ] }}},
      { $sort: { _id: 1 }},
      { $project: { url: '$url' }}
    ],
    as: 'photoDocs'
  }},

  { $lookup: {
    from: 'intermediatephotos',
    let: { 'answer_id': '$id' },
    pipeline: [
      { $match: { $expr: { $eq: [ '$answer_id', '$$answer_id' ] }}},
      { $sort: { _id: 1 }},
      { $group: {
        _id: '$answer_id',
        photos: { $push: '$url' }}
      },
    ],
    as: 'photoDocsGrouped'
  }},

  { $set: {
    photoUrls: {
      $cond: {
        if: { $eq: [ { $size: '$photoDocsGrouped.photos' }, 0 ] },
        then: [],
        else: { $arrayElemAt: [ '$photoDocsGrouped.photos', 0 ] }
      }
    }
  }},

  // { $unset: ['_id', 'id'] },
  { $unset: '_id' },

  { $project: {
    answer_id: '$id',
    question_id: '$question_id',
    body: '$body',
    date: { $toDate: '$date_written' },
    answerer_name: '$answerer_name',
    answerer_email: '$answerer_email',
    helpfulness: '$helpful',
    photos: '$photoDocs',
    photoUrls: '$photoUrls',
    reported: { $cond: { if: { $eq: [ '$reported', 0 ] }, then: false, else: true } }
  }},

  { $out: 'intermediateanswers' },

];


// Pipeline Definition - Questions
// - - - - - - - - - - - - - - - - - - - - - - - - - -

const questionPipeline = [

  { $match: { id: { $lte: 500 } } },

  { $sort: { produce_id: 1, id: 1 } },

  { $lookup: {
    from: 'intermediateanswers',
    let: { question_id: '$id' },
    pipeline: [
      { $match: { $expr: { $eq: [ '$question_id', '$$question_id' ] }}},
    ],
    as: 'answers'
  }},

  { $unset: ['_id', 'id'] },

  { $project: {
    product_id: { $toString: '$product_id' },
    question_body: '$body',
    question_date: { $toDate: '$date_written' },
    asker_name: '$asker_name',
    asker_email: '$asker_email',
    question_helpfulness: '$helpful',
    reported: { $cond: { if: { $eq: [ '$reported', 0 ] }, then: false, else: true } },
    answers: '$answers'
  }},

  { $out: 'questions' },

];


// Transformation
// - - - - - - - - - - - - - - - - - - - - - - - - - -

async function transformData() {

  try {

    console.log('\n' + 'Aggregating...');

    let photos = await importedPhotos.aggregate(photoPipeline);
    console.log('\n' + 'Working on photos...');
    console.log('Done with photos!');

    let answers = await importedAnswers.aggregate(answerPipeline);
    console.log('\n' + 'Working on answers...');
    console.log('Done with answers!');

    let questions = await importedQuestions.aggregate(questionPipeline);
    console.log('\n' + 'Working on questions...');
    console.log('Done with questions!');

    return '\n' + 'Aggregation complete!';

  } catch(error) {
    console.error('Problem:', error);
    return '\n' + error;
  }

}

transformData()
  .then(resp => {
    console.log(resp);
  })
  .catch(err => {
    console.log(err);
  })
