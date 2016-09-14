var createComponents = require('./entities.js');
var createPlayerComponent = require('./player.js');

module.exports = function(Crafty, model) {
  Crafty.init(500, 500);

  if (model.receiver === 'CLIENT') {
    Crafty.background('#000000');
  }

  createComponents(Crafty, model);
  createPlayerComponent(Crafty, model);
};
