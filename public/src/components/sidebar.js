/* globals Crafty */

module.exports = function(Crafty) {
  Crafty.c('PlayerScore', {
    init: function() {
      this.requires('2D, DOM, Text');
    },
  });

  Crafty.c('PlayerIcon', {
    init: function() {
      this.requires('Actor, Color');
    }
  });

  Crafty.c('WeaponDisplay', {
    init: function() {
      this.requires('2D, DOM, Text, Color');
      this.color('white');
    },

    createText: function(type) {
      this.text(`Weapon: ${ type }`);
      return this;
    }
  });
};
