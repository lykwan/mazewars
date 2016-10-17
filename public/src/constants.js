const NUM_ROWS = 8;
const NUM_COLS = 8;
const NUM_MAZE_ROWS =  NUM_ROWS * 2 - 1;
const NUM_MAZE_COLS = NUM_COLS * 2 - 1;
const EXTRA_GAME_DIM = 80;

const TILE = {
  ORIG_WIDTH: 101,
  ORIG_HEIGHT: 122,
  RATIO: 3 / 4,
  Z: 0
};

const PLAYER = {
  ORIG_WIDTH: 40,
  ORIG_HEIGHT: 54,
  RATIO: 1
};

const PLAYER_ATTACKING = {
  ORIG_WIDTH: 51,
  ORIG_HEIGHT: 54,
  RATIO: 1
};

const BALL = {
  ORIG_WIDTH: 128,
  ORIG_HEIGHT: 128,
  RATIO: 2 / 5
};

const BFS = {
  ORIG_WIDTH: 194,
  ORIG_HEIGHT: 204,
  RATIO: 1 / 4
};

const DFS = {
  ORIG_WIDTH: 83,
  ORIG_HEIGHT: 296,
  RATIO: 1 / 4
};

const ASTAR = {
  ORIG_WIDTH: 233,
  ORIG_HEIGHT: 269,
  RATIO: 1 / 5
};

const actors = [TILE, PLAYER, PLAYER_ATTACKING, BALL, BFS, DFS, ASTAR];

actors.forEach(actor => {
  actor.WIDTH = actor.ORIG_WIDTH * actor.RATIO;
  actor.HEIGHT = actor.ORIG_HEIGHT * actor.RATIO;
  actor.SURFACE_HEIGHT = actor.WIDTH / 2;
});

actors.slice(1).forEach(actor => {
  const y0 = (TILE.HEIGHT / TILE.SURFACE_HEIGHT - 2) * TILE.SURFACE_HEIGHT;
  // need to increase it by player depth
  const y1 = y0 + (PLAYER.HEIGHT - PLAYER.SURFACE_HEIGHT);
  // finding the z layer based on the craftyjs code
  actor.Z = (y1 - ((PLAYER.HEIGHT / TILE.SURFACE_HEIGHT - 2) *
              PLAYER.SURFACE_HEIGHT)) / TILE.SURFACE_HEIGHT;
  // actor.Z = ((PLAYER.HEIGHT - PLAYER.SURFACE_HEIGHT) /
  //           ((TILE.HEIGHT - TILE.SURFACE_HEIGHT) / ACTOR_Z)) + 1;
  // actor.Z = (((PLAYER_HEIGHT / TILE.SURFACE_HEIGHT) - 2) * TILE.SURFACE_HEIGHT
});

const mapGrid = {
  GAME_WIDTH: NUM_MAZE_ROWS * TILE.WIDTH + EXTRA_GAME_DIM,
  // CHANGE TILE HEIGHT TO CHAR HEIGHT
  GAME_HEIGHT: NUM_MAZE_COLS * TILE.SURFACE_HEIGHT + PLAYER.HEIGHT + EXTRA_GAME_DIM,
  EXTRA_GAME_DIM: EXTRA_GAME_DIM,
  NUM_ROWS: NUM_ROWS,
  NUM_COLS: NUM_COLS,
  NUM_MAZE_ROWS: NUM_MAZE_ROWS,
  NUM_MAZE_COLS: NUM_MAZE_COLS,
  TILE: TILE,
  PLAYER: PLAYER,
  // PLAYER_ATTACKING: PLAYER_ATTACKING,
  BALL: BALL,
  BFS: BFS,
  DFS: DFS,
  ASTAR: ASTAR,
  CHAR_STEP: 20, // how many steps it needs from one tile to another
  FULL_HP_BAR_WIDTH: 130
};

const weaponTypes = {
  BFS: 'BFS',
  DFS: 'DFS',
  ASTAR: 'ASTAR'
};

const gameSettings = {
  WEAPON_RANGE: 10,
  BUFFER_DAMAGE_TIME: 1000,
  BUFFER_SHOOTING_TIME: 1500,
  WEAPON_SPAWN_TIME: 3000,
  DAMAGE_ANIMATION_TIME: 100,
  DAMAGE_DISAPPEAR_TIME: 1000,
  HP_DAMAGE: 10,
  GAME_DURATION: 50, // 200
  CHECK_COLLISION_INTERVAL: 200,
  COLORS: ['blue', 'red', 'yellow', 'green']
};

module.exports = {
  mapGrid: mapGrid,
  weaponTypes: weaponTypes,
  gameSettings: gameSettings
};
