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

let gameState = {
  weaponId: 0,
  players: {
    1: null,
    2: null,
    3: null,
    4: null
  },
  weapons: {},
  ball: null,
  seedRandomStr: "whatever",
  board: null,
  timer: 60
};

const constants = {
  WEAPON_COLORS: {
    BFS: '#ffa500',
    DFS: '#551a8b'
  },
  WEAPON_RANGE: 10,
  DAMAGE_COLOR: 'purple',
  BUFFER_DAMAGE_TIME: 400,
  WEAPON_SPAWN_TIME: 10000,
  DAMAGE_ANIMATION_TIME: 100,
  HP_DAMAGE: 10,
  BALL_COLOR: '#008080'
};

io.on('connection', function(socket) {
  console.log(`a user connected`);

  let selfId;
  for (let i = 1; i <= Object.keys(gameState.players).length; i++) {
    if (gameState.players[i] === null) {
      selfId = i;
      break;
    }
  }

  if (selfId === undefined) {
    return;
  }

  socket.emit('connected', { selfId: selfId,
                             seedRandomStr: gameState.seedRandomStr,
                             playerColor: colors[selfId - 1]
                           });

  Object.keys(gameState.players).forEach((id) => {
     if (gameState.players[id] !== null) {
       socket.emit('addNewPlayer', {
         playerId: id,
         playerColor: colors[id - 1]
       });
     }
  });

  socket.join(selfId);

  drawBoard();
  setUpAddNewPlayer(socket, selfId, colors[selfId - 1]);

  let player =  Crafty.e('Player')
                      .at(0, 0)
                      .setUp(selfId, colors[selfId - 1]);

  gameState.players[selfId] = player;

  setUpDisconnect(socket, selfId);
  setUpStartGame(socket);
});

function setUpStartGame(socket) {
  socket.on('startNewGame', data => {
    console.log('starting new game');
      const players = Object.keys(gameState.players).filter((playerId) => {
        return gameState.players[playerId] !== null;
      }).map(playerId => {
        return {
          playerId: playerId,
          playerColor: gameState.players[playerId].playerColor,
          playerPos: [gameState.players[playerId].getCol(),
                      gameState.players[playerId].getRow()]
        };
      });

      if (players.length >= 2) {
        io.emit('startNewGame', {
          players: players,
          timer: gameState.timer
        });
      }

      addBall(socket);
      setUpUpdatePos(socket);
      setUpPickUpWeapon(socket);
      setUpShootWeapon(socket);
      setUpTimer(socket);
      addWeapon(socket);

  });
}

// function extractPlayersInfo() {
//   let playersInfo = {};
//   Object.keys(gameState.players).forEach((id) => {
//     if (gameState.players[id] !== null) {
//       playersInfo[id] = colors[id];
//     }
//   });
//
//   return playersInfo;
// }

function addBall(socket) {
  const col = Math.floor(mapGrid.NUM_COLS / 2);
  const row = Math.floor(mapGrid.NUM_ROWS / 2);
  gameState.ball =
    Crafty.e('Ball')
          .at(col, row)
          .onHit('Player', pickUpBall);
  io.emit('addBall', {
    col: col,
    row: row,
    ballColor: constants.BALL_COLOR
  });
}

function pickUpBall(socket) {

}

function setUpTimer(socket) {
  gameState.timer--;
  let intervalId = setInterval(() => {
    io.emit('countDown', {
      timer: gameState.timer
    });


    if (gameState.timer <= 0) {
      clearInterval(intervalId);
      gameOver(socket);
    }

    gameState.timer--;
  }, 1000);
}

function gameOver(socket) {
  io.emit('gameOver', {

  });
}

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

function setUpDisconnect(socket, playerId) {
  socket.on('disconnect', function() {
    console.log('user disconnected');
    gameState.players[playerId].destroy();
    gameState.players[playerId] = null;
    io.emit('othersDisconnected', {
      playerId: playerId
    });
  });
}

