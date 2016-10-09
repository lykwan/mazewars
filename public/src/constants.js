const NUM_ROWS = 8;
const NUM_COLS = 8;

const mapGrid = {
  NUM_ROWS: NUM_ROWS,
  NUM_COLS: NUM_COLS,
  NUM_MAZE_ROWS: NUM_ROWS * 2 - 1,
  NUM_MAZE_COLS: NUM_COLS * 2 - 1,
  TILE_WIDTH: 75,
  TILE_HEIGHT: 92,
  PLAYER_WIDTH: 20,
  PLAYER_HEIGHT: 15,
  BALL_WIDTH: 25,
  BALL_HEIGHT: 25,
  DFS_WIDTH: 25,
  DFS_HEIGHT: 0.30 * 25,
  BFS_WIDTH: 20,
  BFS_HEIGHT: 0.70 * 20,
  TILE_Z: 0,
  WALL_Z: 0,
  ACTOR_Z: 1.5,
  CHAR_STEP: 10
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
  GAME_DURATION: 2000000, // 200
  COLORS: ['blue', 'red', 'yellow', 'green']
};

module.exports = {
  mapGrid: mapGrid,
  weaponTypes: weaponTypes,
  gameSettings: gameSettings
};
