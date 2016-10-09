const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;
const Cell = require('./cell.js');

class Board {
  constructor(m, n, seedRandomStr, Crafty) {
    // how many cells rows and cols are there if walls were just borders
    this.numGridRows = m;
    this.numGridCols = n;
    // for the 2d array with the walls as part of the cells
    this.numMazeCols = (2 * n) - 1;
    this.numMazeRows = (2 * m) - 1;

    Math.seedrandom(seedRandomStr);
    this.maze = this.createStartingMaze();
    this.frontier = [];
    this.generateMaze();
    this.Crafty = Crafty;
  }

  // create a starting maze map with all the walls
  createStartingMaze() {
    let maze = new Array(this.numMazeRows);
    for (let i = 0; i < maze.length; i++) {
      maze[i] = new Array(this.numMazeCols);
      for (let j = 0; j < this.numMazeCols; j++) {
        if (i % 2 === 1) {
          // the odd number rows are all filled with wall
          maze[i][j] = new Cell(true);
        } else {
          // the odd number cols are walls and the even number cols are spaces
          maze[i][j] = (j % 2 === 1) ? new Cell(true) : new Cell(false);
        }
      }
    }
    return maze;
  }

  gridToMazePos(row, col) {
    return [row * 2, col * 2];
  }

  log(maze) {
    let maz = maze.map(row => {
      return row.map(tile => {
        if (tile.isWall) return 1;
        if (!tile.isWall) return 0;
      });
    });
    console.table(maz);
  }

  // getting direct neighbor tiles that are not walls
  getNeighborTiles(row, col) {
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let neighborTiles = dirs.map(dir => {
      let [dRow, dCol] = dir;
      return [row + dRow, col + dCol];
    });

    // return the tiles that are in the grid and
    // tiles that are not walls
    return neighborTiles.filter(([tileRow, tileCol]) => {
      return this.isInGrid(tileRow, tileCol) &&
        !this.maze[tileRow][tileCol].isWall;
    });
  }

  // getting the neighbor cells separated by a wall
  getNeighborSpace(row, col) {
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let neighbors = [];
    dirs.forEach(dir => {
      // multiplying by 2 to account for the wall in between
      let [newRow, newCol] = [row + dir[0] * 2, col + dir[1] * 2];
      if (this.isInGrid(newRow, newCol)) {
        // ensure that we are not adding walls
        if (this.maze[newRow][newCol].isWall === true) {
          throw "Error: adding walls to the neighbor space array";
        }

        neighbors.push([newRow, newCol]);
      }
    });

    return neighbors;
  }

  // the forefront surrounding the cells that are in the maze
  addFrontiers(row, col) {
    this.getNeighborSpace(row, col).forEach(cell => {
      let [newRow, newCol] = cell;
      if (!this.maze[newRow][newCol].isInMaze &&
          !this.maze[newRow][newCol].hasBeenFrontier) {
        this.frontier.push([newRow, newCol]);
        this.maze[newRow][newCol].hasBeenFrontier = true;
      }
    });
  }

  isInGrid(row, col) {
    return 0 <= row && row < this.numMazeRows &&
           0 <= col && col < this.numMazeCols;
  }

  inMazeNeighbors(row, col) {
    return this.getNeighborSpace(row, col).filter(cell => {
      let [newRow, newCol] = cell;
      return this.maze[newRow][newCol].isInMaze;
    });
  }

  expandMaze(row, col) {
    this.maze[row][col].isInMaze = true;
    this.addFrontiers(row, col);
  }

  getRandomCell() {
    const randomRow = Math.floor(Math.random() * (this.numGridRows - 1));
    const randomCol = Math.floor(Math.random() * (this.numGridCols - 1));

    return this.gridToMazePos(randomRow, randomCol);
  }

  // breaking the wall between [row, col] and [otherRow, otherCol]
  breakWall(row, col, otherRow, otherCol) {
    if ((otherRow < row) && col === otherCol) { // other cell is on top of cell
      this.maze[row - 1][col].isWall = false;
    } else if ((otherRow > row) && col === otherCol) { // other cell is bottom
      this.maze[row + 1][col].isWall = false;
    } else if ((otherCol < col) && row === otherRow) { // other cell is left
      this.maze[row][col - 1].isWall = false;
    } else if ((otherCol > col) && row === otherRow) { // other cell is right
      this.maze[row][col + 1].isWall = false;
    }
  }

  generateMaze() {
    let [randomCol, randomRow] = this.getRandomCell();
    this.expandMaze(randomRow, randomCol);

    // find a random frontier, find a random neighbor of that frontier,
    // and break the walls between them
    while (this.frontier.length !== 0) {
      const randomIndex = Math.floor(Math.random() * this.frontier.length);
      const [randomPos] = this.frontier.splice(randomIndex, 1);
      const [row, col] = randomPos;
      const neighbors = this.inMazeNeighbors(row, col);
      const [neighRow, neighCol] =
        neighbors[Math.floor(Math.random() * neighbors.length)];

      this.breakWall(row, col, neighRow, neighCol);
      this.expandMaze(row, col);
    }
  }

  drawWalls(withColor) {
    for (let i = 0; i < this.numMazeRows; i++) {
      for (let j = 0; j < this.numMazeCols; j++) {
        if (this.maze[i][j].isWall) {
          if (withColor) {
            this.Crafty.e('Wall').at(i, j).attr({ w: mapGrid.TILE_WIDTH, h: mapGrid.TILE_HEIGHT}).color('#FFFFFF');
          } else {
            this.Crafty.e('Wall').at(i, j).attr({ w: mapGrid.TILE_WIDTH, h: mapGrid.TILE_HEIGHT});
          }
        }
      }
    }
  }
}

module.exports = Board;
