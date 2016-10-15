const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;
const gameSettings = Constants.gameSettings;
/* globals Crafty */

let epsilon = 0.000000001;

module.exports = function(Crafty) {
  Crafty.c('Cell', {
    init: function() {
      this.attr({
        w: mapGrid.TILE.WIDTH,
        h: mapGrid.TILE.HEIGHT
      });
    },

    at: function(row, col) {
      // the amount to move from one neighbor to the other
      const w = (mapGrid.TILE.WIDTH / 2);
      const h = (mapGrid.TILE.WIDTH / 4);

      const x = (row - col) * w;
      const y = (row + col) * h;
      this.attr({ x: x, y: y });
      return this;
    },

    getRowsCols: function() {
      const w = (mapGrid.TILE.WIDTH / 2);
      const h = (mapGrid.TILE.SURFACE_HEIGHT / 2);

      const xOverW = this.x / w;
      const yOverH = this.y / h;

      // (x/w) + (y/h) = 2*r
      const row = this.fixRoundingErrors((xOverW + yOverH) / 2);
      const col = this.fixRoundingErrors(row - xOverW);

      // const bottomRightX = this.x + mapGrid.PLAYER_WIDTH;
      // const bottomRightY = this.y + mapGrid.SURFACE_HEIGHT;
      // const xOverWBR = bottomRightX / w;
      // const yOverHBR = bottomRightY / h;
      // const rowBR = this.fixRoundingErrors((xOverWBR + yOverHBR) / 2);
      // const colBR = this.fixRoundingErrors(rowBR - xOverWBR);

      // finding all the rows it is at
      let rows = [Math.floor(row)];
      // if (((row - Math.floor(row)) * w - (mapGrid.PLAYER_WIDTH / 2)) > epsilon) {

      // if the offset of the block + half the width of the block is more than
      // the width of half a tile, then it is overlapping two rows
      let spaceOccupyingX = (row - Math.floor(row)) * w
                              + (mapGrid.PLAYER.WIDTH / 2);
      if ((spaceOccupyingX - w) > epsilon) {
        // console.log('really?');
        // console.log((row - Math.floor(row)) * w);
        // console.log(mapGrid.PLAYER_WIDTH / 2);
        // console.log(w);
        rows.push(Math.ceil(row));
      }

      // finding all the cols it is at
      let cols = [Math.floor(col)];
      // if (Math.floor(col) !== Math.floor(colBR)) {
      let spaceOccupyingY = (col - Math.floor(col)) * h
                            + (mapGrid.PLAYER.SURFACE_HEIGHT / 2);
      if ((spaceOccupyingY - h) > epsilon) {
        // rows.push(Math.floor(colBR));
        cols.push(Math.ceil(col));
      }
      // if (Math.floor(col) !== Math.ceil(col)) {
      // if ((col - Math.floor(col)) * h - (mapGrid.PLAYER_WIDTH / 4) > epsilon) {
      //   cols.push(Math.ceil(col));
      // }

      return [rows, cols];
    },

    // account for the floating point epsilon
    fixRoundingErrors: function(n) {
      return (Math.abs(n - Math.round(n)) <= epsilon) ? Math.round(n) : n;
    },

    getTopLeftRowCol: function() {
      let [rows, cols] = this.getRowsCols();
      return [rows[0], cols[0]];
    }
  });

  Crafty.c('Actor', {
    init: function() {
      this.requires('2D, DOM, Cell');
    },
  });

  Crafty.c('Item', {
    init: function() {

    },

    // for items that are in a static position
    setUpStaticPos(row, col) {
      this.staticRow = row;
      this.staticCol = col;
      return this;
    }
  });

  Crafty.c('Tile', {
    init: function() {
      this.requires('2D, DOM, tileSprite');
    },

    damageDisappearAfter: function(activeTileSprite) {
      window.setTimeout(() => {
        this.removeComponent(activeTileSprite);
        this.addComponent('tileSprite')
            .attr({ w: mapGrid.TILE.WIDTH, h: mapGrid.TILE.HEIGHT });
      }, gameSettings.DAMAGE_DISAPPEAR_TIME);
    }
  });

};
