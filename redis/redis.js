
let redis_url;
redis_url = process.env.REDIS_URL;
// redis_url = 'redis://172.31.18.86'; // prod

// if (process.env.ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production') {
//   let redis_url = 'redis://172.31.18.86';
// }

//redis setup
let client = require('redis').createClient(redis_url);
let Redis = require('ioredis');
let redis = new Redis(redis_url);

module.exports = redis;
