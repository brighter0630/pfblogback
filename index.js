const express = require("express");
const fs = require("fs");
const https = require("https");

const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/dividendgrowthinvesting.co.kr/privkey.pem"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/dividendgrowthinvesting.co.kr/fullchain.pem"
);
const option = {
  key: privateKey.toString(),
  cert: certificate.toString(),
  ca: [certificate.toString()],
  requestCert: false,
};

const server = https.createServer(option);
const { Server } = require("socket.io");
require("dotenv").config();

const io = new Server(server, {
  cors: {
    origin: process.env.BASE_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });
});

try {
  setInterval(async () => {
    const res = await fetch(
      `${process.env.stockAPI_REALTIME}${process.env.STOCK_API_KEY}`,
      {
        method: "GET",
      }
    );
    const realtimeData = (await res.json()).stockList;

    io.sockets.emit("price", { realtimeData });
  }, Math.random() * 3000 + 2000);
} catch (error) {
  console.log(error);
}

server.listen(5000, () => {
  console.log("listening on *:5000");
});
