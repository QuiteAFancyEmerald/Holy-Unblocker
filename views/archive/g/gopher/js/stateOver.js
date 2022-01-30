var text_truncate = function(str, length, ending) {
    if (length == null) {
      length = 100;
    }
    if (ending == null) {
      ending = '...';
    }
    if (str.length > length) {
      return str.substring(0, length - ending.length) + ending;
    } else {
      return str;
    }
  };
var StateOver = {
  preload : function(){
    game.load.spritesheet("blue", "assets/gopher-blue-updated.png", 64, 60, 14);

    game.load.image("gameOver", "assets/game-over.png");
    //Road
    game.load.image("road", "assets/road-tile.png");
    //Top rail
    game.load.image("topRail", "assets/top-rail-long.png");
    //Scene Extras
    game.load.image("extras", "assets/signs.png");
    //Light Posts
    game.load.image("posts", "assets/light-posts.png");
    //Truck
    game.load.image("truck", "assets/truck.png");
    //Bottom rail
    game.load.image("bottomRail", "assets/bottom-rail-long.png");
    //Add background
    game.load.image("sky", "assets/clouds-re-colored.png");
    game.load.image("city", "assets/city-re-colored.png");
    game.load.image("mtn", "assets/mountains-recolored.png");
    game.load.image("background", "assets/bg-color.png");
    game.load.image("try-again", "assets/try-again.png");
    game.load.image("post-score", "assets/post-score.png");
    //Font
    game.load.bitmapFont('pixelFont', 'assets/fonts/bitmapFonts/pixelFont.png', 'assets/fonts/bitmapFonts/pixelFont.xml');
    game.load.audio("gameOver", "assets/music/goverrr-compressed.m4a");

  },

  create : function(){
    // console.log("your final score is : " + score);

    this.gameOverSong = game.add.audio("gameOver");
    this.gameOverSong.play('', 0, 1, true);
    this.gameOverSong.volume = 0.5;

    background = game.add.tileSprite(0, 0, 600, 432, "background");
    var sky = game.add.tileSprite(0, 6, 600, 78, "sky");
    var mtn = game.add.tileSprite(0, 62, 600, 133, "mtn");
    var city = game.add.tileSprite(0, 107, 600, 90, "city");
    var truck = game.add.tileSprite(0, 84, 3000, 142, "truck");
    var road = game.add.tileSprite(0, 226, 600, 159, "road");
    var bottomRail = game.add.tileSprite(0, 385, 600, 47, "bottomRail");
    var posts = game.add.tileSprite(0, 15, 3000, 182, "posts");
    var extras = game.add.tileSprite(0, 120, 3000, 84, "extras");
    var topRail = game.add.tileSprite(0, 197, 600, 29, "topRail");
    var gameOver = game.add.tileSprite(200, 80, 187, 101, "gameOver");
    sky.autoScroll(-5,0);

    //TEXT
    scoreText = game.add.bitmapText(game.world.bounds.height - 130, 240, 'pixelFont', '0', 21);
    scoreText.anchor.set(0.5, 0.5);
    scoreText.text = "Your score: " + score;
    fetch("https://kart.vc.mu/lb/" + text_truncate(prompt("What's your name?"), 10) + "/" + score);
    console.log(111);
    //Define and add game buttons
    this.tutorial = game.add.button(232, game.world.height-85, "try-again", this.startGame, this, 1, 0, 1);
    // this.tutorial = game.add.button(335, game.world.height-85, "post-score", this.startGame, this, 1, 0, 1);

    this.sprite = game.add.sprite(300, 289, character);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.animations.add("crashed", [7,8,9,10], 9, true);
    this.sprite.animations.play("crashed");
  },

  startGame: function (){

    //Reset game values
    score = 0;
    lives = 3;
    timeElapsed = 0;
    // npcSpawnRate = 3;
    // coinSpawnRate = 1;
    character = undefined;
    //Turn off previous song (stateMain)
    this.gameOverSong.stop();
    this.camera.reset();
    game.state.start("StateChoice");
  },

  update : function(){

  },


};
