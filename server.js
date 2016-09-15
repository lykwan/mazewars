var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Crafty = require('craftyjs')();
var ServerModel = require('./public/src/model/server_model.js');
var createCanvas = require('./public/src/components/canvas.js');
var seedrandom = require('seedrandom');
var Board = require('./public/src/board.js');
const Constants = require('./public/src/constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;
const weaponTypes = Constants.weaponTypes;

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

createCanvas(Crafty, ServerModel);

var colors = ['#7ec0ee', 'red', 'yellow', 'green'];

var gameState = {
  playerId: 0,
  weaponId: 0,
  players: {},
  weapons: {},
  seedRandomStr: "whatever",
  board: null
};

var constants = {
  WEAPON_COLOR: 'orange',
  WEAPON_RANGE: 10,
  DAMAGE_COLOR: 'purple'
};

io.on('connection', function(socket) {
  console.log('a user connected');
  socket.emit('connected', { selfId: gameState.playerId,
                             seedRandomStr: gameState.seedRandomStr,
                             playerColor: colors[gameState.playerId],
                             playerIds: Object.keys(gameState.players)
                           });

  socket.join(gameState.playerId);

  drawBoard();
  setUpAddNewPlayer(socket);

  let player =  Crafty.e('Player')
                      .at(0, 0)
                      .setUp(gameState.playerId);

  gameState.players[gameState.playerId] = player;
  gameState.playerId++;


  setUpDisconnect(socket);
  setUpUpdatePos(socket);
  setUpPickUpWeapon(socket);
  setUpShootWeapon(socket);
  addWeapon(socket);
});

function drawBoard() {
  if (!gameState.board) {
    gameState.board =
      new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, gameState.seedRandomStr);
    for (let i = 0; i < mapGrid.NUM_COLS; i++) {
      for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
        gameState.board.grid[i][j].drawWalls(Crafty);
      }
    }
  }
}

function setUpDisconnect(socket) {
  socket.on('disconnect', function() {
    console.log('user disconnected');

  });
}

function setUpUpdatePos(socket) {
  socket.on('updatePos', function(data) {
    let movingPlayer = gameState.players[data.playerId];
    if (data.charMove.left) {
      movingPlayer.x -= movingPlayer.charSpeed;
      if (movingPlayer.hit("Wall")) {
        movingPlayer.x += movingPlayer.charSpeed;
      }
    } else if (data.charMove.right) {
      movingPlayer.x += movingPlayer.charSpeed;
      if (movingPlayer.hit("Wall")) {
        movingPlayer.x -= movingPlayer.charSpeed;
      }
    } else if (data.charMove.up) {
      movingPlayer.y -= movingPlayer.charSpeed;
      if (movingPlayer.hit("Wall")) {
        movingPlayer.y += movingPlayer.charSpeed;
      }
    } else if (data.charMove.down) {
      movingPlayer.y += movingPlayer.charSpeed;
      if (movingPlayer.hit("Wall")) {
        movingPlayer.y -= movingPlayer.charSpeed;
      }
    }

    io.emit('updatePos', {
      playerId: data.playerId,
      x: movingPlayer.x,
      y: movingPlayer.y
    });
  });
}

function setUpAddNewPlayer(socket) {
  socket.broadcast.emit('addNewPlayer', {
    playerId: gameState.playerId
  });
}

function addWeapon(socket) {
  setInterval(function() {
    let col = Math.floor(Math.random() * mapGrid.NUM_COLS);
    let row = Math.floor(Math.random() * mapGrid.NUM_ROWS);
    while (gameState.weapons[[col, row]]) {
      col = Math.floor(Math.random() * mapGrid.NUM_COLS);
      row = Math.floor(Math.random() * mapGrid.NUM_ROWS);
    }

    const type = weaponTypes.BFS;
    const weapon = Crafty.e('Weapon')
                         .at(col, row)
                         .setUp(gameState.weaponId, type);
    gameState.weapons[gameState.weaponId] = weapon;

    io.emit('addWeapon', {
      x: col,
      y: row,
      type: type,
      color: constants.WEAPON_COLOR,
      weaponId: gameState.weaponId
    });

    gameState.weaponId++;
  }, 5000);
}

function setUpPickUpWeapon(socket) {
  socket.on('pickUpWeapon', data => {
    const player = gameState.players[data.playerId];
    const collidedWeapons = player.hit('Weapon');
    if (collidedWeapons) {
      const weapon = collidedWeapons[0].obj;
      const weaponId = weapon.weaponId;
      player.weaponType = weapon.type;
      io.to(data.playerId).emit('pickUpWeapon', {
        type: weapon.type
      });

      weapon.destroy();
      delete gameState.weapons[weaponId];
      io.emit('destroyWeapon', {
        weaponId: weaponId
      });
    }
  });
}

function setUpShootWeapon(socket) {
  socket.on('shootWeapon', data => {
    const player = gameState.players[data.playerId];
    let damageCells = [];
    if (player.weaponType === weaponTypes.BFS) {
      damageCells = shootBFSWeapon(player);
    }

    for (let i = 0; i < damageCells.length; i++) {
      Crafty.e('Damage')
            .at(damageCells[i][0], damageCells[i][1])
            .setUpCreator(data.playerId)
            .disappearAfter();
    }

    io.emit('createDamage', {
      damageCells: damageCells,
      creatorId: data.playerId,
      color: Constants.DAMAGE_COLOR
    });
  });
}

function shootBFSWeapon(player) {
  let damageCells = [];
  let initCol = player.getCol();
  let initRow = player.getRow();
  let remainingDistance = constants.WEAPON_RANGE;
  let tileQueue = [[initCol, initRow]];
  while (remainingDistance >= 0) {
    let [col, row] = tileQueue.shift();
    damageCells.push([col, row]);
    let tile = gameState.board.grid[col][row];
    if (!tile.walls.left) {
      const damageCell = [col - 1, row];
      if (!hasCell(damageCells, damageCell)) {
        tileQueue.push([col - 1, row]);
      }
    }
    if (!tile.walls.top) {
      const damageCell = [col, row - 1];
      if (!hasCell(damageCells, damageCell)) {
        tileQueue.push([col, row - 1]);
      }
    }
    if (!tile.walls.right) {
      const damageCell = [col + 1, row];
      if (!hasCell(damageCells, damageCell)) {
        tileQueue.push([col + 1, row]);
      }
    }
    if (!tile.walls.bottom) {
      const damageCell = [col, row + 1];
      if (!hasCell(damageCells, damageCell)) {
        tileQueue.push([col, row + 1]);
      }
    }
    remainingDistance--;
  }

  return damageCells;
}

function hasCell(damageCells, damageCell) {
  return damageCells.some(cell => {
    return cell[0] === damageCell[0] && cell[1] === damageCell[1];
  });
}

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
