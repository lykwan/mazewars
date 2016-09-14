import { mapGrid, wallDirection } from '../constants.js';
/* globals Crafty */

export default function() {
  Crafty.c('Tile', {
    init: function() {
      this.attr({
        w: mapGrid.PLAYER_WIDTH,
        h: mapGrid.PLAYER_HEIGHT
      });
    },

    at: function(row, col) {
      const x = row * mapGrid.TILE_WIDTH + mapGrid.WALL_THICKNESS;
      const y = col * mapGrid.TILE_HEIGHT + mapGrid.WALL_THICKNESS;
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
      this.requires('2D, Canvas, Color, Solid, Collision');
    },

    wallDir: function(wallDir) {
      if (wallDir === wallDirection.HORIZONTAL) {
        this.attr({
             w: mapGrid.TILE_WIDTH,
             h: mapGrid.WALL_THICKNESS
          }).color('#FFFFFF');
      } else if (wallDir === wallDirection.VERTICAL) {
        this.attr({
             w: mapGrid.WALL_THICKNESS,
             h: mapGrid.TILE_HEIGHT
          }).color('#FFFFFF');
      }
      return this;
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
}
