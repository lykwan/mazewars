/* globals Crafty */

module.exports = function(Crafty) {
  Crafty.c('Weapon', {
    init: function() {
      this.requires('Actor, Item');
    },

    setUp: function(type) {
      this.type = type;
      return this;
    }
  });

  Crafty.c('Damage', {
    init: function() {
      this.requires('Actor, Item');
      this.checkCollisionInterval = null;
    },

    setUpCreator(playerId) {
      this.creatorId = playerId;
      return this;
    },

    disappearAfter(disappearTime) {
      setTimeout(() => {
        if (this.checkCollisionInterval) {
          clearInterval(this.checkCollisionInterval);
        }
        this.destroy();
      }, disappearTime);
      return this;
    }
  });
};
