class Cell {
  constructor(isWall) {
    this.isWall = isWall;
    this.isInMaze = false;
    this.hasBeenFrontier = false;
  }
}

module.exports = Cell;
