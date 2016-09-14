var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

let playerId = 0;

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.emit('connected', { playerId });
  playerId++;

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('updatePos', function(data) {
    console.log('updatingPos');
    io.emit('updatePos', data);
  });
});

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
