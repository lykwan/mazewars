const mapGrid = {
  NUM_ROWS: 5,
  NUM_COLS: 5,
  // TILE_WIDTH: 25,
  // TILE_HEIGHT: 25,
  PLAYER_WIDTH: 20,
  PLAYER_HEIGHT: 15,
  BALL_WIDTH: 25,
  BALL_HEIGHT: 25,
  DFS_WIDTH: 25,
  DFS_HEIGHT: 0.30 * 25,
  BFS_WIDTH: 20,
  BFS_HEIGHT: 0.70 * 20,
  TILE_WIDTH: 51,
  TILE_HEIGHT: 61,
  TILE_Z: 2,
  WALL_Z: 1
};

const weaponTypes = {
  BFS: 'BFS',
  DFS: 'DFS'
};

const gameSettings = {
  WEAPON_RANGE: 10,
  BUFFER_DAMAGE_TIME: 1000,
  BUFFER_SHOOTING_TIME: 1500,
  WEAPON_SPAWN_TIME: 1000,
  DAMAGE_ANIMATION_TIME: 100,
  DAMAGE_DISAPPEAR_TIME: 1000,
  HP_DAMAGE: 10,
  GAME_DURATION: 30, // 200
  COLORS: ['blue', 'red', 'yellow', 'green']
};

module.exports = {
  mapGrid: mapGrid,
  weaponTypes: weaponTypes,
  gameSettings: gameSettings
};
