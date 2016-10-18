const seedrandom = require('seedrandom');
const PriorityQueue = require('js-priority-queue');
const Constants = require('./constants.js');
const Craftyjs = require('craftyjs');
const initGame = require('./components/init.js');
const Board = require('./board.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;
const weaponTypes = Constants.weaponTypes;
const gameSettings = Constants.gameSettings;

class GameState {
  constructor(io, socket, roomId) {
    this.sockets = {};
    this.roomId = roomId;
    this.players = {
      1: null,
      2: null,
      3: null,
      4: null
    };
    this.weapons = {};
    this.ball = null;
    this.seedRandomStr = "randomStr" +
      Math.floor(Math.random() * 30).toString();
    this.board =
      new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS,
                this.seedRandomStr, this.Crafty);
    this.timer = gameSettings.GAME_DURATION;
    this.ballHolder = null;
    this.addWeaponIntervalId = null;
    this.setScoreIntervalId = null;
    this.io = io;

    this.addSocket(socket);
    this.Crafty = Craftyjs();
    this.isGameOver = false;
    initGame(this.Crafty);
  }

  addSocket(socket) {
    if (Object.keys(this.sockets).length < 4) {
      this.sockets[socket.id] = socket;
      socket.join(this.roomId);  // join that socket to the game room

      socket.on('setUpLoadingScene', () => {
        this.setUpLoadingScene(socket);
      });
      return true;
    } else {
      return false; // room is full
    }
  }

  setUpLoadingScene(socket) {
    // give a playerId to player
    let playerId;
    for (let i = 1; i <= Object.keys(this.players).length; i++) {
      if (this.players[i] === null) {
        playerId = i;
        break;
      }
    }

    socket.emit('setUpGame', {
      selfId: playerId,
      seedRandomStr: this.seedRandomStr,
      playerColor: gameSettings.COLORS[playerId - 1]
    });

    // adding existing players in the room
    Object.keys(this.players).forEach((id) => {
       if (this.players[id] !== null) {
         socket.emit('addNewPlayer', {
           playerId: id,
           playerColor: gameSettings.COLORS[id - 1]
         });
       }
    });

    this.players[playerId] = true;

    this.setUpDisconnect(socket, playerId);
    this.setUpAddNewPlayer(socket, playerId,
                            gameSettings.COLORS[playerId - 1]);
    this.setUpStartGame(socket);
    this.setUpUpdateMovement(socket);
    this.setUpPickUpWeapon(socket);
    this.setUpShootWeapon(socket);
  }

  setUpDisconnect(socket, playerId) {
    socket.on('disconnect', () => {
      console.log('user disconnected');
      delete this.sockets[socket.id];

      // delete player if game has started already
      if (this.players[playerId] !== true) {
        this.players[playerId].destroy();
      }
      this.players[playerId] = null;

      // notify other people that this player disconnected
      this.io.to(this.roomId).emit('othersDisconnected', {
        playerId: playerId,
        playerColor: gameSettings.COLORS[playerId - 1]
      });
    });
  }

  // when a new player enters
  setUpAddNewPlayer(socket, playerId, color) {
    socket.broadcast.to(this.roomId).emit('addNewPlayer', {
      playerId: playerId,
      playerColor: color
    });
  }

  setUpStartGame(socket) {
    const allPlayerPos = this.getPlayerInitPos();
    socket.on('startNewGame', data => {
      // start the game when there are two or more players
      if (Object.keys(this.sockets).length < 2) {
        return;
      }

      // creating the player characters
      this.createPlayerEntities(allPlayerPos);

      // sending this info over to the client
      const playerData = Object.keys(this.players).filter((playerId) => {
        return this.players[playerId] !== null;
      }).map(playerId => {
        const playerPos = allPlayerPos[playerId - 1];
        const playerEntity = this.players[playerId];
        return {
          playerId: playerId,
          playerColor: gameSettings.COLORS[playerId - 1],
          playerPos: playerPos,
          playerPx: [playerEntity.x, playerEntity.y]
        };
      });

      this.io.to(this.roomId).emit('startNewGame', {
        players: playerData,
        timer: this.timer
      });

      this.addBall();
      this.addWeapon();
      this.addTimer();
    });
  }

  createPlayerEntities(allPlayerPos) {
    Object.keys(this.players).filter((playerId) => {
      return this.players[playerId] !== null;
    }).forEach(playerId => {
      const [playerRow, playerCol] = allPlayerPos[playerId - 1];
      let player =
        this.Crafty.e('SelfPlayer')
                   .at(playerRow, playerCol)
                   .setUp(playerId, gameSettings.COLORS[playerId - 1]);
        this.players[playerId] = player;
    });
  }

  getPlayerInitPos() {
    let playerPos = [];
    [0, this.board.numGridRows - 1].forEach(row => {
      [0, this.board.numGridCols - 1].forEach(col => {
        const mazePos = this.board.gridToMazePos(row, col);
        playerPos.push(mazePos);
      });
    });

    return playerPos;
  }

  addBall(mazeRow, mazeCol) {
    if (mazeRow === undefined) {
      const col = Math.floor(this.board.numGridCols / 2);
      const row = Math.floor(this.board.numGridRows / 2);
      [mazeRow, mazeCol] = this.board.gridToMazePos(row, col);
    }

    this.ball =
      this.Crafty.e('Ball')
                  .at(mazeRow, mazeCol)
                  .setUpStaticPos(mazeRow, mazeCol);
    this.io.to(this.roomId).emit('addBall', {
      col: mazeCol,
      row: mazeRow
    });
  }

   setBallTime(player) {
    this.setScoreIntervalId = setInterval(() => {
      if (!this.ballHolder ||
          player.playerId !== this.ballHolder.playerId) {
        clearInterval(this.setScoreIntervalId);
        return;
      }

      player.currentBallHoldingTime++;
      if (player.currentBallHoldingTime > player.longestBallHoldingTime) {
        player.longestBallHoldingTime = player.currentBallHoldingTime;
      }

      this.showScoreboard(player);

      // this.showSelfScore(player);
    }, 1000);
  }

  showScoreboard(player) {
    const rankedPlayerScores = this.getRankedPlayerScores();

    this.io.to(this.roomId).emit('showScoreboard', {
      playerColor: player.playerColor,
      currentBallHoldingTime: player.currentBallHoldingTime,
      rankedPlayerScores: rankedPlayerScores
    });
  }

  // sorting from the highest score to the lowest
  getRankedPlayerScores() {
    const allPlayerScores = Object.keys(this.players).filter(id => {
      return this.players[id] !== null;
    }).map(id => {
      return {
        playerColor: this.players[id].playerColor,
        longestBallHoldingTime: this.players[id].longestBallHoldingTime
      };
    });

    const scoreFromHighToLow = function(player1, player2) {
      return player2.longestBallHoldingTime - player1.longestBallHoldingTime;
    };

    return allPlayerScores.sort(scoreFromHighToLow);
  }

  addTimer() {
    this.timer--;
    let intervalId = setInterval(() => {
      this.io.to(this.roomId).emit('countDown', {
        timer: this.timer
      });


      if (this.timer <= 0) {
        clearInterval(intervalId);
        this.gameOver();
      }

      this.timer--;
    }, 1000);
  }

  gameOver() {
    clearInterval(this.addWeaponIntervalId);
    clearInterval(this.setScoreIntervalId);
    this.isGameOver = true;

    this.io.to(this.roomId).emit('gameOver', {
      rankedPlayerScores: this.getRankedPlayerScores()
    });

    setTimeout(() => {
      this.clearGameState();
    }, 300);
  }

  clearGameState() {
    Object.keys(this.weapons).forEach(weaponPos => {
      this.weapons[weaponPos].destroy();
    });
    this.weapons = {};

    if (this.ball !== null) {
      this.ball.destroy();
      this.ball = null;
    }

    this.seedRandomStr =
      "randomStr" + Math.floor(Math.random() * 30).toString();
    this.board = null;
    this.timer = gameSettings.GAME_DURATION;
    this.ballHolder = null;
    this.addWeaponIntervalId = null;

    this.Crafty('Wall').each(function(i) {
      this.destroy();
    });

    this.Crafty('Damage').each(function(i) {
      clearInterval(this.checkCollisionInterval);
      this.destroy();
    });

    Object.keys(this.players).map(id => {
      if (this.players[id] !== null && this.players[id] !== true) {
        this.players[id].destroy();
        this.players[id] = true;
      }
    });

  }

  setUpUpdateMovement(socket) {
    socket.on('updatePos', data => {
      if (this.isGameOver) {
        return;
      }

      let movingPlayer = this.players[data.playerId];
      let dirX, dirY;
      if (data.charMove.left) {
        dirX = -1;
        dirY = -1;
      } else if (data.charMove.right) {
        dirX = 1;
        dirY = 1;
      } else if (data.charMove.up) {
        dirX = 1;
        dirY = -1;
      } else if (data.charMove.down) {
        dirX = -1;
        dirY = 1;
      }

      movingPlayer.moveDir(dirX, dirY);
      if (this.collideWithWall(movingPlayer)) {
        let undoDirX = dirX === -1 ? 1 : -1;
        let undoDirY = dirY === -1 ? 1 : -1;
        movingPlayer.moveDir(undoDirX, undoDirY);
      }

      if (this.ball && this.collideWithItem(movingPlayer, this.ball)) {
        this.pickUpBall(socket, movingPlayer);
      }

      this.io.to(this.roomId).emit('updatePos', {
        playerId: data.playerId,
        x: movingPlayer.x,
        y: movingPlayer.y,
        charMove: data.charMove
      });
    });

    socket.on('stopMovement', data => {
      this.io.to(this.roomId).emit('stopMovement', {
        playerId: data.playerId,
        keyCode: data.keyCode
      });
    });
  }

  pickUpBall(socket, player) {
    this.ball.destroy();
    this.ball = null;
    this.ballHolder = player;
    this.setBallTime(player);

    // player get to pick up astar weapon
    player.weaponType = weaponTypes.ASTAR;
    socket.emit('pickUpWeapon', {
      type: weaponTypes.ASTAR
    });

    this.io.to(this.roomId).emit('showBall', {
      playerId: player.playerId,
      playerColor: player.playerColor,
      currentBallHoldingTime: 0
    });
  }

  // checking if player's current position is colliding with a wall or
  // if it is out of the grid
  collideWithWall(player) {
    let [rows, cols] = player.getRowsCols();
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        if (!this.board.isInGrid(rows[i], cols[j]) ||
            this.board.maze[rows[i]][cols[j]].isWall) {
          return true;
        }
      }
    }

    return false;
  }

  collideWithItem(player, item) {
    let [rows, cols] = player.getRowsCols();
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        if (rows[i] === item.staticRow && cols[j] === item.staticCol) {
          return true;
        }
      }
    }

    return false;
  }

  addWeapon() {
    this.addWeaponIntervalId = setInterval(() => {
      // Pick a random col, row
      let [row, col] = this.board.getRandomCell();
      while (this.weapons[[row, col]]) {
        [row, col] = this.board.getRandomCell();
      }

      const pickables = [weaponTypes.BFS, weaponTypes.DFS];
      const randomIdx = Math.floor(Math.random() * pickables.length);
      const type = pickables[randomIdx];
      const weapon = this.Crafty.e('Weapon')
                               .at(row, col)
                               .setUpStaticPos(row, col)
                               .setUp(type);
      this.weapons[[row, col]] = weapon;

      this.io.to(this.roomId).emit('addWeapon', {
        row: row,
        col: col,
        type: type
      });

    }, gameSettings.WEAPON_SPAWN_TIME);
  }

  setUpPickUpWeapon(socket) {
    socket.on('pickUpWeapon', data => {
      if (this.isGameOver) {
        return;
      }

      const player = this.players[data.playerId];
      const collidedWeapon = this.collidedWeapon(player);
      if (collidedWeapon !== null) {
        player.weaponType = collidedWeapon.type;
        socket.emit('pickUpWeapon', {
          type: collidedWeapon.type
        });

        const [row, col] = [collidedWeapon.staticRow, collidedWeapon.staticCol];
        collidedWeapon.destroy();
        delete this.weapons[[row, col]];
        this.io.to(this.roomId).emit('destroyWeapon', {
          row: row,
          col: col
        });
      }
    });
  }

  collidedWeapon(player) {
    let weaponPos = Object.keys(this.weapons);
    for (let i = 0; i < weaponPos.length; i++) {
      const weapon = this.weapons[weaponPos[i]];
      if (this.collideWithItem(player, weapon)) {
        return weapon;
      }
    }

    return null;
  }

  setUpShootWeapon(socket) {
    socket.on('shootWeapon', data => {
      if (this.isGameOver) {
        return;
      }

      const player = this.players[data.playerId];
      if (!player.weaponCoolingDown) {
        let damageCells = [];
        if (player.weaponType === weaponTypes.BFS) {
          damageCells = this.shootBFSWeapon(player);
        } else if (player.weaponType === weaponTypes.DFS) {
          damageCells = this.shootDFSWeapon(player);
        } else if (player.weaponType === weaponTypes.ASTAR) {
          damageCells = this.shootASTARWeapon(player);
        }

        this.bufferShootingTime(player);

        let idx = 0;
        let intervalId = setInterval(() => {
          if (this.isGameOver) {
            clearInterval(intervalId);
            return;
          }

          const [row, col] = damageCells[idx];
          const damage = this.Crafty.e('Damage')
                        .at(row, col)
                        .setUpCreator(data.playerId)
                        .setUpStaticPos(row, col)
                        .disappearAfter(gameSettings.DAMAGE_DISAPPEAR_TIME);

          this.checkForDamageCollision(damage);

          this.io.to(this.roomId).emit('createDamage', {
            row: row,
            col: col,
            creatorId: data.playerId,
            disappearTime: gameSettings.DAMAGE_DISAPPEAR_TIME
          });

          idx++;
          if (idx >= damageCells.length) {
            clearInterval(intervalId);
          }

        }, gameSettings.DAMAGE_ANIMATION_TIME);
      }
    });
  }

  // check if it hits a player once in a while
  checkForDamageCollision(damage) {
    damage.checkCollisionInterval = setInterval(() => {
      Object.keys(this.players).forEach(playerId => {
        let player = this.players[playerId];
        // if player exists and it collides with a damage cell
        if (player && this.collideWithItem(player, damage)) {
          this.lowerHP(player, damage);
        }
      });
    }, gameSettings.CHECK_COLLISION_INTERVAL);
  }

  bufferShootingTime(player) {
    player.weaponCoolingDown = true;
    setTimeout(() => {
      player.weaponCoolingDown = false;
    }, gameSettings.BUFFER_SHOOTING_TIME);
  }

  // find out the cells that bfs weapon reaches to
  shootBFSWeapon(player) {
    let damageCells = [];
    let exploredCells = {};
    let [initRow, initCol] = player.getTopLeftRowCol();
    let remainingDistance = gameSettings.WEAPON_RANGE;
    let tileQueue = [[initRow, initCol]];
    while (remainingDistance > 0 && tileQueue.length !== 0) {
      let [row, col] = tileQueue.shift();
      damageCells.push([row, col]);
      exploredCells[[row, col]] = true; // so we won't duplicate damage cells
      // push its neighbor tiles to the queue
      let neighborTiles = this.board.getNeighborTiles(row, col);
      neighborTiles.forEach(([tileRow, tileCol]) => {
        if (exploredCells[[tileRow, tileCol]] === undefined) {
          // hasn't been explored yet
          tileQueue.push([tileRow, tileCol]);
        }
      });
      remainingDistance--;
    }

    return damageCells;
  }

  shootDFSWeapon(player) {
    let damageCells = [];
    let exploredCells = {};
    let [row, col] = player.getTopLeftRowCol();
    let remainingDistance = gameSettings.WEAPON_RANGE;
    let tileStack = [];
    while (remainingDistance > 0) {
      if (exploredCells[[row, col]] === undefined) {
        damageCells.push([row, col]);
        exploredCells[[row, col]] = true;
        remainingDistance--;
      }

      // check its remaining neighbor tiles, see if there's another path we
      // can go to
      let neighborTiles = this.board.getNeighborTiles(row, col);
      let unvisitedNeighbors = neighborTiles.filter(pos => {
        return exploredCells[pos] === undefined;
      });

      if (unvisitedNeighbors.length !== 0) {
        tileStack.push([row, col]);
        let randomIdx = Math.floor(Math.random() * unvisitedNeighbors.length);
        [row, col] = unvisitedNeighbors[randomIdx];
      } else {
        if (tileStack.length === 0) {
          break;
        }

        [row, col] = tileStack.pop(); // no remaining paths, have to backtrack
      }
    }

    return damageCells;
  }

  shootASTARWeapon(player) {
    // the priority queue comparator to determine which path is the best path
    const compareTwoPathCosts = function([tile1, cost1], [tile2, cost2]) {
      return cost1 - cost2;
    };
    let frontier = new PriorityQueue({ comparator: compareTwoPathCosts });
    let cameFrom = {}; // recording the parent tile (prev path) of a tile
    // recording the min distance from start tile to a tile
    let distanceFromStart = {};

    // the goals are the other players
    let goals = this.getOtherPlayersPos(player.playerId);

    let initPos = player.getTopLeftRowCol();
    frontier.queue([initPos, 0]); // enqueue the initial pos
    cameFrom[initPos] = null;
    distanceFromStart[initPos] = 0;

    // keep expanding from the lowest cost tile to the closest goal
    while (frontier.length !== 0) {
      const [curr, cost] = frontier.dequeue();

      const goal = this.getPosEqual(goals, curr);
      if (goal !== null) {
        return this.constructPath(cameFrom, goal);
      }

      const neighborTiles = this.board.getNeighborTiles(curr[0], curr[1]);
      neighborTiles.forEach(next => {
        const newDistance = distanceFromStart[curr] + 1;
        if (distanceFromStart[next] === undefined ||
            newDistance < distanceFromStart[next]) {
          distanceFromStart[next] = newDistance;
          cameFrom[next] = curr;
          let newCost = newDistance + this.getMinManhattanDistance(next, goals);
          frontier.queue([next, newCost]);
        }
      });
    }

    return [];
  }

  // heuristic function for a star algorithm
  getMinManhattanDistance([row, col], goals) {
    let shortestDistance = null;
    for (let i = 0; i < goals.length; i++) {
      const [goalRow, goalCol] = goals[i];
      const dRow = Math.abs(row - goalRow);
      const dCol = Math.abs(col - goalCol);
      const distance = dRow + dCol;
      if (shortestDistance === null || distance < shortestDistance) {
        shortestDistance = distance;
      }
    }

    return shortestDistance;
  }

  getOtherPlayersPos(currPlayerId) {
    let otherPlayers = Object.keys(this.players).filter(id => {
      return parseInt(id) !== parseInt(currPlayerId)
          && this.players[id] !== null;
    });

    return otherPlayers.map(id => {
      return this.players[id].getTopLeftRowCol();
    });
  }

  // return one of the goals if they're the same distance, else null
  getPosEqual(goals, curr) {
    for (let i = 0; i < goals.length; i++) {
      // if row and col are the same
      if (curr[0] === goals[i][0] && curr[1] === goals[i][1]) {
        return goals[i];
      }
    }

    return null;
  }

  // path needs to expand a little more than just the path to goal because
  // the goal(other player) can be moving around
  constructPath(cameFrom, goal) {
    let path = this.board.getNeighborTiles(goal[0], goal[1]);
    let pos = goal;
    while (pos !== null) {
      path.unshift(pos);
      pos = cameFrom[pos]; // set the pos to prev pos
    }

    return path;
  }


  lowerHP(player, damageEntity) {
    if (!player.hasTakenDamage &&
      parseInt(damageEntity.creatorId) !== parseInt(player.playerId)) {
      player.HP -= gameSettings.HP_DAMAGE;
      if (player.HP <= 0) {
        this.respawnPlayer(player);
      }
      this.bufferDamageTime(player);
      this.io.to(this.roomId).emit('HPChange', {
        playerId: player.playerId,
        playerHP: player.HP
      });
    }
  }

  respawnPlayer(player) {
    player.HP = 100;
    if (this.ballHolder &&
        player.playerId === this.ballHolder.playerId) {
      this.loseBall(player);
    }

    console.log('respawning');
    console.log(player);

    player.weaponType = null;
    this.io.to(this.roomId).emit('loseWeapon', {
      playerId: player.id
    });

    const initPlayerPos = this.getPlayerInitPos();
    const [randomRow, randomCol] =
      initPlayerPos[Math.floor(Math.random() * initPlayerPos.length)];
    player.at(randomCol, randomRow);

    this.io.to(this.roomId).emit('updatePos', {
      playerId: player.playerId,
      x: player.x,
      y: player.y
    });
  }

  loseBall(player) {
    let [row, col] = player.getTopLeftRowCol();
    this.addBall(row, col);
    this.ballHolder = null;

    this.io.to(this.roomId).emit('loseBall', {
      playerId: player.playerId
    });

    player.currentBallHoldingTime = 0;
    // this.showSelfScore(player);
  }

  showSelfScore(player) {
    this.io.to(player.playerId).emit('showSelfScore', {
      currentBallHoldingTime: player.currentBallHoldingTime,
      longestBallHoldingTime: player.longestBallHoldingTime
    });
  }

  bufferDamageTime(player) {
    player.hasTakenDamage = true;
    setTimeout(() => {
      player.hasTakenDamage = false;
    }, gameSettings.BUFFER_DAMAGE_TIME);
  }

}

module.exports = GameState;
