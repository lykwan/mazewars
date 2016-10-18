import initGame from './components/init.js';
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
    this.selfPlayerColor = null;
    this.ball = null;
    this.translateX = null;
    this.translateY = null;
    this.playersReady = {};
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
          // <span class="start-game-instructions">
          //   Press SPACE to  (Needs 2 or more people to start)
          // </span>
      $('.waiting-list').removeClass('hidden');
      $('.waiting-room').removeClass('hidden');
      $('.waiting-room').prepend(
        `<div class="content">
          <h1>Maze Wars</h1>
          <span>Room Link: amazeball.lilykwan.me/${ param }</span>
          </span>
          <ul class="keyboard-instructions">
            <h3>Instructions</h3>
            <li>
              <img src="../assets/keyboard_z.png">
              <span>PICK UP WEAPON</span>
            </li>
            <li>
              <img src="../assets/keyboard_x.png">
              <span>SHOOT WEAPON</span>
            </li>
            <li>
              <img src="../assets/keyboard_arrows.png">
              <span>MOVE AROUND</span>
            </li>
          </ul>
          <div class="ready-form">
            <button class="ready">
              READY
            </button>
          </div>
          <div class="help">
            <span>?</span>
            <div class="help-text container">
              <span>The goal of the game is to hold onto the ball for the longest duration of time. You can pick up weapons to kill people, and if the ball holder dies, he releases the ball.</span>
            </div>
          </div>
        </div>`
      );

      this.handleDisableReadyButton();

      this.setUpGame();
    });
  }

  handleDisableReadyButton(playerCount) {
    if (playerCount === undefined || playerCount <= 1) {
      console.log('disabling');
      $('.ready-form button').prop('disabled', true);
    } else {
      console.log(' notdisabling');
      $('.ready-form button').prop('disabled', false);
    }
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
    Crafty.background(`url(../assets/lava_background6.jpg)
                        no-repeat center center`);
    Crafty.stage.elem.style.backgroundSize = "cover";

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
      this.setUpGameOver(data);
    });

    // start loading scene
    Crafty.scene('Loading');
  }

  setUpGameOver(data) {
    const rankedPlayerScoreLis = data.rankedPlayerScores.map((player, i) => {
    const selfPlayerClass = player.playerColor === this.selfPlayerColor ?
                              "self-player" :
                              "";
    const iconImgSrc = `../assets/icons/${ player.playerColor }_icon.png`;
    return `<li class='${ player.playerColor } ${ selfPlayerClass }'>
              <span>${ i + 1 }</span>
              <img class="icon" src="${ iconImgSrc }"></img>
              <span>${ player.longestBallHoldingTime }</span>
            </li>`;
    });

    $(".game-status").html(`
      <div class="results-container">
        <h1>GAME OVER</h1>
        <div class="results container">
          <h2>SCORE</h2>
          <h3 class="row-header">PLAYER</h3>
          <h3 class="row-header">TIME RECORD</h3>
          <ul class="ranking">
            ${ rankedPlayerScoreLis.join("") }
          </ul>
        </div>
      </div>
    `);
  }

  installStartGameListener() {
    // $(document).on('keydown', e => {
    //   let spaceBarKeyCode = 32;
    //   if (e.keyCode === spaceBarKeyCode) {
    //     $(document).off('keydown');
    //     socket.emit('startNewGame');
    //   }
    // });
    $('.ready-form').on('click', '.ready', e => {
      e.preventDefault();
      socket.emit('clickReady', { playerId: this.selfId });
      $('.ready-form button').prop('disabled', true);
    });

    $('.ready-form').on('click', '.cancel', e => {
      e.preventDefault();
      socket.emit('clickCancel', { playerId: this.selfId });
      $('.ready-form button').prop('disabled', true);
    });

    socket.on('clickReady', () => {
      $('.ready-form').html('<button class="cancel">CANCEL</button>');
      $('.ready-form button').prop('disabled', false);
    });

    socket.on('clickCancel', () => {
      $('.ready-form').html('<button class="ready">READY</button>');
      $('.ready-form button').prop('disabled', false);
    });
  }

  setUpLoadingScene() {
    Crafty.load(AssetsObj);

    socket.on('setUpGame', data => {
      this.selfId = data.selfId;
      this.selfPlayerColor = data.playerColor;
      this.board = new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS,
                    data.seedRandomStr, Crafty);

      $('.waiting-list').append(`<ul class="players-list">
                                    <h2>Player List</h2>
                                  </ul>`);
      this.appendToPlayersList(data.playerColor, true);
    });

    socket.on('addNewPlayer', data => {
      this.appendToPlayersList(data.playerColor, false);
      this.showPlayerReady(data.playerColor, data.playerReady);
      this.handleDisableReadyButton(data.playerCount);
    });

    socket.on('othersClickReady', data => {
      console.log('telling others!');
      this.showPlayerReady(data.playerColor, data.playerReady);
    });

    socket.on('startNewGame', (data) => {
      Crafty.scene('Game', data);
    });
  }

  showPlayerReady(playerColor, playerReady) {
    console.log(playerColor, playerReady);
    if (playerReady) {
      $(`.player-item.${ playerColor } .ready-text`).removeClass('hidden');
    } else {
      $(`.player-item.${ playerColor } .ready-text`).addClass('hidden');
    }
  }

  setUpDisconnect() {
    socket.on('othersDisconnected', data => {
      if (this.players[data.playerId]) {
        this.players[data.playerId].destroy();
        delete this.players[data.playerId];
      }

      $(`.player-item.${ data.playerColor }`).remove();

      this.handleDisableReadyButton(data.playerCount);
    });
  }

  appendToPlayersList(playerColor, isSelfPlayer) {
    let selfPlayerClass = isSelfPlayer ? 'self-player' : '';
    let iconImgSrc = `../assets/icons/${ playerColor }_icon.png`;
    $('.players-list').append(
      `<li class="player-item ${ selfPlayerClass } ${ playerColor }">
          <img src=${ iconImgSrc }></img>
          <span class="player-name">Player ${ playerColor }</span>
          <span class="ready-text hidden">READY</span>
        </li>`
    );
  }

  setUpNewGame(data) {
    this.setUpGameStatus(data);
    this.createPlayerEntities(data);
    this.createMapEntities();
  }

  setUpGameStatus(data) {
    // add the game stage div in and remove the loading scene
    $('.stage-container').removeClass('hidden');
    $('.waiting-room').remove();
    $('.waiting-list').remove();

    // putting the timer on the screen
    let timerMin = Math.floor(data.timer / 60);
    let timerSec = data.timer % 60;
    $('#game').append(`<div class="game-status"></div>`);
    $('.game-status').append(`<div class='timer-container container'>
                                <div class='timer'>
                                  <span class='time-left-text'>TIME LEFT:</span>
                                  <div class="timer-min-div">
                                    <span class='timer-min'>${ timerMin }</span>
                                    <span class='time-text'>MINS</span>
                                  </div>
                                  <div class="timer-sec-div">
                                    <span class='timer-sec'>${ timerSec }</span>
                                    <span class='time-text'>SECS</span>
                                  </div>
                                </div>
                              </div>`);

    // putting the HP div on the screen
    $('.game-status').append(`<div class="hp-container container">
                                  <ul class="hp-list"></ul>
                                </div>`);

    // putting the weapon display on the screen
    $('.game-status').append(`<div class="weapon-container container">
                                <img class="no-weapon-img"
                                      src="../assets/clear_sword5.png">
                              </div>`);

    // putting scoreboard on the screen
    $('.game-status').append(`<div class='scoreboard-container container'>
                                <h2>Ranking</h2>
                                <ul class='ranking'></ul>
                              </div>`);
  }

  createPlayerEntities(data) {
    data.players.forEach((playerInfo, idx) => {
      let [playerX, playerY] = playerInfo.playerPx;
      let [playerRow, playerCol] = playerInfo.playerPos;
      let player;
      let charSprite = `${ playerInfo.playerColor }Sprite`;
      let selfPlayerClass;
      if (parseInt(playerInfo.playerId) === this.selfId) {
        player = Crafty.e(`SelfPlayer, SpriteAnimation, ${ charSprite }`)
                  .setUpSocket(socket)
                  .setUpSetBallTime()
                  .bindingKeyEvents()
                  .attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });

        this.iso.place(player, playerRow, playerCol, mapGrid.PLAYER.Z);

        this.translateX = player.x - playerX;
        this.translateY = player.y - playerY;

        // since the player block always starts at bottom left corner
        // when rendering, we need to account for the translation so we can
        // render the player block in the top left corner instead
        this.translateX += ((mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2);
        this.translateY -=
        ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2);
        console.log(this.translateX);
        console.log(this.translateY);

        // for displaying purposes. showing the user his/her player color
        selfPlayerClass = 'self-player';
      } else {
        player = Crafty.e(`SelfPlayer, SpriteAnimation, ${ charSprite }`);
        selfPlayerClass = '';
      }

      player.setUp(playerInfo.playerId, playerInfo.playerColor)
            .setUpAnimation()
            .attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });

      // place it on isometric map
      this.iso.place(player, playerRow, playerCol, mapGrid.PLAYER.Z);

      // after placing it on isometric map, figure out the translation of px
      // from the server side to client side rendering
      if (playerInfo.playerId === this.selfId) {
        // this.translateX = player.x - playerX;
        // this.translateY = player.y - playerY;
        //
        // // since the player block always starts at bottom left corner
        // // when rendering, we need to account for the translation so we can
        // // render the player block in the top left corner instead
        // this.translateX += ((mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2);
        // this.translateY -=
        // ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2);
        // console.log(this.translateX);
        // console.log(this.translateY);
      }

      // translate the player px in the initial rendering as well
      player.x += ((mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2);
      player.y -=
      ((mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2);

      // putting each player's hp on the hp div
      const HPLevelWidth = (player.HP / 100) * mapGrid.FULL_HP_BAR_WIDTH;
      const iconImgSrc = `../assets/icons/${ playerInfo.playerColor}_icon.png`;
      $('.hp-list').append(`
        <li class="${ playerInfo.playerColor } ${ selfPlayerClass }">
          <span>${ playerInfo.playerColor }</span>
          <div class="hp-bar"
             style="width: ${ mapGrid.FULL_HP_BAR_WIDTH }px;">
            <div class="hp-level"
                 style="width: ${ HPLevelWidth }px;">
            </div>
          </div>
        </li>`);

      // scoreboard
      $('.ranking').append(`<li class='${ playerInfo.playerColor }
                                        ${ selfPlayerClass }'>
                              <span>${ idx + 1 }</span>
                              <img class="icon" src="${ iconImgSrc }"></img>
                              <span>${ player.longestBallHoldingTime }
                              </span>
                            </li>`);

      this.players[playerInfo.playerId] = player;
    });
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
    Crafty.viewport.y = (mapGrid.EXTRA_GAME_DIM / 2) + mapGrid.PLAYER.HEIGHT;
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
        }
        if (data.keyCode === Crafty.keys.LEFT_ARROW) {
          if (player.isPlaying('PlayerMovingLeft')) player.pauseAnimation();
        }
        if (data.keyCode === Crafty.keys.UP_ARROW) {
          if (player.isPlaying('PlayerMovingUp')) player.pauseAnimation();
        }
        if (data.keyCode === Crafty.keys.DOWN_ARROW) {
          if (player.isPlaying('PlayerMovingDown')) player.pauseAnimation();
        }
      }
    });
  }

  setUpPlacingWeapons() {
    socket.on('addWeapon', data => {
      const weapon = Crafty.e('Weapon')
         .setUpStaticPos(data.row, data.col)
         .setUp(data.type);

      const sprite = `${ data.type }Sprite`;

      weapon.addComponent(sprite);
      weapon.attr({
        w: mapGrid[data.type].WIDTH,
        h: mapGrid[data.type].HEIGHT
      });
      this.weapons[[data.row, data.col]] = weapon;
      this.iso.place(weapon, data.row, data.col, mapGrid[data.type].Z);

      // translate the weapon px in the initial rendering to the middle of tile
      weapon.x += ((mapGrid.TILE.WIDTH - mapGrid[data.type].WIDTH) / 2);
    });

    socket.on('destroyWeapon', data => {
      const weapon = this.weapons[[data.row, data.col]];
      weapon.destroy();
    });
  }

  setUpCreateDamage() {
    socket.on('createDamage', data => {
      let activeComponent = `${ data.playerColor}ActiveTileSprite`;
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
        const HPLevelWidth = (player.HP / 100) * mapGrid.FULL_HP_BAR_WIDTH;
        $(`.hp-list .${ player.playerColor } .hp-level`)
          .css("width", HPLevelWidth);
      }
    });
  }

  setUpTimer() {
    socket.on('countDown', data => {
      let timerMin = Math.floor(data.timer / 60);
      let timerSec = data.timer % 60;

      $('.timer-min').text(timerMin);
      $('.timer-sec').text(timerSec);
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
      const player = this.players[data.playerId];
      player.pickUpBall();
      // add ball next to the player with the ball
      $(`.ranking .${ data.playerColor }`).append(`
          <div class="ball-holder">
            <img src="../assets/weapons/ASTAR_weapon.png">
            <span class="current-score">${ data.currentBallHoldingTime }</span>
          </div>
        `);
    });

    socket.on('loseBall', data => {
      this.players[data.playerId].loseBall();
      $('.ball-holder').remove();
    });
  }

  setUpShowBallRecord() {
    socket.on('showScoreboard', data => {
      const rankedPlayerScoreLis = data.rankedPlayerScores.map((player, i) => {
        // The ball holder has the record of current ball holding time
        const ballHolderDiv = data.playerColor === player.playerColor ?
                                `<div class='ball-holder'>
                                  <img src="../assets/weapons/ASTAR_weapon.png">
                                  <span>${ data.currentBallHoldingTime }</span>
                                </div>` :
                                "";

        const selfPlayerClass = player.playerColor === this.selfPlayerColor ?
                                    "self-player" :
                                    "";
        const iconImgSrc = `../assets/icons/${ player.playerColor }_icon.png`;
        return `<li class='${ player.playerColor } ${ selfPlayerClass }'>
                  <span>${ i + 1 }</span>
                  <img class="icon" src="${ iconImgSrc }"></img>
                  <span>${ player.longestBallHoldingTime }</span>
                  ${ ballHolderDiv }
                </li>`;
      });

      $('.ranking').html(rankedPlayerScoreLis.join(''));
    });
  }

  setUpHaveWeapon() {
    socket.on('pickUpWeapon', data => {
      this.players[this.selfId].weaponType = data.type;
      let imgSrc = `../assets/weapons/${ data.type }_weapon_diagonal.png`;
      $('.weapon-container').html(`<img src=${ imgSrc }>
                                      <span class="weapon-type">
                                        ${ data.type }
                                      </span>
                                    `);
    });

    socket.on('loseWeapon', data => {
      this.players[data.playerId].loseWeapon();
      $('.weapon-container').html(`<img class="no-weapon-img"
                                          src="../assets/clear_sword5.png">`
                                    );
    });
  }
}

export default Game;
