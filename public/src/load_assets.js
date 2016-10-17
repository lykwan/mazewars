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
    '../assets/purple_ring.png': {
      'tile': mapGrid.BALL.ORIG_WIDTH,
      'tileh': mapGrid.BALL.ORIG_HEIGHT,
      'map': {
        'ballSprite': [0, 0]
      }
    },
    '../assets/bfs_weapon.png': {
      'tile': mapGrid.BFS.ORIG_WIDTH,
      'tileh': mapGrid.BFS.ORIG_HEIGHT,
      'map': {
        'BFSSprite': [0, 0]
      }
    },
    '../assets/dfs_weapon.png': {
      'tile': mapGrid.DFS.ORIG_WIDTH,
      'tileh': mapGrid.DFS.ORIG_HEIGHT,
      'map': {
        'DFSSprite': [0, 0]
      }
    },
    '../assets/astar_weapon.png': {
      'tile': mapGrid.ASTAR.ORIG_WIDTH,
      'tileh': mapGrid.ASTAR.ORIG_HEIGHT,
      'map': {
        'ASTARSprite': [0, 0]
      }
    }

  }
};

module.exports = assetsObj;
