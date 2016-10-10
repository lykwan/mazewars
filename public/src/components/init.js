var createComponents = require('./components.js');
var createPlayerComponent = require('./player.js');
var createWeaponComponent = require('./weapon.js');
var createBallComponent = require('./ball.js');
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;

module.exports = function(Crafty, model) {
  // const mazeRows = (mapGrid.NUM_ROWS * 2 - 1);
  // const mazeCols = (mapGrid.NUM_COLS * 2 - 1);
  // const width = mazeRows * mapGrid.TILE_WIDTH;
  // const height = mazeCols * mapGrid.TILE_HEIGHT;
  //
  // change name of the html element to stage
  Crafty.init(mapGrid.GAME_WIDTH, mapGrid.GAME_HEIGHT, 'stage');

  createComponents(Crafty, model);
  createPlayerComponent(Crafty, model);
  createWeaponComponent(Crafty);
  createBallComponent(Crafty);

};
