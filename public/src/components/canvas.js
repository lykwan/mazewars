var createComponents = require('./entities.js');
var createPlayerComponent = require('./player.js');
var createWeaponComponent = require('./weapon.js');
var createSideBarComponent = require('./sidebar.js');

module.exports = function(Crafty, model) {
  Crafty.init(500, 500);

  Crafty.scene('Game', () => {
    createComponents(Crafty, model);
    createPlayerComponent(Crafty, model);
    createWeaponComponent(Crafty);
  });
};
