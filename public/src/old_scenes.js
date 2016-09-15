module.exports = function(Crafty, socket, players, weapons) {
  Crafty.scene('Game', () => {
    setUpConnection();
    setUpPlayersMove();
    setUpAddNewPlayer();
    setUpPlacingWeapons();
    setUpCreateDamage();
    setUpHPChange();
  });

  function setUpConnection() {
    var colors = ['#7ec0ee', 'red', 'yellow', 'green'];
    socket.on('connected', data => {
      // let weaponDisplay = Crafty.e('WeaponDisplay')
      //                           .attr({ x: 600, y: 300 })
      //                           .createText(' ');
      // let weaponDisplayId = weaponDisplay[0];
      let player = Crafty.e('Player')
                         .at(0, 0)
                         .setUp(data.selfId, data.playerColor)
                         .setUpSocket(socket)
                         .bindingKeyEvents();

      $('#scoreboard')
        .append(`<li class='player-${ data.selfId }'>
                    ${ player.HP }
                </li>`);

      data.playerIds.forEach(id => {
        let otherPlayer = Crafty.e('OtherPlayer')
                                .at(0, 0)
                                .setUp(id, colors[id]);
        $('#scoreboard')
          .append(`<li class='player-${ id }'>
                      ${ otherPlayer.HP }
                  </li>`);
        this.players[id] = otherPlayer;
      });

      this.players[data.selfId] = player;
      this.board =
        new Board(mapGrid.NUM_COLS, mapGrid.NUM_ROWS, data.seedRandomStr);

      for (let i = 0; i < mapGrid.NUM_COLS; i++) {
        for (let j = 0; j < mapGrid.NUM_ROWS; j++) {
          this.board.grid[i][j].drawWalls(Crafty);
        }
      }

    });
  }

  function setUpAddNewPlayer() {
    var colors = ['blue', 'red', 'yellow', 'green'];
    socket.on('addNewPlayer', data => {
      let otherPlayer = Crafty.e('OtherPlayer')
                              .at(0, 0)
                              .setUp(data.playerId, colors[data.playerId]);
      $('#scoreboard')
        .append(`<li class='player-${ data.playerId }'>
                    ${ otherPlayer.HP }
                </li>`);
      this.players[data.playerId] = otherPlayer;
    });
  }

  function setUpPlayersMove() {
    socket.on('updatePos', data => {
      const player = this.players[data.playerId];
      if (player) {
        player.x = data.x;
        player.y = data.y;
      }
    });
  }

  function setUpPlacingWeapons() {
    socket.on('addWeapon', data => {
      const weapon = Crafty.e('Weapon')
                           .at(data.x, data.y)
                           .setUp(data.weaponId, data.type)
                           .color(data.color);
      this.weapons[data.weaponId] = weapon;
    });

    socket.on('destroyWeapon', data => {
      const weapon = this.weapons[data.weaponId];
      weapon.destroy();
    });
  }

  function setUpCreateDamage() {
    socket.on('createDamage', data => {
      Crafty.e('Damage')
            .at(data.damageCell[0], data.damageCell[1])
            .setUpCreator(data.creatorId)
            .disappearAfter()
            .color('#7ec0ee', 0.5);
    });
  }

  function setUpHPChange() {
    socket.on('HPChange', data => {
      const player = this.players[data.playerId];
      if (player) {
        player.HP = data.playerHP;
        $(`.player-${ data.playerId }`).text(player.HP);
      }
    });
  }

};
