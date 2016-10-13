var createComponents = require('./components.js');
var createPlayerComponent = require('./player.js');
var createWeaponComponent = require('./weapon.js');
var createBallComponent = require('./ball.js');
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;

module.exports = function(Crafty) {
  // change name of the html element to stage
  Crafty.init(mapGrid.GAME_WIDTH, mapGrid.GAME_HEIGHT, 'stage');

  createComponents(Crafty);
  createPlayerComponent(Crafty);
  createWeaponComponent(Crafty);
  createBallComponent(Crafty);
};
