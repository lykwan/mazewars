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
    this.ball = null;
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
      this.setUpShowBall();
      this.setUpShowBallRecord();
      this.setUpPickUpWeapon();
    });

    Crafty.scene('GameOver', (data) => {
      Crafty.e('2D, DOM, Text')
            .attr({ x: 0, y: 0, w: 300 })
            .text('Game Over')
            .textColor('white');

      let winnerText;
      if (data.winnerId !== undefined) {
        winnerText = `player ${ data.winnerId } has
                won with ${ data.winnerScore } secs`;
      } else {
        winnerText = 'No one won!';
      }

      Crafty.e('2D, DOM, Text')
        .attr({ x: 50, y: 50, w: 400})
        .text(winnerText)
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
      Crafty.e('2D, DOM, Text')
            .attr({ x: 0, y: 30, w: 300 })
            .text(`Game can only be started when
                   there are more than 2 people in the room`)
            .textColor('white');



    // Crafty.load(['../assets/blue.png',
    //              '../assets/green.png',
    //              '../assets/red.png',
    //              '../assets/yellow.png'],
    //   function() {
    //     Crafty.sprite("../assets/red.png", {spr_red:[0,0,174,116]});
    //     Crafty.sprite("../assets/green.png", {spr_green:[0,0,166,108]});
    //     Crafty.sprite("../assets/blue.png", {spr_blue:[0,0,154,100]});
    //     Crafty.sprite("../assets/yellow.png", {spr_yellow:[0,0,167,128]});
    //   });

    Crafty.sprite("../assets/red.png", {spr_red:[0,0,174,116]});
    Crafty.sprite("../assets/green.png", {spr_green:[0,0,166,108]});
    Crafty.sprite("../assets/blue.png", {spr_blue:[0,0,154,100]});
    Crafty.sprite("../assets/yellow.png", {spr_yellow:[0,0,167,128]});
    Crafty.sprite("../assets/ball.png", {spr_ball:[0,0,144,144]});
    Crafty.sprite("../assets/bfs_weapon.png", {spr_bfs:[0,0,144,102]});
    Crafty.sprite("../assets/dfs_weapon.png", {spr_dfs:[0,0,288,88]});

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
      // socket.emit('gotmessage', {
      //   msg: 'hellow world',
      //   playerId: this.selfId
      // });

    });
  }

  setUpNewGame(data) {
    $('#scoreboard').append(`<div id='hp'>
                              <h2>HP</h2>
                             </div>`);
    $('#scoreboard').append(`<div id='timer'>
                              <h2>Timer</h2>
                              <span id='timer-countdown'>
                                ${ data.timer }
                              </span>
                             </div>`);
    $('#scoreboard').append(`<div id='self-record'>
                                <h2>Ball Duration</h2>
                                Longest Duration Time: 0
                                Current Duration Time: 0
                             </div>`);
    $('#scoreboard').append(`<div id="weapon">
                                <h2>Weapon</h2>
                                <div id='weapon-img'></div>
                                <div id='weapon-type'></div>
                             </div>`);
    data.players.forEach(playerInfo => {
      if (parseInt(playerInfo.playerId) === this.selfId) {
        let player =
             Crafty.e('Player')
                   .at(playerInfo.playerPos[0], playerInfo.playerPos[1])
                   .setUp(playerInfo.playerId, playerInfo.playerColor)
                   .setUpSocket(socket)
                   .autoPickUpBall()
                   .bindingKeyEvents();

        if (player.playerColor === 'red') {
          player.addComponent('spr_red')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        } else if (player.playerColor === 'green') {
          player.addComponent('spr_green')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        } else if (player.playerColor === 'blue') {
          player.addComponent('spr_blue')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        } else if (player.playerColor === 'yellow') {
          player.addComponent('spr_yellow')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        }

        $('#hp').append(`<div class='player-${ playerInfo.playerId }'>
                                  Player ${playerInfo.playerId}: ${ player.HP }
                                 </div>`);

        this.players[playerInfo.playerId] = player;
      } else {
        let otherPlayer =
          Crafty.e('OtherPlayer')
                .at(playerInfo.playerPos[0], playerInfo.playerPos[1])
                .setUp(data.players.playerId, playerInfo.playerColor);

        if (otherPlayer.playerColor === 'red') {
          otherPlayer.addComponent('spr_red')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        } else if (otherPlayer.playerColor === 'green') {
          otherPlayer.addComponent('spr_green')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        } else if (otherPlayer.playerColor === 'blue') {
          otherPlayer.addComponent('spr_blue')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        } else if (otherPlayer.playerColor === 'yellow') {
          otherPlayer.addComponent('spr_yellow')
                .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
        }

        $('#hp').append(`<div class='player-${ playerInfo.playerId }'>
                            Player ${playerInfo.playerId}: ${ otherPlayer.HP }
                           </div>`);

        this.players[playerInfo.playerId] = otherPlayer;
      }
    });

    for (let i = 0; i < mapGrid.NUM_COLS; i++) {
      for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
        this.board.grid[i][j].drawWalls(Crafty);
      }
    }

    // Crafty.sprite('assets/weapons.png', {
    //   spr_bfs: [0, 0],
    //   spr_dfs: [0, 1]
    // });

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
                           .setUp(data.type);

      if (data.type === 'BFS') {
        weapon.addComponent('spr_bfs')
              .attr({ w: mapGrid.BFS_WIDTH, h: mapGrid.BFS_HEIGHT });
      } else if (data.type === 'DFS') {
        weapon.addComponent('spr_dfs')
              .attr({ w: mapGrid.DFS_WIDTH, h: mapGrid.DFS_HEIGHT });
      }
      const col = weapon.getCol();
      const row = weapon.getRow();
      this.weapons[[col, row]] = weapon;
    });

    socket.on('destroyWeapon', data => {
      const weapon = this.weapons[[data.col, data.row]];
      weapon.destroy();
    });
  }

  setUpCreateDamage() {
    socket.on('createDamage', data => {
      Crafty.e('Damage')
            .at(data.damageCell[0], data.damageCell[1])
            .attr({ w: mapGrid.TILE_WIDTH, h: mapGrid.TILE_HEIGHT })
            .setUpCreator(data.creatorId)
            .disappearAfter()
            .color(this.players[data.creatorId].playerColor, 0.5);
    });
  }

  setUpHPChange() {
    socket.on('HPChange', data => {
      const player = this.players[data.playerId];
      if (player) {
        player.HP = data.playerHP;
        $(`.player-${ data.playerId }`)
          .text(`Player ${data.playerId}: ${ data.playerHP }`);
      }
    });
  }

  setUpTimer() {
    socket.on('countDown', data => {
      $('#timer-countdown').text(data.timer);
    });
  }

  setUpGameOver() {
    socket.on('gameOver', data => {
      Crafty.scene('GameOver', data);
    });
  }

  setUpAddBall() {
    socket.on('addBall', data => {
      this.ball = Crafty.e('Ball')
                    .at(data.col, data.row)
                    .attr({ w: mapGrid.BALL_WIDTH, h: mapGrid.BALL_HEIGHT });
    });
  }

  setUpShowBall() {
    socket.on('showBall', data => {
      this.ball.destroy();
      this.players[data.playerId].pickUpBall();
    });

    socket.on('loseBall', data => {
      this.players[data.playerId]
                  .color('black');
    });
  }

  setUpShowBallRecord() {
    socket.on('showSelfScore', data => {
      $('#self-record')
        .html(`
          <h2>Ball Duration</h2>
          <span>
            Longest Duration Time: ${ data.longestBallHoldingTime }
          </span>
          <span>
            Current Duration Time: ${ data.currentBallHoldingTime }
          </span>`);

      // $('#ball-record')
    });
  }

  setUpPickUpWeapon() {
    socket.on('pickUpWeapon', data => {
      this.players[this.selfId].weaponType = data.type;
      $('#weapon-type').text(data.type);
      if (data.type === 'BFS') {
        $('#weapon-img').html(`<img src='../assets/bfs_weapon.png'
                                      height='50'></img>`);
      } else if (data.type === 'DFS') {
        $('#weapon-img').html(`<img src='../assets/dfs_weapon.png'
                                      height='50'></img>`);
      }
    });
  }
}

export default Game;
