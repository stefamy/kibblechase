require("./Entity");

var express = require("express");
var app = express();
var serv = require("http").Server(app);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = {};

var io = require("socket.io")(serv, {});
io.sockets.on("connection", function(socket) {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  Player.onConnect(socket);

  socket.on("disconnect", function() {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
});

setInterval(function() {
  var pack = Entity.getFrameUpdateData();

  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit("newPositions", pack);
  }
}, 1000 / 25);
