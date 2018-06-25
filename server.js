"use strict";
//// SETUP VARS ////////////////////////////
var http = require("http");
var url = require('url');
var fs = require('fs');

// Unfortunately at this time this setups up the server and does all the listening so its a little ugly. to see actual game functions goto the setInterval. That loop is the backbone of the game.
var server = http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    // host it ///////////////////
    if (path.substring(0,1 ) == "/" ) {
        fs.readFile(__dirname + path, function(error, data){
            if (error){
                response.writeHead(404);
                response.write("o0ps this doesn't exist - 404");
                response.end();
            }
            else{
                if (path.slice(-3) == "png"){
                    response.writeHead(200, {"Content-Type": "image/png"});
                };
                if (path.slice(-3) == "jpg"){
                    response.writeHead(200, {"Content-Type": "image/jpg"});
                };
                if (path.slice(-4) == "html"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                if (path.slice(-2) == "js"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                if (path.slice(-4) == "woff"){
                    response.writeHead(200, {"Content-Type": "text/html"});
                };
                response.write(data, "utf8");
                response.end();
            }
        });
    } else {
      response.writeHead(404, {'Content-Type': 'text/html'});
      response.write('Whoops,  <a href="/" style="size: 54px;">!404! </a>');
      response.end();
    }
});
var io = require("socket.io")(server);
var p2pserver = require("socket.io-p2p-server").Server;
var CoreLogger = require("core-logger");

// log to console
var logger = new CoreLogger({
  label: "socket.io-p2p-room-server"
});

var maxRoomClients = 5;
var data = "";
server.listen(3030);

io.on("connection", function(socket){
  socket.on("create-room", function(roomId) {
    socket.join(roomId);
    logger.info("created Room", {roomId: roomId});
  });
  socket.on("addtochat", function(newdat) {
    data =  data + newdat + "<br>"
    io.in('room1').emit("data", data);
    logger.info("newchatdata: ", newdat)
  });
  socket.on("join-room", function(roomId){
    logger.info("Attempting to join room", {userId: socket.id, roomId: roomId});
    if (roomId in io.sockets.adapter.rooms) {
      var room = io.sockets.adapter.rooms[roomId];
      var numClients = Object.keys(room).length - 1;
      if (numClients >= maxRoomClients) {
        logger.info("room is full", {userId: socket.id, roomId: roomId});
        socket.emit("full-room");
      } else {
        socket.join(roomId);
        p2pserver(socket, null, {name: roomId});
        logger.info("room joined", {
          userId: socket.id,
          roomId: roomId,
          numClients: numClients
        });
        logger.info("Users In Room: ", io.sockets.adapter.rooms[roomId])
      }
    } else {
      socket.emit("invalid-room");
    }
  });
  socket.on('disconnect', function () {
    logger.info("Discon")
  });
});
