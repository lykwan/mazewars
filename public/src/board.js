const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;
const Tile = require('./tile.js');


const DIRECTION = {
  left: 'left',
  right: 'right',
  top: 'top',
  bottom: 'bottom'
};

const OPPOSITE = {
  left: DIRECTION.right,
  right: DIRECTION.left,
  top: DIRECTION.bottom,
  bottom: DIRECTION.top
};


class Board {
  constructor(n, m, seedRandomStr) {
    this.numCols = n;
    this.numRows = m;
    Math.seedrandom(seedRandomStr);
    this.grid = this.createGrid();
    this.frontier = [];
    this.createMaze();
  }

  createGrid() {
    let grid = new Array(this.numRows);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = new Array(this.numCols);
      for (let j = 0; j < this.numCols; j++) {
        grid[i][j] = new Tile(i, j);
      }
    }
    return grid;
  }

  addFrontiers(x, y) {
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    dirs.forEach(dir => {
      const [newX, newY] = [x + dir[0], y + dir[1]];

      if (this.isInGrid(newX, newY) && !this.grid[newX][newY].isInMaze &&
          this.grid[newX][newY].hasBeenFrontier === false) {
        this.frontier.push([newX, newY]);
        this.grid[newX][newY].hasBeenFrontier = true;
      }
    });
  }

  isInGrid(x, y) {
    return 0 <= x && x < this.numCols && 0 <= y && y < this.numRows;
  }

  inMazeNeighbors(x, y) {
    let neighbors = [];
    if (x > 0 && this.grid[x - 1][y].isInMaze) {
      neighbors.push([x - 1, y]);
    }
    if (x < (this.numCols - 1) && this.grid[x + 1][y].isInMaze) {
      neighbors.push([x + 1, y]);
    }
    if (y > 0 && this.grid[x][y - 1].isInMaze) {
      neighbors.push([x, y - 1]);
    }
    if (y < (this.numRows - 1) && this.grid[x][y + 1].isInMaze) {
      neighbors.push([x, y + 1]);
    }

    return neighbors;
  }

  direction(x, y, otherX, otherY) {
    if ((otherX < x) && y === otherY) {
      return DIRECTION.left;
    } else if ((otherY < y) && x === otherX) {
      return DIRECTION.top;
    } else if ((otherX > x) && y === otherY) {
      return DIRECTION.right;
    } else if ((otherY > y) && x === otherX) {
      return DIRECTION.bottom;
    }
  }

  expandMaze(x, y) {
    this.grid[x][y].isInMaze = true;
    this.addFrontiers(x, y);
  }

  createMaze() {
    const randomX = Math.floor(Math.random() * this.numCols);
    const randomY = Math.floor(Math.random() * this.numRows);
    this.expandMaze(randomX, randomY);
    while (this.frontier.length !== 0) {
      const randomIndex = Math.floor(Math.random() * this.frontier.length);
      const [randomPos] = this.frontier.splice(randomIndex, 1);
      const [x, y] = randomPos;
      const neighbors = this.inMazeNeighbors(x, y);
      const [neighX, neighY] =
        neighbors[Math.floor(Math.random() * neighbors.length)];

      const dir = this.direction(x, y, neighX, neighY);
      this.grid[x][y].walls[dir] = false;
      this.grid[neighX][neighY].walls[OPPOSITE[dir]] = false;

      this.expandMaze(x, y);
    }
  }
}

module.exports = Board;
