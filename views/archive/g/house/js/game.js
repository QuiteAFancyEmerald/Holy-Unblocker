/*jshint bitwise: false, camelcase: false*/
/*globals define*/
define(function( require ) {
  'use strict';

  var Box2D = require( 'box2d' );
  var Input = require( 'input' );
  var Intersection = require( 'geometry/intersection' );
  var Camera = require( 'entities/camera' );
  var Player = require( 'entities/player' );
  var Explosion = require( 'entities/explosion' );
  var Trigger = require( 'entities/trigger' );
  var Door = require( 'entities/door' );
  var Background = require( 'effects/background' );
  var Shake = require( 'effects/shake' );
  var Colors = require( 'config/colors' );
  var Material = require( 'config/material' );
  var Settings = require( 'config/settings' );
  var world = require( 'world' );

  var DebugDraw = Box2D.Dynamics.b2DebugDraw;
  var ContactListener = Box2D.Dynamics.b2ContactListener;

  function Game() {
    this.prevTime = Date.now();
    this.currTime = this.prevTime;

    this.running = true;

    this.element = document.createElement( 'div' );
    this.canvas  = document.createElement( 'canvas' );
    this.ctx     = this.canvas.getContext( '2d' );

    this.element.appendChild( this.canvas );

    var width  = 640,
        height = 480;

    this.canvas.width  = width;
    this.canvas.height = height;

    this.removed = [];

    this.entities = [];
    this.player = null;

    this.camera = new Camera();
    this.camera.margin = 10;
    this.camera.world = this;

    this.shake = new Shake();

    this.level = null;

    this.input = new Input();
    this.input.game = this;

    // dt should never exceed this (milliseconds).
    this.MAX_FRAME_TIME = 1000 / 30;
    this.MIN_FRAME_TIME = 1000 / 120;
    // Frame time (seconds).
    this.FRAME_TIME = 1 / 60;

    this.debug = false;
    this.debugAABB = false;

    this.text = '';

    this.background = new Background( width, height );
    this.background.camera = this.camera;
    this.background.game = this;
    this.background.prerender();

    this.world = world;
    world.GetGravity().SetZero();

    // Debug view variables.
    this.box2dDebug = false;
    this.debugCanvas = null;
    this.debugCtx = null;

    var contactListener = new ContactListener();

    function userData( fixture ) {
      return fixture.GetBody().GetUserData();
    }

    contactListener.BeginContact = function( contact ) {
      var fixtureA = contact.GetFixtureA(),
          fixtureB = contact.GetFixtureB();

      var a = userData( fixtureA ),
          b = userData( fixtureB );

      // Handle player explosions.
      var player, other;
      if ( a instanceof Player && !fixtureB.IsSensor() ) {
        player = a;
        other = b;
      } else if ( b instanceof Player && !fixtureA.IsSensor() ) {
        player = b;
        other = a;
      }

      var explosion, fill;
      if ( player && !( player.material & other.material ) &&
           player.game && other.game ) {
        player.emotion = Player.Emotion.HIT;
        if ( player.emotionTimeout ) {
          clearTimeout( player.emotionTimeout );
        }

        player.emotionTimeout = setTimeout(function() {
          player.emotion = Player.Emotion.NORMAL;
          clearTimeout( player.emotionTimeout );
          player.emotionTimeout = null;
        }, 700 );

        if ( Settings.explosions ) {
          fill = Colors.Explosion[ Material.type( other.material )];

          if ( fill ) {
            explosion = new Explosion( other.x, other.y );
            explosion.fill.set( fill );
            this.add( explosion );
          }
        }

        this.shake.shake( 1, 0.4 );
        this.removed.push( other );
        return;
      }

      // Handle explosions.
      if ( !player &&
           !fixtureA.IsSensor() &&
           !fixtureB.IsSensor() &&
           !( a.material & b.material ) &&
           a.game &&
           b.game ) {
        var explosionA,
            explosionB;

        var fillA,
            fillB;

        if ( Settings.explosions ) {
          fillA = Colors.Explosion[ Material.type( a.material )];
          fillB = Colors.Explosion[ Material.type( b.material )];

          if ( fillA ) {
            explosionA = new Explosion( a.x, a.y );
            explosionA.fill.set( fillA );
            this.add( explosionA );
          }

          if ( fillB ) {
            explosionB = new Explosion( b.x, b.y );
            explosionB.fill.set( fillB );
            this.add( explosionB );
          }
        }

        this.removed.push( a );
        this.removed.push( b );
      }

      // Handles trigger.
      var trigger;
      if ( a instanceof Trigger &&
           !fixtureB.IsSensor() &&
           !( b instanceof Player ) ) {
        trigger = a;
        other = b;
      } else if ( b instanceof Trigger &&
                  !fixtureA.IsSensor() &&
                  !( a instanceof Player ) ) {
        trigger = b;
        other = a;
      }

      if ( trigger &&
           !trigger.active &&
           ( trigger.material & other.material ) ) {
        trigger.object = other;
      }

      // Handle door.
      var door;
      if ( a instanceof Door && b instanceof Player ) {
        door = a;
        player = b;
      } else if ( b instanceof Door && a instanceof Player ) {
        door = b;
        player = a;
      }

      if ( door && door.open ) {
        door.player = player;
      }
    }.bind( this );

    world.SetContactListener( contactListener );
  }

  Game.instance = null;

  Game.prototype.initializeDebugView = function() {
    this.debugCanvas = document.createElement( 'canvas' );
    this.debugCtx    = this.debugCanvas.getContext( '2d' );

    document.body.appendChild( this.debugCanvas );

    this.debugCanvas.id = 'box2d-debug-canvas';
    this.debugCanvas.width  = this.canvas.width;
    this.debugCanvas.height = this.canvas.height;

    var debugDraw = new DebugDraw();
    debugDraw.SetSprite( this.debugCtx );
    debugDraw.SetDrawScale( 1 );
    debugDraw.SetFillAlpha( 0.3 );
    debugDraw.SetLineThickness( 1 );
    debugDraw.SetFlags( DebugDraw.e_shapeBit );
    world.SetDebugDraw( debugDraw );
  };

  Game.prototype.update = function() {
    this.currTime = Date.now();
    var dt = this.currTime - this.prevTime;
    if ( dt < this.MIN_FRAME_TIME ) {
      return;
    }

    this.prevTime = this.currTime;

    if ( dt > this.MAX_FRAME_TIME ) {
      dt = this.MAX_FRAME_TIME;
    }

    dt *= 1e-3;

    this.input.update( dt );
    // Camera controls.
    if ( this.debug ) {
      this.updateDebug( dt );
    }

    this.entities.forEach(function( entity ) {
      entity.update( dt );
    });

    this.player.update( dt );
    this.camera.update( dt );
    this.shake.update( dt );

    this.world.Step( this.FRAME_TIME, 8, 3 );

    this.world.ClearForces();

    this.removed.forEach(function( removed ) {
      this.remove( removed );

      if ( removed.body ) {
        this.world.DestroyBody( removed.body );
      }
    }.bind( this ));

    this.removed = [];
  };

  Game.prototype.draw = function() {
    if ( this.box2dDebug ) {
      this.drawDebug();
    }

    var ctx = this.ctx;

    var level = this.level;
    if ( level && level.fill.alpha ) {
      ctx.fillStyle = level.fill.rgba();
      ctx.fillRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    } else {
      ctx.clearRect( 0, 0, ctx.canvas.width, ctx.canvas.height );
    }

    ctx.save();
    this.camera.applyTransform( ctx );
    this.shake.applyTransform( ctx );

    if ( Settings.background ) {
      this.background.draw( ctx );
    }

    this.entities.forEach(function( entity ) {
      entity.draw( ctx );
    });

    this.player.draw( ctx );
    this.camera.draw( ctx );

    if ( this.debugAABB ) {
      this.drawAABBs( ctx );
    }

    ctx.restore();

    this.input.draw( ctx );

    if ( this.text ) {
      ctx.font = this.font;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowBlur = 10;
      ctx.shadowColor = 'black';
      ctx.fillText( this.text, 0.5 * ctx.canvas.width, 0.25 * ctx.canvas.height );
      ctx.shadowBlur = 0;

      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    }
  };

  Game.prototype.updateDebug = function( dt ) {
    var aspectRatio = this.camera.width / this.camera.height;
    // Basic camera controls.
    // I. Zoom in.
    if ( this.input.keys[ 73 ] ) {
      this.camera.width = Math.max( this.camera.width - 1.5 * aspectRatio, 32 );
      this.camera.height = Math.max( this.camera.height - 1.5, 24 );
    }
    // J. Zoom out.
    if ( this.input.keys[ 74 ] ) {
      this.camera.width += 1.5 * aspectRatio;
      this.camera.height += 1.5;
    }
    // K. Rotate left.
    if ( this.input.keys[ 75 ] ) {
      this.camera.angle += dt;
    }
    // L. Rotate right.
    if ( this.input.keys[ 76 ] ) {
      this.camera.angle -= dt;
    }
    // O. Reset camera.
    if ( this.input.keys[ 79 ] ) {
      this.camera.width = 64;
      this.camera.height = 48;
      this.camera.angle = 0;
    }
  };

  Game.prototype.drawAABBs = function( ctx ) {
    ctx.beginPath();

    var aabb;
    this.entities.forEach(function( entity ) {
      aabb = entity.aabb();
      if ( aabb ) {
        ctx.rect( aabb.xmin, aabb.ymin, aabb.xmax - aabb.xmin, aabb.ymax - aabb.ymin );
      }
    });

    aabb = this.player.aabb();
    if ( aabb ) {
      ctx.rect( aabb.xmin, aabb.ymin, aabb.xmax - aabb.xmin, aabb.ymax - aabb.ymin );
    }

    aabb = this.camera.aabb();
    if ( aabb ) {
      ctx.rect( aabb.xmin, aabb.ymin, aabb.xmax - aabb.xmin, aabb.ymax - aabb.ymin );
    }

    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 0.2;
    ctx.stroke();
  };

  Game.prototype.drawDebug = function() {
    var debugCtx = this.debugCtx;

    var width  = debugCtx.canvas.width,
        height = debugCtx.canvas.height;

    debugCtx.clearRect( 0, 0, width, height );
    debugCtx.save();

    debugCtx.translate( 0.5 * width, 0.5 * height );
    this.world.DrawDebugData();

    debugCtx.restore();
  };

  Game.prototype.tick = function() {
    if ( !this.running ) {
      return;
    }

    this.update();
    this.draw();

    window.requestAnimationFrame( this.tick.bind( this ) );
  };

  Game.prototype.add = function( entity ) {
    this.entities.push( entity );
    entity.game = this;
  };

  Game.prototype.remove = function( entity ) {
    var index = this.entities.indexOf( entity );
    if ( index !== -1 ) {
      this.entities.splice( index, 1 );
      entity.game = null;
    }
  };

  Game.prototype.setPlayer = function( player ) {
    player.game = this;
    this.player = player;
  };

  /**
   * Clear the world before loading the level.
   */
  Game.prototype.clear = function() {
    this.entities = [];

    var world = this.world;
    world.ClearForces();

    var body = world.GetBodyList();
    while ( body ) {
      if ( !( body.GetUserData() instanceof Player ) ) {
        world.DestroyBody( body );
      }

      body = body.GetNext();
    }
  };

  Game.prototype.load = function( level ) {
    level.entities.forEach(function( entity ) {
      this.add( entity );
    }.bind( this ));
  };

  return Game;
});
