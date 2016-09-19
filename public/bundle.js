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
	  game.start();
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _canvas = __webpack_require__(2);
	
	var _canvas2 = _interopRequireDefault(_canvas);
	
	var _entities = __webpack_require__(3);
	
	var _entities2 = _interopRequireDefault(_entities);
	
	var _player = __webpack_require__(5);
	
	var _player2 = _interopRequireDefault(_player);
	
	var _client_model = __webpack_require__(9);
	
	var _client_model2 = _interopRequireDefault(_client_model);
	
	var _board = __webpack_require__(10);
	
	var _board2 = _interopRequireDefault(_board);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var wallDirection = Constants.wallDirection;
	
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
	  }
	
	  _createClass(Game, [{
	    key: 'width',
	    value: function width() {
	      return mapGrid.NUM_ROWS * mapGrid.TILE_WIDTH;
	    }
	  }, {
	    key: 'height',
	    value: function height() {
	      return mapGrid.NUM_COLS * mapGrid.TILE_HEIGHT;
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      var _this = this;
	
	      (0, _canvas2.default)(Crafty, _client_model2.default);
	      //TODO: DELETE MODEL
	      Crafty.background('url(../assets/free-space-background-7.png) repeat');
	
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
	        _this.setUpNewGame(data);
	        _this.setUpPlayersMove();
	        _this.setUpPlacingWeapons();
	        _this.setUpCreateDamage();
	        _this.setUpHPChange();
	        _this.setUpTimer();
	        _this.setUpGameOver();
	        _this.setUpAddBall();
	        _this.setUpShowBall();
	        _this.setUpShowBallRecord();
	        _this.setUpHaveWeapon();
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
	      var _this2 = this;
	
	      var loadingScene = Crafty.e('2D, DOM, Text').attr({ x: 0, y: 0, w: 300 }).text('A-maze Ball - Press s to start').textColor('white');
	      Crafty.e('2D, DOM, Text').attr({ x: 0, y: 30, w: 300 }).text('Game can only be started when\n                   there are more than 2 people in the room').textColor('white');
	
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
	
	      Crafty.sprite("../assets/red.png", { spr_red: [0, 0, 174, 116] });
	      Crafty.sprite("../assets/green.png", { spr_green: [0, 0, 166, 108] });
	      Crafty.sprite("../assets/blue.png", { spr_blue: [0, 0, 154, 100] });
	      Crafty.sprite("../assets/yellow.png", { spr_yellow: [0, 0, 167, 128] });
	      Crafty.sprite("../assets/ball.png", { spr_ball: [0, 0, 144, 144] });
	      Crafty.sprite("../assets/bfs_weapon.png", { spr_bfs: [0, 0, 144, 102] });
	      Crafty.sprite("../assets/dfs_weapon.png", { spr_dfs: [0, 0, 288, 88] });
	
	      var playerTextY = 50;
	      socket.on('connected', function (data) {
	        var playerText = Crafty.e('2D, DOM, Text').attr({ x: 50, y: playerTextY, w: 200 }).text('You are player ' + data.selfId).textColor(data.playerColor);
	        playerTextY += 30;
	        _this2.board = new _board2.default(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr);
	        _this2.playersInfo[data.selfId] = playerText;
	        _this2.selfId = data.selfId;
	      });
	
	      socket.on('addNewPlayer', function (data) {
	        var playerText = Crafty.e('2D, DOM, Text').attr({ x: 50, y: playerTextY, w: 200 }).text('connected with player ' + data.playerId).textColor(data.playerColor);
	        playerTextY += 30;
	        _this2.playersInfo[data.playerId] = playerText;
	      });
	
	      socket.on('othersDisconnected', function (data) {
	        if (_this2.players[data.playerId]) {
	          _this2.players[data.playerId].destroy();
	          delete _this2.players[data.playerId];
	        }
	
	        if (_this2.playersInfo[data.playerId]) {
	          _this2.playersInfo[data.playerId].destroy();
	          delete _this2.playersInfo[data.playerId];
	        }
	      });
	
	      socket.on('startNewGame', function (data) {
	        Crafty.scene('Game', data);
	        // socket.emit('gotmessage', {
	        //   msg: 'hellow world',
	        //   playerId: this.selfId
	        // });
	      });
	    }
	  }, {
	    key: 'setUpNewGame',
	    value: function setUpNewGame(data) {
	      var _this3 = this;
	
	      $('#game-status').append('<div id=\'hp\'>\n                              <h2>HP</h2>\n                             </div>');
	      $('#game-status').append('<div id=\'timer\'>\n                              <h2>Timer</h2>\n                              <span id=\'timer-countdown\'>\n                                ' + data.timer + '\n                              </span>\n                             </div>');
	      $('#game-status').append('<div id=\'self-record\'>\n                                <h2>Ball Duration</h2>\n                                Longest Duration Time: 0\n                                Current Duration Time: 0\n                             </div>');
	      $('#game-status').append('<div id=\'scoreboard\'>\n                              <h2>Scoreboard</h2>\n                             </div>');
	      $('#game-status').append('<div id="weapon">\n                                <h2>Weapon</h2>\n                                <div id=\'weapon-img\'></div>\n                                <div id=\'weapon-type\'></div>\n                             </div>');
	      data.players.forEach(function (playerInfo) {
	        if (parseInt(playerInfo.playerId) === _this3.selfId) {
	          var player = Crafty.e('Player').at(playerInfo.playerPos[0], playerInfo.playerPos[1]).setUp(playerInfo.playerId, playerInfo.playerColor).setUpSocket(socket).setUpSetBallTime().bindingKeyEvents();
	
	          if (player.playerColor === 'red') {
	            player.addComponent('spr_red').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          } else if (player.playerColor === 'green') {
	            player.addComponent('spr_green').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          } else if (player.playerColor === 'blue') {
	            player.addComponent('spr_blue').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          } else if (player.playerColor === 'yellow') {
	            player.addComponent('spr_yellow').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          }
	
	          $('#hp').append('<span class=\'player-' + playerInfo.playerId + '\'>\n                                  Player ' + playerInfo.playerId + ': ' + player.HP + '\n                                 </span>');
	          $('#scoreboard').append('<span class=\'player-' + playerInfo.playerId + '\'>\n              Player ' + playerInfo.playerId + ': ' + player.longestBallHoldingTime + '\n                                 </span>');
	
	          _this3.players[playerInfo.playerId] = player;
	        } else {
	          var otherPlayer = Crafty.e('OtherPlayer').at(playerInfo.playerPos[0], playerInfo.playerPos[1]).setUp(data.players.playerId, playerInfo.playerColor);
	
	          if (otherPlayer.playerColor === 'red') {
	            otherPlayer.addComponent('spr_red').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          } else if (otherPlayer.playerColor === 'green') {
	            otherPlayer.addComponent('spr_green').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          } else if (otherPlayer.playerColor === 'blue') {
	            otherPlayer.addComponent('spr_blue').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          } else if (otherPlayer.playerColor === 'yellow') {
	            otherPlayer.addComponent('spr_yellow').attr({ w: mapGrid.PLAYER_WIDTH, h: mapGrid.PLAYER_HEIGHT });
	          }
	
	          $('#hp').append('<span class=\'player-' + playerInfo.playerId + '\'>\n                            Player ' + playerInfo.playerId + ': ' + otherPlayer.HP + '\n                           </span>');
	          $('#scoreboard').append('<span class=\'player-' + playerInfo.playerId + '\'>\n          Player ' + playerInfo.playerId + ': 0\n                                 </span>');
	
	          _this3.players[playerInfo.playerId] = otherPlayer;
	        }
	      });
	
	      for (var i = 0; i < mapGrid.NUM_COLS; i++) {
	        for (var j = 0; j < mapGrid.NUM_ROWS; j++) {
	          this.board.grid[i][j].drawWalls(Crafty);
	        }
	      }
	    }
	  }, {
	    key: 'setUpPlayersMove',
	    value: function setUpPlayersMove() {
	      var _this4 = this;
	
	      socket.on('updatePos', function (data) {
	        var player = _this4.players[data.playerId];
	        if (player) {
	          player.x = data.x;
	          player.y = data.y;
	        }
	      });
	    }
	  }, {
	    key: 'setUpPlacingWeapons',
	    value: function setUpPlacingWeapons() {
	      var _this5 = this;
	
	      socket.on('addWeapon', function (data) {
	        var weapon = Crafty.e('Weapon').at(data.x, data.y).setUp(data.type);
	
	        if (data.type === 'BFS') {
	          weapon.addComponent('spr_bfs').attr({ w: mapGrid.BFS_WIDTH, h: mapGrid.BFS_HEIGHT });
	        } else if (data.type === 'DFS') {
	          weapon.addComponent('spr_dfs').attr({ w: mapGrid.DFS_WIDTH, h: mapGrid.DFS_HEIGHT });
	        }
	        var col = weapon.getCol();
	        var row = weapon.getRow();
	        _this5.weapons[[col, row]] = weapon;
	      });
	
	      socket.on('destroyWeapon', function (data) {
	        var weapon = _this5.weapons[[data.col, data.row]];
	        weapon.destroy();
	      });
	    }
	  }, {
	    key: 'setUpCreateDamage',
	    value: function setUpCreateDamage() {
	      var _this6 = this;
	
	      socket.on('createDamage', function (data) {
	        Crafty.e('Damage').at(data.damageCell[0], data.damageCell[1]).attr({ w: mapGrid.TILE_WIDTH, h: mapGrid.TILE_HEIGHT }).setUpCreator(data.creatorId).disappearAfter(data.disappearTime).color(_this6.players[data.creatorId].playerColor, 0.5);
	      });
	    }
	  }, {
	    key: 'setUpHPChange',
	    value: function setUpHPChange() {
	      var _this7 = this;
	
	      socket.on('HPChange', function (data) {
	        var player = _this7.players[data.playerId];
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
	      var _this8 = this;
	
	      socket.on('addBall', function (data) {
	        _this8.ball = Crafty.e('Ball').at(data.col, data.row).attr({ w: mapGrid.BALL_WIDTH, h: mapGrid.BALL_HEIGHT });
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
	        _this10.players[_this10.selfId].weaponType = null;
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
	var createBallComponent = __webpack_require__(8);
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	
	module.exports = function (Crafty, model) {
	  var width = mapGrid.NUM_ROWS * mapGrid.TILE_WIDTH;
	  var height = mapGrid.NUM_COLS * mapGrid.TILE_HEIGHT;
	
	  Crafty.init(width, height, 'stage');
	
	  createComponents(Crafty, model);
	  createPlayerComponent(Crafty, model);
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
	/* globals Crafty */
	
	module.exports = function (Crafty, model) {
	  Crafty.c('Tile', {
	    init: function init() {
	      this.attr({
	        w: mapGrid.PLAYER_WIDTH,
	        h: mapGrid.PLAYER_HEIGHT
	      });
	    },
	
	    at: function at(col, row) {
	      var x = col * mapGrid.TILE_WIDTH + mapGrid.WALL_THICKNESS;
	      var y = row * mapGrid.TILE_HEIGHT + mapGrid.WALL_THICKNESS;
	      this.attr({ x: x, y: y });
	      return this;
	    },
	
	    getCol: function getCol() {
	      return Math.floor(this.x / mapGrid.TILE_WIDTH);
	    },
	
	    getRow: function getRow() {
	      return Math.floor(this.y / mapGrid.TILE_HEIGHT);
	    }
	  });
	
	  Crafty.c('Actor', {
	    init: function init() {
	      this.requires('2D, Canvas, Tile');
	    }
	  });
	
	  Crafty.c('Wall', {
	    init: function init() {
	      this.requires('2D, Canvas, Solid, Color, Collision');
	      this.z = 10;
	    },
	
	    wallDir: function wallDir(_wallDir) {
	      var wall = this;
	      if (_wallDir === wallDirection.HORIZONTAL) {
	        wall.attr({
	          w: mapGrid.TILE_WIDTH,
	          h: mapGrid.WALL_THICKNESS
	        });
	      } else if (_wallDir === wallDirection.VERTICAL) {
	        wall.attr({
	          w: mapGrid.WALL_THICKNESS,
	          h: mapGrid.TILE_HEIGHT
	        });
	      }
	
	      if (model.receiver === 'CLIENT') {
	        wall.color('#FFFFFF');
	      }
	
	      return wall;
	    },
	
	    atWall: function atWall(row, col, offset) {
	      var _offset = _slicedToArray(offset, 2);
	
	      var offSetX = _offset[0];
	      var offsetY = _offset[1];
	
	      var x = row * mapGrid.TILE_WIDTH + offSetX * (mapGrid.TILE_WIDTH - mapGrid.WALL_THICKNESS);
	      var y = col * mapGrid.TILE_HEIGHT + offsetY * (mapGrid.TILE_HEIGHT - mapGrid.WALL_THICKNESS);
	      this.attr({ x: x, y: y });
	      return this;
	    }
	  });
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	var mapGrid = {
	  NUM_ROWS: 13,
	  NUM_COLS: 13,
	  WALL_THICKNESS: 3,
	  TILE_WIDTH: 45,
	  TILE_HEIGHT: 45,
	  PLAYER_WIDTH: 30,
	  PLAYER_HEIGHT: 24,
	  BALL_WIDTH: 40,
	  BALL_HEIGHT: 40,
	  DFS_WIDTH: 50,
	  DFS_HEIGHT: 0.30 * 50,
	  BFS_WIDTH: 40,
	  BFS_HEIGHT: 0.70 * 40
	};
	
	var wallDirection = {
	  HORIZONTAL: 'HORIZONTAL',
	  VERTICAL: 'VERTICAL'
	};
	
	var weaponTypes = {
	  BFS: 'BFS',
	  DFS: 'DFS'
	};
	
	module.exports = {
	  mapGrid: mapGrid,
	  wallDirection: wallDirection,
	  weaponTypes: weaponTypes
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
	      this.charSpeed = 2;
	      this.HP = 100;
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
	        this.charMove.left = false;
	        this.charMove.right = false;
	        this.charMove.down = false;
	        this.charMove.up = false;
	
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) this.charMove.right = true;
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) this.charMove.left = true;
	        if (e.keyCode === Crafty.keys.UP_ARROW) this.charMove.up = true;
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) this.charMove.down = true;
	
	        if (e.keyCode === Crafty.keys.Z) {
	          this.pickUpWeapon();
	        }
	
	        if (e.keyCode === Crafty.keys.X && this.weaponType !== null) {
	          this.shootWeapon();
	        }
	      });
	
	      this.bind('KeyUp', function (e) {
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) this.charMove.right = false;
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) this.charMove.left = false;
	        if (e.keyCode === Crafty.keys.UP_ARROW) this.charMove.up = false;
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) this.charMove.down = false;
	      });
	
	      return this;
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
/* 7 */,
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	/* globals Crafty */
	
	module.exports = function (Crafty) {
	  Crafty.c('Ball', {
	    init: function init() {
	      this.requires('Actor, spr_ball, Collision');
	      //TODO: change spr_ball
	      this.z = 8;
	    }
	  });
	};

/***/ },
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var wallDirection = Constants.wallDirection;
	var Tile = __webpack_require__(11);
	
	var DIRECTION = {
	  left: 'left',
	  right: 'right',
	  top: 'top',
	  bottom: 'bottom'
	};
	
	var OPPOSITE = {
	  left: DIRECTION.right,
	  right: DIRECTION.left,
	  top: DIRECTION.bottom,
	  bottom: DIRECTION.top
	};
	
	var Board = function () {
	  function Board(n, m, seedRandomStr) {
	    _classCallCheck(this, Board);
	
	    this.numCols = n;
	    this.numRows = m;
	    Math.seedrandom(seedRandomStr);
	    this.grid = this.createGrid();
	    this.frontier = [];
	    this.createMaze();
	  }
	
	  _createClass(Board, [{
	    key: 'createGrid',
	    value: function createGrid() {
	      var grid = new Array(this.numRows);
	      for (var i = 0; i < grid.length; i++) {
	        grid[i] = new Array(this.numCols);
	        for (var j = 0; j < this.numCols; j++) {
	          grid[i][j] = new Tile(i, j);
	        }
	      }
	      return grid;
	    }
	  }, {
	    key: 'addFrontiers',
	    value: function addFrontiers(x, y) {
	      var _this = this;
	
	      var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	      dirs.forEach(function (dir) {
	        var newX = x + dir[0];
	        var newY = y + dir[1];
	
	
	        if (_this.isInGrid(newX, newY) && !_this.grid[newX][newY].isInMaze && _this.grid[newX][newY].hasBeenFrontier === false) {
	          _this.frontier.push([newX, newY]);
	          _this.grid[newX][newY].hasBeenFrontier = true;
	        }
	      });
	    }
	  }, {
	    key: 'isInGrid',
	    value: function isInGrid(x, y) {
	      return 0 <= x && x < this.numCols && 0 <= y && y < this.numRows;
	    }
	  }, {
	    key: 'inMazeNeighbors',
	    value: function inMazeNeighbors(x, y) {
	      var neighbors = [];
	      if (x > 0 && this.grid[x - 1][y].isInMaze) {
	        neighbors.push([x - 1, y]);
	      }
	      if (x < this.numCols - 1 && this.grid[x + 1][y].isInMaze) {
	        neighbors.push([x + 1, y]);
	      }
	      if (y > 0 && this.grid[x][y - 1].isInMaze) {
	        neighbors.push([x, y - 1]);
	      }
	      if (y < this.numRows - 1 && this.grid[x][y + 1].isInMaze) {
	        neighbors.push([x, y + 1]);
	      }
	
	      return neighbors;
	    }
	  }, {
	    key: 'direction',
	    value: function direction(x, y, otherX, otherY) {
	      if (otherX < x && y === otherY) {
	        return DIRECTION.left;
	      } else if (otherY < y && x === otherX) {
	        return DIRECTION.top;
	      } else if (otherX > x && y === otherY) {
	        return DIRECTION.right;
	      } else if (otherY > y && x === otherX) {
	        return DIRECTION.bottom;
	      }
	    }
	  }, {
	    key: 'expandMaze',
	    value: function expandMaze(x, y) {
	      this.grid[x][y].isInMaze = true;
	      this.addFrontiers(x, y);
	    }
	  }, {
	    key: 'createMaze',
	    value: function createMaze() {
	      var randomX = Math.floor(Math.random() * this.numCols);
	      var randomY = Math.floor(Math.random() * this.numRows);
	      this.expandMaze(randomX, randomY);
	      while (this.frontier.length !== 0) {
	        var randomIndex = Math.floor(Math.random() * this.frontier.length);
	
	        var _frontier$splice = this.frontier.splice(randomIndex, 1);
	
	        var _frontier$splice2 = _slicedToArray(_frontier$splice, 1);
	
	        var randomPos = _frontier$splice2[0];
	
	        var _randomPos = _slicedToArray(randomPos, 2);
	
	        var x = _randomPos[0];
	        var y = _randomPos[1];
	
	        var neighbors = this.inMazeNeighbors(x, y);
	
	        var _neighbors$Math$floor = _slicedToArray(neighbors[Math.floor(Math.random() * neighbors.length)], 2);
	
	        var neighX = _neighbors$Math$floor[0];
	        var neighY = _neighbors$Math$floor[1];
	
	
	        var dir = this.direction(x, y, neighX, neighY);
	        this.grid[x][y].walls[dir] = false;
	        this.grid[neighX][neighY].walls[OPPOSITE[dir]] = false;
	
	        this.expandMaze(x, y);
	      }
	    }
	  }]);
	
	  return Board;
	}();
	
	module.exports = Board;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Constants = __webpack_require__(4);
	var mapGrid = Constants.mapGrid;
	var wallDirection = Constants.wallDirection;
	/* globals Crafty */
	
	var Tile = function () {
	  function Tile(x, y) {
	    _classCallCheck(this, Tile);
	
	    this.walls = {
	      left: true,
	      right: true,
	      top: true,
	      bottom: true
	    };
	    this.isInMaze = false;
	    this.hasBeenFrontier = false;
	    this.x = x;
	    this.y = y;
	  }
	
	  _createClass(Tile, [{
	    key: 'drawWalls',
	    value: function drawWalls(Crafty) {
	      if (this.walls.left) {
	        Crafty.e('Wall').wallDir(wallDirection.VERTICAL).atWall(this.x, this.y, [0, 0]);
	      }
	      if (this.walls.right) {
	        Crafty.e('Wall').wallDir(wallDirection.VERTICAL).atWall(this.x, this.y, [1, 0]);
	      }
	      if (this.walls.top) {
	        Crafty.e('Wall').wallDir(wallDirection.HORIZONTAL).atWall(this.x, this.y, [0, 0]);
	      }
	      if (this.walls.bottom) {
	        Crafty.e('Wall').wallDir(wallDirection.HORIZONTAL).atWall(this.x, this.y, [0, 1]);
	      }
	    }
	  }, {
	    key: 'remainingPaths',
	    value: function remainingPaths() {
	      var _this = this;
	
	      return Object.keys(this.walls).filter(function (dir) {
	        return !_this.walls[dir];
	      });
	    }
	  }]);
	
	  return Tile;
	}();
	
	module.exports = Tile;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map