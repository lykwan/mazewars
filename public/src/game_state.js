var seedrandom = require('seedrandom');

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
  GAME_DURATION: 30, // 200
  COLORS: ['blue', 'red', 'yellow', 'green']
};

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
    this.board = null;
    this.timer = constants.GAME_DURATION;
    this.ballHolder = null;
    this.addWeaponIntervalId = null;
    this.setScoreIntervalId = null;
    this.io = io;

    this.addSocket(socket);
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

    // if there are more than 4 players
    if (playerId === undefined) {
      return;
    }

    socket.emit('joinGame', {
      selfId: playerId,
      seedRandomStr: this.seedRandomStr,
      playerColor: constants.COLORS[playerId - 1]
    });

    // adding existing players in the room
    Object.keys(this.players).forEach((id) => {
       if (this.players[id] !== null) {
         socket.emit('addNewPlayer', {
           playerId: id,
           playerColor: constants.COLORS[id - 1]
         });
       }
    });

    this.players[playerId] = true;

    this.setUpDisconnect(socket, playerId);
    this.setUpAddNewPlayer(socket, playerId,
                            constants.COLORS[playerId - 1]);
    // setUpStartGame(socket);
    // setUpUpdatePos(socket);
    // setUpPickUpWeapon(socket);
    // setUpShootWeapon(socket);
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
      this.io.to(this.roomId).emit('othersDisconnected', {
        playerId: playerId
      });
    });
  }

  setUpAddNewPlayer(socket, playerId, color) {
    socket.broadcast.to(this.roomId).emit('addNewPlayer', {
      playerId: playerId,
      playerColor: color
    });
  }
}

module.exports = GameState;
