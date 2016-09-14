import Game from './game.js';
/* globals io */

document.addEventListener('DOMContentLoaded', function() {
  const game = new Game();
  game.start();
});
