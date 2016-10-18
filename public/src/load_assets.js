const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;

const assetsObj = {
  'sprites': {
    '../assets/tiles.png': {
      'tile': mapGrid.TILE.ORIG_WIDTH,
      'tileh': mapGrid.TILE.ORIG_HEIGHT,
      'map': {
        'tileSprite': [0, 0],
        'blueActiveTileSprite': [1, 0],
        'redActiveTileSprite': [2, 0],
        'yellowActiveTileSprite': [3, 0],
        'greenActiveTileSprite': [4, 0],
        'purpleActiveTileSprite': [5, 0],
        'wallSprite': [6, 0],
      }
    },
    '../assets/char/green_char.png': {
      'tile': mapGrid.PLAYER.ORIG_WIDTH,
      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
      'map': {
        'greenSprite': [0, 0]
      }
    },
    '../assets/char/blue_char.png': {
      'tile': mapGrid.PLAYER.ORIG_WIDTH,
      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
      'map': {
        'blueSprite': [0, 0]
      }
    },
    '../assets/char/red_char.png': {
      'tile': mapGrid.PLAYER.ORIG_WIDTH,
      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
      'map': {
        'redSprite': [0, 0]
      }
    },
    '../assets/char/yellow_char.png': {
      'tile': mapGrid.PLAYER.ORIG_WIDTH,
      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
      'map': {
        'yellowSprite': [0, 0]
      }
    },
    '../assets/char/purple_char.png': {
      'tile': mapGrid.PLAYER.ORIG_WIDTH,
      'tileh': mapGrid.PLAYER.ORIG_HEIGHT,
      'map': {
        'purpleSprite': [0, 0]
      }
    },
    '../assets/weapons/ASTAR_weapon.png': {
      'tile': mapGrid.BALL.ORIG_WIDTH,
      'tileh': mapGrid.BALL.ORIG_HEIGHT,
      'map': {
        'ballSprite': [0, 0],
        'ASTARSprite': [0, 0]
      }
    },
    '../assets/weapons/BFS_weapon.png': {
      'tile': mapGrid.BFS.ORIG_WIDTH,
      'tileh': mapGrid.BFS.ORIG_HEIGHT,
      'map': {
        'BFSSprite': [0, 0]
      }
    },
    '../assets/weapons/DFS_weapon.png': {
      'tile': mapGrid.DFS.ORIG_WIDTH,
      'tileh': mapGrid.DFS.ORIG_HEIGHT,
      'map': {
        'DFSSprite': [0, 0]
      }
    }
  }
};

module.exports = assetsObj;
