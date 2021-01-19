var StateTitle = {
  preload: function(){
    game.load.bitmapFont('pixelFont', 'assets/fonts/bitmapFonts/pixelFont.png', 'assets/fonts/bitmapFonts/pixelFont.xml');
    game.load.audio("title", "assets/music/BeepBox-Song2-compressed.m4a");
    game.load.image("city", "assets/city-re-colored.png");
    game.load.audio("select_button", "assets/music/sfx/select.wav");
    game.stage.backgroundColor = 0xe9fffe;
    game.load.spritesheet("logo", "assets/menu-animation.png", 576, 334, 28);
    //Need to add buttons for:
    //1. Start game
    //2. Tutorial??
    game.load.spritesheet("buttons", "assets/main-menu-buttons.png", 217, 40, 2);
    game.load.spritesheet("controls-buttons", "assets/controls-button.png", 108, 32, 2);
    //Need: "best played in landscape-view image for mobile"

    //Temp button for tutorial button
    game.load.image("tutorial", "assets/try-again.png");
    game.load.image("background", "assets/bg-color.png");
    game.load.image("sky", "assets/clouds-re-colored.png");
    game.load.image("mtn", "assets/mountains-recolored.png");
  },

  create: function (){
    // game.scale.pageAlignHorizontally = true;
    // game.scale.pageAlignVertically = true;
    // game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    // game.stage.disableVisibilityChange = true;

     background = game.add.tileSprite(0, 0, 600, 432, "background");
     this.titleSong = game.add.audio("title");
     this.titleSong.play('', 0, 1, true);

     this.sky = game.add.tileSprite(0, 10, 600, 78, "sky");
     this.mtn = game.add.tileSprite(0, 295, 600, 131, "mtn");
     this.city = game.add.tileSprite(0, 342, 600, 90, "city");

     this.logo = game.add.sprite(game.world.centerX, game.world.height-250, "logo");
     this.logo.anchor.set(0.5, 0.5);
     this.logo.animations.add("menu", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], 12, true);
     this.logo.animations.play("menu");

     //Define and add game buttons
     this.startBtn = game.add.button(285, game.world.height-60, "buttons", this.startGame, this, 1, 0, 1);
     this.startBtn.anchor.set(0.5, 0.5);

    //Define and add game buttons
     this.tutorial = game.add.button(486, game.world.height-37, "controls-buttons", this.startTutorial, this, 1, 0, 1);
     this.startBtn.anchor.set(0.5, 0.5);

     //Enable input
     //Call setListeners();

     var bmpText;
     bmpText = game.add.bitmapText(155, 400, 'pixelFont', '©2018 Ardan Labs', 21);
  },

  startGame: function (){
    this.select_button = game.add.audio("select_button");
    this.select_button.play('', 0, 1, false);
    this.select_button.volume = 0.3;
    this.titleSong.stop();
    game.state.start("StateChoice");
  },

  startTutorial: function(){
    this.titleSong.stop();
    game.state.start("StateTutorial");
  },

  //Define setListeners function
  //Add listeners for correct and incorrect screen orientation

  update: function (){
    this.mtn.tilePosition.x -= 1;
    this.sky.tilePosition.x -= 0.5;
    this.city.tilePosition.x -= 1.5;
  },

}; //END StateTitle
