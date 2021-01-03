var rush = rush || {};
rush.Game = (function() {
  // constructor
  function RushGame() {
    console.log("Rush game starts.");

    this.canvas = document.getElementById('game-canvas');

    // score
    this.scoreHud = document.getElementById('score');

    // EaselJS Stage
    this.stage = new createjs.Stage(this.canvas);

    // Background
    this.bg = new createjs.Container();
    var bgImage = new createjs.Bitmap('images/trees.png');
    this.bg.addChild(bgImage);
    this.stage.addChild(this.bg);

    // Camera
    this.camera = new createjs.Container();
    this.stage.addChild(this.camera);

    // Create heartbreat for our game loop
    createjs.Ticker.setFPS(40);

    var preloader = new rush.Preloader(this);
    this.stage.addChild(preloader);
    preloader.loadGraphics();
  }

  var p = RushGame.prototype;

  p.resetGame = function() {
    this.camera.removeAllChildren();
    this.camera.x = 0;
    createjs.Ticker.removeAllEventListeners();
    createjs.Ticker.addEventListener('tick', this.tick.bind(this));
  }

  p.initGame = function() {
    this.resetGame();
    console.log ("Game Inited.");

    this.collectedCoins = 0;

    var lastPlatformX = 50;
    var lastPlatformY = 150;

    for (var i=0;i<200;i++)
    {
      var width = 120 + Math.round(Math.random() * 50);
      var platform = new rush.Platform(width);

      platform.x = lastPlatformX;
      // -40~+40 from the last y position.
      platform.y = Math.random() * 80 - 40 + lastPlatformY;;

      // we need to limit the max and min y to a range.
      // the range is 80-250
      platform.y = Math.max(80, Math.min(250, platform.y));

      this.camera.addChild(platform);

      var gapBetweenPlatforms = Math.random() * 32;
      lastPlatformX += platform.width + gapBetweenPlatforms;
      lastPlatformY = platform.y;

      // let's put an obstacle on platform.
      if (Math.random()>0.5 && i >= 1) {
        var obstacle = new rush.Obstacle();
        obstacle.x = platform.x + platform.width/2;
        obstacle.y = platform.y;
        this.camera.addChild(obstacle);
      } else {
        // put coins there if no obstacle.
        var coin = new rush.Coin();
        coin.x = platform.x + platform.width/2;
        coin.y = platform.y;
        this.camera.addChild(coin);
      }

    }

    var hero = this.hero = new rush.Hero();
    hero.x = 100;
    hero.y = 100;
    this.camera.addChild(hero);

    this.stage.on('stagemousedown', function() {
      hero.jump();
    });

    this.updateView();
  }

  p.tick = function() {
    if (createjs.Ticker.getPaused()) return; // tick when not paused.

    this.updateView();

    this.moveGameObjects();
    this.resolveCollision();

    this.moveCamera();
  }

  p.moveCamera = function() {
    this.camera.x -= this.hero.velocity.x;
  }

  p.updateView = function(){
    this.stage.update();
    this.scoreHud.innerHTML = this.collectedCoins;
  }

  p.gameOver = function(){
    createjs.Ticker.setPaused(true);

    var gameoverScene = document.getElementById('gameover');
    var yourScore = document.getElementById('your-game-score');

    localStorage['maxScore'] = localStorage['maxScore'] || 0; // set the saved max score to zero if not defined

    var maxScore = Math.max(localStorage['maxScore'], this.collectedCoins);
    localStorage['maxScore'] = maxScore;

    yourScore.innerHTML = 'Your score is ' + this.collectedCoins + '.';
    yourScore.innerHTML+= '<br>Highest: ' + maxScore;

    var topScores = new rush.TopScores();
    topScores.saveScore(this.collectedCoins);
    var topScoresHud = document.getElementById('top-scores');
    topScoresHud.innerHTML = topScores.toHTML();

    gameoverScene.classList.remove('hidden');
  }

  p.moveGameObjects = function () {
    for (var i=0, len=this.camera.children.length; i<len; i++){
      var gameObject = this.camera.children[i];

      if (gameObject.velocity) {
        gameObject.x += gameObject.velocity.x;
        gameObject.y += gameObject.velocity.y;
      }

      // for each game object, we mark the outside of screen flag
      var globalPosition = new createjs.Point();
      globalPosition.x = gameObject.x + this.camera.x;
      globalPosition.y = gameObject.y + this.camera.y;

      if (globalPosition.x > this.canvas.width ||
          globalPosition.x + gameObject.width < 0 ||
          globalPosition.y > this.canvas.height ||
          globalPosition.y + gameObject.height < 0) {
        gameObject.isOutsideOfScreen = true;
      }else{
        gameObject.isOutsideOfScreen = false;
      }
    }

    // game over if the hero falls down
    if (this.hero.y > 500) {
      this.gameOver();
    }
  }

  p.gameObjectHitHero = function (category, hitCallback) {
    for (var i=0, len=this.camera.children.length; i<len; i++){
      var gameObject = this.camera.children[i];

      // if it's removed (specifically: coins), we skip the object.
      if (!gameObject) continue;

      // skip the game object if it is out of the screen.
      if (gameObject.isOutsideOfScreen) continue;

      // check collision between platform and hero
      if (gameObject.category === category) {
        // loop all collision point.
        for (var j=0, length = this.hero.collisionPoints.length; j<length; j++) {
          var collisionPoint = this.hero.collisionPoints[j];
          var point = this.hero.localToLocal(collisionPoint.x, collisionPoint.y, gameObject);
          if (gameObject.hitPoint(point)) {
            hitCallback(point, gameObject);
          }
        }
      }
    }
  }

  p.heroHitsPlatform = function(point) {
    // get distance between target point and game object
      var distanceY = - point.y;
      if (this.hero.velocity.y > 0) {
        this.hero.y += distanceY;
        this.hero.velocity.y = 0;
      }

      this.hero.onGround = true;
  }

  p.heroHitsCoin = function(point, coin){
    this.camera.removeChild(coin);
    this.collectedCoins++;
  }

  p.heroHitsObstacle = function(){
    this.gameOver();
  }

  p.resolveCollision = function() {
    // check collision between platform and hero
    this.hero.onGround = false;
    this.gameObjectHitHero('platform', (this.heroHitsPlatform).bind(this));

    // check collision between obstacle and hero
    this.gameObjectHitHero('obstacle', (this.heroHitsObstacle).bind(this));

    // check collision between obstacle and hero
    this.gameObjectHitHero('coin', (this.heroHitsCoin).bind(this));
  }

  return RushGame;
})();