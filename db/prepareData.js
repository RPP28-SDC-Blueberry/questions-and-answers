const mongoose = require('mongoose');

// define a schema
const schema = new mongoose.Schema({
  legacyId: Number,
  productId: Number,
  body: String,
  askerName: String,
  askerEmail: String,
  helpfulness: Number,
  reported: Boolean,
  createdDate: Date,
  answers: [{
    legacyId: Number,
    body: String,
    answererName: String,
    answererEmail: String,
    helpfulness: Number,
    reported: Boolean,
    photos: [String],
    createdDate: Date }]
});

// define first test row of data to insert
const firstQuestionData = {
  "productId": 1,
  "body": "What fabric is the top made of?",
  "askerName": "yankeelover",
  "askerEmail": "first.last@gmail.com",
  "helpfulness": 1,
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
      "helpfulness": 5
    },
    {
      "body": "Its the best! Seriously magic fabric",
      "createdDate": 1614451524662,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpfulness": 7
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
      "helpfulness": 8
    },
    {
      "body": "Suede",
      "createdDate": 1618159891495,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpfulness": 7
    },
    {
      "body": "Supposedly suede, but I think its synthetic",
      "createdDate": 1600120432219,
      "answererName": "metslover",
      "answererEmail": "first.last@gmail.com",
      "reported": false,
      "photos": [],
      "helpfulness": 3
    }
  ]
}

// create a connection
mongoose.connect('mongodb://localhost:27017/sdcqa', {useNewUrlParser: true, useUnifiedTopology: true})
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  })

// compile the model
const Question = mongoose.model('Question', schema);

// construct a document
const firstQuestion = new Question(firstQuestionData);

firstQuestion.save()
  .then(resp => {
    console.log('First document saved');
  })
  .catch(err => {
    console.error('Error saving first document')
  })
