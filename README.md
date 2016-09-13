## Oddball

### Background

Oddball is a multiplayer game in a maze map. The goal of the game is to locate the ball on the map and keep possession of it for the longest period of time. The player that holds onto the ball for the longest period of time wins that round of the game.

### Functionality & MVP  

This game has several features:
- [ ] A player can hold onto the ball, and the timer for that duration would start as soon as the player gets the hold of the ball.
- [ ] A ranking of the duration of holding onto the ball
- [ ] A randomly generated maze each game
- [ ] The players can use weapons to make a player lose the possession of the ball

In addition, this project will include:

- [ ] An About modal describing the background and rules of the game
- [ ] A production Readme

### Wireframes

In this app, there will be a screen with a maze as the gameboard, game controls, and a ranking list indicating which player is currently in the lead. Game controls will explain the keys used to play in this game. There will be several players in the gameboard, which can all move around, and a ball which could be captured.

![wireframes](img/oddball.png)

### Architecture and Technologies

This project will be implemented with the following technologies:

- Vanilla JavaScript and `jquery` for overall structure and game logic,
- CraftyJS for implementing the entities (players, walls, ball) and the maze map
- Prim's algorithm to generate the random maze
- Webpack to bundle and serve up the various scripts.

In addition to the webpack entry file, there will be three scripts involved in this project:

`board.js`: this script will handle the logic for creating and updating the necessary `CraftJS` elements and rendering them to the DOM.

`player.js`: this script will handle the logic of players, in terms of movement, catching the ball, and using weapons on other players.

`ball.js`: this script will handle the logic of the ball, starting the timer as a player possess the ball, keeping track of the ranking

`weapon.js`: this script will handle the logic of weapon. What actions these weapons take, etc.

`game.js`: this script will deal with all the logic of the game. It is the controller that deals with all the objects in this game.

### Implementation Timeline

**Day 1**: Implementing the maze, learning how craftyJS work, and create entities (players, ball, wall, etc.)

- Get a green bundle with `webpack`
- Learn enough `CraftyJS` to render an object to the `Canvas` element

**Day 2**: Implementing the gameplay, like the players logic, and the ball logic and the ranking system.

- Implementing the player.js file
- Implementing the ball.js file
- incorporating with the game.js file

**Day 3**: Creating the weapon and control how the a player gets hold of a weapon and uses it

- Randomly places weapon at random times
- Allow the user to get hold onto the weapon
- Deals with the logic of weapon getting to the enemies and kill them

**Day 4**: Making it multiplayer with different key controls, finish polishing up the game

- Making it multiplayer
- Implementing the minor things and fixes bugs
- Make it look presentable

### Bonus features

If time permits:

- [ ] Implementing different weapons, and different ways weapons can reach to an enemy
- [ ] Special weapons for the person containing the ball
