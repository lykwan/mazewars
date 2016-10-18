/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _game = __webpack_require__(1);
	
	var _game2 = _interopRequireDefault(_game);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/* globals io */
	
	document.addEventListener('DOMContentLoaded', function () {
	  var game = new _game2.default();
	  game.run();
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _init = __webpack_require__(2);
	
	var _init2 = _interopRequireDefault(_init);
	
	var _board = __webpack_require__(8);
	
	var _board2 = _interopRequireDefault(_board);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var gameSettings = Constants.gameSettings;
	var AssetsObj = __webpack_require__(10);
	
	var socket = io();
	/* globals Crafty */
	/* globals io */
	
	var Game = function () {
	  function Game() {
	    _classCallCheck(this, Game);
	
	    this.players = {};
	    this.weapons = {};
	    this.board = null;
	    this.tileBoard = this.createTileBoard();
	    this.selfId = null;
	    this.selfPlayerColor = null;
	    this.ball = null;
	    this.translateX = null;
	    this.translateY = null;
	  }
	
	  _createClass(Game, [{
	    key: 'run',
	    value: function run() {
	      // getting the room id from the url params, if any
	      var pageURL = decodeURIComponent(window.location.search.substring(1));
	      var param = pageURL.split('=');
	      var roomId = void 0;
	      if (param[0] === 'room_id') {
	        roomId = param[1];
	      }
	
	      // if the user is joining a room
	      if (roomId !== undefined) {
	        socket.emit('joinRoom', { roomId: roomId });
	        socket.on('failedToJoin', function (data) {
	          //TODO: fix this
	          $('#game').prepend('<span class=\'error-msg\'>' + data.msg + '</span>');
	        });
	      } else {
	        this.loadNewRoomButton();
	      }
	
	      this.setUpJoinRoom();
	    }
	  }, {
	    key: 'setUpJoinRoom',
	    value: function setUpJoinRoom() {
	      var _this = this;
	
	      socket.on('joinRoom', function (data) {
	        var param = '?room_id=' + data.roomId;
	
	        if (data.isNewRoom) {
	          // replace the url with room id query
	          window.history.replaceState({}, '', param);
	          $('.new-room').remove();
	        }
	
	        // load room content
	        // TODO: change link
	        $('.waiting-list').removeClass('hidden');
	        $('.waiting-room').removeClass('hidden');
	        $('.waiting-room').prepend('<div class="content">\n          <h1>Maze Wars</h1>\n          <span>Room Link: amazeball.lilykwan.me/' + param + '</span>\n          </span>\n          <ul class="keyboard-instructions">\n            <h3>Instructions</h3>\n            <li>\n              <img src="../assets/keyboard_z.png">\n              <span>PICK UP WEAPON</span>\n            </li>\n            <li>\n              <img src="../assets/keyboard_x.png">\n              <span>SHOOT WEAPON</span>\n            </li>\n            <li>\n              <img src="../assets/keyboard_arrows.png">\n              <span>MOVE AROUND</span>\n            </li>\n          </ul>\n          <span class="start-game-instructions">\n            Press SPACE to start game (Needs 2 or more people to start)\n          </span>\n          <div class="help">\n            <span>?</span>\n            <div class="help-text container">\n              <span>The goal of the game is to hold onto the ball for the longest duration of time. You can pick up weapons to kill people, and if the ball holder dies, he releases the ball.</span>\n            </div>\n          </div>\n        </div>');
	
	        _this.setUpGame();
	      });
	    }
	  }, {
	    key: 'loadNewRoomButton',
	    value: function loadNewRoomButton() {
	      var newRoomPage = '<div class="new-room page">\n                            <div class="content">\n                              <h1>Maze Wars</h1>\n                              <button>Create Room</button>\n                            </div>\n                          </div>';
	      $('#game').prepend(newRoomPage);
	
	      $('.new-room button').on('click', function (e) {
	        e.preventDefault();
	        socket.emit('makeNewRoom');
	      });
	    }
	  }, {
	    key: 'createTileBoard',
	    value: function createTileBoard() {
	      var board = new Array(mapGrid.NUM_MAZE_ROWS);
	      for (var i = 0; i < mapGrid.NUM_MAZE_ROWS; i++) {
	        board[i] = new Array(mapGrid.NUM_MAZE_COLS);
	      }
	      return board;
	    }
	  }, {
	    key: 'setUpGame',
	    value: function setUpGame() {
	      var _this2 = this;
	
	      (0, _init2.default)(Crafty);
	      Crafty.background('url(../assets/lava_background6.jpg)\n                        no-repeat center center');
	      Crafty.stage.elem.style.backgroundSize = "cover";
	
	      this.iso = Crafty.diamondIso.init(mapGrid.TILE.WIDTH, mapGrid.TILE.SURFACE_HEIGHT, mapGrid.NUM_MAZE_ROWS, mapGrid.NUM_MAZE_COLS);
	
	      socket.emit('setUpLoadingScene');
	
	      // set up loading scene
	      Crafty.scene('Loading', function () {
	        _this2.installStartGameListener();
	        _this2.setUpLoadingScene();
	        _this2.setUpDisconnect();
	      });
	
	      // set up the game scene
	      Crafty.scene('Game', function (data) {
	        _this2.setUpNewGame(data);
	        _this2.setUpPlayersMovement();
	        _this2.setUpPlacingWeapons();
	        _this2.setUpCreateDamage();
	        _this2.setUpHPChange();
	        _this2.setUpTimer();
	        _this2.setUpGameOver();
	        _this2.setUpAddBall();
	        _this2.setUpShowBall();
	        _this2.setUpShowBallRecord();
	        _this2.setUpHaveWeapon();
	      });
	
	      // set up game over scene
	      Crafty.scene('GameOver', function (data) {
	        // Crafty.e('2D, DOM, Text')
	        //       .attr({ x: 0, y: 0, w: 300 })
	        //       .text('Game Over')
	        //       .textColor('white');
	        //
	        // let winnerText;
	        // if (data.winnerId !== undefined) {
	        //   winnerText = `player ${ data.winnerId } has
	        //           won with ${ data.winnerScore } secs`;
	        // } else {
	        //   winnerText = 'No one won!';
	        // }
	
	        // Crafty.e('2D, DOM, Text')
	        //   .attr({ x: 50, y: 50, w: 400})
	        //   .text(winnerText)
	        //   .textColor('white');
	        var rankedPlayerScoreLis = data.rankedPlayerScores.map(function (player, i) {
	          var selfPlayerClass = player.playerColor === _this2.selfPlayerColor ? "self-player" : "";
	          var iconImgSrc = '../assets/icons/' + player.playerColor + '_icon.png';
	          return '<li class=\'' + player.playerColor + ' ' + selfPlayerClass + '\'>\n                  <span>' + (i + 1) + '</span>\n                  <img class="icon" src="' + iconImgSrc + '"></img>\n                  <span>' + player.longestBallHoldingTime + '</span>\n                </li>';
	        });
	
	        $(".game-status").html('\n        <div class="results-container">\n          <h1>GAME OVER</h1>\n          <div class="results container">\n            <h2>SCORE</h2>\n            <h3 class="row-header">PLAYER</h3>\n            <h3 class="row-header">TIME RECORD</h3>\n            <ul class="ranking">\n              ' + rankedPlayerScoreLis.join("") + '\n            </ul>\n          </div>\n        </div>\n      ');
	      });
	
	      // start loading scene
	      Crafty.scene('Loading');
	    }
	  }, {
	    key: 'installStartGameListener',
	    value: function installStartGameListener() {
	      $(document).on('keydown', function (e) {
	        var spaceBarKeyCode = 32;
	        if (e.keyCode === spaceBarKeyCode) {
	          $(document).off('keydown');
	          socket.emit('startNewGame');
	        }
	      });
	    }
	  }, {
	    key: 'setUpLoadingScene',
	    value: function setUpLoadingScene() {
	      var _this3 = this;
	
	      Crafty.load(AssetsObj);
	
	      socket.on('setUpGame', function (data) {
	        _this3.selfId = data.selfId;
	        _this3.selfPlayerColor = data.playerColor;
	        _this3.board = new _board2.default(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr, Crafty);
	
	        $('.waiting-list').append('<ul class="players-list">\n                                    <h2>Player List</h2>\n                                  <ul>');
	        _this3.appendToPlayersList(data.playerColor, true);
	      });
	
	      socket.on('addNewPlayer', function (data) {
	        _this3.appendToPlayersList(data.playerColor, false);
	      });
	
	      socket.on('startNewGame', function (data) {
	        Crafty.scene('Game', data);
	      });
	    }
	  }, {
	    key: 'setUpDisconnect',
	    value: function setUpDisconnect() {
	      var _this4 = this;
	
	      socket.on('othersDisconnected', function (data) {
	        if (_this4.players[data.playerId]) {
	          _this4.players[data.playerId].destroy();
	          delete _this4.players[data.playerId];
	        }
	
	        $('.player-item.' + data.playerColor).remove();
	      });
	    }
	  }, {
	    key: 'appendToPlayersList',
	    value: function appendToPlayersList(playerColor, isSelfPlayer) {
	      var selfPlayerClass = isSelfPlayer ? 'self-player' : '';
	      var iconImgSrc = '../assets/icons/' + playerColor + '_icon.png';
	      $('.players-list').append('<li class="player-item ' + selfPlayerClass + ' ' + playerColor + '">\n          <img src=' + iconImgSrc + '></img>\n          <span>Player ' + playerColor + '</span>\n        </li>');
	    }
	  }, {
	    key: 'setUpNewGame',
	    value: function setUpNewGame(data) {
	      this.setUpGameStatus(data);
	      this.createPlayerEntities(data);
	      this.createMapEntities();
	    }
	  }, {
	    key: 'setUpGameStatus',
	    value: function setUpGameStatus(data) {
	      // add the game stage div in and remove the loading scene
	      $('.stage-container').removeClass('hidden');
	      $('.waiting-room').remove();
	      $('.waiting-list').remove();
	
	      // putting the timer on the screen
	      var timerMin = Math.floor(data.timer / 60);
	      var timerSec = data.timer % 60;
	      $('#game').append('<div class="game-status"></div>');
	      $('.game-status').append('<div class=\'timer-container container\'>\n                                <div class=\'timer\'>\n                                  <span class=\'time-left-text\'>TIME LEFT:</span>\n                                  <div class="timer-min-div">\n                                    <span class=\'timer-min\'>' + timerMin + '</span>\n                                    <span class=\'time-text\'>MINS</span>\n                                  </div>\n                                  <div class="timer-sec-div">\n                                    <span class=\'timer-sec\'>' + timerSec + '</span>\n                                    <span class=\'time-text\'>SECS</span>\n                                  </div>\n                                </div>\n                              </div>');
	
	      // putting the HP div on the screen
	      $('.game-status').append('<div class="hp-container container">\n                                  <ul class="hp-list"><ul>\n                                </div>');
	
	      // putting the weapon display on the screen
	      $('.game-status').append('<div class="weapon-container container">\n                                <img class="no-weapon-img"\n                                      src="../assets/clear_sword5.png">\n                              </div>');
	
	      // putting scoreboard on the screen
	      $('.game-status').append('<div class=\'scoreboard-container container\'>\n                                <h2>Ranking</h2>\n                                <ul class=\'ranking\'></ul>\n                              </div>');
	    }
	  }, {
	    key: 'createPlayerEntities',
	    value: function createPlayerEntities(data) {
	      var _this5 = this;
	
	      data.players.forEach(function (playerInfo, idx) {
	        var _playerInfo$playerPx = _slicedToArray(playerInfo.playerPx, 2);
	
	        var playerX = _playerInfo$playerPx[0];
	        var playerY = _playerInfo$playerPx[1];
	
	        var _playerInfo$playerPos = _slicedToArray(playerInfo.playerPos, 2);
	
	        var playerRow = _playerInfo$playerPos[0];
	        var playerCol = _playerInfo$playerPos[1];
	
	        var player = void 0;
	        var charSprite = playerInfo.playerColor + 'Sprite';
	        var selfPlayerClass = void 0;
	        if (parseInt(playerInfo.playerId) === _this5.selfId) {
	          player = Crafty.e('SelfPlayer, SpriteAnimation, ' + charSprite).setUpSocket(socket).setUpSetBallTime().bindingKeyEvents().attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });
	
	          _this5.iso.place(player, playerRow, playerCol, mapGrid.PLAYER.Z);
	
	          _this5.translateX = player.x - playerX;
	          _this5.translateY = player.y - playerY;
	
	          // since the player block always starts at bottom left corner
	          // when rendering, we need to account for the translation so we can
	          // render the player block in the top left corner instead
	          _this5.translateX += (mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2;
	          _this5.translateY -= (mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2;
	          console.log(_this5.translateX);
	          console.log(_this5.translateY);
	
	          // for displaying purposes. showing the user his/her player color
	          selfPlayerClass = 'self-player';
	        } else {
	          player = Crafty.e('SelfPlayer, SpriteAnimation, ' + charSprite);
	          selfPlayerClass = '';
	        }
	
	        player.setUp(playerInfo.playerId, playerInfo.playerColor).setUpAnimation().attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });
	
	        // place it on isometric map
	        _this5.iso.place(player, playerRow, playerCol, mapGrid.PLAYER.Z);
	
	        // after placing it on isometric map, figure out the translation of px
	        // from the server side to client side rendering
	        if (playerInfo.playerId === _this5.selfId) {}
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
	
	
	        // translate the player px in the initial rendering as well
	        player.x += (mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2;
	        player.y -= (mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2;
	
	        // putting each player's hp on the hp div
	        var HPLevelWidth = player.HP / 100 * mapGrid.FULL_HP_BAR_WIDTH;
	        var iconImgSrc = '../assets/icons/' + playerInfo.playerColor + '_icon.png';
	        $('.hp-list').append('\n        <li class="' + playerInfo.playerColor + ' ' + selfPlayerClass + '">\n          <span>' + playerInfo.playerColor + '</span>\n          <div class="hp-bar"\n             style="width: ' + mapGrid.FULL_HP_BAR_WIDTH + 'px;">\n            <div class="hp-level"\n                 style="width: ' + HPLevelWidth + 'px;">\n            </div>\n          </div>\n        </li>');
	
	        // scoreboard
	        $('.ranking').append('<li class=\'' + playerInfo.playerColor + '\n                                        ' + selfPlayerClass + '\'>\n                              <span>' + (idx + 1) + '</span>\n                              <img class="icon" src="' + iconImgSrc + '"></img>\n                              <span>' + player.longestBallHoldingTime + '\n                              </span>\n                            </li>');
	
	        _this5.players[playerInfo.playerId] = player;
	      });
	    }
	  }, {
	    key: 'createMapEntities',
	    value: function createMapEntities() {
	      for (var i = 0; i < mapGrid.NUM_MAZE_ROWS; i++) {
	        for (var j = 0; j < mapGrid.NUM_MAZE_COLS; j++) {
	          if (this.board.maze[i][j].isWall) {
	            var wallEntity = Crafty.e('Actor, wallSprite').attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
	            this.iso.place(wallEntity, i, j, mapGrid.TILE.Z);
	            this.tileBoard[i][j] = wallEntity;
	          } else {
	            var tileEntity = Crafty.e('Tile').attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
	            this.iso.place(tileEntity, i, j, mapGrid.TILE.Z);
	            this.tileBoard[i][j] = tileEntity;
	          }
	        }
	      }
	
	      Crafty.viewport.x = mapGrid.GAME_WIDTH / 2;
	      Crafty.viewport.y = mapGrid.EXTRA_GAME_DIM / 2 + mapGrid.PLAYER.HEIGHT;
	    }
	  }, {
	    key: 'setUpPlayersMovement',
	    value: function setUpPlayersMovement() {
	      var _this6 = this;
	
	      socket.on('updatePos', function (data) {
	        var player = _this6.players[data.playerId];
	        if (player) {
	          var playerOldX = player.x;
	          var playerOldY = player.y;
	
	          player.x = data.x + _this6.translateX;
	          player.y = data.y + _this6.translateY;
	
	          player.displayAnimation(data.charMove);
	        }
	      });
	
	      socket.on('stopMovement', function (data) {
	        var player = _this6.players[data.playerId];
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
	  }, {
	    key: 'setUpPlacingWeapons',
	    value: function setUpPlacingWeapons() {
	      var _this7 = this;
	
	      socket.on('addWeapon', function (data) {
	        var weapon = Crafty.e('Weapon').setUpStaticPos(data.row, data.col).setUp(data.type);
	
	        var sprite = data.type + 'Sprite';
	
	        weapon.addComponent(sprite);
	        weapon.attr({
	          w: mapGrid[data.type].WIDTH,
	          h: mapGrid[data.type].HEIGHT
	        });
	        _this7.weapons[[data.row, data.col]] = weapon;
	        _this7.iso.place(weapon, data.row, data.col, mapGrid[data.type].Z);
	
	        // translate the weapon px in the initial rendering to the middle of tile
	        weapon.x += (mapGrid.TILE.WIDTH - mapGrid[data.type].WIDTH) / 2;
	      });
	
	      socket.on('destroyWeapon', function (data) {
	        var weapon = _this7.weapons[[data.row, data.col]];
	        weapon.destroy();
	      });
	    }
	  }, {
	    key: 'setUpCreateDamage',
	    value: function setUpCreateDamage() {
	      var _this8 = this;
	
	      socket.on('createDamage', function (data) {
	        var activeComponent = data.playerColor + 'ActiveTileSprite';
	        _this8.tileBoard[data.row][data.col].removeComponent('tileSprite');
	        _this8.tileBoard[data.row][data.col].addComponent(activeComponent).attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
	        _this8.tileBoard[data.row][data.col].damageDisappearAfter(activeComponent);
	      });
	    }
	  }, {
	    key: 'setUpHPChange',
	    value: function setUpHPChange() {
	      var _this9 = this;
	
	      socket.on('HPChange', function (data) {
	        var player = _this9.players[data.playerId];
	        if (player) {
	          player.HP = data.playerHP;
	          var HPLevelWidth = player.HP / 100 * mapGrid.FULL_HP_BAR_WIDTH;
	          $('.hp-list .' + player.playerColor + ' .hp-level').css("width", HPLevelWidth);
	        }
	      });
	    }
	  }, {
	    key: 'setUpTimer',
	    value: function setUpTimer() {
	      socket.on('countDown', function (data) {
	        var timerMin = Math.floor(data.timer / 60);
	        var timerSec = data.timer % 60;
	
	        $('.timer-min').text(timerMin);
	        $('.timer-sec').text(timerSec);
	      });
	    }
	  }, {
	    key: 'setUpGameOver',
	    value: function setUpGameOver() {
	      socket.on('gameOver', function (data) {
	        Crafty.scene('GameOver', data);
	      });
	    }
	  }, {
	    key: 'setUpAddBall',
	    value: function setUpAddBall() {
	      var _this10 = this;
	
	      socket.on('addBall', function (data) {
	        _this10.ball = Crafty.e('Ball, ballSprite').attr({ w: mapGrid.BALL.WIDTH, h: mapGrid.BALL.HEIGHT });
	
	        _this10.iso.place(_this10.ball, data.row, data.col, mapGrid.BALL.Z);
	      });
	    }
	  }, {
	    key: 'setUpShowBall',
	    value: function setUpShowBall() {
	      var _this11 = this;
	
	      socket.on('showBall', function (data) {
	        _this11.ball.destroy();
	        var player = _this11.players[data.playerId];
	        player.pickUpBall();
	        // add ball next to the player with the ball
	        $('.ranking .' + data.playerColor).append('\n          <div class="ball-holder">\n            <img src="../assets/astar_weapon.png">\n            <span class="current-score">' + data.currentBallHoldingTime + '</span>\n          </div>\n        ');
	      });
	
	      socket.on('loseBall', function (data) {
	        _this11.players[data.playerId].loseBall();
	        $('.ball-holder').remove();
	      });
	    }
	  }, {
	    key: 'setUpShowBallRecord',
	    value: function setUpShowBallRecord() {
	      var _this12 = this;
	
	      socket.on('showScoreboard', function (data) {
	        var rankedPlayerScoreLis = data.rankedPlayerScores.map(function (player, i) {
	          // The ball holder has the record of current ball holding time
	          var ballHolderDiv = data.playerColor === player.playerColor ? '<div class=\'ball-holder\'>\n                                  <img src="../assets/astar_weapon.png">\n                                  <span>' + data.currentBallHoldingTime + '</span>\n                                </div>' : "";
	
	          var selfPlayerClass = player.playerColor === _this12.selfPlayerColor ? "self-player" : "";
	          var iconImgSrc = '../assets/icons/' + player.playerColor + '_icon.png';
	          return '<li class=\'' + player.playerColor + ' ' + selfPlayerClass + '\'>\n                  <span>' + (i + 1) + '</span>\n                  <img class="icon" src="' + iconImgSrc + '"></img>\n                  <span>' + player.longestBallHoldingTime + '</span>\n                  ' + ballHolderDiv + '\n                </li>';
	        });
	
	        $('.ranking').html(rankedPlayerScoreLis.join(''));
	      });
	    }
	  }, {
	    key: 'setUpHaveWeapon',
	    value: function setUpHaveWeapon() {
	      var _this13 = this;
	
	      socket.on('pickUpWeapon', function (data) {
	        _this13.players[_this13.selfId].weaponType = data.type;
	        var imgSrc = '../assets/' + data.type + '_weapon_diagonal.png';
	        $('.weapon-container').html('<img src=' + imgSrc + '>\n                                      <span class="weapon-type">\n                                        ' + data.type + '\n                                      </span>\n                                    ');
	      });
	
	      socket.on('loseWeapon', function (data) {
	        _this13.players[data.playerId].loseWeapon();
	        $('.weapon-container').html('<img class="no-weapon-img"\n                                          src="../assets/clear_sword5.png">');
	      });
	    }
	  }]);
	
	  return Game;
	}();
	
	exports.default = Game;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var createComponents = __webpack_require__(3);
	var createPlayerComponent = __webpack_require__(5);
	var createWeaponComponent = __webpack_require__(6);
	var createBallComponent = __webpack_require__(7);
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	
	module.exports = function (Crafty) {
	  // change name of the html element to stage
	  Crafty.init(mapGrid.GAME_WIDTH, mapGrid.GAME_HEIGHT, 'stage');
	  console.log(mapGrid.GAME_WIDTH);
	  console.log(mapGrid.GAME_HEIGHT);
	
	  createComponents(Crafty);
	  createPlayerComponent(Crafty);
	  createWeaponComponent(Crafty);
	  createBallComponent(Crafty);
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var wallDirection = Constants.wallDirection;
	var gameSettings = Constants.gameSettings;
	/* globals Crafty */
	
	var epsilon = 0.000000001;
	
	module.exports = function (Crafty) {
	  Crafty.c('Cell', {
	    init: function init() {
	      this.attr({
	        w: mapGrid.TILE.WIDTH,
	        h: mapGrid.TILE.HEIGHT
	      });
	    },
	
	    at: function at(row, col) {
	      // the amount to move from one neighbor to the other
	      var w = mapGrid.TILE.WIDTH / 2;
	      var h = mapGrid.TILE.WIDTH / 4;
	
	      var x = (row - col) * w;
	      var y = (row + col) * h;
	      this.attr({ x: x, y: y });
	      return this;
	    },
	
	    getRowsCols: function getRowsCols() {
	      var w = mapGrid.TILE.WIDTH / 2;
	      var h = mapGrid.TILE.SURFACE_HEIGHT / 2;
	
	      var xOverW = this.x / w;
	      var yOverH = this.y / h;
	
	      // (x/w) + (y/h) = 2*r
	      var row = this.fixRoundingErrors((xOverW + yOverH) / 2);
	      var col = this.fixRoundingErrors(row - xOverW);
	
	      // const bottomRightX = this.x + mapGrid.PLAYER_WIDTH;
	      // const bottomRightY = this.y + mapGrid.SURFACE_HEIGHT;
	      // const xOverWBR = bottomRightX / w;
	      // const yOverHBR = bottomRightY / h;
	      // const rowBR = this.fixRoundingErrors((xOverWBR + yOverHBR) / 2);
	      // const colBR = this.fixRoundingErrors(rowBR - xOverWBR);
	
	      // finding all the rows it is at
	      var rows = [Math.floor(row)];
	      // if (((row - Math.floor(row)) * w - (mapGrid.PLAYER_WIDTH / 2)) > epsilon) {
	
	      // if the offset of the block + half the width of the block is more than
	      // the width of half a tile, then it is overlapping two rows
	      var spaceOccupyingX = (row - Math.floor(row)) * w + mapGrid.PLAYER.WIDTH / 2;
	      if (spaceOccupyingX - w > epsilon) {
	        // console.log('really?');
	        // console.log((row - Math.floor(row)) * w);
	        // console.log(mapGrid.PLAYER_WIDTH / 2);
	        // console.log(w);
	        rows.push(Math.ceil(row));
	      }
	
	      // finding all the cols it is at
	      var cols = [Math.floor(col)];
	      // if (Math.floor(col) !== Math.floor(colBR)) {
	      var spaceOccupyingY = (col - Math.floor(col)) * h + mapGrid.PLAYER.SURFACE_HEIGHT / 2;
	      if (spaceOccupyingY - h > epsilon) {
	        // rows.push(Math.floor(colBR));
	        cols.push(Math.ceil(col));
	      }
	      // if (Math.floor(col) !== Math.ceil(col)) {
	      // if ((col - Math.floor(col)) * h - (mapGrid.PLAYER_WIDTH / 4) > epsilon) {
	      //   cols.push(Math.ceil(col));
	      // }
	
	      return [rows, cols];
	    },
	
	    // account for the floating point epsilon
	    fixRoundingErrors: function fixRoundingErrors(n) {
	      return Math.abs(n - Math.round(n)) <= epsilon ? Math.round(n) : n;
	    },
	
	    getTopLeftRowCol: function getTopLeftRowCol() {
	      var _getRowsCols = this.getRowsCols();
	
	      var _getRowsCols2 = _slicedToArray(_getRowsCols, 2);
	
	      var rows = _getRowsCols2[0];
	      var cols = _getRowsCols2[1];
	
	      return [rows[0], cols[0]];
	    }
	  });
	
	  Crafty.c('Actor', {
	    init: function init() {
	      this.requires('2D, DOM, Cell');
	    }
	  });
	
	  Crafty.c('Item', {
	    init: function init() {},
	
	    // for items that are in a static position
	    setUpStaticPos: function setUpStaticPos(row, col) {
	      this.staticRow = row;
	      this.staticCol = col;
	      return this;
	    }
	  });
	
	  Crafty.c('Tile', {
	    init: function init() {
	      this.requires('2D, DOM, tileSprite');
	    },
	
	    damageDisappearAfter: function damageDisappearAfter(activeTileSprite) {
	      var _this = this;
	
	      window.setTimeout(function () {
	        _this.removeComponent(activeTileSprite);
	        _this.addComponent('tileSprite').attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
	      }, gameSettings.DAMAGE_DISAPPEAR_TIME);
	    }
	  });
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	var NUM_ROWS = 8;
	var NUM_COLS = 8;
	var NUM_MAZE_ROWS = NUM_ROWS * 2 - 1;
	var NUM_MAZE_COLS = NUM_COLS * 2 - 1;
	var EXTRA_GAME_DIM = 50;
	
	var TILE = {
	  ORIG_WIDTH: 101,
	  ORIG_HEIGHT: 122,
	  RATIO: 3 / 4,
	  Z: 0
	};
	
	var PLAYER = {
	  ORIG_WIDTH: 40,
	  ORIG_HEIGHT: 54,
	  RATIO: 1
	};
	
	var PLAYER_ATTACKING = {
	  ORIG_WIDTH: 51,
	  ORIG_HEIGHT: 54,
	  RATIO: 1
	};
	
	var BALL = {
	  ORIG_WIDTH: 128,
	  ORIG_HEIGHT: 128,
	  RATIO: 2 / 5
	};
	
	var BFS = {
	  ORIG_WIDTH: 155,
	  ORIG_HEIGHT: 363,
	  RATIO: 1 / 4
	};
	
	var DFS = {
	  ORIG_WIDTH: 128,
	  ORIG_HEIGHT: 313,
	  RATIO: 1 / 4
	};
	
	var ASTAR = {
	  ORIG_WIDTH: 128,
	  ORIG_HEIGHT: 128,
	  RATIO: 2 / 5
	};
	
	var actors = [TILE, PLAYER, PLAYER_ATTACKING, BALL, BFS, DFS, ASTAR];
	
	actors.forEach(function (actor) {
	  actor.WIDTH = actor.ORIG_WIDTH * actor.RATIO;
	  actor.HEIGHT = actor.ORIG_HEIGHT * actor.RATIO;
	  actor.SURFACE_HEIGHT = actor.WIDTH / 2;
	});
	
	actors.slice(1).forEach(function (actor) {
	  var y0 = (TILE.HEIGHT / TILE.SURFACE_HEIGHT - 2) * TILE.SURFACE_HEIGHT;
	  // need to increase it by player depth
	  var y1 = y0 + (PLAYER.HEIGHT - PLAYER.SURFACE_HEIGHT);
	  // finding the z layer based on the craftyjs code
	  actor.Z = (y1 - (PLAYER.HEIGHT / TILE.SURFACE_HEIGHT - 2) * PLAYER.SURFACE_HEIGHT) / TILE.SURFACE_HEIGHT;
	  // actor.Z = ((PLAYER.HEIGHT - PLAYER.SURFACE_HEIGHT) /
	  //           ((TILE.HEIGHT - TILE.SURFACE_HEIGHT) / ACTOR_Z)) + 1;
	  // actor.Z = (((PLAYER_HEIGHT / TILE.SURFACE_HEIGHT) - 2) * TILE.SURFACE_HEIGHT
	});
	
	var mapGrid = {
	  GAME_WIDTH: NUM_MAZE_ROWS * TILE.WIDTH + EXTRA_GAME_DIM,
	  GAME_HEIGHT: NUM_MAZE_COLS * TILE.SURFACE_HEIGHT + PLAYER.HEIGHT + EXTRA_GAME_DIM,
	  EXTRA_GAME_DIM: EXTRA_GAME_DIM,
	  NUM_ROWS: NUM_ROWS,
	  NUM_COLS: NUM_COLS,
	  NUM_MAZE_ROWS: NUM_MAZE_ROWS,
	  NUM_MAZE_COLS: NUM_MAZE_COLS,
	  TILE: TILE,
	  PLAYER: PLAYER,
	  // PLAYER_ATTACKING: PLAYER_ATTACKING,
	  BALL: BALL,
	  BFS: BFS,
	  DFS: DFS,
	  ASTAR: ASTAR,
	  CHAR_STEP: 20, // how many steps it needs from one tile to another
	  FULL_HP_BAR_WIDTH: 130
	};
	
	var weaponTypes = {
	  BFS: 'BFS',
	  DFS: 'DFS',
	  ASTAR: 'ASTAR'
	};
	
	var gameSettings = {
	  WEAPON_RANGE: 10,
	  BUFFER_DAMAGE_TIME: 1000,
	  BUFFER_SHOOTING_TIME: 1500,
	  WEAPON_SPAWN_TIME: 5000,
	  DAMAGE_ANIMATION_TIME: 100,
	  DAMAGE_DISAPPEAR_TIME: 1000,
	  HP_DAMAGE: 10,
	  GAME_DURATION: 200, // 200
	  CHECK_COLLISION_INTERVAL: 200,
	  COLORS: ['blue', 'red', 'yellow', 'green']
	};
	
	module.exports = {
	  mapGrid: mapGrid,
	  weaponTypes: weaponTypes,
	  gameSettings: gameSettings
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/* globals Crafty */
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var wallDirection = Constants.wallDirection;
	
	module.exports = function (Crafty) {
	  Crafty.c('SelfPlayer', {
	    init: function init() {
	      this.requires('Player');
	      this.charStep = mapGrid.CHAR_STEP;
	      this.hasTakenDamage = false;
	      this.weaponType = null;
	      this.weaponCoolingdown = false;
	      this.z = 9;
	    },
	
	    bindingKeyEvents: function bindingKeyEvents() {
	      this.charMove = { left: false, right: false, up: false, down: false };
	
	      this.bind('EnterFrame', function () {
	        if (this.charMove.right || this.charMove.left || this.charMove.up || this.charMove.down) {
	          this.socket.emit('updatePos', {
	            playerId: this.playerId,
	            charMove: this.charMove
	          });
	        }
	      });
	
	      this.bind('KeyDown', function (e) {
	        e.originalEvent.preventDefault();
	        this.charMove.left = false;
	        this.charMove.right = false;
	        this.charMove.down = false;
	        this.charMove.up = false;
	
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
	          this.charMove.right = true;
	        }
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
	          this.charMove.left = true;
	        }
	        if (e.keyCode === Crafty.keys.UP_ARROW) {
	          this.charMove.up = true;
	        }
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
	          this.charMove.down = true;
	        }
	
	        if (e.keyCode === Crafty.keys.Z) {
	          this.pickUpWeapon();
	        }
	
	        if (e.keyCode === Crafty.keys.X && this.weaponType !== null) {
	          this.shootWeapon();
	        }
	      });
	
	      this.bind('KeyUp', function (e) {
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
	          this.charMove.right = false;
	        }
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
	          this.charMove.left = false;
	        }
	        if (e.keyCode === Crafty.keys.UP_ARROW) {
	          this.charMove.up = false;
	        }
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
	          this.charMove.down = false;
	        }
	        this.socket.emit('stopMovement', {
	          playerId: this.playerId,
	          keyCode: e.keyCode
	        });
	      });
	
	      return this;
	    },
	    moveDir: function moveDir(dirX, dirY) {
	      // the offset it needs to move to the neighbor blocks
	      var w = mapGrid.TILE.WIDTH / 2;
	      var h = mapGrid.TILE.SURFACE_HEIGHT / 2;
	
	      this.x += w / this.charStep * dirX;
	      this.y += h / this.charStep * dirY;
	    },
	
	
	    setUpSocket: function setUpSocket(socket) {
	      this.socket = socket;
	      return this;
	    },
	
	    setUpSetBallTime: function setUpSetBallTime() {
	      var _this = this;
	
	      this.socket.on('setBallTime', function (data) {
	        _this.currentBallHoldingTime = data.currentBallHoldingTime;
	        _this.longestSecsHoldingBall = data.longestSecsHoldingBall;
	      });
	
	      return this;
	    },
	
	    pickUpWeapon: function pickUpWeapon() {
	      this.socket.emit('pickUpWeapon', {
	        playerId: this.playerId
	      });
	    },
	
	    shootWeapon: function shootWeapon() {
	      this.socket.emit('shootWeapon', {
	        playerId: this.playerId
	      });
	    },
	
	    loseWeapon: function loseWeapon() {
	      this.weaponType = null;
	    }
	
	  });
	
	  Crafty.c('OtherPlayer', {
	    init: function init() {
	      this.requires('Player');
	    }
	  });
	
	  Crafty.c('Player', {
	    init: function init() {
	      this.requires('Actor');
	      this.HP = 100;
	      this.longestBallHoldingTime = 0;
	      this.currentBallHoldingTime = 0;
	    },
	
	    displayAnimation: function displayAnimation(charMove) {
	      // display the animation movement depending on the char move
	      if (charMove.left && !this.isPlaying('PlayerMovingLeft')) {
	        this.animate('PlayerMovingLeft', -1);
	        this.unflip('X');
	      } else if (charMove.down && !this.isPlaying('PlayerMovingDown')) {
	        this.animate('PlayerMovingDown', -1);
	        this.unflip('X');
	      } else if (charMove.up && !this.isPlaying('PlayerMovingUp')) {
	        this.animate('PlayerMovingUp', -1);
	        this.flip('X');
	      } else if (charMove.right && !this.isPlaying('PlayerMovingRight')) {
	        this.animate('PlayerMovingRight', -1);
	        this.flip('X');
	      }
	    },
	
	    loseWeapon: function loseWeapon() {},
	
	    setUpAnimation: function setUpAnimation() {
	      this.reel('PlayerMovingRight', 600, 0, 1, 5);
	      this.reel('PlayerMovingDown', 600, 0, 1, 5);
	      this.reel('PlayerMovingUp', 600, 0, 2, 5);
	      this.reel('PlayerMovingLeft', 600, 0, 2, 5);
	      return this;
	    },
	
	    setUp: function setUp(playerId, playerColor) {
	      this.playerId = playerId;
	      if (playerColor) {
	        this.playerColor = playerColor;
	      }
	      return this;
	    },
	
	    pickUpBall: function pickUpBall() {
	      this.addComponent('purpleSprite');
	      this.removeComponent(this.playerColor + 'Sprite');
	      return this;
	    },
	
	    loseBall: function loseBall() {
	      this.addComponent(this.playerColor + 'Sprite');
	      this.removeComponent('purpleSprite');
	      return this;
	    }
	  });
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	/* globals Crafty */
	
	module.exports = function (Crafty) {
	  Crafty.c('Weapon', {
	    init: function init() {
	      this.requires('Actor, Item');
	    },
	
	    setUp: function setUp(type) {
	      this.type = type;
	      return this;
	    }
	  });
	
	  Crafty.c('Damage', {
	    init: function init() {
	      this.requires('Actor, Item');
	      this.checkCollisionInterval = null;
	    },
	
	    setUpCreator: function setUpCreator(playerId) {
	      this.creatorId = playerId;
	      return this;
	    },
	    disappearAfter: function disappearAfter(disappearTime) {
	      var _this = this;
	
	      setTimeout(function () {
	        if (_this.checkCollisionInterval) {
	          clearInterval(_this.checkCollisionInterval);
	        }
	        _this.destroy();
	      }, disappearTime);
	      return this;
	    }
	  });
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	/* globals Crafty */
	
	module.exports = function (Crafty) {
	  Crafty.c('Ball', {
	    init: function init() {
	      this.requires('Actor, Item');
	    }
	  });
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var Cell = __webpack_require__(9);
	
	var Board = function () {
	  function Board(m, n, seedRandomStr) {
	    _classCallCheck(this, Board);
	
	    // how many cells rows and cols are there if walls were just borders
	    this.numGridRows = m;
	    this.numGridCols = n;
	    // for the 2d array with the walls as part of the cells
	    this.numMazeCols = 2 * n - 1;
	    this.numMazeRows = 2 * m - 1;
	
	    Math.seedrandom(seedRandomStr);
	    this.maze = this.createStartingMaze();
	    this.frontier = [];
	    this.generateMaze();
	  }
	
	  // create a starting maze map with all the walls
	
	
	  _createClass(Board, [{
	    key: 'createStartingMaze',
	    value: function createStartingMaze() {
	      var maze = new Array(this.numMazeRows);
	      for (var i = 0; i < maze.length; i++) {
	        maze[i] = new Array(this.numMazeCols);
	        for (var j = 0; j < this.numMazeCols; j++) {
	          if (i % 2 === 1) {
	            // the odd number rows are all filled with wall
	            maze[i][j] = new Cell(true);
	          } else {
	            // the odd number cols are walls and the even number cols are spaces
	            maze[i][j] = j % 2 === 1 ? new Cell(true) : new Cell(false);
	          }
	        }
	      }
	      return maze;
	    }
	  }, {
	    key: 'gridToMazePos',
	    value: function gridToMazePos(row, col) {
	      return [row * 2, col * 2];
	    }
	  }, {
	    key: 'log',
	    value: function log(maze) {
	      var maz = maze.map(function (row) {
	        return row.map(function (tile) {
	          if (tile.isWall) return 1;
	          if (!tile.isWall) return 0;
	        });
	      });
	      console.table(maz);
	    }
	
	    // getting direct neighbor tiles that are not walls
	
	  }, {
	    key: 'getNeighborTiles',
	    value: function getNeighborTiles(row, col) {
	      var _this = this;
	
	      var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	      var neighborTiles = dirs.map(function (dir) {
	        var _dir = _slicedToArray(dir, 2);
	
	        var dRow = _dir[0];
	        var dCol = _dir[1];
	
	        return [row + dRow, col + dCol];
	      });
	
	      // return the tiles that are in the grid and
	      // tiles that are not walls
	      return neighborTiles.filter(function (_ref) {
	        var _ref2 = _slicedToArray(_ref, 2);
	
	        var tileRow = _ref2[0];
	        var tileCol = _ref2[1];
	
	        return _this.isInGrid(tileRow, tileCol) && !_this.maze[tileRow][tileCol].isWall;
	      });
	    }
	
	    // getting the neighbor cells separated by a wall
	
	  }, {
	    key: 'getNeighborSpace',
	    value: function getNeighborSpace(row, col) {
	      var _this2 = this;
	
	      var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	      var neighbors = [];
	      dirs.forEach(function (dir) {
	        // multiplying by 2 to account for the wall in between
	        var newRow = row + dir[0] * 2;
	        var newCol = col + dir[1] * 2;
	
	        if (_this2.isInGrid(newRow, newCol)) {
	          // ensure that we are not adding walls
	          if (_this2.maze[newRow][newCol].isWall === true) {
	            throw "Error: adding walls to the neighbor space array";
	          }
	
	          neighbors.push([newRow, newCol]);
	        }
	      });
	
	      return neighbors;
	    }
	
	    // the forefront surrounding the cells that are in the maze
	
	  }, {
	    key: 'addFrontiers',
	    value: function addFrontiers(row, col) {
	      var _this3 = this;
	
	      this.getNeighborSpace(row, col).forEach(function (cell) {
	        var _cell = _slicedToArray(cell, 2);
	
	        var newRow = _cell[0];
	        var newCol = _cell[1];
	
	        if (!_this3.maze[newRow][newCol].isInMaze && !_this3.maze[newRow][newCol].hasBeenFrontier) {
	          _this3.frontier.push([newRow, newCol]);
	          _this3.maze[newRow][newCol].hasBeenFrontier = true;
	        }
	      });
	    }
	  }, {
	    key: 'isInGrid',
	    value: function isInGrid(row, col) {
	      return 0 <= row && row < this.numMazeRows && 0 <= col && col < this.numMazeCols;
	    }
	  }, {
	    key: 'inMazeNeighbors',
	    value: function inMazeNeighbors(row, col) {
	      var _this4 = this;
	
	      return this.getNeighborSpace(row, col).filter(function (cell) {
	        var _cell2 = _slicedToArray(cell, 2);
	
	        var newRow = _cell2[0];
	        var newCol = _cell2[1];
	
	        return _this4.maze[newRow][newCol].isInMaze;
	      });
	    }
	  }, {
	    key: 'expandMaze',
	    value: function expandMaze(row, col) {
	      this.maze[row][col].isInMaze = true;
	      this.addFrontiers(row, col);
	    }
	  }, {
	    key: 'getRandomCell',
	    value: function getRandomCell() {
	      var randomRow = Math.floor(Math.random() * (this.numGridRows - 1));
	      var randomCol = Math.floor(Math.random() * (this.numGridCols - 1));
	
	      return this.gridToMazePos(randomRow, randomCol);
	    }
	
	    // breaking the wall between [row, col] and [otherRow, otherCol]
	
	  }, {
	    key: 'breakWall',
	    value: function breakWall(row, col, otherRow, otherCol) {
	      if (otherRow < row && col === otherCol) {
	        // other cell is on top of cell
	        this.maze[row - 1][col].isWall = false;
	      } else if (otherRow > row && col === otherCol) {
	        // other cell is bottom
	        this.maze[row + 1][col].isWall = false;
	      } else if (otherCol < col && row === otherRow) {
	        // other cell is left
	        this.maze[row][col - 1].isWall = false;
	      } else if (otherCol > col && row === otherRow) {
	        // other cell is right
	        this.maze[row][col + 1].isWall = false;
	      }
	    }
	  }, {
	    key: 'generateMaze',
	    value: function generateMaze() {
	      var _getRandomCell = this.getRandomCell();
	
	      var _getRandomCell2 = _slicedToArray(_getRandomCell, 2);
	
	      var randomCol = _getRandomCell2[0];
	      var randomRow = _getRandomCell2[1];
	
	      this.expandMaze(randomRow, randomCol);
	
	      // find a random frontier, find a random neighbor of that frontier,
	      // and break the walls between them
	      while (this.frontier.length !== 0) {
	        var randomIndex = Math.floor(Math.random() * this.frontier.length);
	
	        var _frontier$splice = this.frontier.splice(randomIndex, 1);
	
	        var _frontier$splice2 = _slicedToArray(_frontier$splice, 1);
	
	        var randomPos = _frontier$splice2[0];
	
	        var _randomPos = _slicedToArray(randomPos, 2);
	
	        var row = _randomPos[0];
	        var col = _randomPos[1];
	
	        var neighbors = this.inMazeNeighbors(row, col);
	
	        var _neighbors$Math$floor = _slicedToArray(neighbors[Math.floor(Math.random() * neighbors.length)], 2);
	
	        var neighRow = _neighbors$Math$floor[0];
	        var neighCol = _neighbors$Math$floor[1];
	
	
	        this.breakWall(row, col, neighRow, neighCol);
	        this.expandMaze(row, col);
	      }
	    }
	  }]);
	
	  return Board;
	}();
	
	module.exports = Board;

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Cell = function Cell(isWall) {
	  _classCallCheck(this, Cell);
	
	  this.isWall = isWall;
	  this.isInMaze = false;
	  this.hasBeenFrontier = false;
	};
	
	module.exports = Cell;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	
	var assetsObj = {
	  'sprites': {
	    '../assets/tiles.png': {
	      'tile': mapGrid.TILE.ORIG_WIDTH,
	      'tileh': mapGrid.TILE.ORIG_HEIGHT,
	      'map': {
	        'tileSprite': [0, 0],
	        'blueActiveTileSprite': [1, 0],
	        'redActiveTileSprite': [2, 0],
	        'yellowActiveTileSprite': [3, 0],
	        'greenActiveTileSprite': [4, 0],
	        'purpleActiveTileSprite': [5, 0],
	        'wallSprite': [6, 0]
	      }
	    },
	    '../assets/char/green_char.png': {
	      'tile': mapGrid.PLAYER.ORIG_WIDTH,
	      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
	      'map': {
	        'greenSprite': [0, 0]
	      }
	    },
	    '../assets/char/blue_char.png': {
	      'tile': mapGrid.PLAYER.ORIG_WIDTH,
	      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
	      'map': {
	        'blueSprite': [0, 0]
	      }
	    },
	    '../assets/char/red_char.png': {
	      'tile': mapGrid.PLAYER.ORIG_WIDTH,
	      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
	      'map': {
	        'redSprite': [0, 0]
	      }
	    },
	    '../assets/char/yellow_char.png': {
	      'tile': mapGrid.PLAYER.ORIG_WIDTH,
	      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
	      'map': {
	        'yellowSprite': [0, 0]
	      }
	    },
	    '../assets/char/purple_char.png': {
	      'tile': mapGrid.PLAYER.ORIG_WIDTH,
	      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
	      'map': {
	        'purpleSprite': [0, 0]
	      }
	    },
	    '../assets/astar_weapon.png': {
	      'tile': mapGrid.BALL.ORIG_WIDTH,
	      'tileh': mapGrid.BALL.ORIG_HEIGHT,
	      'map': {
	        'ballSprite': [0, 0],
	        'ASTARSprite': [0, 0]
	      }
	    },
	    '../assets/bfs_weapon.png': {
	      'tile': mapGrid.BFS.ORIG_WIDTH,
	      'tileh': mapGrid.BFS.ORIG_HEIGHT,
	      'map': {
	        'BFSSprite': [0, 0]
	      }
	    },
	    '../assets/dfs_weapon.png': {
	      'tile': mapGrid.DFS.ORIG_WIDTH,
	      'tileh': mapGrid.DFS.ORIG_HEIGHT,
	      'map': {
	        'DFSSprite': [0, 0]
	      }
	    }
	  }
	};
	
	module.exports = assetsObj;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map