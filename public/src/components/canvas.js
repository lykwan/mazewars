var createComponents = require('./entities.js');
var createPlayerComponent = require('./player.js');
var createWeaponComponent = require('./weapon.js');
var createSideBarComponent = require('./sidebar.js');

module.exports = function(Crafty, model) {
  Crafty.init(700, 500);

  createComponents(Crafty, model);
  createPlayerComponent(Crafty, model);
  createWeaponComponent(Crafty);
  createSideBarComponent(Crafty);
};
