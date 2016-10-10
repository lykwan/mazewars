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

    at: function(row, col) {
      // the amount to move from one neighbor to the other
      const w = (mapGrid.TILE_WIDTH / 2);
      const h = (mapGrid.TILE_WIDTH / 4);

      const x = (row - col) * w;
      const y = (row + col) * h;
      this.attr({ x: x, y: y });
      return this;
    },

    getRowsCols: function() {
      const w = (mapGrid.TILE_WIDTH / 2);
      const h = (mapGrid.TILE_WIDTH / 4);

      const xOverW = this.x / w;
      const yOverH = this.y / h;

      // (x/w) + (y/h) = 2*r
      const row = this.fixRoundingErrors((xOverW + yOverH) / 2);
      const col = this.fixRoundingErrors(row - xOverW);

      // finding all the rows it is at
      let rows = [Math.floor(row)];
      if (Math.floor(row) !== Math.ceil(row)) {
        rows.push(Math.ceil(row));
      }

      // finding all the cols it is at
      let cols = [Math.floor(col)];
      if (Math.floor(col) !== Math.ceil(col)) {
        cols.push(Math.ceil(col));
      }

      return [rows, cols];
    },

    // account for the floating point epsilon
    fixRoundingErrors: function(n) {
      let epsilon = 0.00005;
      return (Math.abs(n - Math.round(n)) <= epsilon) ? Math.round(n) : n;
    }
  });

  Crafty.c('Actor', {
    init: function() {
      this.requires('2D, Canvas, Tile');
    },
  });

  Crafty.c('Wall', {
    init: function() {
      this.requires('2D, Canvas, Tile, Solid, Collision');
    }
  });


  // Crafty.c('Wall', {
  //   init: function() {
  //     this.requires('2D, Canvas, Solid, Color, Collision');
  //     this.z = 10;
  //   },
  //
  //   wallDir: function(wallDir) {
  //     let wall = this;
  //     if (wallDir === wallDirection.HORIZONTAL) {
  //       wall.attr({
  //            w: mapGrid.TILE_WIDTH,
  //            h: mapGrid.WALL_THICKNESS
  //          });
  //     } else if (wallDir === wallDirection.VERTICAL) {
  //       wall.attr({
  //            w: mapGrid.WALL_THICKNESS,
  //            h: mapGrid.TILE_HEIGHT
  //          });
  //     }
  //
  //     if (model.receiver === 'CLIENT') {
  //       wall.color('#FFFFFF');
  //     }
  //
  //     return wall;
  //   },
  //
  //   atWall: function(row, col, offset) {
  //     const [offSetX, offsetY] = offset;
  //     const x = (row * mapGrid.TILE_WIDTH) +
  //               (offSetX * (mapGrid.TILE_WIDTH - mapGrid.WALL_THICKNESS));
  //     const y = (col * mapGrid.TILE_HEIGHT) +
  //               (offsetY * (mapGrid.TILE_HEIGHT - mapGrid.WALL_THICKNESS));
  //     this.attr({ x: x, y: y });
  //     return this;
  //   }
  // });
};
