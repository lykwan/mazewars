let ClientModel = {
  receiver: 'CLIENT',
  wallInit: function() {
    this.requires('2D, Canvas, Solid, Color, Collision');
  },
  playerMoveInDirections: function(speed) {
    this.bind('EnterFrame', function() {
      if (this.charMove.right || this.charMove.left ||
          this.charMove.up || this.charMove.down) {
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
  }
 };

module.exports = ClientModel;
