import initGame from './components/init.js';
import ClientModel from './model/client_model.js';
import Board from './board.js';
const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;
const gameSettings = Constants.gameSettings;
const AssetsObj = require('./load_assets.js');

const socket = io();
/* globals Crafty */
/* globals io */

class Game {
  constructor() {
    this.players = {};
    this.weapons = {};
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

    // if the user is joining a room
    if (roomId !== undefined) {
      socket.emit('joinRoom', { roomId: roomId });
      socket.on('failedToJoin', data => {
        //TODO: fix this
        $('#game').prepend(`<span class='error-msg'>${ data.msg }</span>`);
      });
    } else {
      this.loadNewRoomButton();
    }

    this.setUpJoinRoom();
  }

  setUpJoinRoom() {
    socket.on('joinRoom', data => {
      let param = `?room_id=${ data.roomId }`;

      if (data.isNewRoom) {
        // replace the url with room id query
        window.history.replaceState({}, '', param);
        $('.new-room').remove();
      }

      // load room content
      // TODO: change link
      $('.game-status').removeClass('hidden');
      $('.waiting-room').removeClass('hidden');
      $('.waiting-room').append(
        `<div class="content">
          <h1>Maze Wars</h1>
          <span>Room Link: amazeball.lilykwan.me/${ param }</span>
        </div>`
      );

      this.setUpGame();
    });
  }

  loadNewRoomButton() {
    const newRoomPage = `<div class="new-room page">
                            <div class="content">
                              <h1>Maze Wars</h1>
                              <button>Create Room</button>
                            </div>
                          </div>`;
    $('#game').prepend(newRoomPage);

    $('.new-room button').on('click', e => {
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

  setUpGame() {
    initGame(Crafty);
    Crafty.background('url(../assets/free-space-background-7.png) repeat');

    this.iso = Crafty.diamondIso.init(mapGrid.TILE.WIDTH,
                                       mapGrid.TILE.SURFACE_HEIGHT,
                                       mapGrid.NUM_MAZE_ROWS,
                                       mapGrid.NUM_MAZE_COLS);

    socket.emit('setUpLoadingScene');

    // set up loading scene
    Crafty.scene('Loading', () => {
      this.installStartGameListener();
      this.setUpLoadingScene();
      this.setUpDisconnect();
    });

    // set up the game scene
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

    // set up game over scene
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

    // start loading scene
    Crafty.scene('Loading');
  }

  installStartGameListener() {
    $(document).on('keydown', e => {
      let spaceBarKeyCode = 32;
      if (e.keyCode === spaceBarKeyCode) {
        $(document).off('keydown');
        socket.emit('startNewGame');
      }
    });
  }

  setUpLoadingScene() {
    Crafty.load(AssetsObj);

    socket.on('setUpGame', data => {
      this.selfId = data.selfId;
      this.board = new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS,
                    data.seedRandomStr, Crafty);

      $('.game-status').append(`<ul class="players-list"><ul>`);
      this.appendToPlayersList(data.playerColor, true);
    });

    socket.on('addNewPlayer', data => {
      this.appendToPlayersList(data.playerColor, false);
    });

    socket.on('startNewGame', (data) => {
      Crafty.scene('Game', data);
    });
  }

  setUpDisconnect() {
    socket.on('othersDisconnected', data => {
      if (this.players[data.playerId]) {
        this.players[data.playerId].destroy();
        delete this.players[data.playerId];
      }

      $(`.player-item.${ data.playerColor }`).remove();
    });
  }

  appendToPlayersList(playerColor, isSelfPlayer) {
    let selfPlayerClass = isSelfPlayer ? 'self-player' : '';
    let iconImgSrc = `../assets/green_char_icon.png`;
    $('.players-list').append(
      `<li class="player-item ${ selfPlayerClass} ${ playerColor }">
          <img src=${ iconImgSrc }></img>
          <span>Player ${ playerColor }</span>
        </li>`
    );
  }

  setUpNewGame(data) {
    // add the game stage div in and remove the loading scene
    $('.stage-container').removeClass('hidden');
    $('.waiting-room').remove();

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
        weapon.addComponent('BFSSprite');
      } else if (data.type === 'DFS') {
        weapon.addComponent('DFSSprite');
      }

      weapon.attr({
        w: mapGrid[data.type].WIDTH,
        h: mapGrid[data.type].HEIGHT
      });
      this.weapons[[data.row, data.col]] = weapon;
      this.iso.place(weapon, data.row, data.col, mapGrid[data.type].Z);

      // translate the weapon px in the initial rendering to the middle of tile
      weapon.x += ((mapGrid.TILE.WIDTH - mapGrid[data.type].WIDTH) / 2);
      // weapon.y -=
      //   ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid[data.type].SURFACE_HEIGHT) / 4);
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
      this.ball = Crafty.e('Ball, ballSprite')
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
