import initGame from './components/init.js';
import ClientModel from './model/client_model.js';
import Board from './board.js';
const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;
const gameSettings = Constants.gameSettings;

const socket = io();
/* globals Crafty */
/* globals io */

class Game {
  constructor() {
    this.players = {};
    this.weapons = {};
    this.playersInfo = {};
    this.board = null;
    this.tileBoard = this.createTileBoard();
    this.selfId = null;
    this.ball = null;
    this.translateX = 0;
    this.translateY = 0;
  }


  run() {
    // getting the room id from the url params, if any
    let pageURL = decodeURIComponent(window.location.search.substring(1));
    let param = pageURL.split('=');
    let roomId;
    if (param[0] === 'room_id') {
      roomId = param[1];
    }

    this.setUpJoinRoom();

    if (roomId !== undefined) {
      socket.emit('joinRoom', { roomId: roomId });
      socket.on('failedToJoin', data => {
        $('#game').append(`<span class='error-msg'>${ data.msg }</span>`);
      });
    } else {
      this.loadNewRoomButton();
    }
  }

  setUpJoinRoom() {
    socket.on('joinRoom', data => {
      let param = `?room_id=${ data.roomId }`;
      $('#game').append(`<span>
                           Link: amazeball.lilykwan.me/${ param }
                         </span>`);

      if (data.isNewRoom) {
        // replace the url with room id query
        window.history.replaceState({}, '', param);
        $('#game .new-room').remove();
      }

      this.start();
    });
  }

  loadNewRoomButton() {
    const makeNewRoomButton = "<button class='new-room'>Create Room</button>";
    $('#game').append(makeNewRoomButton);

    $('#game .new-room').on('click', e => {
      e.preventDefault();
      socket.emit('makeNewRoom');
    });
  }

  createTileBoard() {
    let board = new Array(mapGrid.NUM_MAZE_ROWS);
    for (let i = 0; i < mapGrid.NUM_MAZE_ROWS; i++) {
      board[i] = new Array(mapGrid.NUM_MAZE_COLS);
    }
    return board;
  }