function setUpUpdatePos(socket) {
  socket.on('updatePos', function(data) {
    console.log(data);
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

function setUpAddNewPlayer(socket, playerId, color) {
  socket.broadcast.emit('addNewPlayer', {
    playerId: playerId,
    playerColor: color
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

    const randomIdx =
      Math.floor(Math.random() * Object.keys(weaponTypes).length);
    const type = weaponTypes[Object.keys(weaponTypes)[randomIdx]];
    const weapon = Crafty.e('Weapon')
                         .at(col, row)
                         .setUp(gameState.weaponId, type);
    gameState.weapons[gameState.weaponId] = weapon;

    io.emit('addWeapon', {
      x: col,
      y: row,
      type: type,
      color: constants.WEAPON_COLORS[type],
      weaponId: gameState.weaponId
    });

    gameState.weaponId++;
  }, constants.WEAPON_SPAWN_TIME);
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
    } else if (player.weaponType === weaponTypes.DFS) {
      damageCells = shootDFSWeapon(player);
    }

    let idx = 0;
    let intervalId = setInterval(() => {
      const damage = Crafty.e('Damage')
            .at(damageCells[idx][0], damageCells[idx][1])
            .setUpCreator(data.playerId)
            .disappearAfter();

      damage.onHit('Player', lowerHP.bind(null, damage));

      io.emit('createDamage', {
        damageCell: damageCells[idx],
        creatorId: data.playerId,
        color: Constants.DAMAGE_COLOR
      });

      idx++;

      if (idx === damageCells.length) {
        clearInterval(intervalId);
      }

    }, constants.DAMAGE_ANIMATION_TIME);

  });
}

function shootBFSWeapon(player) {
  let damageCells = [];
  let initCol = player.getCol();
  let initRow = player.getRow();
  let remainingDistance = constants.WEAPON_RANGE;
  let tileQueue = [[initCol, initRow]];
  while (remainingDistance > 0) {
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

function shootDFSWeapon(player) {
  let damageCells = [];
  let col = player.getCol();
  let row = player.getRow();
  let remainingDistance = constants.WEAPON_RANGE;
  let tileStack = [];
  while (remainingDistance > 0) {
    if (!hasCell(damageCells, [col, row])) {
      damageCells.push([col, row]);
    }
    let tile = gameState.board.grid[col][row];
    let untouchedPaths =
      getUntouchedPaths(col, row, damageCells, tile.remainingPaths());
    if (untouchedPaths.length !== 0) {
      remainingDistance--;
      tileStack.push([col, row]);
      let randomIdx = Math.floor(Math.random() * untouchedPaths.length);
      let path = untouchedPaths[randomIdx];
      [col, row] = getNewColRow(col, row, path);
    } else {
      [col, row] = tileStack.pop();
    }
  }

  return damageCells;
}

function getNewColRow(col, row, path) {
  if (path === 'left') {
    return [col - 1, row];
  } else if (path === 'top') {
    return [col, row - 1];
  } else if (path === 'right') {
    return [col + 1, row];
  } else if (path === 'bottom') {
    return [col, row + 1];
  }
}

function getUntouchedPaths(col, row, damageCells, remainingPaths) {
  let newPos;
  return remainingPaths.filter((path) => {
    newPos = getNewColRow(col, row, path);
    return !hasCell(damageCells, newPos);
  });
}

function hasCell(damageCells, damageCell) {
  return damageCells.some(cell => {
    return cell[0] === damageCell[0] && cell[1] === damageCell[1];
  });
}

// function checkDamage(creatorId) {
//   console.log('creat', creatorId);
//   return setInterval(() => {
//     Object.keys(gameState.players).forEach(playerId => {
//       const player = gameState.players[playerId];
//       console.log(player.hit('Damage'));
//       if (player.hit('Damage') &&
//          (parseInt(playerId, 10) !== parseInt(creatorId, 10))) {
//         player.HP -= 10;
//         console.log('killing someone on server')
//         io.emit('HPChange', {
//           playerId: player.playerId,
//           playerHP: player.HP
//         });
//       }
//     });
//   }, 100);
// }

function lowerHP(damageEntity) {
  const hitPlayers = damageEntity.hit('Player');
  if (hitPlayers) {
    hitPlayers.forEach(playerObj => {
      const player = playerObj.obj;
      if (!player.hasTakenDamage &&
        parseInt(damageEntity.creatorId) !== parseInt(player.playerId)) {
        player.HP -= constants.HP_DAMAGE;
        bufferDamageTime(player);
        io.emit('HPChange', {
          playerId: player.playerId,
          playerHP: player.HP
        });
      }
    });
  }
}

function bufferDamageTime(player) {
  player.hasTakenDamage = true;
  setTimeout(() => {
    player.hasTakenDamage = false;
  }, constants.BUFFER_DAMAGE_TIME);
}

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
