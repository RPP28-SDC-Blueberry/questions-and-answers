const db = require('../db/models.js')

async function listQuestionsPerformance() {
  try {
    const productId = getRandomInt(1, 1000000).toString();
    console.time(`List questions for product_id ${productId}`);
    const productQuestions = await db.listQuestions(productId);
    console.timeEnd(`List questions for product_id ${productId}`);
  } catch (error) {
    console.error(error);
  }
}

async function listAnswersPerformance() {
  try {
    const productId = getRandomInt(1, 1000000).toString();
    const productQuestions = await db.listQuestions(productId);
    if (productQuestions.length === 0) { return -1 };
    const questionIndex = getRandomInt(0, productQuestions.length);
    const qId = productQuestions[questionIndex].question_id;
    console.time(`List answers for question_id ${qId}`);
    const questionAnswers = await db.listAnswers(qId);
    console.timeEnd(`List answers for question_id ${qId}`);
  } catch (error) {
    console.error(error);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

async function run() {
  for (let i = 0; i <= 25; i++) {
    await listQuestionsPerformance();
  }
  for (let j = 0; j <= 25; j++) {
    await listAnswersPerformance();
  }
};

run();