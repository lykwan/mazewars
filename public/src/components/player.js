/* globals Crafty */
/* globals Queue */
const Constants = require('../constants.js');
const mapGrid = Constants.mapGrid;
const wallDirection = Constants.wallDirection;

module.exports = function(Crafty) {
  Crafty.c('SelfPlayer', {
    init: function() {
      this.requires('Player');
      this.charStep = mapGrid.CHAR_STEP;
      this.hasTakenDamage = false;
      this.weaponType = null;
      this.weaponCoolingdown = false;
      this.z = 9;
    },

    setUpMovesQueue() {
      this.pendingMoves = [];
      // each movement has a number to it, to help client side prediction
      this.moveIdx = 0;
      return this;
    },

    bindingKeyEvents() {
      this.charMove = { left: false, right: false, up: false, down: false };

      // this.bind('EnterFrame', (data) => {
      //   if (this.charMove.right || this.charMove.left ||
      //       this.charMove.up || this.charMove.down) {
      //     this.moveIdx++;
      //     // console.log(this.charMove);
      //     this.socket.emit('updatePos', {
      //       playerId: this.playerId,
      //       charMove: this.charMove,
      //       moveIdx: this.moveIdx
      //     });
      //
      //     // console.log('charMove', this.copy(this.charMove));
      //     // client side prediction. push the pending move to the queue,
      //     // then move according to what the pending move is
      //     this.pendingMoves.push(Object.assign({}, this.charMove));
      //     let [newX, newY] = this.getNewPos(this.charMove, this.x, this.y);
      //     this.x = newX;
      //     this.y = newY;
      //     this.displayAnimation(this.charMove);
      //     // console.log('moveIdx', this.moveIdx);
      //     // console.log('newmvt', newX, newY);
      //   }
      // });

      this.bind('KeyDown', e => {
        e.originalEvent.preventDefault();
        if (e.keyCode === Crafty.keys.Z) {
          this.pickUpWeapon();
          return;
        }

        if (e.keyCode === Crafty.keys.X && this.weaponType !== null) {
          this.shootWeapon();
          return;
        }

        this.charMove.left = false;
        this.charMove.right = false;
        this.charMove.down = false;
        this.charMove.up = false;

        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
          this.charMove.right = true;
        }
        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
          this.charMove.left = true;
        }
        if (e.keyCode === Crafty.keys.UP_ARROW) {
          this.charMove.up = true;
        }
        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
          this.charMove.down = true;
        }
      });

      this.bind('KeyUp', e => {
        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
          this.charMove.right = false;
        }
        if (e.keyCode === Crafty.keys.LEFT_ARROW) {
          this.charMove.left = false;
        }
        if (e.keyCode === Crafty.keys.UP_ARROW) {
          this.charMove.up = false;
        }
        if (e.keyCode === Crafty.keys.DOWN_ARROW) {
          this.charMove.down = false;
        }

        this.stopAnimation(e.keyCode);
        this.socket.emit('stopMovement', {
          playerId: this.playerId,
          keyCode: e.keyCode
        });
      });

      return this;
    },

    // getDir(charMove) {
    //   let dirX, dirY;
    //   if (charMove.left) {
    //     dirX = -1;
    //     dirY = -1;
    //   } else if (charMove.right) {
    //     dirX = 1;
    //     dirY = 1;
    //   } else if (charMove.up) {
    //     dirX = 1;
    //     dirY = -1;
    //   } else if (charMove.down) {
    //     dirX = -1;
    //     dirY = 1;
    //   }
    //
    //   return [dirX, dirY];
    // },
    //
    // getNewPos(charMove, x, y) {
    //   let [dirX, dirY] = this.getDir(charMove);
    //   return this.moveDir(x, y, dirX, dirY);
    // },
    //
    // moveDir(x, y, dirX, dirY) {
    //   // the offset it needs to move to the neighbor blocks
    //   const w = mapGrid.TILE.WIDTH / 2;
    //   const h = mapGrid.TILE.SURFACE_HEIGHT / 2;
    //
    //   const newX = x + (w / this.charStep) * dirX;
    //   const newY = y + (h / this.charStep) * dirY;
    //   return [newX, newY];
    // },

    updatePos(x, y, translateX, translateY) {
      console.log('not in here are you....?');
      this.x = x + translateX;
      this.y = y + translateY;
    },
    //
    // server reconcilation. getting rid of the move inputs that we don't
    // need anymore from the queue up until the movement updates the server
    // side returns, and then applying the rest of the moves in the queue
    // on top of the server state
    // updatePosWithServerState(data, translateX, translateY) {
    //   const clientAheadBy = this.moveIdx - data.moveIdx;
    //   console.log('clientahedby', clientAheadBy);
    //   console.log('length', this.pendingMoves.length);
    //   while (this.pendingMoves.length > clientAheadBy) {
    //     // get rid of the move inputs we don't need
    //     this.pendingMoves.shift();
    //   }
    //
    //   this.updatePosWithRemainingMoves(data, translateX, translateY);
    // },
    //
    // // applying the remaining moves that hasn't come back from server yet
    // // on top of the most recent server side update
    // updatePosWithRemainingMoves(data, translateX, translateY) {
    //   let [x, y] = [data.x, data.y];
    //   for (let i = 0; i < this.pendingMoves.length; i++) {
    //     let charMove = this.pendingMoves[i];
    //     console.log('applying thing', charMove);
    //     console.log(x + translateX, y + translateY);
    //     [x, y] = this.getNewPos(charMove, x, y);
    //   }
    //   console.log(x + translateX, y + translateY);
    //
    //   // apply the translation on top of the final x and Y
    //   this.x = x + translateX;
    //   this.y = y + translateY;
    // },

    setUpSocket: function(socket) {
      this.socket = socket;
      return this;
    },

    setUpSetBallTime: function() {
      this.socket.on('setBallTime', data => {
        this.currentBallHoldingTime = data.currentBallHoldingTime;
        this.longestSecsHoldingBall = data.longestSecsHoldingBall;
      });

      return this;
    },

    pickUpWeapon: function() {
      this.socket.emit('pickUpWeapon', {
        playerId: this.playerId
      });
    },

    shootWeapon: function() {
      this.socket.emit('shootWeapon', {
        playerId: this.playerId
      });
    },

    loseWeapon: function() {
      this.weaponType = null;
    }

  });

  Crafty.c('OtherPlayer', {
    init: function() {
      this.requires('Player');
    },

    updatePos(x, y, translateX, translateY, charMove) {
      console.log('updating in other player!!');
      this.x = x + translateX;
      this.y = y + translateY;

      console.log(charMove);
      this.displayAnimation(charMove);
    }
  });

  Crafty.c('Player', {
    init: function() {
      this.requires('Actor');
      this.HP = 100;
      this.longestBallHoldingTime = 0;
      this.currentBallHoldingTime = 0;
    },

    displayAnimation: function(charMove) {
      console.log(charMove);
      // display the animation movement depending on the char move
      if (charMove.left && !this.isPlaying('PlayerMovingLeft')) {
        this.animate('PlayerMovingLeft', -1);
        this.unflip('X');
      } else if (charMove.down &&
        !this.isPlaying('PlayerMovingDown')) {
          this.animate('PlayerMovingDown', -1);
          this.unflip('X');
      } else if (charMove.up && !this.isPlaying('PlayerMovingUp')) {
        this.animate('PlayerMovingUp', -1);
        this.flip('X');
      } else if (charMove.right &&
        !this.isPlaying('PlayerMovingRight')) {
          this.animate('PlayerMovingRight', -1);
          this.flip('X');
      }
    },

    loseWeapon: function() {

    },

    setUpAnimation: function() {
      this.reel('PlayerMovingRight', 600, 0, 1, 5);
      this.reel('PlayerMovingDown', 600, 0, 1, 5);
      this.reel('PlayerMovingUp', 600, 0, 2, 5);
      this.reel('PlayerMovingLeft', 600, 0, 2, 5);
      return this;
    },

    setUp: function(playerId, playerColor) {
      this.playerId = playerId;
      if (playerColor) {
        this.playerColor = playerColor;
      }
      return this;
    },

    pickUpBall: function() {
      this.addComponent('purpleSprite');
      this.removeComponent(`${ this.playerColor }Sprite`);
      return this;
    },

    loseBall: function() {
      this.addComponent(`${ this.playerColor }Sprite`);
      this.removeComponent('purpleSprite');
      return this;
    },

    stopAnimation(keyCode) {
      if (keyCode === Crafty.keys.RIGHT_ARROW) {
        console.log(this.isPlaying('PlayerMovingRight'));
        if (this.isPlaying('PlayerMovingRight')) this.pauseAnimation();
      }
      if (keyCode === Crafty.keys.LEFT_ARROW) {
        console.log(this.isPlaying('PlayerMovingLeft'));
        if (this.isPlaying('PlayerMovingLeft')) this.pauseAnimation();
      }
      if (keyCode === Crafty.keys.UP_ARROW) {
        console.log(this.isPlaying('PlayerMovingUp'));
        if (this.isPlaying('PlayerMovingUp')) this.pauseAnimation();
      }
      if (keyCode === Crafty.keys.DOWN_ARROW) {
        console.log(this.isPlaying('PlayerMovingDown'));
        if (this.isPlaying('PlayerMovingDown')) this.pauseAnimation();
      }
    }
  });
};
