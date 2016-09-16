var createComponents = require('./entities.js');
var createPlayerComponent = require('./player.js');
var createWeaponComponent = require('./weapon.js');
var createSideBarComponent = require('./sidebar.js');
var createBallComponent = require('./ball.js');
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;

module.exports = function(Crafty, model) {
  const width = mapGrid.NUM_ROWS * mapGrid.TILE_WIDTH;
  const height = mapGrid.NUM_COLS * mapGrid.TILE_HEIGHT;

  Crafty.init(width, height);

  createComponents(Crafty, model);
  createPlayerComponent(Crafty, model);
  createWeaponComponent(Crafty);
  createBallComponent(Crafty);
};
