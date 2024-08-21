const dotenv = require("dotenv");
dotenv.config();

// Environment variables
const account = process.env.account;
const password = process.env.password;

// Global variables
let orderInterval = 180000; // 3 minutes
let token = "";
let game_id = 426482;
let contract_type = 1;
let type = 1;
let pick = "green";
let previousBalance = 0;

let headers = {
  accept: "application/json, text/plain, */*",
  "accept-language": "en-US,en;q=0.9",
  "content-type": "application/x-www-form-urlencoded",
  priority: "u=1, i",
  "sec-ch-ua": '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  token: "",
  Referer: "https://redpearlmall.com/",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

/**
 * Makes an HTTP request.
 * @param {string} url - The URL to request.
 * @param {string} method - The HTTP method to use.
 * @param {string} body - The body of the request.
 * @returns {Promise<Object>} - The response data.
 */
const request = async (url, method, body) => {
  const response = await fetch(url, {
    headers: headers,
    body: body,
    method: method,
  });
  return response.json();
};

/**
 * Logs in the user and retrieves the token.
 * @returns {Promise<string>} - The user token.
 */
const login = async () => {
  const loginResponse = await request("https://art.redpearlmall.com/api/user/login", "POST", `account=${account}&password=${password}`);

  console.log("Token", loginResponse.data.userinfo.token);
  return loginResponse.data.userinfo.token;
};

const getBalance = async () => {
  const balanceResponse = await request("https://art.redpearlmall.com/api/my/index", "POST", "");
  // console.log("Balance", balanceResponse.data.money);
  return balanceResponse.data.money;
};

/**
 * Adds an order.
 * @returns {Promise<void>}
 */
const addOrder = async (contract_number) => {
  const addOrderResponse = await request(
    "https://art.redpearlmall.com/api/project/add_order",
    "POST",
    `contract_type=${contract_type}&contract_number=${contract_number}&type=${type}&pick=${pick}&game_id=${game_id}`
  );

  console.log("Add Order Response", addOrderResponse);
};

/**
 * Delays execution for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const addNumberOrder = async (number) => {
  console.log("Number Pick: ", number);
  const addOrderResponse = await request(
    "https://art.redpearlmall.com/api/project/add_order",
    "POST",
    `contract_type=${contract_type}&contract_number=${contract_number}&type=2&pick=${number}&game_id=${game_id}`
  );

  console.log("Add Order Response", addOrderResponse);
};

/**
 * Retrieves the game history.
 * @returns {Promise<Object>} - The game history data.
 */
const getGameHistory = async () => {
  const gameHistoryResponse = await request("https://art.redpearlmall.com/api/project/game_history", "POST", `project_id=1&page=1&limit=10`);
  return gameHistoryResponse;
};

/**
 * Main function to execute the workflow.
 * @returns {Promise<void>}
 */
const main = async () => {
  if (!token) {
    token = await login();
  }
  headers.token = token;

  const currentBalance = await getBalance();
  if (previousBalance !== 0) {
    if (currentBalance > previousBalance) {
      console.log("You Won\n");
    } else {
      console.log("You Lost\n");
    }
  }

  console.log("Current Balance: ", currentBalance);
  previousBalance = currentBalance;

  const gameHistoryResponse = await getGameHistory();
  const prevGame = gameHistoryResponse.data.list[0];
  game_id = prevGame.id + 1;
  const prevColor = prevGame.color;

  // Uncomment the following line for alternate color
  // pick = prevColor === "green" ? "red" : "green";

  // Use the same color
  pick = prevColor.split(",")[0];
  console.log("Game ID: ", game_id);
  console.log("Previous Color: ", prevColor);
  console.log("Current Pick: ", pick);

  await addOrder(1);

  // Next order at HH:MM:SS AM/PM in UTC+5:30 timezone
  const nextDate = new Date();
  nextDate.setMinutes(nextDate.getMinutes() + 3);
  console.log("Next order at", nextDate.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" }));
};

// Run the main function immediately
main();

// Set an interval to run the main function every 3 minutes (180,000 milliseconds)
setInterval(main, orderInterval);
