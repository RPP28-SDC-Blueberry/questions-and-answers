export function generateRandomProductId() {

  let min = 900000;
  let max = 1000000;

  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min).toString();

}