// window/global scope
var c99 = {};

c99.Tile = (function(){
  function Tile(number){
    this.initialize();

    this.number = number;

    this.width = this.height = 80;

    var image = new createjs.Bitmap(c99.graphics.tile.path);
    this.addChild(image);

    var numberText = new createjs.Text(number, "24px pf_tempesta_seven_compresseBd, sans-serif", "#ac1000");
    // place it at the center of the tile box.
    numberText.x = this.width/2 + 1;
    numberText.y = this.height/2 - 2;

    // align cetner, vertically and horizontally.
    numberText.textAlign = "center";
    numberText.textBaseline = "middle";
    this.addChild(numberText);
  }
  var p = Tile.prototype = new createjs.Container();

  return Tile;
})();

c99.Preloader = (function(){
  // constructor
  function Preloader(game) {
    this.game = game;
  };

  Preloader.prototype.loadGraphics = function(){
    var imagesList = [
      {name:"tile", path:"images/tile.png"},
      {name:"hud", path:"images/hud.png"},
      {name:"bg", path:"images/bg.png"},
      {name:"gameover", path:"images/gameover.jpg"},
      {name:"restartButton", path:"images/restart-button.png"},
    ]

    c99.graphics = {};

    var totalFiles = imagesList.length;
    var loadedFiles = 0;
    for (var i=0, len=totalFiles; i<len; i++) {
      imageToLoad = imagesList[i];
      var img = new Image();
      // make sure we have onload event declaring before setting the src property.
      img.onload = (function(event) {
        loadedFiles++;
        console.log ('loaded', event, loadedFiles, '/', totalFiles)

        if (loadedFiles >= totalFiles) {
          this.game.initGame();
        }
      }).bind(this);

      console.log ("loading: ", imageToLoad.path);
      img.src = imageToLoad.path;

      c99.graphics[imageToLoad.name] = imageToLoad;
    };
  }
  return Preloader;
})();

c99.Game = (function() {
  // constructor
  function Count99Game() {
    console.log("Count99 game starts.");

    this.canvas = document.getElementById('game-canvas');

    // EaselJS Stage
    this.stage = new createjs.Stage(this.canvas);
    createjs.Touch.enable(this.stage);

    // this.initGame();
    var preloader = new c99.Preloader(this);
    preloader.loadGraphics();

    var restartButton = document.getElementById('restart-button');
    restartButton.onclick = (function(event) {
      var gameoverScene = document.getElementById('gameover');
      gameoverScene.classList.remove('gameover-appear');
      this.initGame();
    }).bind(this);
  }

  var p = Count99Game.prototype;

  p.initGame = function() {
    this.totalTiles = 3;

    // store which number player should click on next tile.
    this.nextCount = 1;

    // we have a <span> in the HTML that display the nextCount variable.
    // We can store the reference of that element
    // so we can access later without finding it again.
    this.nextCountLabel = document.getElementById('next-count');
    this.nextCountLabel.innerText = this.nextCount;

    // the onPress event handler for tile
    var tileOnPress = function(event) {
      if (event.currentTarget.number === this.nextCount) {
        this.stage.removeChild(event.currentTarget);

        // count the next tile.
        this.nextCount++;

        // game over, player wins.
        if (this.nextCount > this.totalTiles) {
          this.gameOver();
        }

        // update the canvas to reflect the new display list.
        this.stage.update();
        // update the <span id='next-count'> element
        this.nextCountLabel.innerText = this.nextCount;

      }
    }

    for (var i=this.totalTiles; i>0; i--) {
      var tile = new c99.Tile(i);
      tile.x = Math.random()*(this.canvas.width-tile.width);
      tile.y = Math.random()*(this.canvas.height-tile.height);
      tile.on('mousedown', (tileOnPress).bind(this)); // bind the outer 'this' scope into the event handler function.
      this.stage.addChild(tile);
    }

    this.stage.update();
  }

  p.gameOver = function() {
    // force the next count to be the total tiles maximum.
    this.nextCount = this.totalTiles;

    // display the game over scene.
    var gameoverScene = document.getElementById('gameover');
    gameoverScene.classList.add('gameover-appear');
  }

  return Count99Game;
})();

window.onload = function() {
  // entry point
  var game = new c99.Game();
};