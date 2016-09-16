const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;
/* globals Crafty */

module.exports = function(Crafty, model) {
  Crafty.c('Tile', {
    init: function() {
      this.attr({
        w: mapGrid.PLAYER_WIDTH,
        h: mapGrid.PLAYER_HEIGHT
      });
    },

    at: function(col, row) {
      const x = col * mapGrid.TILE_WIDTH + mapGrid.WALL_THICKNESS;
      const y = row * mapGrid.TILE_HEIGHT + mapGrid.WALL_THICKNESS;
      this.attr({ x: x, y: y });
      return this;
    }
  });


  Crafty.c('Actor', {
    init: function() {
      this.requires('2D, Canvas, Tile');
    },
  });


  Crafty.c('Wall', {
    init: function() {
      this.requires('2D, Canvas, Solid, Color, Collision');
      this.z = 10;
    },

    wallDir: function(wallDir) {
      let wall = this;
      if (wallDir === wallDirection.HORIZONTAL) {
        wall.attr({
             w: mapGrid.TILE_WIDTH,
             h: mapGrid.WALL_THICKNESS
           });
      } else if (wallDir === wallDirection.VERTICAL) {
        wall.attr({
             w: mapGrid.WALL_THICKNESS,
             h: mapGrid.TILE_HEIGHT
           });
      }

      if (model.receiver === 'CLIENT') {
        wall.color('#FFFFFF');
      }

      return wall;
    },

    atWall: function(row, col, offset) {
      const [offSetX, offsetY] = offset;
      const x = (row * mapGrid.TILE_WIDTH) +
                (offSetX * (mapGrid.TILE_WIDTH - mapGrid.WALL_THICKNESS));
      const y = (col * mapGrid.TILE_HEIGHT) +
                (offsetY * (mapGrid.TILE_HEIGHT - mapGrid.WALL_THICKNESS));
      this.attr({ x: x, y: y });
      return this;
    }
  });
};
