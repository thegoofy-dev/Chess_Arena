const http = require("http");
const express = require("express");
const socket = require("socket.io");
const path = require("path");
const { Chess } = require("chess.js");

const PORT = 5000;

const app = express();

// Initialize HTTP server with Express
const server = http.createServer(app);

// Instantiate Socket.io on HTTP server
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", {title:"Custom Chess Arena"});
});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

// Additional Socket.io logic would go here, if necessary.
