var game;
var character;
var npcSpawnRate = 1.8;
var coinSpawnRate = 1;
var availLanes = [233, 289, 345];
var availNpcGophers =
  [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [8, 9],
    [10, 11],
    [12, 13],
    [14, 15],
    [16, 17],
    [18, 19],
  ];
var score = 0;
var cursors;
var scoreText;
var lives = 3;
var count = 0;
var timeElapsed = 0;


var sky;
var mtn;
var city;
var truck;
var road;
var bottomRail;
var posts;
var extras;
var topRail;

window.onload = function(){
  if(screen.width>900){
    game = new Phaser.Game(600, 432, Phaser.CANVAS, "phaser-wrapper", null, false, false);
  }
  else{
    game = new
    Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, "phaser-wrapper");
  }
  game.state.add("StateTitle", StateTitle);
  game.state.add("StateMain", StateMain);
  game.state.add("StateChoice", StateChoice);
  game.state.add("StateTutorial", StateTutorial);
  game.state.add("StateOver", StateOver);


  game.state.start("StateTitle");
};
