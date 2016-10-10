const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const GameState = require('./public/src/game_state.js');
const crypto = require("crypto");

app.use(express.static('public'));

let allGameStates = {};

io.on('connection', function(socket) {
  console.log(`a user connected`);

  setUpMakeNewRoom(socket);
  setUpJoinRoom(socket);
});

function setUpMakeNewRoom(socket) {
  socket.on('makeNewRoom', () => {
    // create a new password
    let roomId = crypto.randomBytes(5).toString('hex');
    // let roomId = 'testing';
    while (allGameStates[roomId] !== undefined) {
      roomId = crypto.randomBytes(5).toString('hex');
    }

    allGameStates[roomId] = new GameState(io, socket, roomId);

    // send the roomId back to the client
    socket.emit('joinRoom', {
      roomId: roomId,
      isNewRoom: true
    });
  });
}

function setUpJoinRoom(socket) {
  socket.on('joinRoom', data => {
    let gameState = allGameStates[data.roomId];
    if (gameState === undefined) {
      socket.emit('failedToJoin', {
        msg: "Cannot find room"
      });
    } else {
      let successJoin = gameState.addSocket(socket);
      if (successJoin) {
        socket.emit('joinRoom', {
          roomId: data.roomId,
          isNewRoom: false
        });
      } else {
        socket.emit('failedToJoin', {
          msg: 'Room is currently full!'
        });
      }
    }
  });
}


server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
