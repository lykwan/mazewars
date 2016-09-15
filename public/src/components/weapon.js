/* globals Crafty */

module.exports = function(Crafty, model) {
  Crafty.c('Weapon', {
    init: function() {
      this.requires('Actor, Color, Collision');
    },

    

  });
};
