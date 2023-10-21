const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
require("dotenv").config();

const io = new Server(server, {
  cors: {
    origin: "*",
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
