/* globals Crafty */

module.exports = function(Crafty) {
  Crafty.c('Weapon', {
    init: function() {
      this.requires('Actor, Color, Collision');
    },

    setUp: function(weaponId, type) {
      this.weaponId = weaponId;
      this.type = type;
      return this;
    }
  });

  Crafty.c('Damage', {
    init: function() {
      this.requires('Actor, Color, Collision');
    }
  });
};
