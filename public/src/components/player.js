/* globals Crafty */
/* globals Queue */
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;

module.exports = function(Crafty) {
  Crafty.c('SelfPlayer', {
    init: function() {
      this.requires('Player');
      this.charStep = mapGrid.CHAR_STEP;
      this.hasTakenDamage = false;
      this.weaponType = null;
      this.weaponCoolingdown = false;
      this.pendingMoves = new Queue();
      // each movement has a number to it, to help client side prediction
      this.movementIdx = 0;

      this.z = 9;
    },

    bindingKeyEvents() {
      this.charMove = { left: false, right: false, up: false, down: false };

      this.bind('EnterFrame', function() {
        if (this.charMove.right || this.charMove.left ||
            this.charMove.up || this.charMove.down) {
          this.socket.emit('updatePos', {
            playerId: this.playerId,
            charMove: this.charMove
          });
        }
      });

      this.bind('KeyDown', function(e) {
        e.originalEvent.preventDefault();
        if (e.keyCode === Crafty.keys.Z) {
          this.pickUpWeapon();
          return;
        }

        if (e.keyCode === Crafty.keys.X && this.weaponType !== null) {
          this.shootWeapon();
          return;
        }

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
      });

      this.bind('KeyUp', function(e) {
        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
          console.log('releasing key');
          this.charMove.right = false;
        }
        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
          console.log('releasing key');
          this.charMove.left = false;
        }
        if (e.keyCode === Crafty.keys.UP_ARROW) {
          console.log('releasing key');
          this.charMove.up = false;
        }
        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
          console.log('releasing key');
          this.charMove.down = false;
        }
        this.socket.emit('stopMovement', {
          playerId: this.playerId,
          keyCode: e.keyCode
        });
      });

      return this;
    },

    moveDir(dirX, dirY) {
      // the offset it needs to move to the neighbor blocks
      const w = mapGrid.TILE.WIDTH / 2;
      const h = mapGrid.TILE.SURFACE_HEIGHT / 2;

      this.x += (w / this.charStep) * dirX;
      this.y += (h / this.charStep) * dirY;
    },

    setUpSocket: function(socket) {
      this.socket = socket;
      return this;
    },

    setUpSetBallTime: function() {
      this.socket.on('setBallTime', data => {
        this.currentBallHoldingTime = data.currentBallHoldingTime;
        this.longestSecsHoldingBall = data.longestSecsHoldingBall;
      });

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
    },

    loseWeapon: function() {
      this.weaponType = null;
    }

  });

  Crafty.c('OtherPlayer', {
    init: function() {
      this.requires('Player');
    }
  });

  Crafty.c('Player', {
    init: function() {
      this.requires('Actor');
      this.HP = 100;
      this.longestBallHoldingTime = 0;
      this.currentBallHoldingTime = 0;
    },

    displayAnimation: function(charMove) {
      // display the animation movement depending on the char move
      if (charMove.left && !this.isPlaying('PlayerMovingLeft')) {
        this.animate('PlayerMovingLeft', -1);
        this.unflip('X');
      } else if (charMove.down &&
        !this.isPlaying('PlayerMovingDown')) {
          this.animate('PlayerMovingDown', -1);
          this.unflip('X');
      } else if (charMove.up && !this.isPlaying('PlayerMovingUp')) {
        this.animate('PlayerMovingUp', -1);
        this.flip('X');
      } else if (charMove.right &&
        !this.isPlaying('PlayerMovingRight')) {
          this.animate('PlayerMovingRight', -1);
          this.flip('X');
      }
    },

    loseWeapon: function() {

    },

    setUpAnimation: function() {
      this.reel('PlayerMovingRight', 600, 0, 1, 5);
      this.reel('PlayerMovingDown', 600, 0, 1, 5);
      this.reel('PlayerMovingUp', 600, 0, 2, 5);
      this.reel('PlayerMovingLeft', 600, 0, 2, 5);
      return this;
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;
      if (playerColor) {
        this.playerColor = playerColor;
      }
      return this;
    },

    pickUpBall: function() {
      this.addComponent('purpleSprite');
      this.removeComponent(`${ this.playerColor }Sprite`);
      return this;
    },

    loseBall: function() {
      this.addComponent(`${ this.playerColor }Sprite`);
      this.removeComponent('purpleSprite');
      return this;
    }
  });
};
