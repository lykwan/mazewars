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
	
	var _client_model = __webpack_require__(8);
	
	var _client_model2 = _interopRequireDefault(_client_model);
	
	var _board = __webpack_require__(9);
	
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
	      Crafty.background('#000000');
	
	      Crafty.scene('Loading', function () {
	        _this.setUpLoadingScene.bind(_this)();
	      });
	
	      Crafty.scene('Game', function () {
	        _this.setUpConnection();
	        _this.setUpPlayersMove();
	        _this.setUpAddNewPlayer();
	        _this.setUpPlacingWeapons();
	        _this.setUpCreateDamage();
	        _this.setUpHPChange();
	      });
	
	      // Crafty.scene('Loading');
	
	      Crafty.scene('Game');
	    }
	  }, {
	    key: 'setUpLoadingScene',
	    value: function setUpLoadingScene() {
	      var loadingScene = Crafty.e('2D, DOM, Text').attr({ x: 0, y: 0 }).text('A-maze Ball').textColor('white');
	
	      var playerTextY = 50;
	      socket.on('connected', function (data) {
	        Crafty.e('2D, DOM, Text').attr({ x: 50, y: playerTextY }).text(data.selfId).textColor(data.playerColor);
	        playerTextY += 30;
	      });
	
	      socket.on('addNewPlayer', function (data) {
	        Crafty.e('2D, DOM, Text').attr({ x: 50, y: playerTextY }).text('connected with ' + data.playerId).textColor('white');
	        playerTextY += 30;
	      });
	    }
	  }, {
	    key: 'setUpConnection',
	    value: function setUpConnection() {
	      var _this2 = this;
	
	      var colors = ['#7ec0ee', 'red', 'yellow', 'green'];
	      socket.on('connected', function (data) {
	        // let weaponDisplay = Crafty.e('WeaponDisplay')
	        //                           .attr({ x: 600, y: 300 })
	        //                           .createText(' ');
	        // let weaponDisplayId = weaponDisplay[0];
	        var player = Crafty.e('Player').at(0, 0).setUp(data.selfId, data.playerColor).setUpSocket(socket).bindingKeyEvents();
	
	        $('#scoreboard').append('<li class=\'player-' + data.selfId + '\'>\n                    ' + player.HP + '\n                </li>');
	
	        data.playerIds.forEach(function (id) {
	          var otherPlayer = Crafty.e('OtherPlayer').at(0, 0).setUp(id, colors[id]);
	          $('#scoreboard').append('<li class=\'player-' + id + '\'>\n                      ' + otherPlayer.HP + '\n                  </li>');
	          _this2.players[id] = otherPlayer;
	        });
	
	        _this2.players[data.selfId] = player;
	        _this2.board = new _board2.default(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr);
	
	        for (var i = 0; i < mapGrid.NUM_COLS; i++) {
	          for (var j = 0; j < mapGrid.NUM_ROWS; j++) {
	            _this2.board.grid[i][j].drawWalls(Crafty);
	          }
	        }
	      });
	    }
	  }, {
	    key: 'setUpAddNewPlayer',
	    value: function setUpAddNewPlayer() {
	      var _this3 = this;
	
	      var colors = ['blue', 'red', 'yellow', 'green'];
	      socket.on('addNewPlayer', function (data) {
	        var otherPlayer = Crafty.e('OtherPlayer').at(0, 0).setUp(data.playerId, colors[data.playerId]);
	        $('#scoreboard').append('<li class=\'player-' + data.playerId + '\'>\n                    ' + otherPlayer.HP + '\n                </li>');
	        _this3.players[data.playerId] = otherPlayer;
	      });
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
	        var weapon = Crafty.e('Weapon').at(data.x, data.y).setUp(data.weaponId, data.type).color(data.color);
	        _this5.weapons[data.weaponId] = weapon;
	      });
	
	      socket.on('destroyWeapon', function (data) {
	        var weapon = _this5.weapons[data.weaponId];
	        weapon.destroy();
	      });
	    }
	  }, {
	    key: 'setUpCreateDamage',
	    value: function setUpCreateDamage() {
	      socket.on('createDamage', function (data) {
	        Crafty.e('Damage').at(data.damageCell[0], data.damageCell[1]).setUpCreator(data.creatorId).disappearAfter().color('#7ec0ee', 0.5);
	      });
	    }
	  }, {
	    key: 'setUpHPChange',
	    value: function setUpHPChange() {
	      var _this6 = this;
	
	      socket.on('HPChange', function (data) {
	        var player = _this6.players[data.playerId];
	        if (player) {
	          player.HP = data.playerHP;
	          $('.player-' + data.playerId).text(player.HP);
	        }
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
	var createSideBarComponent = __webpack_require__(7);
	
	module.exports = function (Crafty, model) {
	  Crafty.init(500, 500);
	
	  createComponents(Crafty, model);
	  createPlayerComponent(Crafty, model);
	  createWeaponComponent(Crafty);
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
	  NUM_ROWS: 8,
	  NUM_COLS: 8,
	  WALL_THICKNESS: 3,
	  TILE_WIDTH: 50,
	  TILE_HEIGHT: 50,
	  PLAYER_WIDTH: 30,
	  PLAYER_HEIGHT: 30
	};
	
	var wallDirection = {
	  HORIZONTAL: 'HORIZONTAL',
	  VERTICAL: 'VERTICAL'
	};
	
	var weaponTypes = {
	  BFS: 'BFS',
	  DSF: 'DFS'
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
	      this.requires('Actor, Color, Collision, Text');
	      this.charSpeed = 2;
	      this.HP = 100;
	      this.hasTakenDamage = false;
	    },
	
	    getCol: function getCol() {
	      return Math.floor(this.x / mapGrid.TILE_WIDTH);
	    },
	
	    getRow: function getRow() {
	      return Math.floor(this.y / mapGrid.TILE_HEIGHT);
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
	
	        if (e.keyCode === Crafty.keys.X) {
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
	        this.color(playerColor);
	      }
	      return this;
	    },
	
	    setUpSocket: function setUpSocket(socket) {
	      this.socket = socket;
	      return this;
	    },
	
	    pickUpWeapon: function pickUpWeapon() {
	      var _this = this;
	
	      this.socket.emit('pickUpWeapon', {
	        playerId: this.playerId
	      });
	
	      this.socket.on('pickUpWeapon', function (data) {
	        _this.weaponType = data.type;
	        _this.color('white');
	        // const weaponDisplay = Crafty(this.weaponDisplayId);
	        // weaponDisplay.createText(this.weaponType);
	      });
	    },
	
	    shootWeapon: function shootWeapon() {
	      this.socket.emit('shootWeapon', {
	        playerId: this.playerId
	      });
	    }
	  });
	
	  Crafty.c('OtherPlayer', {
	    init: function init() {
	      this.requires('Actor, Color');
	      this.HP = 100;
	    },
	
	    setUp: function setUp(playerId, playerColor, weaponDisplayId) {
	      this.playerId = playerId;
	
	      if (playerColor) {
	        this.color(playerColor);
	      }
	
	      if (weaponDisplayId) {
	        this.weaponDisplayId = weaponDisplayId;
	      }
	
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
	
	    setUp: function setUp(weaponId, type) {
	      this.weaponId = weaponId;
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
	    disappearAfter: function disappearAfter() {
	      var _this = this;
	
	      setTimeout(function () {
	        return _this.destroy();
	      }, 400);
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
	  Crafty.c('PlayerScore', {
	    init: function init() {
	      this.requires('2D, DOM, Text');
	    }
	  });
	
	  Crafty.c('PlayerIcon', {
	    init: function init() {
	      this.requires('Actor, Color');
	    }
	  });
	
	  Crafty.c('WeaponDisplay', {
	    init: function init() {
	      this.requires('2D, DOM, Text, Color');
	      this.color('white');
	    },
	
	    createText: function createText(type) {
	      this.text('Weapon: ' + type);
	      return this;
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
	var wallDirection = Constants.wallDirection;
	var Tile = __webpack_require__(10);
	
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
/* 10 */
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
	
	      return Object.keys(this.walls).filter(function (wall) {
	        return !_this.walls[wall];
	      });
	    }
	  }]);
	
	  return Tile;
	}();
	
	module.exports = Tile;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map