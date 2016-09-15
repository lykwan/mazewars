const mapGrid = {
  NUM_ROWS: 8,
  NUM_COLS: 8,
  WALL_THICKNESS: 3,
  TILE_WIDTH: 50,
  TILE_HEIGHT: 50,
  PLAYER_WIDTH: 30,
  PLAYER_HEIGHT: 30
};

const wallDirection = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
};

const weaponTypes = {
  BFS: 'BFS',
  DSF: 'DFS'
};

module.exports = {
  mapGrid: mapGrid,
  wallDirection: wallDirection,
  weaponTypes: weaponTypes
};
