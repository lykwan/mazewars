/* globals Crafty */

module.exports = function(Crafty) {
  Crafty.c('Ball', {
    init: function() {
      this.requires('Actor, spr_ball, Collision');
      //TODO: change spr_ball
      this.z = 8;
    }
  });
};
