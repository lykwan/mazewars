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
	
	var _client_model = __webpack_require__(8);
	
	var _client_model2 = _interopRequireDefault(_client_model);
	
	var _board = __webpack_require__(9);
	
	var _board2 = _interopRequireDefault(_board);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	
	var socket = io();
	/* globals Crafty */
	/* globals io */
	
	var Game = function () {
	  function Game() {
	    _classCallCheck(this, Game);
	
	    this.players = {};
	    this.weapons = {};
	    this.playersInfo = {};
	    this.board = null;
	    this.selfId = null;
	    this.ball = null;
	    this.translateX = 0;
	    this.translateY = 0;
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
	
	      this.setUpJoinRoom();
	
	      if (roomId !== undefined) {
	        socket.emit('joinRoom', { roomId: roomId });
	        socket.on('failedToJoin', function (data) {
	          $('#game').append('<span class=\'error-msg\'>' + data.msg + '</span>');
	        });
	      } else {
	        this.loadNewRoomButton();
	      }
	    }
	  }, {
	    key: 'setUpJoinRoom',
	    value: function setUpJoinRoom() {
	      var _this = this;
	
	      socket.on('joinRoom', function (data) {
	        var param = '?room_id=' + data.roomId;
	        $('#game').append('<span>\n                           Link: amazeball.lilykwan.me/' + param + '\n                         </span>');
	
	        if (data.isNewRoom) {
	          // replace the url with room id query
	          window.history.replaceState({}, '', param);
	          $('#game .new-room').remove();
	        }
	
	        _this.start();
	      });
	    }
	  }, {
	    key: 'loadNewRoomButton',
	    value: function loadNewRoomButton() {
	      var makeNewRoomButton = "<button class='new-room'>Create Room</button>";
	      $('#game').append(makeNewRoomButton);
	
	      $('#game .new-room').on('click', function (e) {
	        e.preventDefault();
	        socket.emit('makeNewRoom');
	      });
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      var _this2 = this;
	
	      (0, _init2.default)(Crafty, _client_model2.default);
	      //TODO: DELETE MODEL
	      Crafty.background('url(../assets/free-space-background-7.png) repeat');
	
	      this.iso = Crafty.diamondIso.init(mapGrid.TILE.WIDTH, mapGrid.TILE.SURFACE_HEIGHT, mapGrid.NUM_MAZE_ROWS, mapGrid.NUM_MAZE_COLS);
	
	      socket.emit('setUpLoadingScene');
	
	      var game = this;
	      Crafty.scene('Loading', function () {
	        game.setUpLoadingScene.bind(game)();
	        this.startGame = this.bind('KeyDown', function (e) {
	          if (e.keyCode === Crafty.keys.S) {
	            socket.emit('startNewGame');
	          }
	        });
	      }, function () {
	        this.unbind('KeyDown', this.startGame);
	      });
	
	      Crafty.scene('Game', function (data) {
	        _this2.setUpNewGame(data);
	        _this2.setUpPlayersMove();
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
	
	      Crafty.scene('GameOver', function (data) {
	        Crafty.e('2D, DOM, Text').attr({ x: 0, y: 0, w: 300 }).text('Game Over').textColor('white');
	
	        var winnerText = void 0;
	        if (data.winnerId !== undefined) {
	          winnerText = 'player ' + data.winnerId + ' has\n                won with ' + data.winnerScore + ' secs';
	        } else {
	          winnerText = 'No one won!';
	        }
	
	        Crafty.e('2D, DOM, Text').attr({ x: 50, y: 50, w: 400 }).text(winnerText).textColor('white');
	      });
	
	      Crafty.scene('Loading');
	    }
	  }, {
	    key: 'setUpLoadingScene',
	    value: function setUpLoadingScene() {
	      var _this3 = this;
	
	      var loadingScene = Crafty.e('2D, DOM, Text').attr({ x: 0, y: 0, w: 300 }).text('A-maze Ball - Press s to start').textColor('white');
	      Crafty.e('2D, DOM, Text').attr({ x: 0, y: 30, w: 300 }).text('Game can only be started when\n                   there are more than 2 people in the room').textColor('white');
	
	      // Crafty.sprite("../assets/red.png", {spr_red:[0,0,174,116]});
	      // Crafty.sprite("../assets/green.png", {spr_green:[0,0,166,108]});
	      // Crafty.sprite("../assets/blue.png", {spr_blue:[0,0,154,100]});
	      // Crafty.sprite("../assets/yellow.png", {spr_yellow:[0,0,167,128]});
	      // Crafty.sprite("../assets/ball.png", {spr_ball:[0,0,144,144]});
	      // Crafty.sprite("../assets/bfs_weapon.png", {spr_bfs:[0,0,144,102]});
	      // Crafty.sprite("../assets/dfs_weapon.png", {spr_dfs:[0,0,288,88]});
	      //
	      Crafty.sprite("../assets/tile.png", {
	        tileSprite: [0, 0, mapGrid.TILE.ORIG_WIDTH, mapGrid.TILE.ORIG_HEIGHT]
	      });
	      Crafty.sprite("../assets/lava_tile.png", {
	        wallSprite: [0, 0, mapGrid.TILE.ORIG_WIDTH, mapGrid.TILE.ORIG_HEIGHT]
	      });
	      Crafty.sprite(mapGrid.PLAYER.ORIG_WIDTH, mapGrid.PLAYER.ORIG_HEIGHT, "../assets/green_char.png", {
	        greenSprite: [0, 0]
	      });
	
	      var playerTextY = 50;
	      socket.on('joinGame', function (data) {
	        var playerText = Crafty.e('2D, DOM, Text').attr({ x: 50, y: playerTextY, w: 200 }).text('You are player ' + data.selfId).textColor(data.playerColor);
	        playerTextY += 30;
	        _this3.board = new _board2.default(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr, Crafty, true);
	        _this3.playersInfo[data.selfId] = playerText;
	        _this3.selfId = data.selfId;
	      });
	
	      socket.on('addNewPlayer', function (data) {
	        var playerText = Crafty.e('2D, DOM, Text').attr({ x: 50, y: playerTextY, w: 200 }).text('connected with player ' + data.playerId).textColor(data.playerColor);
	        playerTextY += 30;
	        _this3.playersInfo[data.playerId] = playerText;
	      });
	
	      socket.on('othersDisconnected', function (data) {
	        if (_this3.players[data.playerId]) {
	          _this3.players[data.playerId].destroy();
	          delete _this3.players[data.playerId];
	        }
	
	        if (_this3.playersInfo[data.playerId]) {
	          _this3.playersInfo[data.playerId].destroy();
	          delete _this3.playersInfo[data.playerId];
	        }
	      });
	
	      socket.on('startNewGame', function (data) {
	        Crafty.scene('Game', data);
	      });
	    }
	  }, {
	    key: 'setUpNewGame',
	    value: function setUpNewGame(data) {
	      var _this4 = this;
	
	      $('#game-status').append('<div id=\'hp\'>\n                              <h2>HP</h2>\n                             </div>');
	      $('#game-status').append('<div id=\'timer\'>\n                              <h2>Timer</h2>\n                              <span id=\'timer-countdown\'>\n                                ' + data.timer + '\n                              </span>\n                             </div>');
	      $('#game-status').append('<div id=\'self-record\'>\n                                <h2>Ball Duration</h2>\n                                Longest Duration Time: 0\n                                Current Duration Time: 0\n                             </div>');
	      $('#game-status').append('<div id=\'scoreboard\'>\n                              <h2>Scoreboard</h2>\n                             </div>');
	      $('#game-status').append('<div id="weapon">\n                                <h2>Weapon</h2>\n                                <div id=\'weapon-img\'></div>\n                                <div id=\'weapon-type\'></div>\n                             </div>');
	      data.players.forEach(function (playerInfo) {
	        var _playerInfo$playerPx = _slicedToArray(playerInfo.playerPx, 2);
	
	        var playerX = _playerInfo$playerPx[0];
	        var playerY = _playerInfo$playerPx[1];
	
	        var _playerInfo$playerPos = _slicedToArray(playerInfo.playerPos, 2);
	
	        var playerRow = _playerInfo$playerPos[0];
	        var playerCol = _playerInfo$playerPos[1];
	
	        if (parseInt(playerInfo.playerId) === _this4.selfId) {
	          var player = Crafty.e('Player, SpriteAnimation, greenSprite').setUp(playerInfo.playerId, playerInfo.playerColor).setUpSocket(socket).setUpSetBallTime().bindingKeyEvents().attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT }).reel('PlayerMovingRight', 600, 0, 1, 5).reel('PlayerMovingDown', 600, 0, 1, 5).reel('PlayerMovingUp', 600, 0, 2, 5).reel('PlayerMovingLeft', 600, 0, 2, 5);
	          //  .animate('PlayerMovingDown', -1);
	
	
	          // place it on isometric map
	          // this.iso.place(player, playerRow, playerCol, mapGrid.ACTOR_Z);
	          _this4.iso.place(player, playerRow, playerCol, mapGrid.PLAYER.Z);
	
	          // after placing it on isometric map, figure out the translation of px
	          // from the server side to client side rendering
	          _this4.translateX = player.x - playerX;
	          _this4.translateY = player.y - playerY;
	
	          // since the player block always starts at bottom left corner
	          // when rendering, we need to account for the translation so we can
	          // render the player block in the top left corner instead
	          _this4.translateX += (mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2;
	          _this4.translateY -= (mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2;
	
	          // translate the player px in the initial rendering as well
	          player.x += (mapGrid.TILE.WIDTH - mapGrid.PLAYER.WIDTH) / 2;
	          player.y -= (mapGrid.TILE.SURFACE_HEIGHT - mapGrid.PLAYER.SURFACE_HEIGHT) / 2;
	
	          // if (player.playerColor === 'red') {
	          //   player.addComponent('spr_red')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // } else if (player.playerColor === 'green') {
	          //   player.addComponent('spr_green')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // } else if (player.playerColor === 'blue') {
	          //   player.addComponent('spr_blue')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // } else if (player.playerColor === 'yellow') {
	          //   player.addComponent('spr_yellow')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // }
	
	          $('#hp').append('<span class=\'player-' + playerInfo.playerId + '\'>\n                                  Player ' + playerInfo.playerId + ': ' + player.HP + '\n                                 </span>');
	          $('#scoreboard').append('<span class=\'player-' + playerInfo.playerId + '\'>\n              Player ' + playerInfo.playerId + ': ' + player.longestBallHoldingTime + '\n                                 </span>');
	
	          _this4.players[playerInfo.playerId] = player;
	        } else {
	          var otherPlayer = Crafty.e('OtherPlayer, tileSprite').setUp(data.players.playerId, playerInfo.playerColor).attr({ w: mapGrid.PLAYER.WIDTH, h: mapGrid.PLAYER.HEIGHT });
	
	          // place it on isometric map
	          _this4.iso.place(otherPlayer, playerRow, playerCol, mapGrid.PLAYER.Z);
	
	          // if (otherPlayer.playerColor === 'red') {
	          //   otherPlayer.addComponent('spr_red')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // } else if (otherPlayer.playerColor === 'green') {
	          //   otherPlayer.addComponent('spr_green')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // } else if (otherPlayer.playerColor === 'blue') {
	          //   otherPlayer.addComponent('spr_blue')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // } else if (otherPlayer.playerColor === 'yellow') {
	          //   otherPlayer.addComponent('spr_yellow')
	          //         .attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          // }
	
	          $('#hp').append('<span class=\'player-' + playerInfo.playerId + '\'>\n                            Player ' + playerInfo.playerId + ': ' + otherPlayer.HP + '\n                           </span>');
	          $('#scoreboard').append('<span class=\'player-' + playerInfo.playerId + '\'>\n          Player ' + playerInfo.playerId + ': 0\n                                 </span>');
	
	          _this4.players[playerInfo.playerId] = otherPlayer;
	        }
	      });
	
	      this.createMapEntities();
	    }
	  }, {
	    key: 'createMapEntities',
	    value: function createMapEntities() {
	      for (var i = 0; i < mapGrid.NUM_MAZE_ROWS; i++) {
	        for (var j = 0; j < mapGrid.NUM_MAZE_COLS; j++) {
	          if (this.board.maze[i][j].isWall) {
	            var wallEntity = Crafty.e('2D, DOM, wallSprite').attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
	            this.iso.place(wallEntity, i, j, mapGrid.TILE.Z);
	          } else {
	            console.log(mapGrid.TILE.WIDTH);
	            var tileEntity = Crafty.e('2D, DOM, tileSprite').attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
	            this.iso.place(tileEntity, i, j, mapGrid.TILE.Z);
	          }
	        }
	      }
	
	      Crafty.viewport.x = mapGrid.GAME_WIDTH / 2;
	      Crafty.viewport.y = 0 + mapGrid.PLAYER.HEIGHT;
	    }
	  }, {
	    key: 'setUpPlayersMove',
	    value: function setUpPlayersMove() {
	      var _this5 = this;
	
	      socket.on('updatePos', function (data) {
	        var player = _this5.players[data.playerId];
	        if (player) {
	          player.x = data.x + _this5.translateX;
	          player.y = data.y + _this5.translateY;
	        }
	      });
	    }
	  }, {
	    key: 'setUpPlacingWeapons',
	    value: function setUpPlacingWeapons() {
	      var _this6 = this;
	
	      socket.on('addWeapon', function (data) {
	        var weapon = Crafty.e('Weapon').at(data.row, data.col).setUp(data.type);
	
	        if (data.type === 'BFS') {
	          weapon.addComponent('spr_bfs').attr({ w: mapGrid.BFS_WIDTH, h: mapGrid.BFS_HEIGHT });
	        } else if (data.type === 'DFS') {
	          weapon.addComponent('spr_dfs').attr({ w: mapGrid.DFS_WIDTH, h: mapGrid.DFS_HEIGHT });
	        }
	        var col = weapon.getCol();
	        var row = weapon.getRow();
	        _this6.weapons[[col, row]] = weapon;
	      });
	
	      socket.on('destroyWeapon', function (data) {
	        var weapon = _this6.weapons[[data.col, data.row]];
	        weapon.destroy();
	      });
	    }
	  }, {
	    key: 'setUpCreateDamage',
	    value: function setUpCreateDamage() {
	      var _this7 = this;
	
	      socket.on('createDamage', function (data) {
	        Crafty.e('Damage').at(data.damageCell[0], data.damageCell[1]).attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT }).setUpCreator(data.creatorId).disappearAfter(data.disappearTime).color(_this7.players[data.creatorId].playerColor, 0.5);
	      });
	    }
	  }, {
	    key: 'setUpHPChange',
	    value: function setUpHPChange() {
	      var _this8 = this;
	
	      socket.on('HPChange', function (data) {
	        var player = _this8.players[data.playerId];
	        if (player) {
	          player.HP = data.playerHP;
	          $('#hp .player-' + data.playerId).text('Player ' + data.playerId + ': ' + data.playerHP);
	        }
	      });
	    }
	  }, {
	    key: 'setUpTimer',
	    value: function setUpTimer() {
	      socket.on('countDown', function (data) {
	        $('#timer-countdown').text(data.timer);
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
	      socket.on('addBall', function (data) {
	        // this.ball = Crafty.e('Ball, tileSprite')
	        //     .attr({ w: mapGrid.BALL_WIDTH, h: mapGrid.BALL_HEIGHT });
	        //
	        // this.iso.place(this.ball, data.row, data.col, mapGrid.ACTOR_Z);
	      });
	    }
	  }, {
	    key: 'setUpShowBall',
	    value: function setUpShowBall() {
	      var _this9 = this;
	
	      socket.on('showBall', function (data) {
	        _this9.ball.destroy();
	        _this9.players[data.playerId].pickUpBall();
	      });
	
	      socket.on('loseBall', function (data) {
	        _this9.players[data.playerId].color('black');
	      });
	    }
	  }, {
	    key: 'setUpShowBallRecord',
	    value: function setUpShowBallRecord() {
	      socket.on('showSelfScore', function (data) {
	        $('#self-record').html('\n          <h2>Ball Duration</h2>\n          <span>\n            Longest Duration Time: ' + data.longestBallHoldingTime + '\n          </span>\n          <span>\n            Current Duration Time: ' + data.currentBallHoldingTime + '\n          </span>');
	      });
	
	      socket.on('showScoreboard', function (data) {
	        $('#scoreboard .player-' + data.playerId).text('Player ' + data.playerId + ': ' + data.score);
	      });
	    }
	  }, {
	    key: 'setUpHaveWeapon',
	    value: function setUpHaveWeapon() {
	      var _this10 = this;
	
	      socket.on('pickUpWeapon', function (data) {
	        _this10.players[_this10.selfId].weaponType = data.type;
	        $('#weapon-type').text(data.type);
	        if (data.type === 'BFS') {
	          $('#weapon-img').html('<img src=\'../assets/bfs_weapon.png\'\n                                      height=\'50\'></img>');
	        } else if (data.type === 'DFS') {
	          $('#weapon-img').html('<img src=\'../assets/dfs_weapon.png\'\n                                      height=\'50\'></img>');
	        }
	      });
	
	      socket.on('loseWeapon', function (data) {
	        _this10.players[data.playerId].loseWeapon();
	        $('#weapon-type').empty();
	        $('#weapon-img').empty();
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
	
	module.exports = function (Crafty, model) {
	  // change name of the html element to stage
	  Crafty.init(mapGrid.GAME_WIDTH, mapGrid.GAME_HEIGHT, 'stage');
	
	  createComponents(Crafty, model);
	  createPlayerComponent(Crafty, model);
	  createWeaponComponent(Crafty);
	  createBallComponent(Crafty);
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var wallDirection = Constants.wallDirection;
	/* globals Crafty */
	
	var epsilon = 0.000000001;
	
	module.exports = function (Crafty, model) {
	  Crafty.c('Tile', {
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
	    }
	  });
	
	  Crafty.c('Actor', {
	    init: function init() {
	      this.requires('2D, Canvas, Tile');
	    }
	  });
	
	  Crafty.c('Wall', {
	    init: function init() {
	      this.requires('2D, Canvas, Tile, Solid, Collision');
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
	
	[TILE, PLAYER].forEach(function (actor) {
	  actor.WIDTH = actor.ORIG_WIDTH * actor.RATIO;
	  actor.HEIGHT = actor.ORIG_HEIGHT * actor.RATIO;
	  actor.SURFACE_HEIGHT = actor.WIDTH / 2;
	});
	
	[PLAYER].forEach(function (actor) {
	  var y0 = (TILE.HEIGHT / TILE.SURFACE_HEIGHT - 2) * TILE.SURFACE_HEIGHT;
	  // need to increase it by player depth
	  var y1 = y0 + (PLAYER.HEIGHT - PLAYER.SURFACE_HEIGHT);
	  // finding the z layer based on the craftyjs code
	  actor.Z = (y1 - (PLAYER.HEIGHT / TILE.SURFACE_HEIGHT - 2) * PLAYER.SURFACE_HEIGHT) / TILE.SURFACE_HEIGHT;
	  // actor.Z = ((PLAYER.HEIGHT - PLAYER.SURFACE_HEIGHT) /
	  //           ((TILE.HEIGHT - TILE.SURFACE_HEIGHT) / ACTOR_Z)) + 1;
	  // actor.Z = (((PLAYER_HEIGHT / TILE.SURFACE_HEIGHT) - 2) * TILE.SURFACE_HEIGHT
	});
	console.log(PLAYER.Z);
	
	// const TILE_ORIG_WIDTH = 101;
	// const TILE_ORIG_HEIGHT = 122;
	// const TILE_RATIO = (1 / 2);
	// const TILE_WIDTH = TILE_ORIG_WIDTH * TILE_RATIO;
	// const TILE_HEIGHT = TILE_ORIG_HEIGHT * TILE_RATIO;
	// const TILE_SURFACE_HEIGHT = TILE_WIDTH / 2;
	
	// const [PLAYER_ORIG_WIDTH, PLAYER_ORIG_HEIGHT] = [40, 54];
	// const [PLAYER_ORIG_WIDTH, PLAYER_ORIG_HEIGHT] = [101, 122];
	// const PLAYER_RATIO = (1 / 2);
	// const PLAYER_WIDTH = PLAYER_ORIG_WIDTH * PLAYER_RATIO;
	// const PLAYER_HEIGHT = PLAYER_ORIG_HEIGHT * PLAYER_RATIO;
	// const PLAYER_SURFACE_HEIGHT = PLAYER_WIDTH / 2;
	// the z layer if it was the same height as the tile
	
	var mapGrid = {
	  GAME_WIDTH: NUM_MAZE_ROWS * TILE.WIDTH,
	  // CHANGE TILE HEIGHT TO CHAR HEIGHT
	  GAME_HEIGHT: NUM_MAZE_COLS * TILE.SURFACE_HEIGHT + PLAYER.HEIGHT,
	  NUM_ROWS: NUM_ROWS,
	  NUM_COLS: NUM_COLS,
	  NUM_MAZE_ROWS: NUM_MAZE_ROWS,
	  NUM_MAZE_COLS: NUM_MAZE_COLS,
	  TILE: TILE,
	  PLAYER: PLAYER,
	  BALL_WIDTH: 101 / 2,
	  BALL_HEIGHT: 122 / 2,
	  DFS_WIDTH: 25,
	  DFS_HEIGHT: 0.30 * 25,
	  BFS_WIDTH: 20,
	  BFS_HEIGHT: 0.70 * 20,
	  CHAR_STEP: 20 // how many steps it needs from one tile to another
	};
	
	var weaponTypes = {
	  BFS: 'BFS',
	  DFS: 'DFS'
	};
	
	var gameSettings = {
	  WEAPON_RANGE: 10,
	  BUFFER_DAMAGE_TIME: 1000,
	  BUFFER_SHOOTING_TIME: 1500,
	  WEAPON_SPAWN_TIME: 10000,
	  DAMAGE_ANIMATION_TIME: 100,
	  DAMAGE_DISAPPEAR_TIME: 1000,
	  HP_DAMAGE: 10,
	  GAME_DURATION: 2000, // 200
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
	
	module.exports = function (Crafty, model) {
	  Crafty.c('Player', {
	    init: function init() {
	      this.requires('2D, DOM, Tile, Collision, Color');
	      this.HP = 100;
	      this.charStep = mapGrid.CHAR_STEP;
	      this.hasTakenDamage = false;
	      this.longestBallHoldingTime = 0;
	      this.currentBallHoldingTime = 0;
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
	          console.log("animating!");
	          this.animate('PlayerMovingRight', -1);
	          console.log(this.flip("X"));
	        }
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
	          console.log("animating!");
	          this.animate('PlayerMovingLeft', -1);
	          this.charMove.left = true;
	          this.unflip("X");
	        }
	        if (e.keyCode === Crafty.keys.UP_ARROW) {
	          console.log("animating!");
	          this.animate('PlayerMovingUp', -1);
	          this.charMove.up = true;
	          this.flip("X");
	        }
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
	          console.log("animating!");
	          this.animate('PlayerMovingDown', -1);
	          this.charMove.down = true;
	          this.unflip("X");
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
	          if (this.isPlaying('PlayerMovingRight')) this.pauseAnimation();
	          this.charMove.right = false;
	        }
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
	          if (this.isPlaying('PlayerMovingLeft')) this.pauseAnimation();
	          this.charMove.left = false;
	        }
	        if (e.keyCode === Crafty.keys.UP_ARROW) {
	          if (this.isPlaying('PlayerMovingUp')) this.pauseAnimation();
	          this.charMove.up = false;
	        }
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
	          if (this.isPlaying('PlayerMovingDown')) this.pauseAnimation();
	          this.charMove.down = false;
	        }
	        // this.pauseAnimation();
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
	
	
	    setUp: function setUp(playerId, playerColor) {
	      this.playerId = playerId;
	      if (playerColor) {
	        this.playerColor = playerColor;
	      }
	      return this;
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
	
	    pickUpBall: function pickUpBall() {
	      this.color('white');
	      return this;
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
	      this.requires('2D, DOM, Tile, Color');
	      this.HP = 100;
	    },
	
	    setUp: function setUp(playerId, playerColor, weaponDisplayId) {
	      this.playerId = playerId;
	
	      if (playerColor) {
	        this.playerColor = playerColor;
	      }
	
	      if (weaponDisplayId) {
	        this.weaponDisplayId = weaponDisplayId;
	      }
	
	      return this;
	    },
	
	    pickUpBall: function pickUpBall() {
	      this.color('white');
	      return this;
	    },
	
	    loseWeapon: function loseWeapon() {}
	
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
	      this.requires('Actor, Color, Collision');
	    },
	
	    setUp: function setUp(type) {
	      this.type = type;
	      return this;
	    }
	  });
	
	  Crafty.c('Damage', {
	    init: function init() {
	      this.requires('Actor, Color, Collision');
	    },
	
	    setUpCreator: function setUpCreator(playerId) {
	      this.creatorId = playerId;
	      return this;
	    },
	    disappearAfter: function disappearAfter(disappearTime) {
	      var _this = this;
	
	      setTimeout(function () {
	        return _this.destroy();
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
	      this.requires('2D, DOM, Tile, Solid, Collision');
	    }
	  });
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	var ClientModel = {
	  receiver: 'CLIENT',
	  wallInit: function wallInit() {
	    this.requires('2D, Canvas, Solid, Color, Collision');
	  },
	  playerMoveInDirections: function playerMoveInDirections(speed) {}
	};
	
	module.exports = ClientModel;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var Cell = __webpack_require__(10);
	
	var Board = function () {
	  function Board(m, n, seedRandomStr, print) {
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
	    if (print) this.log(this.maze);
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
/* 10 */
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

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map