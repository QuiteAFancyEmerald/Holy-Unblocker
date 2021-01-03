var rush = rush || {};

rush.Platform = (function(){
  function Platform(width){
    this.initialize(width);
  }

  var p = Platform.prototype = new rush.GameObject();

  p.category = 'platform';

  p.GameObject_initialize = p.initialize;
  p.initialize = function(width) {
    this.GameObject_initialize();

    this.width = width || 120;
    this.height = 12;

    // variable width with graphics
    if (width === 120) {
      var image = new createjs.Bitmap("images/platform.png");
      this.addChild(image);
    } else if (width > 120) {
      var imageLeft = new createjs.Bitmap("images/platform-left.png");
      this.addChild(imageLeft); // width 57
      var imageRight = new createjs.Bitmap("images/platform-right.png");
      this.addChild(imageRight); // width 62
      var imageMiddle = new createjs.Bitmap("images/platform-middle.png");
      this.addChild(imageMiddle);

      // place them in correct place.
      imageMiddle.x = 57;
      imageMiddle.scaleX = width - 57 - 62;
      imageRight.x = imageMiddle.x + imageMiddle.scaleX;
    }
  }

  return Platform;
})();