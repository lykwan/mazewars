const mapGrid = {
  NUM_ROWS: 10,
  NUM_COLS: 10,
  TILE_WIDTH: 25,
  TILE_HEIGHT: 25,
  PLAYER_WIDTH: 30,
  PLAYER_HEIGHT: 24,
  BALL_WIDTH: 40,
  BALL_HEIGHT: 40,
  DFS_WIDTH: 50,
  DFS_HEIGHT: 0.30 * 50,
  BFS_WIDTH: 40,
  BFS_HEIGHT: 0.70 * 40
};

// const wallDirection = {
//   HORIZONTAL: 'HORIZONTAL',
//   VERTICAL: 'VERTICAL'
// };
//
const weaponTypes = {
  BFS: 'BFS',
  DFS: 'DFS'
};

const gameSettings = {
  WEAPON_RANGE: 10,
  BUFFER_DAMAGE_TIME: 1000,
  BUFFER_SHOOTING_TIME: 1500,
  WEAPON_SPAWN_TIME: 5000,
  DAMAGE_ANIMATION_TIME: 100,
  DAMAGE_DISAPPEAR_TIME: 1000,
  HP_DAMAGE: 10,
  GAME_DURATION: 30, // 200
  COLORS: ['blue', 'red', 'yellow', 'green']
};

module.exports = {
  mapGrid: mapGrid,
  // wallDirection: wallDirection,
  weaponTypes: weaponTypes,
  gameSettings: gameSettings
};
