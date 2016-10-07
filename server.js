var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Crafty = require('craftyjs')();
var ServerModel = require('./public/src/model/server_model.js');
var createCanvas = require('./public/src/components/canvas.js');
var Board = require('./public/src/board.js');
var GameState = require('./public/src/game_state.js');
var crypto = require("crypto");
const Constants = require('./public/src/constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;
const weaponTypes = Constants.weaponTypes;

app.use(express.static('public'));

createCanvas(Crafty, ServerModel);

const constants = {
  WEAPON_COLORS: {
    BFS: '#ffa500',
    DFS: '#551a8b'
  },
  WEAPON_RANGE: 10,
  BUFFER_DAMAGE_TIME: 1000,
  BUFFER_SHOOTING_TIME: 1500,
  WEAPON_SPAWN_TIME: 5000,
  DAMAGE_ANIMATION_TIME: 100,
  DAMAGE_DISAPPEAR_TIME: 1000,
  HP_DAMAGE: 10,
  BALL_COLOR: '#008080',
  GAME_DURATION: 30// 200
};

let gameStateObj = {
  players: {
    1: null,
    2: null,
    3: null,
    4: null
  },
  weapons: {},
  ball: null,
  seedRandomStr: "randomStr" + Math.floor(Math.random() * 30).toString(),
  board: null,
  timer: constants.GAME_DURATION,
  ballHolder: null,
  addWeaponIntervalId: null,
  setScoreIntervalId: null
};

// let gameState = new GameState();
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

function getPlayerInitPos() {
  let playerPos = [];
  for (let i = 0; i <= 1 ; i++) {
    for (let j = 0; j <= 1; j++) {
      const col = j * (mapGrid.NUM_COLS - 1);
      const row = i * (mapGrid.NUM_ROWS - 1);
      playerPos.push([col, row]);
    }
  }
  return playerPos;
}

function setUpStartGame(socket) {
  drawBoard();
  const playerPos = getPlayerInitPos();
  socket.on('startNewGame', data => {
      const players = Object.keys(gameState.players).filter((playerId) => {
        return gameState.players[playerId] !== null;
      }).map(playerId => {
        return {
          playerId: playerId,
          playerColor: colors[playerId - 1],
          playerPos: [playerPos[playerId - 1][0], playerPos[playerId - 1][1]]
        };
      });

      Object.keys(gameState.players).filter((playerId) => {
        return gameState.players[playerId] !== null;
      }).forEach(playerId => {
        let player =
          Crafty.e('Player')
                .at(playerPos[playerId - 1][0], playerPos[playerId - 1][1])
                .setUp(playerId, colors[playerId - 1]);
        gameState.players[playerId] = player;
      });

      if (players.length >= 2) {
        io.emit('startNewGame', {
          players: players,
          timer: gameState.timer
        });
      }

    const col = Math.floor(mapGrid.NUM_COLS / 2);
    const row = Math.floor(mapGrid.NUM_ROWS / 2);
    // const col = 1;
    // const row = 1;


    addBall(col, row);
    addWeapon();
    addTimer();
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

function addBall(col, row) {
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

function pickUpBall() {
  console.log(gameState.ball);
  const player = gameState.ball.hit('Player')[0].obj;
  gameState.ball.destroy();
  gameState.ball = null;
  gameState.ballHolder = player;
  setBallTime(player);

  // io.to(player.playerId).emit('pickUpBall');
  io.emit('showBall', {
    playerId: player.playerId
  });
}

function setBallTime(player) {
  gameState.setScoreIntervalId = setInterval(() => {
    if (!gameState.ballHolder ||
        player.playerId !== gameState.ballHolder.playerId) {
      clearInterval(gameState.setScoreIntervalId);
    }

    player.currentBallHoldingTime++;
    if (player.currentBallHoldingTime > player.longestBallHoldingTime) {
      player.longestBallHoldingTime = player.currentBallHoldingTime;
      showScoreboard(player);
    }

    showSelfScore(player);
  }, 1000);
}

function showScoreboard(player) {
  io.emit('showScoreboard', {
    playerId: player.playerId,
    score: player.longestBallHoldingTime
  });
}

function addTimer() {
  gameState.timer--;
  let intervalId = setInterval(() => {
    io.emit('countDown', {
      timer: gameState.timer
    });


    if (gameState.timer <= 0) {
      clearInterval(intervalId);
      gameOver();
    }

    gameState.timer--;
  }, 1000);
}

function gameOver() {
  clearInterval(gameState.addWeaponIntervalId);
  clearInterval(gameState.setScoreIntervalId);
  let winner = null;
  let winnerScore = 0;
  let playerIds = Object.keys(gameState.players);
  for (let i = 0; i < playerIds.length; i++) {
    let player = gameState.players[playerIds[i]];
    if (player) {
      let playerScore = player.longestBallHoldingTime;
      if (playerScore > winnerScore) {
        winner = player;
        winnerScore = playerScore;
      }
    }
  }

  let winnerId;
  if (winner !== null) {
    winnerId = winner.playerId;
  }

  io.emit('gameOver', {
    winnerId: winnerId,
    winnerScore: winnerScore
  });

  setTimeout(() => {
    clearGameState();
  }, 300);
}

function clearGameState() {
  Object.keys(gameState.weapons).forEach(weaponPos => {
    gameState.weapons[weaponPos].destroy();
  });
  gameState.weapons = {};

  if (gameState.ball !== null) {
    gameState.ball.destroy();
    gameState.ball = null;
  }

  gameState.seedRandomStr =
    "randomStr" + Math.floor(Math.random() * 30).toString();
  gameState.board = null;
  gameState.timer = constants.GAME_DURATION;
  gameState.ballHolder = null;
  gameState.addWeaponIntervalId = null;

  Crafty('Wall').each(function(i) {
    this.destroy();
  });

  Crafty('Damage').each(function(i) {
    this.destroy();
  });

  Object.keys(gameState.players).map(id => {
    if (gameState.players[id] !== null && gameState.players[id] !== true) {
      gameState.players[id].destroy();
      gameState.players[id] = true;
    }
  });

}

function drawBoard() {
  gameState.board =
    new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, gameState.seedRandomStr);
  for (let i = 0; i < mapGrid.NUM_COLS; i++) {
    for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
      gameState.board.grid[i][j].drawWalls(Crafty);
    }
  }
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

function addWeapon() {
  gameState.addWeaponIntervalId = setInterval(function() {
    // Pick a random col, row
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
                         .setUp(type);
    gameState.weapons[[col, row]] = weapon;

    io.emit('addWeapon', {
      x: col,
      y: row,
      type: type,
      color: constants.WEAPON_COLORS[type],
    });

  }, constants.WEAPON_SPAWN_TIME);
}

function setUpPickUpWeapon(socket) {
  socket.on('pickUpWeapon', data => {
    const player = gameState.players[data.playerId];
    const collidedWeapons = player.hit('Weapon');
    if (collidedWeapons) {
      const weapon = collidedWeapons[0].obj;
      player.weaponType = weapon.type;
      io.to(data.playerId).emit('pickUpWeapon', {
        type: weapon.type
      });

      const [col, row] = [weapon.getCol(), weapon.getRow()];
      weapon.destroy();
      delete gameState.weapons[[col, row]];
      io.emit('destroyWeapon', {
        col: col,
        row: row
      });
    }
  });
}

function setUpShootWeapon(socket) {
  socket.on('shootWeapon', data => {
    const player = gameState.players[data.playerId];
    if (!player.weaponCoolingDown) {
      let damageCells = [];
      if (player.weaponType === weaponTypes.BFS) {
        damageCells = shootBFSWeapon(player);
      } else if (player.weaponType === weaponTypes.DFS) {
        damageCells = shootDFSWeapon(player);
      }

      bufferShootingTime(player);

      let idx = 0;
      let intervalId = setInterval(() => {
        const damage = Crafty.e('Damage')
              .at(damageCells[idx][0], damageCells[idx][1])
              .setUpCreator(data.playerId)
              .disappearAfter(constants.DAMAGE_DISAPPEAR_TIME);

        damage.onHit('Player', lowerHP.bind(null, damage));

        io.emit('createDamage', {
          damageCell: damageCells[idx],
          creatorId: data.playerId,
          disappearTime: constants.DAMAGE_DISAPPEAR_TIME
        });

        idx++;

        if (idx === damageCells.length) {
          clearInterval(intervalId);
        }

      }, constants.DAMAGE_ANIMATION_TIME);
    }
  });
}

function bufferShootingTime(player) {
  player.weaponCoolingDown = true;
  setTimeout(() => {
    player.weaponCoolingDown = false;
  }, constants.BUFFER_SHOOTING_TIME);
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

function lowerHP(damageEntity) {
  const hitPlayers = damageEntity.hit('Player');
  if (hitPlayers) {
    hitPlayers.forEach(playerObj => {
      const player = playerObj.obj;
      if (!player.hasTakenDamage &&
        parseInt(damageEntity.creatorId) !== parseInt(player.playerId)) {
        player.HP -= constants.HP_DAMAGE;
        if (player.HP <= 0) {
          respawnPlayer(player);
        }
        bufferDamageTime(player);
        io.emit('HPChange', {
          playerId: player.playerId,
          playerHP: player.HP
        });
      }
    });
  }
}

function respawnPlayer(player) {
  player.HP = 100;
  if (gameState.ballHolder &&
      player.playerId === gameState.ballHolder.playerId) {
    loseBall(player);
  }

  player.weaponType = null;
  io.to(player.playerId).emit('loseWeapon');

  const initPlayerPos = getPlayerInitPos();
  const randomPos =
    initPlayerPos[Math.floor(Math.random() * initPlayerPos.length)];
  player.at(randomPos[0], randomPos[1]);

  io.emit('updatePos', {
    playerId: player.playerId,
    x: player.x,
    y: player.y
  });
}

function loseBall(player) {
  addBall(player.getCol(), player.getRow());
  gameState.ballHolder = null;

  io.emit('loseBall', {
    playerId: player.playerId
  });

  player.currentBallHoldingTime = 0;
  showSelfScore(player);
}

function showSelfScore(player) {
  io.to(player.playerId).emit('showSelfScore', {
    currentBallHoldingTime: player.currentBallHoldingTime,
    longestBallHoldingTime: player.longestBallHoldingTime
  });
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
