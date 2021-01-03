var rush = rush || {};
rush.Hero = (function(){
  function Hero() {
    this.initialize();
  };
  var p = Hero.prototype = new rush.MovableGameObject();

  // super initialize
  p.MovableGameObject_initialize = p.initialize;
  p.initialize = function() {
    this.MovableGameObject_initialize();

    this.category = 'hero';

    this.width = 10;
    this.height = 16;

    // put registration point to the middle of botth feet.
    this.regX = this.width/2;
    this.regY = this.height;

    // copy from zoe exported running.json file.
    var spritesheetData = {"images": ["images/running.png"], "frames": [[0, 0, 16, 16, 0, 0, 0], [16, 0, 16, 16, 0, 0, 0], [32, 0, 16, 16, 0, 0, 0], [48, 0, 16, 16, 0, 0, 0]], "animations": {"all": {"frames": [0, 1, 2, 3], frequency:4}}}
    var spritesheet = new createjs.SpriteSheet(spritesheetData);
    this.animation = new createjs.Sprite(spritesheet);
    this.animation.gotoAndPlay('all');
    this.animation.y = 2; // there is some white space between hero graphics and the bottom of the graphics file.
    this.addChild(this.animation);

    // collision point
    this.collisionPoints = [
      new createjs.Point(this.width/2, this.height), // bottom center
      new createjs.Point(this.width, this.height/2), // right middle
    ];
  };

  p.jump = function () {
    if (this.onGround)
      this.velocity.y = -10;
  }

  p.MovableGameObject_tick = p.tick;
  p.tick = function () {
    this.MovableGameObject_tick();
    this.velocity.x = 3;
  }

  return Hero;
})();