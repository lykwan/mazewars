/* globals Crafty */

export default function() {
  Crafty.c('Player', {
    init: function() {
      this.requires('Actor, Fourway, Color, Collision')
          .moveInDirections(2)
          .stopOnSolids();
    },

    playerColor: function(color) {
      this.color(color);
      return this;
    },

    moveInDirections(speed) {
      this.charMove = { left: false, right: false, up: false, down: false };
      this.charSpeed = speed;

      this.bind('EnterFrame', function() {
          if (this.charMove.right) {
            this.socket.emit('updatePos', { playerId: this.playerId, charMove: this.charMove });
          } else if (this.charMove.left) {
            this.socket.emit('updatePos', { playerId: this.playerId, charMove: this.charMove });
          } else if (this.charMove.up) {
            this.socket.emit('updatePos', { playerId: this.playerId, charMove: this.charMove });
          } else if (this.charMove.down) {
            this.socket.emit('updatePos', { playerId: this.playerId, charMove: this.charMove });
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
      });

      this.bind('KeyUp', function(e) {
        if (e.keyCode === Crafty.keys.RIGHT_ARROW) this.charMove.right = false;
        if (e.keyCode === Crafty.keys.LEFT_ARROW) this.charMove.left = false;
        if (e.keyCode === Crafty.keys.UP_ARROW) this.charMove.up = false;
        if (e.keyCode === Crafty.keys.DOWN_ARROW) this.charMove.down = false;
      });

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

    setUpSocket(socket, playerId) {
      this.socket = socket;
      this.playerId = playerId;
      this.socket.on('updatePos', data => {
        console.log('got hereeee updating pos ');
        if (data.charMove.right) {
            this.x += this.charSpeed;
        } else if (data.charMove.left) {
            this.x -= this.charSpeed;
        } else if (data.charMove.up) {
            this.y -= this.charSpeed;
        } else if (data.charMove.down) {
            this.y += this.charSpeed;
        }
      });
    }

  });
}
