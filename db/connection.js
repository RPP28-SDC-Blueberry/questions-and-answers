const mongoose = require('mongoose');

const mongooseConnectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  poolSize: 10
};

let db;
if (process.env.NODE_ENV === 'test') {
  db = mongoose.connect('mongodb://localhost:27017/sdcqatest', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });
} else {
  // db = mongoose.connect('mongodb://localhost:27017/sdcqa', mongooseConnectionOptions)
  // db = mongoose.connect('mongodb://host.docker.internal:27017/sdcqa', mongooseConnectionOptions)
  db = mongoose.connect('mongodb://172.31.51.194:27017/sdcqa', mongooseConnectionOptions)
  .catch(err => {
    console.error('Error connecting to mongodb:', err);
  });
}

module.exports = db;
