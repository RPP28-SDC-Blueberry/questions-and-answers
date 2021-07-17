const mongoose = require('mongoose');

// Define the schemas

const schema = new mongoose.Schema({
  // legacyId: Number,
  productId: { type: [Number], index: true },
  body: String,
  askerName: String,
  askerEmail: String,
  helpful: Number,
  reported: { type: [Boolean], index: true },
  createdDate: Date,
  answers: [{
    // legacyId: Number,
    body: String,
    answererName: String,
    answererEmail: String,
    helpful: Number,
    reported: Boolean,
    photos: [String],
    createdDate: Date }]
});

const stagedQuestionSchema = new mongoose.Schema({
  "id" : { type: [Number], index: true },
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
	"id" : Number,
	"question_id" : { type: [Number], index: true },
	"body" : String,
	"date_written" : Date,
	"answerer_name" : String,
	"answerer_email" : String,
	"reported" : Number,
	"helpful" : Number
},
{ collection: 'staged_answers' });

const stagedAnswersPhotoSchema = new mongoose.Schema({
  "id" : Number,
  "answer_id" : { type: [Number], index: true },
  "url" : String
},
{ collection: 'staged_answers_photos' });


// Define the test data

const firstQuestionData = {
  "productId": 1,
  "body": "What fabric is the top made of?",
  "askerName": "yankeelover",
  "askerEmail": "first.last@gmail.com",
  "helpful": 1,
  "reported": false,
  "createdDate": 1595884714409,
  "answers": [
    {
      "body": "Something pretty soft but I can't be sure",
      "createdDate": 1599990560555,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpful": 5
    },
    {
      "body": "Its the best! Seriously magic fabric",
      "createdDate": 1614451524662,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpful": 7
    },
    {
      "body": "DONT BUY IT! It's bad for the environment",
      "createdDate": 1600552162548,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [
        "https://images.unsplash.com/photo-1530519729491-aea5b51d1ee1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1651&q=80",
        "https://images.unsplash.com/photo-1500603720222-eb7a1f997356?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1653&q=80"
      ],
      "helpful": 8
    },
    {
      "body": "Suede",
      "createdDate": 1618159891495,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpful": 7
    },
    {
      "body": "Supposedly suede, but I think its synthetic",
      "createdDate": 1600120432219,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpful": 3
    }
  ]
}

// Create the connection
mongoose.connect('mongodb://localhost:27017/sdcqa', {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

// Create the models
const Question = mongoose.model('Question', schema);
const stagedQuestions = mongoose.model('StagedQuestion', stagedQuestionSchema);
const stagedAnswers = mongoose.model('StagedAnswer', stagedAnswerSchema);
const stagedAnswersPhotos = mongoose.model('StagedAnswersPhoto', stagedAnswersPhotoSchema);

async function dbInit() {

  let data = null;

  try {
    await Question.deleteMany({});

    // const firstQuestion = new Question(firstQuestionData);
    // await firstQuestion.save();
    // console.log('First document saved');

    // data = await Question.findOne()
    // console.log('\n' + 'Questions...');
    // console.log(data);

    // data = await stagedQuestions.findOne()
    // console.log('\n' + 'stagedQuestions...');
    // console.log(data);

    // data = await stagedAnswers.findOne()
    // console.log('\n' + 'stagedAnswers...');
    // console.log(data);

    // data = await stagedAnswersPhotos.findOne()
    // console.log('\n' + 'stagedAnswersPhotos...');
    // console.log(data);

    // await Question.deleteMany({});

  } catch(error) {
    console.error('Error doing db stuff:', error);
  }

}

dbInit();

// AGGREGATION

async function dataTransform() {

  console.log('\n' + 'Working on aggregation...');
  try {
    const filter = { id: 1 };
    let docs = await stagedQuestions.aggregate()
      .match(filter)
      .lookup(
        {
          from: 'staged_answers',
          localField: 'id',
          foreignField: 'question_id',
          as: 'answers'
        }
      )
      .project({
        _id: 1,
        productId: '$product_id',
        body: 1,
        askerName: '$asker_name',
        askerEmail: '$asker_email',
        helpful: 1,
        reported: { $cond: { if: { $eq: [ "$reported", 0 ] }, then: false, else: true } },
        createdDate: '$date_written',
        answers: {
          "$map": {
            "input": "$answers",
            "as": "a",
            "in": {
              "_id": "$$a._id",
              "questionId": "$$a.question_id",
              "body": "$$a.body",
              "createdDate": "$$a.date_written",
              "answererName": "$$a.answerer_name",
              "answererEmail": "$$a.answerer_email",
              "reported": { $cond: { if: { $eq: [ "$$a.reported", 0 ] }, then: false, else: true } },
              "helpful": "$$a.helpful"
            }
          }
        }
      })

      console.log('\n' + 'lookup');
      console.log(docs[0]);
  } catch(error) {
    console.error('Problem:', error);
  }
}

dataTransform();
