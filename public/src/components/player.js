/* globals Crafty */
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;

module.exports = function(Crafty, model) {
  Crafty.c('Player', {
    init: function() {
      this.requires('2D, DOM, Tile, Collision, Color');
      this.charSpeed = 2;
      this.HP = 100;
      this.hasTakenDamage = false;
      this.longestBallHoldingTime = 0;
      this.currentBallHoldingTime = 0;
      this.weaponType = null;
    },

    getCol: function() {
      return Math.floor(this.x / mapGrid.TILE_WIDTH);
    },

    getRow: function() {
      return Math.floor(this.y / mapGrid.TILE_HEIGHT);
    },

    bindingKeyEvents() {
      this.charMove = { left: false, right: false, up: false, down: false };

      this.bind('EnterFrame', function() {
        if (this.charMove.right || this.charMove.left ||
            this.charMove.up || this.charMove.down) {
              console.log('updating pos', this.playerId, this.charMove);
          // this.socket.emit('gotmessage', {
          //   msg: 'hellow world',
          //   playerId: this.playerId
          // });
          this.socket.emit('updatePos', {
            playerId: this.playerId,
            charMove: this.charMove
          });
        }
      });

      this.bind('KeyDown', function(e) {
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

      this.bind('KeyUp', function(e) {
        if (e.keyCode === Crafty.keys.RIGHT_ARROW) this.charMove.right = false;
        if (e.keyCode === Crafty.keys.LEFT_ARROW) this.charMove.left = false;
        if (e.keyCode === Crafty.keys.UP_ARROW) this.charMove.up = false;
        if (e.keyCode === Crafty.keys.DOWN_ARROW) this.charMove.down = false;
      });

      return this;
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;
      if (playerColor) {
        this.playerColor = playerColor;
      }
      return this;
    },

    setUpSocket: function(socket) {
      this.socket = socket;
      return this;
    },

    autoPickUpBall: function() {
      // this.socket.on('pickUpBall', () => {
      //   this.hasBall = true;
      // });
      //
      this.socket.on('setBallTime', data => {
        this.currentBallHoldingTime = data.currentBallHoldingTime;
        this.longestSecsHoldingBall = data.longestSecsHoldingBall;
      });

      return this;
    },

    pickUpBall: function() {
      this.color('white');
      return this;
    },

    pickUpWeapon: function() {
      this.socket.emit('pickUpWeapon', {
        playerId: this.playerId
      });

    },

    shootWeapon: function() {
      this.socket.emit('shootWeapon', {
        playerId: this.playerId
      });
    }
  });

  Crafty.c('OtherPlayer', {
    init: function() {
      this.requires('2D, DOM, Tile, Color');
      this.HP = 100;
    },

    setUp: function(playerId, playerColor, weaponDisplayId) {
      this.playerId = playerId;

      if (playerColor) {
        this.playerColor = playerColor;
      }

      if (weaponDisplayId) {
        this.weaponDisplayId = weaponDisplayId;
      }

      return this;
    },

    pickUpBall: function() {
      this.color('white');
      return this;
    }

  });
};
