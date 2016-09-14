import createCanvas from './components/canvas.js';
import createComponents from './components/entities.js';
import createPlayerComponent from './components/player.js';
import ClientModel from './model/client_model.js';
import Board from './board.js';
const Constants = require('./constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;

const socket = io();
/* globals Crafty */
/* globals io */

class Game {
  constructor() {
  }

  width() {
    return mapGrid.NUM_ROWS * mapGrid.TILE_WIDTH;
  }

  height() {
    return mapGrid.NUM_COLS * mapGrid.TILE_HEIGHT;
  }

  start() {
    createCanvas(Crafty, ClientModel);
    socket.on('connected', data => {
        let player = Crafty.e('Player')
                           .color('blue')
                           .at(0, 0)
                           .setUp(data.playerId, data.playerColor)
                           .setUpSocket(socket, data.playerId);
      this.board =
        new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr);

      for (let i = 0; i < mapGrid.NUM_COLS; i++) {
        for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
          this.board.grid[i][j].drawWalls(Crafty);
        }
      }
    });
  }
}

export default Game;
