const mongoose = require('mongoose');

const mongooseConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

let db;
if (process.env.NODE_ENV === 'test') {
  db = mongoose.connect('mongodb://localhost:27017/sdcqatest', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });
} else {
  db = mongoose.connect('mongodb://localhost:27017/sdcqa', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });
}

module.exports = db;
