
//production redis url
let redis_url = process.env.REDIS_URL;

if (process.env.ENVIRONMENT === 'development') {
  require('dotenv').config();
  redis_url = "redis://host.docker.internal";
}

//redis setup
let client = require('redis').createClient(redis_url);
let Redis = require('ioredis');
let redis = new Redis(redis_url);

module.exports = redis;
