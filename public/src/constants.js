const mapGrid = {
  NUM_ROWS: 13,
  NUM_COLS: 13,
  WALL_THICKNESS: 3,
  TILE_WIDTH: 45,
  TILE_HEIGHT: 45,
  PLAYER_WIDTH: 34,
  PLAYER_HEIGHT: 26,
  BALL_WIDTH: 40,
  BALL_HEIGHT: 40,
  DFS_WIDTH: 50,
  DFS_HEIGHT: 0.30 * 50,
  BFS_WIDTH: 40,
  BFS_HEIGHT: 0.70 * 40
};

const wallDirection = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};

const weaponTypes = {
  BFS: 'BFS',
  DFS: 'DFS'
};

module.exports = {
  mapGrid: mapGrid,
  wallDirection: wallDirection,
  weaponTypes: weaponTypes
};
