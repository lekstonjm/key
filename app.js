const express = require('express');
const io = require('socket.io');
const path = require('path');
const http = require('http');
const { stringify } = require('querystring');

const port = 3000;

const iceServers = JSON.parse(process.env.ICE_SERVERS);

console.log('ice servers: '+JSON.stringify(iceServers));

const app = express();
app.use('/',express.static(path.join(__dirname, 'static')));

const httpServer = http.createServer(app);
const server = new io.Server(httpServer);

let userCount = 0;
server.on('connection', (socket) => {
  if (userCount == 2) {
    console.log("too many connection");
    socket.disconnect();
    return;
  }
  userCount++;

  console.log('user connection '+userCount);
  
  socket.on('send_offer', (data) => {
    console.log(`send_offer ${JSON.stringify(data)}`)
    socket.broadcast.emit('send_offer', data);
  });

  socket.on('send_answer', (data) => {
    console.log(`send_answer ${JSON.stringify(data)}`)
    socket.broadcast.emit('send_answer', data);
  });

  socket.on('ice_candidate', (candidate) => {
    console.log(`ice_candidate ${JSON.stringify(candidate)}`);
    socket.broadcast.emit('ice_candidate', candidate);
  })
  socket.on('disconnect', (socket) => {
    userCount--;
  });

  socket.emit('ice_servers', iceServers);
  if (userCount < 2) return;

  socket.broadcast.emit('peer_joined');
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});