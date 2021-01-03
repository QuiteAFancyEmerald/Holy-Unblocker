var rush = rush || {};
rush.GameObject = (function(){
  function GameObject() {
    this.initialize();
  };

  var p = GameObject.prototype = new createjs.Container();

  // instance variables
  // what kind of this game object?
  p.category = 'object';

  // dimension
  p.width = 0;
  p.height = 0;

  // mark the game object to be outside of screen
  // useful for collision checking within screen only.
  p.isOutsideOfScreen = false;

  // reference the super initialize
  // before overriding the initialize method.
  p.Container_initialize = p.initialize;
  p.initialize = function(){
    this.Container_initialize();
  }

  p.hitPoint = function(point) {
    if (point.x >= 0 && point.x <= this.width && point.y >= 0 && point.y <= this.height) {
      return true;
    }
    return false;
  }

  return GameObject;
})();