const mongoose = require('mongoose');

// Create the connection
mongoose.connect('mongodb://localhost:27017/sdcqa', {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

// INITIAL DATA POPULATION
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // Define the schemas
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

const stagedQuestionSchema = new mongoose.Schema({
  "id" : { type: Number, index: true },
  "product_id" : Number,
  "body" :  String,
  "date_written" : Number,
  "asker_name" :  String,
  "asker_email" :  String,
  "reported" : Number,
  "helpful" : Number
},
{ collection: 'staged_questions' });

const stagedAnswerSchema = new mongoose.Schema({
	"id" : { type: Number, index: true },
	"question_id" : { type: Number, index: true },
	"body" : String,
	"date_written" : Date,
	"answerer_name" : String,
	"answerer_email" : String,
	"reported" : Number,
	"helpful" : Number
},
{ collection: 'staged_answers' });

const stagedAnswersPhotoSchema = new mongoose.Schema({
  "id" : { type: Number, index: true },
  "answer_id" : { type: Number, index: true },
  "url" : String
},
{ collection: 'staged_answers_photos' });


// Create the models
const Question = mongoose.model('Question', schema);
const stagedQuestions = mongoose.model('StagedQuestion', stagedQuestionSchema);
const stagedAnswers = mongoose.model('StagedAnswer', stagedAnswerSchema);
const stagedAnswersPhotos = mongoose.model('StagedAnswersPhoto', stagedAnswersPhotoSchema);


// AGGREGATION
console.log('\n' + 'Working on aggregation...');

// Stage definitions

var stageMatchQuestions = {
  // "$match": { "id": { $lte: 5 } },
  "$match": { id: 1 }
};

var stageJoinAnswers = {
  "$lookup": {
    "from": "staged_answers",
    "let": { "question_id": "$id" },
    "pipeline": [
      { "$match": { "$expr": { "$eq": [ "$question_id", "$$question_id" ] }}},
      { "$sort": { "id": 1 }},
      { "$lookup": {
        "from": "staged_answers_photos",
        "let": { "answer_id": "$id" },
        "pipeline": [
          { "$match": { "$expr": { "$eq": [ "$answer_id", "$$answer_id" ] }}},
          { "$sort": { "id": 1 }},
          { "$group": {
            "_id": "$answer_id",
            "photos": { "$push": "$url" }}
          },
        ],
        "as": "photos"
      }},
    ],
    "as": "answers"
  },
}
      // { "$lookup": {
      //     "from": "staged_answers_photos",
      //     "let": { "answer_id": "$id" },
      //     "pipeline": [
      //       { "$match": { "$expr": { "$eq": [ "$answer_id", "$$answer_id" ] }}},
      //       { "$sort": { "id": 1 }},
      //       { "$group": {
      //         "_id": "$answer_id",
      //         "photos": { "$push": "$url" }}
      //       },
      //     ],
      //     "as": "photosDocumentGrouped"
      //   },
      // },
      // { "$set": {
      //   photoUrls: {
      //     $cond: {
      //       if: { $eq: [ { $size: "$photosDocumentGrouped.photos" }, 0 ] },
      //       then: [],
      //       else: { $arrayElemAt: [ "$photosDocumentGrouped.photos", 0 ] }
      //     }
      //   }
      // }}

var stageProject = {
  $project: {
    product_id: { $toString: '$product_id' },
    question_body: '$body',
    question_date: { $toDate: "$date_written" },
    asker_name: '$asker_name',
    asker_email: '$asker_email',
    question_helpfulness: '$helpful',
    reported: { $cond: { if: { $eq: [ '$reported', 0 ] }, then: false, else: true } },
    answers: {
      $map: {
        input: "$answers",
        as: "a",
        in: {
          _id: "$$a._id",
          body: "$$a.body",
          date: { $toDate: "$$a.date_written" },
          answerer_name: "$$a.answerer_name",
          answerer_email: "$$a.answerer_email",
          helpfulness: "$$a.helpful",
          photos: "$a.photos",
          // photoUrls: "$aa.photoUrls",
          "reported": { $cond: { if: { $eq: [ "$$a.reported", 0 ] }, then: false, else: true } }
        }
      }
    }
  }
}

var stageOut = { $out: "questions" }

var pipeline = [
  stageMatchQuestions,
  stageJoinAnswers,
  stageProject,
  stageOut
];

async function dataTransform() {
  try {
    let docs = await stagedQuestions.aggregate(pipeline);
      console.log('\n' + 'Combining...');
      console.log('Done!');
  } catch(error) {
    console.error('Problem:', error);
  }
}

// commented out - need to be deliberate about running this...
dataTransform();



// OTHER AD HOC CHANGES
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// async function test() {

//   let product_id_num = Number("1");
//   let docs = await Question.aggregate()
//     .match({
//       $expr: {
//         $or: [
//           product_id: '1',
//           product_id, product_id_num
//         ]
//       }
//     })
//     .exec()
//   return docs;
// }

// test()
//  .then(res => {
//   console.log(res);
//  })
//  .catch(err => {
//   console.log(err);
//  })

  // let res = await Question.updateOne(
  //   { _id: '60ee51b8ec9133d9087ef648' },
  //   { $rename:
  //     { "productId": "product_id" },
  //     // { "_id": "question_id" },
  //     // { "body": "question_body" },
  //     // { "helpful": "question_helpfulness" }
  //   }
  // );

  // let doc = await Question.findOne( { _id: '60ee51b8ec9133d9087ef648'} );




