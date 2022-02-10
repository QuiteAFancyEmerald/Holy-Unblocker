var StateChoice = {
  preload: function () {
    //Music and Sounds
    game.load.audio("select", "assets/music/BeepBox-Song3-compressed.m4a");

    //Spritesheets for the 3 colored Gophers
    //Later put into 1 spritesheet
    game.load.spritesheet("racer", "assets/character-select-loops.png", 76, 72, 7);

    game.load.image("background", "assets/bg-color.png");
    game.load.image("city", "assets/city-re-colored.png");
    game.load.image("sky", "assets/clouds-re-colored.png");
    game.load.image("mtn", "assets/mountains-recolored.png");
    game.load.image("select", "assets/character-select-bg.png");

    //sample test button
    game.load.spritesheet("confirmButton", "assets/buttons-sprite.png", 111, 24, 4);
    game.load.spritesheet("neon", "assets/neon-sign.png", 120, 30, 13);

    game.load.spritesheet("buttons", "assets/on-off-buttons.png", 59, 41, 2);
    game.load.spritesheet("blueMarquee", "assets/blue-crawl.png", 50, 12, 45);
    game.load.spritesheet("pinkMarquee", "assets/pink-crawl.png", 50, 12, 45);
    game.load.spritesheet("purpleMarquee", "assets/purple-crawl.png", 50, 12, 45);
    // game.load.spritesheet("neonCnfrm", "assets/neon-sign.png", )

  },

  create: function () {
    this.camera.reset();

    //MUSIC
    this.selectSong = game.add.audio("select");
    //Watched youtube video, need to check docs for .play params
    this.selectSong.play('', 0, 1, true);

    //BACKGROUND
    this.background = game.add.tileSprite(0, 0, 600, 432, "background");

    this.sky = game.add.tileSprite(0, 10, 600, 78, "sky");
    this.mtn = game.add.tileSprite(0, 250, 600, 131, "mtn");
    this.city = game.add.tileSprite(0, 290, 600, 90, "city");
    this.select = game.add.tileSprite(0, 0, 600, 432, "select");

    //MARQUEE
    //Blue
    this.blueMarquee = game.add.sprite(game.world.bounds.height - 282, game.world.centerY-16, "blueMarquee");
    this.blueMarquee.anchor.set(0.5, 0.5);
    this.blueMarquee.animations.add("blueCrawl", [],15, true);
    this.blueMarquee.animations.play("blueCrawl");
    //Pink
    this.pinkMarquee = game.add.sprite(game.world.bounds.height - 132, game.world.centerY-16, "pinkMarquee");
    this.pinkMarquee.anchor.set(0.5, 0.5);
    this.pinkMarquee.animations.add("pinkCrawl", [],13, true);
    this.pinkMarquee.animations.play("pinkCrawl");
    //Purple
    this.purpleMarquee = game.add.sprite(game.world.bounds.height + 18, game.world.centerY-16, "purpleMarquee");
    this.purpleMarquee.anchor.set(0.5, 0.5);
    this.purpleMarquee.animations.add("purpleCrawl", [],10, true);
    this.purpleMarquee.animations.play("purpleCrawl");

    //Choose Racer1
    this.pickRacer1 = game.add.button(game.world.bounds.height - 282, game.world.centerY+105,
      "buttons", this.racerStart.bind(this, "blue"), this);
    this.pickRacer1.anchor.set(0.5, 0.5);

    //Choose Racer2
    this.pickRacer2 = game.add.button(game.world.bounds.height - 132, game.world.centerY+105,
      "buttons", this.racerStart.bind(this, "pink"), this);
    this.pickRacer2.anchor.set(0.5, 0.5);

    //Choose Racer3
    this.pickRacer3 = game.add.button(game.world.bounds.height + 18, game.world.centerY+105,
      "buttons", this.racerStart.bind(this, "purple"), this);
    this.pickRacer3.anchor.set(0.5, 0.5);

    this.buttons = {
      "blue": this.pickRacer1,
      "pink": this.pickRacer2,
      "purple": this.pickRacer3
    };

    //BLACK AND WHITE GOPHERS
    //Blue
    this.blue = game.add.sprite(game.world.bounds.height - 282, game.world.centerY+40, "racer");
    this.blue.frame = 1;
    this.blue.animations.add("blue", [1, 2],9, true);
    this.blue.anchor.set(0.5, 0.5);
    this.blue.animations.play("blue");

    //Pink
    this.PinkGopher = game.add.sprite(game.world.bounds.height - 132, game.world.centerY+40, "racer");
    this.PinkGopher.frame = 3;
    this.PinkGopher.animations.add("pink", [3, 4],9, true);
    this.PinkGopher.anchor.set(0.5, 0.5);
    this.PinkGopher.animations.play("pink");

    //Purple
    this.PurpleGopher = game.add.sprite(game.world.bounds.height + 18, game.world.centerY+40, "racer");
    this.PurpleGopher.frame = 5;
    this.PurpleGopher.animations.add("purple", [5, 6],9, true);
    this.PurpleGopher.anchor.set(0.5, 0.5);
    this.PurpleGopher.animations.play("purple");


    //CONFIRMATION BUTTON
    this.startConfirm = game.add.button(game.world.bounds.height - 132, game.world.height-46,
     "neon", this.startGame, this, 12, 12, 12);
    this.startConfirm.frame = 12;
    this.startConfirm.anchor.set(0.5, 0.5);
    this.startConfirm.animations.add("neon", [],5, true);
    this.startConfirm.anchor.set(0.5, 0.5);
    // this.startConfirm.animations.play("neon");
  },

  startGame: function () {
    if(character === undefined){
      this.sampleText = game.add.text(game.world.centerX, 30, "You must choose a gopher!");
      this.sampleText.fill = "ffffff";
      this.sampleText.fontSize = 32;
      this.sampleText.anchor.set(0.5, 0.5);
      // console.log("You must choose a gopher!");
    } else {
      this.selectSong.stop();
      game.state.start("StateMain");
    }
  },

  racerStart: function (racer){
    console.log(racer);
    for (var key in this.buttons) {
      this.buttons[key].frame = 0;
    }

    this.buttons[racer].frame = 1;
    character = racer;


    this.startConfirm.animations.play("neon");
    // character.animations.play("blue");
    // console.log(character);
  },


  update: function () {
    this.sky.tilePosition.x -= 0.1;

  },


};
