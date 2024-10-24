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
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Custom Chess Arena" });
});

server.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

// Socket.io logic
io.on("connection", (client) => {
  console.log("Client Connected ID :", client.id);

  // Assign roles to players
  if (!players.white) {
    players.white = client.id;
    client.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = client.id;
    client.emit("playerRole", "b");
  } else {
    client.emit("spectatorRole");
  }

  // Send initial board state to client
  client.emit("boardState", chess.fen());

  // Handle disconnection
  client.on("disconnect", () => {
    if (client.id === players.white) {
      delete players.white;
    } else if (client.id === players.black) {
      delete players.black;
    }
    console.log("disconnected", client.id);
  });
});
