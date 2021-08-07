const mongoose = require('mongoose');

const mongooseConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

const db = mongoose.connect('mongodb://localhost:27017/sdcqa', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

module.exports = db;
