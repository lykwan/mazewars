/* globals Crafty */

export default function() {
  Crafty.c('Player', {
    init: function() {
      this.requires('Actor, Fourway, Color, Collision')
          .fourway(100)
          .stopOnSolids();
    },

    playerColor: function(color) {
      this.color(color);
      return this;
    },

    stopOnSolids: function() {
      this.onHit('Solid', this.stopMovement);
      return this;
    },

    stopMovement: function() {
      this._speed = 0;
      this.x -= this._dx;
      this.y -= this._dy;
    }
  });
}
