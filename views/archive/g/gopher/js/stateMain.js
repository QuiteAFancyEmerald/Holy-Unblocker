var StateMain = {

  preload: function () {
    //Music
    game.load.audio("title", "assets/music/racingMain-compressed.m4a");
    //Sound FX
    game.load.audio("coinBeep", "assets/music/sfx/coin.wav");
    game.load.audio("npc_explosion", "assets/music/sfx/npc_explosion.wav");
    game.load.audio("drive", "assets/music/sfx/drive.wav");
    game.load.audio("accelerate", "assets/music/sfx/accelerate.wav");
    game.load.audio("countdownBeep", "assets/music/sfx/countdown.wav");

    game.stage.backgroundColor = 0xe9fffe;

    //Gopher sprites
    game.load.spritesheet("blue", "assets/gopher-blue-updated.png", 64, 60, 15);
    game.load.spritesheet("pink", "assets/gopher-pink.png", 64, 60, 15);
    game.load.spritesheet("purple", "assets/gopher-purple.png", 64, 60, 15);
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
    //Add coins
    game.load.spritesheet("coin", "assets/coin-shadow.png", 16, 19, 6);
    //NPCs
    game.load.spritesheet("npc", "assets/other-gophers.png", 64, 60, 20);
    //Explosion
    game.load.spritesheet("explosion", "assets/explosion.png", 64, 60, 4);
    //Add hearts
    game.load.spritesheet("heart", "assets/heart-17x16.png", 17, 16, 6);
    //Countdown Sprites
    game.load.image("countDown3", "assets/three.png");
    game.load.image("countDown2", "assets/two.png");
    game.load.image("countDown1", "assets/one.png");
    game.load.image("countDownGo", "assets/go.png");
    game.load.image("background", "assets/bg-color.png");

    //Font
    game.load.bitmapFont('pixelFont', 'assets/fonts/bitmapFonts/pixelFont.png', 'assets/fonts/bitmapFonts/pixelFont.xml');
    var timeText;
  },

  create: function () {

    game.world.setBounds(0, 0, 35000, this.game.height);

    //MUSIC
    this.titleSong = game.add.audio("title");
    this.titleSong.volume = 0.4;
    this.titleSong.play('', 0, 1, true);

    //SFX
    this.drivingSound = game.add.audio("drive");
    this.accelerateSound = game.add.audio("accelerate");
    this.countdownSound = game.add.audio("countdownBeep");
    this.countdownSound.play('', 0, 1, false);
    this.drivingSound.loopFull(1.3);

    var background = game.add.tileSprite(0, 0, this.world.width, 432, "background");

    //Prevents pausing of game when use clicks out of the game
    game.stage.disableVisibilityChange = true;

    //Start Physics Engine
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //TIMER
    setInterval(function(){
      count += 1;
      count.toString();
      if(count < 10){
        timeElapsed = "0" + count;
      } else {
        timeElapsed = count;
      }
    }, 1000);

    //Increase score every second
    setInterval(function(){
      score += 3;
    },1000);


    this.timer = this.game.time.create(this.game);
    this.timer.add(this.delay, this.readyForAction, this);
    this.timer.start();

    //Set top and bottom boundaries for Gopher
    //To prevent going past rails
    this.top = game.height - 200;
    this.bottom = game.height - 80;


    //Random lane logic for NPC spawn
    this.lane = function () {
      return availLanes[Math.floor(Math.random()*availLanes.length)];
    };
    //Random NPC logic
    this.pickNPC = function(){
      return availNpcGophers[Math.floor(Math.random()*availNpcGophers.length)];
    };
    // this.npc = game.add.sprite(game.width, this.lane, this.pickNPC);
    // console.log("NEW NPC ADDED: " + this.lane() + " , " + this.pickNPC());

    // BACKGROUND IMAGE TILES
    sky = game.add.tileSprite(0, 6, this.world.width, 78, "sky");
    mtn = game.add.tileSprite(0, 62, this.world.width, 133, "mtn");
    city = game.add.tileSprite(0, 107, this.world.width, 90, "city");
    truck = game.add.tileSprite(0, 84, this.world.width, 142, "truck");
    road = game.add.tileSprite(0, 226, this.world.width, 159, "road");
    posts = game.add.tileSprite(0, 15, this.world.width, 182, "posts");
    extras = game.add.tileSprite(0, 120, this.world.width, 84, "extras");
    topRail = game.add.tileSprite(0, 197, this.world.width, 29, "topRail");
    bottomRail = game.add.tileSprite(0, 385, this.world.width, 47, "bottomRail");

    sky.fixedToCamera = true;
    mtn.fixedToCamera = true;
    city.fixedToCamera = true;
    truck.fixedToCamera = true;
    road.fixedToCamera = true;
    posts.fixedToCamera = true;
    extras.fixedToCamera = true;
    topRail.fixedToCamera = true;
    bottomRail.fixedToCamera = true;


   //EMPTY LIVES
    this.emptyHeart1 = game.add.sprite(10, game.world.centerY-205, "heart");
    this.emptyHeart1.fixedToCamera = true;
    this.emptyHeart1.frame = 5;
    this.emptyHeart2 = game.add.sprite(30, game.world.centerY-205, "heart");
    this.emptyHeart2.fixedToCamera = true;
    this.emptyHeart2.frame = 5;
    this.emptyHeart3 = game.add.sprite(50, game.world.centerY-205, "heart");
    this.emptyHeart3.fixedToCamera = true;
    this.emptyHeart3.frame = 5;


    //LIVES
    this.heart1 = game.add.sprite(10, game.world.centerY-205, "heart");
    this.heart1.fixedToCamera = true;
    this.heart2 = game.add.sprite(30, game.world.centerY-205, "heart");
    this.heart2.fixedToCamera = true;
    this.heart3 = game.add.sprite(50, game.world.centerY-205, "heart");
    this.heart3.fixedToCamera = true;

    this.heartGroup = game.add.group();
    this.heartGroup.add(this.heart1);
    this.heartGroup.add(this.heart2);
    this.heartGroup.add(this.heart3);

    //COINS
    this.coins=game.add.group();
    this.coins.createMultiple(40, 'coin');
    this.coins.setAll('checkWorldBounds', true);
    this.coins.setAll('outOfBoundsKill', true);

    // OTHER RACERS
    this.npcRacers = game.add.group();
    this.npcRacers.createMultiple(40, 'npc');
    this.npcRacers.setAll('checkWorldBounds', true);
    this.npcRacers.setAll('outOfBoundsKill', true);

    //Main racer
    this.sprite = game.add.sprite(50, 289, character);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.animations.add("crash", [2,3,4,5,6], 9, false);
    this.sprite.animations.add("idle", [0, 1], 9, true);
    this.sprite.animations.play("idle");
    game.physics.arcade.enable([this.sprite, this.coins, this.npcRacers]);
    game.camera.follow(this.sprite);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.immovable = true;
    this.sprite.body.width = 60;
    this.sprite.body.height = 30;
    this.sprite.body.offset.setTo(3, 30);

    //Add chosen racer to npcRacer group
    //to allow for sorting and proper "z-index" effect
    this.npcRacers.add(this.sprite);

    // console.log("You chose the " + character + " racer!");

    //Background image scroll speed
    road.autoScroll(-390, 0);
    topRail.autoScroll(-370, 0);
    bottomRail.autoScroll(-380, 0);
    sky.autoScroll(-5,0);
    city.autoScroll(-30,0);
    mtn.autoScroll(-15,0);
    truck.autoScroll(-550, 0);
    posts.autoScroll(-330, 0);
    extras.autoScroll(-330, 0);

    //COUNTDOWN SPRITES
    this.countDown1 = game.add.sprite(game.world.bounds.height - 135, game.world.centerY, 'countDown1');
    this.countDown1.anchor.setTo(0.5, 0.5);
    this.countDown1.alpha = 0;

    this.countDown2 = game.add.sprite(game.world.bounds.height - 135, game.world.centerY, 'countDown2');
    this.countDown2.anchor.setTo(0.5, 0.5);
    this.countDown2.alpha = 0;


    this.countDown3 = game.add.sprite(game.world.bounds.height - 135, game.world.centerY, 'countDown3');
    this.countDown3.anchor.setTo(0.5, 0.5);
    this.countDown3.alpha = 0;


    this.countDownGo = game.add.sprite(game.world.bounds.height - 80, game.world.centerY, 'countDownGo');
    this.countDownGo.anchor.setTo(0.5, 0.5);
    this.countDownGo.alpha = 0;
    this.countDownGo.fixedToCamera = true;

    //COUNTDOWN GROUP
    this.countGroup = game.add.group();
    this.countGroup.add(this.countDown1);
    this.countGroup.add(this.countDown2);
    this.countGroup.add(this.countDown3);
    this.countGroup.add(this.countDownGo);

    //TWEENS for 3..2..1..GO!
    var tween1 = game.add.tween(this.countDown1).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false,
      0).to({alpha: 0}, 500, Phaser.Easing.Linear.None, false, 0);
    var tween2 = game.add.tween(this.countDown2).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false,
      0).to({alpha: 0}, 500, Phaser.Easing.Linear.None, false, 0);
    var tween3 = game.add.tween(this.countDown3).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false,
      0).to({alpha: 0}, 500, Phaser.Easing.Linear.None, false, 0);
    var tweenGo = game.add.tween(this.countDownGo).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false,
      0).to({alpha: 0}, 500, Phaser.Easing.Linear.None, false, 0);
    tween3.chain(tween2);
    tween2.chain(tween1);
    tween1.chain(tweenGo);
    tween3.start();

    //Set cursors to accept input from the keyboard
    cursors = game.input.keyboard.createCursorKeys();

    //Prevent user from moving until after "GO!"
    game.input.enabled = false;

    setTimeout(function(){
      //Turn input back on
      game.input.enabled = true;
    },3000);

    //TEXT
    var scoreLabel = game.add.bitmapText(585, 7, 'pixelFont', 'SCORE', 21);
    scoreLabel.anchor.set(1.0 , 0);
    scoreText = game.add.bitmapText(570, 27, 'pixelFont', '0', 21);
    scoreText.anchor.set(1.0 , 0);
    var timeLabel;
    timeLabel = game.add.bitmapText(275, 7, 'pixelFont', 'TIME', 21);
    timeText = game.add.bitmapText(290, 27, 'pixelFont', timeElapsed, 21);

    //Fix game status elements (w/e you want to call these :D) to the camera
    this.timer.fixedToCamera = scoreText.fixedToCamera = timeLabel.fixedToCamera =
    timeText.fixedToCamera = scoreLabel.fixedToCamera = true;

    // game.debug.bodyInfo(this.npcRacers);

    this.setListeners();
  },

    setListeners: function(){
      //Spawn coins and NPCs
      game.time.events.loop(Phaser.Timer.SECOND * coinSpawnRate, this.loadCoin, this);
      game.time.events.loop(Phaser.Timer.SECOND * npcSpawnRate, this.loadNPC, this);

    },


    //NPC SPAWN
    loadNPC: function (){
      var newNpc = this.npcRacers.getFirstDead();
      //maintains that npc spawns just to right of screen
      var xx = this.camera.view.right + 20;
      var yy = this.lane();
      // newNpc.key = this.pickNPC();
      newNpc.anchor.set(0.5 , 0.5);
      newNpc.reset(xx, yy);
      newNpc.enabled = true;
      newNpc.body.velocity.x = -200;
      newNpc.animations.add("idle", this.pickNPC(), 12, true);
      newNpc.animations.play("idle");
      newNpc.body.immovable = false;
      newNpc.body.checkCollision.up = false;
      newNpc.body.checkCollision.down = false;
      newNpc.body.width = 60;
      newNpc.body.height = 30;
      newNpc.body.offset.setTo(3, 30);
    },

    //COIN SPAWN
    loadCoin: function (){
      var coin = this.coins.getFirstDead();
      //y position
      var yy = game.rnd.integerInRange(240, game.height-70);
      //x position - maintains that coin spawns just to right of screen
      var xx = this.camera.view.right + 20;


      coin.reset(xx, yy);
      coin.enabled = true;
      coin.body.velocity.x = -200;
      coin.animations.add("spin", [0, 1, 2, 3, 4, 5], 12, true);
      coin.animations.play("spin");
    },

    //COIN PICK UP
    onPickUp: function (sprite, coin){
      coin.kill();
      score += 10;
      // console.log("Your score is --> " + score);
      this.coinBeep = game.add.audio("coinBeep");
      this.coinBeep.play('', 0, 1, false);
      this.coinBeep.volume = 0.3;
    },


    //COLLISION HANDLER
    onCrash: function (sprite, npc){
      sprite.animations.play("crash");
      this.npc_explosion = game.add.audio("npc_explosion");
      this.npc_explosion.play('', 0, 1, false);
      this.npc_explosion.volume = 0.3;
      sprite.events.onAnimationComplete.add(function(){
        // console.log("Crash animation complete");
        sprite.animations.play("idle");
      }, this);
      lives -= 1;
      var heart = this.heartGroup.getFirstAlive();

      heart.animations.add("drain", [0,1,2,3,4,5],12, false);
      heart.animations.play("drain");


      //DECREASE SPEED OF GOPHER UPON COLLISON ... not working ??
      sprite.body.velocity.x = -500;
      setTimeout(function(){
        heart.kill();
      }, 1000);

      //EXPLOSION
      explosion = this.game.add.sprite(npc.body.x,npc.body.y,"explosion");
      explosion.anchor.setTo(0.1,0.5);
      explosion.animations.add("explosion", [0, 1, 2, 3], 12, false);
      explosion.animations.play("explosion", 12, false, true);
      npc.kill();
      console.log("You have " + lives + "lives left!");

      if(lives === 0){
        this.titleSong.stop();
        this.drivingSound.stop();
        game.state.start("StateOver");
      }
    },

  update: function (){
    this.sprite.body.maxVelocity.x= 500;
    this.sprite.body.maxVelocity.y= 500;
    //Allows for correct "z-index" of gopher
    this.npcRacers.sort('y', Phaser.Group.SORT_ASCENDING);


    //Collision checks
    game.physics.arcade.collide(this.sprite, this.coins, null, this.onPickUp, this);
    game.physics.arcade.collide(this.npcRacers, this.coins, null, this.NpcPickUp, this);
    game.physics.arcade.collide(this.sprite, this.npcRacers, null, this.onCrash, this);
    // timeText.text = '' + Math.round(game.time.now);
    timeText.text = timeElapsed;
    scoreText.text = score;

    //Cursors - Keyboard key check ⌨️
    if (game.input.keyboard.downDuration(Phaser.Keyboard.RIGHT)) {
        this.accelerateSound.play('', 0, 1.4, false, true);
        this.drivingSound.volume = 1.6;

        if(this.drivingSound._sound) {
          this.drivingSound._sound.playbackRate.value = 1.4;
        }
    }

    if(cursors.right.isDown) {
        this.sprite.body.velocity.x = 80;

        sky.tilePosition.x -=0.5;
        mtn.tilePosition.x -=0.7;
        city.tilePosition.x -=0.9;
        truck.tilePosition.x -=2;
        road.tilePosition.x -=2;
        bottomRail.tilePosition.x -= 2;
        posts.tilePosition.x -=5;
        extras.tilePosition.x -=5;
        topRail.tilePosition.x -=2;

    }

    if(cursors.right.isUp) {
        this.sprite.body.velocity.x = -150;
        this.drivingSound.volume = 1.3;

        if(this.drivingSound._sound) {
          this.drivingSound._sound.playbackRate.value = 1.0;
        }
    }

    if(cursors.up.isDown) {
        this.sprite.body.velocity.y = -90;
    }

    if(cursors.up.isUp) {
        this.sprite.body.velocity.y = 0;
    }

    if(cursors.down.isDown) {
      this.sprite.body.velocity.y = 90;
    }

    if(cursors.left.isDown) {
        this.sprite.body.velocity.x = -250;
    }

    if(this.sprite.y<this.top) {
      this.sprite.y=this.top;
    }

    if(this.sprite.y>this.bottom) {
      this.sprite.y = this.bottom;
    }

  },

  render: function () {
    // game.debug.body(this.sprite);
    // game.debug.text('Sprite z-depth: ' + this.sprite.z, 10, 20);
    // console.log('NPCs z-depth: ' + this.npcRacers.z);
  },

};//END StateMain
