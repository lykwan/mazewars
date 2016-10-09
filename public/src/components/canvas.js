var createComponents = require('./entities.js');
var createPlayerComponent = require('./player.js');
var createWeaponComponent = require('./weapon.js');
var createBallComponent = require('./ball.js');
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;

module.exports = function(Crafty, model) {
  const mazeRows = (mapGrid.NUM_ROWS * 2 - 1);
  const mazeCols = (mapGrid.NUM_COLS * 2 - 1);
  const width = mazeRows * mapGrid.TILE_WIDTH;
  const height = mazeCols * mapGrid.TILE_HEIGHT;

  Crafty.init(width, height, 'stage');

  createComponents(Crafty, model);
  createPlayerComponent(Crafty, model);
  createWeaponComponent(Crafty);
  createBallComponent(Crafty);
};
