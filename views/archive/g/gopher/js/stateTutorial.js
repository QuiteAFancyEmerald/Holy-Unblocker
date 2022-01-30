var StateTutorial = {

  preload: function(){
    game.load.image("background", "assets/bg-color.png");
    game.load.spritesheet("controls", "assets/controls-animation.png", 600, 432, 24);
    game.load.spritesheet("back-button", "assets/back-button.png", 65, 32, 2);
    game.load.spritesheet("play-button", "assets/play-button.png", 65, 32, 2);
    game.load.audio("tutorial", "assets/music/tutorialScreenJam-compressed.m4a");

  },

  create: function(){
    //MUSIC
    this.tutorialSong = game.add.audio("tutorial");
    this.tutorialSong.play('', 0, 1, true);
    this.tutorialSong.volume = 0.5;

    background = game.add.tileSprite(0, 0, 600, 432, "background");

    this.controls = game.add.sprite(game.world.centerX, game.world.height-215, "controls");
    this.controls.anchor.set(0.5, 0.5);
    this.controls.animations.add("controls-animation", [], 6, true);
    this.controls.animations.play("controls-animation");

    //Back Button
    this.startBtn = game.add.button(40, game.world.height-20,
    "back-button", this.startMain, this, 1, 0, 1);
    this.startBtn.anchor.set(0.5, 0.5);

    //Define and add game buttons
    this.startBtn = game.add.button(563, game.world.height-20,
    "play-button", this.startGame, this, 1, 0, 1);
    this.startBtn.anchor.set(0.5, 0.5);
  },

  startGame: function (){
    this.tutorialSong.stop();
    game.state.start("StateChoice");

  },

  startMain: function (){
    this.tutorialSong.stop();
    game.state.start("StateTitle");

  },

  update: function(){
  },

};
