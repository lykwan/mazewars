/* globals Crafty */

module.exports = function(Crafty, model) {
  Crafty.c('Player', {
    init: function() {
      this.requires('Actor, Color, Collision')
          .moveInDirections(2);
    },

    moveInDirections(speed) {
      this.charMove = { left: false, right: false, up: false, down: false };
      this.charSpeed = speed;

      model.playerMoveInDirections.bind(this, speed)();
      return this;
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;
      if (playerColor) {
        this.color(playerColor);
      }
      return this;
    },

    setUpSocket: function(socket) {
      this.socket = socket;
      return this;
    },

    
  });

  Crafty.c('OtherPlayer', {
    init: function() {
      this.requires('Actor, Color');
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;

      if (playerColor) {
        this.color(playerColor);
      }

      return this;
    },
  });
};
