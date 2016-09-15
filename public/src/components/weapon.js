/* globals Crafty */

module.exports = function(Crafty) {
  Crafty.c('Weapon', {
    init: function() {
      this.requires('Actor, Color, Collision');
    },

    selfDestroy: function() {
      this.destroy();
    },

    type: function(type) {
      this.type = type;
      return this;
    }
  });
};
