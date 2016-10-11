/* globals Crafty */

module.exports = function(Crafty) {
  Crafty.c('Ball', {
    init: function() {
      this.requires('2D, DOM, Tile, Solid, Collision');
    }
  });
};
