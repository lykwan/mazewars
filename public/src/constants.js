const mapGrid = {
  NUM_ROWS: 10,
  NUM_COLS: 10,
  WALL_THICKNESS: 3,
  TILE_WIDTH: 40,
  TILE_HEIGHT: 40,
  PLAYER_WIDTH: 20,
  PLAYER_HEIGHT: 20
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
