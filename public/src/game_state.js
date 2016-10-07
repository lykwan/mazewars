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
    this.sockets = [socket];
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

    // this.setUpLoadingPage(socket);
  }

  addSocket(socket) {
    if (this.sockets.length < 4) {
      this.sockets.push(socket);
      socket.join(this.roomId);  // join that socket to the game room
      // this.setUpLoadingPage(socket);
      return true;
    } else {
      return false; // room is full
    }
  }

  // setUpLoadingPage(socket) {
  //   // give a playerId to player
  //   let playerId;
  //   for (let i = 1; i <= Object.keys(this.players).length; i++) {
  //     if (this.players[i] === null) {
  //       playerId = i;
  //       break;
  //     }
  //   }
  //
  //   if (playerId === undefined) {
  //     return;
  //   }
  //
  //   socket.emit('joinGame', { playerId: playerId,
  //                              seedRandomStr: this.seedRandomStr,
  //                              playerColor: constants.COLORS[playerId - 1]
  //                            });
  //
  //   Object.keys(this.players).forEach((id) => {
  //      if (this.players[id] !== null) {
  //        socket.emit('addNewPlayer', {
  //          playerId: id,
  //          playerColor: constants.COLORS[id - 1]
  //        });
  //      }
  //   });
  //
  //   socket.join(playerId);
  //
  //   setUpAddNewPlayer(socket, playerId, constants.COLORS[playerId - 1]);
  //
  //   this.players[playerId] = true;
  //
  //   setUpDisconnect(socket, playerId);
  //   setUpStartGame(socket);
  //   setUpUpdatePos(socket);
  //   setUpPickUpWeapon(socket);
  //   setUpShootWeapon(socket);
  // }

}

module.exports = GameState;
