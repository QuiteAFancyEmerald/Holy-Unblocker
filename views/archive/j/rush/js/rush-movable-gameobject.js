var rush = rush || {};

rush.MovableGameObject = (function(){
  function MovableGameObject() {
    this.initialize();
  };

  var p = MovableGameObject.prototype = new rush.GameObject();

  p.GameObject_initialize = p.initialize;
  p.initialize = function() {
    this.GameObject_initialize();

    this.velocity = new createjs.Point(0, 0);

    // how fast it goes downward?
    this.dropSpeed = 1;

    // is this game object stands on any ground (platform)?
    this.onGround = false;

    // Give heartbeat to MovableGameObject
    this.addEventListener('tick', this.tick.bind(this));
  }

  p.tick = function(timeElapsed) {
    if (createjs.Ticker.getPaused()) return; // tick when not paused.

    // apply gravity
    this.velocity.y += this.dropSpeed;
    this.velocity.y = Math.min(this.velocity.y, 5); // bound to max velocity
  };

  return MovableGameObject;
})();