  start() {
    initGame(Crafty);
    Crafty.background('url(../assets/free-space-background-7.png) repeat');

    this.iso = Crafty.diamondIso.init(mapGrid.TILE.WIDTH,
                                       mapGrid.TILE.SURFACE_HEIGHT,
                                       mapGrid.NUM_MAZE_ROWS,
                                       mapGrid.NUM_MAZE_COLS);

    socket.emit('setUpLoadingScene');

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
      this.setUpPlayersMovement();
      this.setUpPlacingWeapons();
      this.setUpCreateDamage();
      this.setUpHPChange();
      this.setUpTimer();
      this.setUpGameOver();
      this.setUpAddBall();
      this.setUpShowBall();
      this.setUpShowBallRecord();
      this.setUpHaveWeapon();
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

    const assetsObj = {
      'sprites': {
        '../assets/tile.png': {
          'tile': mapGrid.TILE.ORIG_WIDTH,
          'tileh': mapGrid.TILE.ORIG_HEIGHT,
          'map': {
            'tileSprite': [0, 0]
          }
        },
        '../assets/lava_tile.png': {
          'tile': mapGrid.TILE.ORIG_WIDTH,
          'tileh': mapGrid.TILE.ORIG_HEIGHT,
          'map': {
            'wallSprite': [0, 0]
          }
        },
        '../assets/lava_crack.png': {
          'tile': mapGrid.TILE.ORIG_WIDTH,
          'tileh': mapGrid.TILE.ORIG_HEIGHT,
          'map': {
            'greenActiveTileSprite': [0, 0]
          }
        },
        '../assets/green_char.png': {
          'tile': mapGrid.PLAYER.ORIG_WIDTH,
          'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
          'map': {
            'greenSprite': [0, 0]
          }
        },
        '../assets/ball.png': {
          'tile': mapGrid.BALL.ORIG_WIDTH,
          'tileh': mapGrid.BALL.ORIG_HEIGHT,
          'map': {
            'ballSprite': [0, 0]
          }
        },
        '../assets/flamesword.png': {
          'tile': mapGrid.BFS.ORIG_WIDTH,
          'tileh': mapGrid.BFS.ORIG_HEIGHT,
          'map': {
            'BFSSprite': [0, 0]
          }
        }
      }
    };

    Crafty.load(assetsObj);

    let playerTextY = 50;
    socket.on('joinGame', data => {
      let playerText = Crafty.e('2D, DOM, Text')
            .attr({ x: 50, y: playerTextY, w: 200 })
            .text(`You are player ${data.selfId}`)
            .textColor(data.playerColor);
      playerTextY += 30;
        this.board =
        new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS,
                  data.seedRandomStr, Crafty, true);
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
    $('#game-status').append(`<div id='hp'>
                              <h2>HP</h2>
                             </div>`);
    $('#game-status').append(`<div id='timer'>
                              <h2>Timer</h2>
                              <span id='timer-countdown'>
                                ${ data.timer }
                              </span>
                             </div>`);
    $('#game-status').append(`<div id='self-record'>
                                <h2>Ball Duration</h2>
                                Longest Duration Time: 0
                                Current Duration Time: 0
                             </div>`);
    $('#game-status').append(`<div id='scoreboard'>
                              <h2>Scoreboard</h2>
                             </div>`);
    $('#game-status').append(`<div id="weapon">
                                <h2>Weapon</h2>
                                <div id='weapon-img'></div>
                                <div id='weapon-type'></div>
                             </div>`);
    data.players.forEach(playerInfo => {
      let [playerX, playerY] = playerInfo.playerPx;
      let [playerRow, playerCol] = playerInfo.playerPos;
      if (parseInt(playerInfo.playerId) === this.selfId) {
        let player =
             Crafty.e('SelfPlayer, SpriteAnimation, greenSprite')
                   .setUp(playerInfo.playerId, playerInfo.playerColor)
                   .setUpSocket(socket)
                   .setUpSetBallTime()
                   .setUpAnimation()
                   .bindingKeyEvents()
                   .attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });

        // place it on isometric map
        // this.iso.place(player, playerRow, playerCol, mapGrid.ACTOR_Z);
        this.iso.place(player, playerRow, playerCol, mapGrid.PLAYER.Z);

        // after placing it on isometric map, figure out the translation of px
        // from the server side to client side rendering
        this.translateX = player.x - playerX;
        this.translateY = player.y - playerY;

        // since the player block always starts at bottom left corner
        // when rendering, we need to account for the translation so we can
        // render the player block in the top left corner instead
        this.translateX += ((mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2);
        this.translateY -=
          ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2);

        // translate the player px in the initial rendering as well
        player.x += ((mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2);
        player.y -=
          ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2);

        console.log('player', player.x);
        console.log('player', player.y);

        $('#hp').append(`<span class='player-${ playerInfo.playerId }'>
                                  Player ${playerInfo.playerId}: ${ player.HP }
                                 </span>`);
        $('#scoreboard').append(`<span class='player-${ playerInfo.playerId }'>
              Player ${playerInfo.playerId}: ${ player.longestBallHoldingTime }
                                 </span>`);

        this.players[playerInfo.playerId] = player;
      } else {
        let otherPlayer =
          Crafty.e('OtherPlayer, SpriteAnimation, greenSprite')
                .setUp(data.players.playerId, playerInfo.playerColor)
                .setUpAnimation()
                .attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });

        // place it on isometric map
        this.iso.place(otherPlayer, playerRow, playerCol, mapGrid.PLAYER.Z);

        // translate the player px in the initial rendering as well
        otherPlayer.x += ((mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2);
        otherPlayer.y -=
          ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2);

        $('#hp').append(`<span class='player-${ playerInfo.playerId }'>
                            Player ${playerInfo.playerId}: ${ otherPlayer.HP }
                           </span>`);
        $('#scoreboard').append(`<span class='player-${ playerInfo.playerId }'>
          Player ${playerInfo.playerId}: 0
                                 </span>`);

        this.players[playerInfo.playerId] = otherPlayer;
      }
    });

    this.createMapEntities();
  }

  createMapEntities() {
    for (let i = 0; i < mapGrid.NUM_MAZE_ROWS; i++) {
      for (let j = 0; j < mapGrid.NUM_MAZE_COLS; j++) {
        if (this.board.maze[i][j].isWall) {
          const wallEntity =
            Crafty.e('Actor, wallSprite')
                  .attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
          this.iso.place(wallEntity, i, j, mapGrid.TILE.Z);
          this.tileBoard[i][j] = wallEntity;
        } else {
          const tileEntity =
            Crafty.e('Tile')
                  .attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
          this.iso.place(tileEntity, i, j, mapGrid.TILE.Z);
          this.tileBoard[i][j] = tileEntity;
        }
      }
    }

    Crafty.viewport.x = mapGrid.GAME_WIDTH / 2;
    Crafty.viewport.y = 0 + mapGrid.PLAYER.HEIGHT;
  }

  setUpPlayersMovement() {
    socket.on('updatePos', data => {
      const player = this.players[data.playerId];
      if (player) {
        let [playerOldX, playerOldY] = [player.x, player.y];
        player.x = data.x + this.translateX;
        player.y = data.y + this.translateY;

        player.displayAnimation(data.charMove);
      }
    });

    socket.on('stopMovement', data => {
      const player = this.players[data.playerId];
      if (player) {
        if (data.keyCode === Crafty.keys.RIGHT_ARROW) {
          if (player.isPlaying('PlayerMovingRight')) player.pauseAnimation();
          this.charMove.right = false;
        }
        if (data.keyCode === Crafty.keys.LEFT_ARROW) {
          if (player.isPlaying('PlayerMovingLeft')) player.pauseAnimation();
          this.charMove.left = false;
        }
        if (data.keyCode === Crafty.keys.UP_ARROW) {
          if (player.isPlaying('PlayerMovingUp')) player.pauseAnimation();
          this.charMove.up = false;
        }
        if (data.keyCode === Crafty.keys.DOWN_ARROW) {
          if (player.isPlaying('PlayerMovingDown')) player.pauseAnimation();
          this.charMove.down = false;
        }
      }
    });
  }

  setUpPlacingWeapons() {
    socket.on('addWeapon', data => {
      const weapon = Crafty.e('Weapon')
                           .setUpStaticPos(data.row, data.col)
                           .setUp(data.type);

      if (data.type === 'BFS') {
        weapon.addComponent('BFSSprite')
              .attr({ w: mapGrid.BFS.WIDTH, h: mapGrid.BFS.HEIGHT });
      // } else if (data.type === 'DFS') {
      //   weapon.addComponent('spr_dfs')
      //         .attr({ w: mapGrid.DFS_WIDTH, h: mapGrid.DFS_HEIGHT });
      }
      this.weapons[[data.row, data.col]] = weapon;
      this.iso.place(weapon, data.row, data.col, mapGrid.BFS.Z);
    });

    socket.on('destroyWeapon', data => {
      const weapon = this.weapons[[data.row, data.col]];
      weapon.destroy();
    });
  }

  setUpCreateDamage() {
    socket.on('createDamage', data => {
      let activeComponent = 'greenActiveTileSprite';
      this.tileBoard[data.row][data.col].removeComponent('tileSprite');
      this.tileBoard[data.row][data.col].addComponent(activeComponent)
                    .attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
      this.tileBoard[data.row][data.col].damageDisappearAfter(activeComponent);
    });
  }

  setUpHPChange() {
    socket.on('HPChange', data => {
      console.log('changing hp!');
      const player = this.players[data.playerId];
      if (player) {
        player.HP = data.playerHP;
        $(`#hp .player-${ data.playerId }`)
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
      this.ball = Crafty.e('Ball, swordSprite')
          .attr({ w: mapGrid.BALL.WIDTH, h: mapGrid.BALL.HEIGHT });

      this.iso.place(this.ball, data.row, data.col, mapGrid.BALL.Z);
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
    });

    socket.on('showScoreboard', data => {
      $(`#scoreboard .player-${ data.playerId }`).text(
        `Player ${data.playerId}: ${ data.score }`);
    });
  }

  setUpHaveWeapon() {
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

    socket.on('loseWeapon', data => {
      this.players[data.playerId].loseWeapon();
      $('#weapon-type').empty();
      $('#weapon-img').empty();
    });
  }
}

export default Game;
