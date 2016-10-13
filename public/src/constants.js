const NUM_ROWS = 8;
const NUM_COLS = 8;
const NUM_MAZE_ROWS =  NUM_ROWS * 2 - 1;
const NUM_MAZE_COLS = NUM_COLS * 2 - 1;

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

const BALL = {
  ORIG_WIDTH: 70,
  ORIG_HEIGHT: 70,
  RATIO: 1
};

const BFS = {
  ORIG_WIDTH: 194,
  ORIG_HEIGHT: 204,
  RATIO: 1 / 4
};

const DFS = {
  ORIG_WIDTH: 194,
  ORIG_HEIGHT: 204,
  RATIO: 1 / 4
};

const actors = [TILE, PLAYER, BALL, BFS, DFS];

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
  console.log(PLAYER.Z);
  console.log(BALL.Z);
  console.log(BFS.Z);

// const TILE_ORIG_WIDTH = 101;
// const TILE_ORIG_HEIGHT = 122;
// const TILE_RATIO = (1 / 2);
// const TILE_WIDTH = TILE_ORIG_WIDTH * TILE_RATIO;
// const TILE_HEIGHT = TILE_ORIG_HEIGHT * TILE_RATIO;
// const TILE_SURFACE_HEIGHT = TILE_WIDTH / 2;

// const [PLAYER_ORIG_WIDTH, PLAYER_ORIG_HEIGHT] = [40, 54];
// const [PLAYER_ORIG_WIDTH, PLAYER_ORIG_HEIGHT] = [101, 122];
// const PLAYER_RATIO = (1 / 2);
// const PLAYER_WIDTH = PLAYER_ORIG_WIDTH * PLAYER_RATIO;
// const PLAYER_HEIGHT = PLAYER_ORIG_HEIGHT * PLAYER_RATIO;
// const PLAYER_SURFACE_HEIGHT = PLAYER_WIDTH / 2;
// the z layer if it was the same height as the tile

const mapGrid = {
  GAME_WIDTH: NUM_MAZE_ROWS * TILE.WIDTH,
  // CHANGE TILE HEIGHT TO CHAR HEIGHT
  GAME_HEIGHT: NUM_MAZE_COLS * TILE.SURFACE_HEIGHT + PLAYER.HEIGHT,
  NUM_ROWS: NUM_ROWS,
  NUM_COLS: NUM_COLS,
  NUM_MAZE_ROWS: NUM_MAZE_ROWS,
  NUM_MAZE_COLS: NUM_MAZE_COLS,
  TILE: TILE,
  PLAYER: PLAYER,
  BALL: BALL,
  BFS: BFS,
  DFS: DFS,
  CHAR_STEP: 20 // how many steps it needs from one tile to another
};

const weaponTypes = {
  BFS: 'BFS',
  DFS: 'DFS'
};

const gameSettings = {
  WEAPON_RANGE: 10,
  BUFFER_DAMAGE_TIME: 1000,
  BUFFER_SHOOTING_TIME: 1500,
  WEAPON_SPAWN_TIME: 3000,
  DAMAGE_ANIMATION_TIME: 100,
  DAMAGE_DISAPPEAR_TIME: 1000,
  HP_DAMAGE: 10,
  GAME_DURATION: 2000, // 200
  CHECK_COLLISION_INTERVAL: 200,
  COLORS: ['blue', 'red', 'yellow', 'green']
};

module.exports = {
  mapGrid: mapGrid,
  weaponTypes: weaponTypes,
  gameSettings: gameSettings
};
