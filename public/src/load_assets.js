const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;

const assetsObj = {
  'sprites': {
    '../assets/tile.png': {
      'tile': mapGrid.TILE.ORIG_WIDTH,
      'tileh': mapGrid.TILE.ORIG_HEIGHT,
      'map': {
        'tileSprite': [0, 0]
      }
    },
    '../assets/lava_tile.png': {
      'tile': mapGrid.TILE.ORIG_WIDTH,
      'tileh': mapGrid.TILE.ORIG_HEIGHT,
      'map': {
        'wallSprite': [0, 0]
      }
    },
    '../assets/lava_crack.png': {
      'tile': mapGrid.TILE.ORIG_WIDTH,
      'tileh': mapGrid.TILE.ORIG_HEIGHT,
      'map': {
        'greenActiveTileSprite': [0, 0]
      }
    },
    '../assets/green_char.png': {
      'tile': mapGrid.PLAYER.ORIG_WIDTH,
      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
      'map': {
        'greenSprite': [0, 0]
      }
    },
    '../assets/blue_ring.png': {
      'tile': mapGrid.BALL.ORIG_WIDTH,
      'tileh': mapGrid.BALL.ORIG_HEIGHT,
      'map': {
        'ballSprite': [0, 0]
      }
    },
    '../assets/flamesword.png': {
      'tile': mapGrid.BFS.ORIG_WIDTH,
      'tileh': mapGrid.BFS.ORIG_HEIGHT,
      'map': {
        'BFSSprite': [0, 0]
      }
    },
    '../assets/purple_sword2.png': {
      'tile': mapGrid.DFS.ORIG_WIDTH,
      'tileh': mapGrid.DFS.ORIG_HEIGHT,
      'map': {
        'DFSSprite': [0, 0]
      }
    }
  }
};

module.exports = assetsObj;
