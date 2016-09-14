/* globals Crafty */

module.exports = function(Crafty, model) {
  Crafty.c('Player', {
    init: function() {
      this.requires('Actor, Color, Collision')
          .moveInDirections(2);
    },

    // playerColor: function(color) {
    //   this.color(color);
    //   return this;
    // },

    moveInDirections(speed) {
      this.charMove = { left: false, right: false, up: false, down: false };
      this.charSpeed = speed;

      model.playerMoveInDirections.bind(this, speed)();
      return this;
    },

    stopOnSolids: function() {
      this.onHit('Solid', this.stopMovement);
      return this;
    },

    stopMovement: function() {
      if (this.charMove.left) {
        this.x += this.charSpeed;
      } else if (this.charMove.right) {
        this.x -= this.charSpeed;
      } else if (this.charMove.up) {
        this.y += this.charSpeed;
      } else if (this.charMove.down) {
        this.y -= this.charSpeed;
      }
      this.charMove.left = false;
      this.charMove.right = false;
      this.charMove.down = false;
      this.charMove.up = false;
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;
      if (playerColor) {
        this.color(playerColor);
      }

      return this;
    },

    setUpSocket: function(socket) {
      this.socket = socket;
      this.socket.on('updatePos', data => {
        this.x = data.x;
        this.y = data.y;
      });

      return this;
    }
  });

  Crafty.c('otherPlayer', {
    init: function() {
      this.requires('Actor, Color');
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;

      if (playerColor) {
        this.color(playerColor);
      }

      return this;
    },
  });
};
