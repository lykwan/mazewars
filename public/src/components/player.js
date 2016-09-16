/* globals Crafty */
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;

module.exports = function(Crafty, model) {
  Crafty.c('Player', {
    init: function() {
      this.requires('Actor, Color, Collision, Text');
      this.charSpeed = 2;
      this.HP = 100;
      this.hasTakenDamage = false;
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
          // this.socket.emit('gotmessage', {
          //   msg: 'hellow world',
          //   playerId: this.playerId
          // });
          this.socket.emit('updatePos', {
            playerId: this.playerId,
            charMove: this.charMove
          });
          console.log('getting here after socket');
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

        if (e.keyCode === Crafty.keys.X) {
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

    pickUpWeapon: function() {
      this.socket.emit('pickUpWeapon', {
        playerId: this.playerId
      });

      this.socket.on('pickUpWeapon', data => {
        this.weaponType = data.type;
        this.color('white');
        // const weaponDisplay = Crafty(this.weaponDisplayId);
        // weaponDisplay.createText(this.weaponType);
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
      this.requires('Actor, Color');
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
  });
};
