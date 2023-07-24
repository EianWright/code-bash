const axios = require("axios");
const readline = require("readline");

const testFetch = async () => {
  let url = "https://www.instructure.com/";
  const response = await axios.get(url);
  console.log(response);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Press any key to continue...");

process.stdin.on("keypress", (_, key) => {
  rl.close();
  testFetch();
});

process.stdin.setRawMode(true);
process.stdin.resume();
