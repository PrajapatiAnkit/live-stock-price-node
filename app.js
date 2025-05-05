const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");

let clients = [];
let latestPrice = [];
let stocks = [
  {
    symbol: "AXISBANK",
    name: "Axis Bank Ltd.",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Uniliver",
  },
];

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.static("public"));

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push(res);
  console.log("👤 New client connected");

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
    console.log("❌ Client disconnected");
  });
});

app.get("/api/search", async (req, res) => {
  const response = await fetch(
    "https://groww.in/v1/api/search/v3/query/global/st_p_query?page=0&size=6&web=true&query=infosys"
  );
  const data = await response.json();
  res.json(data);
});

setInterval(async () => {
  for (const stock of stocks) {
    try {
      const response = await axios.get(
        `https://groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/NSE/segment/CASH/${stock.symbol}/latest`
      );
      //  let lastPrice = response.data?.ltp?.toFixed(2);
      let lastPrice = Math.floor(1000 + Math.random() * 9000);

      console.log("lastPrice", lastPrice);
      // lastPrice =  generateRandomPrice();
      const eventData = { symbol: stock.symbol, price: lastPrice };

      clients.forEach((client) =>
        client.write(`data: ${JSON.stringify(eventData)}\n\n`)
      );
      console.log(`Latest price of :${stock.symbol} is: ${lastPrice}`);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  }
}, 5000);

function generateRandomPrice() {
  const randomDecimal = Math.random();
  const priceRange = 100 - 10;
  const randomPrice = 10 + randomDecimal * priceRange;
  return randomPrice.toFixed(2); // toFixed(2) ensures two decimal places for currency
}

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
