import createCanvas from './components/canvas.js';
import createComponents from './components/entities.js';
import createPlayerComponent from './components/player.js';
import ClientModel from './model/client_model.js';
import Board from './board.js';
const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;

const socket = io();
/* globals Crafty */
/* globals io */

class Game {
  constructor() {
    this.players = {};
    this.weapons = {};
    this.playersInfo = {};
    this.board = null;
    this.selfId = null;
  }

  width() {
    return mapGrid.NUM_ROWS * mapGrid.TILE_WIDTH;
  }

  height() {
    return mapGrid.NUM_COLS * mapGrid.TILE_HEIGHT;
  }

  start() {
    createCanvas(Crafty, ClientModel);
    Crafty.background('#000000');

    let game = this;
    Crafty.scene('Loading', function() {
      game.setUpLoadingScene.bind(game)();
      this.startGame = this.bind('KeyDown', function(e) {
        if (e.keyCode === Crafty.keys.S) {
          socket.emit('startNewGame');
        }
      });
    }, function() {
      this.unbind('KeyDown', this.startGame);
    });

    Crafty.scene('Game', (data) => {
      this.setUpNewGame(data);
      this.setUpPlayersMove();
      this.setUpPlacingWeapons();
      this.setUpCreateDamage();
      this.setUpHPChange();
      this.setUpTimer();
      this.setUpGameOver();
      this.setUpAddBall();
    });

    Crafty.scene('GameOver', () => {
      Crafty.e('2D, DOM, Text')
            .attr({ x: 0, y: 0, w: 300 })
            .text('Game Over')
            .textColor('white');
    });

    Crafty.scene('Loading');
  }

  setUpLoadingScene() {
    let loadingScene =
      Crafty.e('2D, DOM, Text')
            .attr({ x: 0, y: 0, w: 300 })
            .text('A-maze Ball - Press s to start')
            .textColor('white');

    let playerTextY = 50;
    socket.on('connected', data => {
      let playerText = Crafty.e('2D, DOM, Text')
            .attr({ x: 50, y: playerTextY, w: 200 })
            .text(`You are player ${data.selfId}`)
            .textColor(data.playerColor);
      playerTextY += 30;
      this.board =
        new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr);
      this.playersInfo[data.selfId] = playerText;
      this.selfId = data.selfId;
    });

    socket.on('addNewPlayer', data => {
      let playerText = Crafty.e('2D, DOM, Text')
            .attr({ x: 50, y: playerTextY, w: 200 })
            .text(`connected with player ${ data.playerId }`)
            .textColor(data.playerColor);
      playerTextY += 30;
      this.playersInfo[data.playerId] = playerText;
    });

    socket.on('othersDisconnected', data => {
      if (this.players[data.playerId]) {
        this.players[data.playerId].destroy();
        delete this.players[data.playerId];
      }

      if (this.playersInfo[data.playerId]) {
        this.playersInfo[data.playerId].destroy();
        delete this.playersInfo[data.playerId];
      }
    });

    socket.on('startNewGame', (data) => {
      Crafty.scene('Game', data);
    });
  }

  setUpNewGame(data) {
    data.players.forEach(playerInfo => {
      if (parseInt(playerInfo.playerId) === this.selfId) {
        let player = Crafty.e('Player')
                           .at(playerInfo.playerPos[0], playerInfo.playerPos[1])
                           .setUp(playerInfo.playerId, playerInfo.playerColor)
                           .setUpSocket(socket)
                           .color(playerInfo.playerColor)
                           .bindingKeyEvents();

        $('#scoreboard').append(`<div class='player-${ playerInfo.playerId }'>
                                  ${ player.HP }
                                 </div>`);

        this.players[playerInfo.playerId] = player;
      } else {
        let otherPlayer =
          Crafty.e('OtherPlayer')
                .at(playerInfo.playerPos[0], playerInfo.playerPos[1])
                .setUp(data.players.playerId, playerInfo.playerColor)
                .color(playerInfo.playerColor);

        $('#scoreboard').append(`<div class='player-${ playerInfo.playerId }'>
                                  ${ otherPlayer.HP }
                                 </div>`);

        this.players[playerInfo.playerId] = otherPlayer;
      }
    });

    for (let i = 0; i < mapGrid.NUM_COLS; i++) {
      for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
        this.board.grid[i][j].drawWalls(Crafty);
      }
    }

    $('#scoreboard').append(`<div id='timer'>${ data.timer }</div>`);
  }

  // setUpAddNewPlayer() {
  //   var colors = ['blue', 'red', 'yellow', 'green'];
  //   socket.on('addNewPlayer', data => {
  //     let otherPlayer = Crafty.e('OtherPlayer')
  //                             .at(0, 0)
  //                             .setUp(data.playerId, colors[data.playerId]);
  //     $('#scoreboard')
  //       .append(`<li class='player-${ data.playerId }'>
  //                   ${ otherPlayer.HP }
  //               </li>`);
  //     this.players[data.playerId] = otherPlayer;
  //   });
  // }

  setUpPlayersMove() {
    socket.on('updatePos', data => {
      const player = this.players[data.playerId];
      if (player) {
        player.x = data.x;
        player.y = data.y;
      }
    });
  }

  setUpPlacingWeapons() {
    socket.on('addWeapon', data => {
      const weapon = Crafty.e('Weapon')
                           .at(data.x, data.y)
                           .setUp(data.weaponId, data.type)
                           .color(data.color);
      this.weapons[data.weaponId] = weapon;
    });

    socket.on('destroyWeapon', data => {
      const weapon = this.weapons[data.weaponId];
      weapon.destroy();
    });
  }

  setUpCreateDamage() {
    socket.on('createDamage', data => {
      Crafty.e('Damage')
            .at(data.damageCell[0], data.damageCell[1])
            .setUpCreator(data.creatorId)
            .disappearAfter()
            .color('#7ec0ee', 0.5);
    });
  }

  setUpHPChange() {
    socket.on('HPChange', data => {
      const player = this.players[data.playerId];
      if (player) {
        player.HP = data.playerHP;
        $(`.player-${ data.playerId }`).text(player.HP);
      }
    });
  }

  setUpTimer() {
    socket.on('countDown', data => {
      console.log('got hereeee counting down');

      $('#timer').text(data.timer);
    });
  }

  setUpGameOver() {
    socket.on('gameOver', data => {
      Crafty.scene('GameOver');
    });
  }

  setUpAddBall() {
    socket.on('addBall', data => {
      Crafty.e('Ball').at(data.col, data.row).color(data.ballColor);
    });
  }
}

export default Game;
