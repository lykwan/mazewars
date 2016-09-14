import { mapGrid, wallDirection } from './constants.js';
import createComponents from './components/entities.js';
import createPlayerComponent from './components/player.js';
import Board from './components/board.js';
const socket = io();
/* globals Crafty */
/* globals mapGrid */
/* globals wallDirection */
/* globals io */

class Game {
  constructor() {
    this.board = new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS);
  }

  width() {
    return mapGrid.NUM_ROWS * mapGrid.TILE_WIDTH;
  }

  height() {
    return mapGrid.NUM_COLS * mapGrid.TILE_HEIGHT;
  }

  start() {
    Crafty.init(this.width(), this.height());
    Crafty.background('#000000');

    createComponents();
    createPlayerComponent();

    for (let i = 0; i < mapGrid.NUM_COLS; i++) {
      for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
        this.board.grid[i][j].drawWalls();
      }
    }

    // player.trigger("ChangeColor", {color:"yellow"});

    this.connectedWithSocket();
  }

  connectedWithSocket() {
    socket.on('connected', function (data) {
      var player = Crafty.e('Player').color('blue').at(0, 0).setUpSocket(socket, data.playerId);
    });
  }

}

export default Game;
