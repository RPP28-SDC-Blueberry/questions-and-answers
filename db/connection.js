const mongoose = require('mongoose');

const mongooseConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true ,
};

const db = mongoose.connect('mongodb://localhost:27017/sdcqa', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });

module.exports = db;
