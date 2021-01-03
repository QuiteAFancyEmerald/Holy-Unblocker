var rush = rush || {};
rush.Obstacle = (function(){
  function Obstacle() {
    this.initialize();
  }
  var p = Obstacle.prototype = new rush.GameObject();

  p.category = 'obstacle';

  p.width = 20;
  p.height = 10;

  // put registration point to the bottom center.
  p.regX = p.width/2;
  p.regY = p.height;

  p.GameObject_initialize = p.initialize;
  p.initialize = function() {
    this.GameObject_initialize();

    // copy from zoe exported obstacle.json file.
    // frame: [x, y, width, height, imageIndex, regX, regY]
    var spritesheetData = {"images": ["images/obstacle.png"], "frames": [[0, 0, 32, 16, 0, 0, 0], [32, 0, 32, 16, 0, 0, 0]], "animations": {"all": {"frames": [0, 1], frequency:5}}}
    var spritesheet = new createjs.SpriteSheet(spritesheetData);
    this.animation = new createjs.Sprite(spritesheet);
    this.animation.gotoAndPlay("all");

    this.addChild(this.animation);
  }

  return Obstacle;
})();