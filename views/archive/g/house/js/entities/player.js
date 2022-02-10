/*jshint bitwise: false*/
/*globals define*/
define([
  'box2d',
  'entities/physics-entity',
  'config/colors',
  'config/material',
  'config/settings',
  'utils'
], function( Box2D, PhysicsEntity, Colors, Material, Settings, Utils ) {
  'use strict';

  var PI2 = Utils.PI2;

  var Emotion = {
    NORMAL: 0,
    HIT: 1
  };

  function Player( x, y ) {
    PhysicsEntity.call( this, {
      shape: 'circle',
      radius: 3,
      fixture: {
        density: 0.25,
        friction: 0.5,
        restitution: 0.2,
        filter: {
          categoryBits: Material.MATTER
        }
      },
      body: {
        position: {
          x: x,
          y: y
        },
        linearDamping: 2,
        angularDamping: 0.1,
        type: 'dynamic'
      }
    });

    this.emotion = Emotion.NORMAL;
    this.emotionTimeout = null;
  }

  Player.Emotion = Emotion;

  Player.prototype = new PhysicsEntity();
  Player.prototype.constructor = Player;

  Player.prototype.draw = function( ctx ) {
    // 0.4 compensates for the difference between the drawn and fixture radii.
    // The drawn ring is at a radius of 0.35 with a maximum lineWidth of 0.18.
    // This results in a total relative width of (0.35 + 0.09) * 2 = 0.88.
    // 0.88 * 3 (physical radius) = 2.64 (draw radius).
    // Whereas:
    // 0.88 * (3 + 0.4) = 2.992, which gives some spacing.
    var radius = this.fixture.GetShape().GetRadius() + 0.4;

    var width  = 2 * radius,
        height = 2 * radius;

    ctx.save();
    ctx.translate( this.x, this.y );
    if ( this.angle ) {
      ctx.rotate( this.angle );
    }

    // Draw casing.
    ctx.lineWidth = 0.05 * width;

    // Top left.
    ctx.beginPath();
    ctx.arc( 0, 0, 0.22 * width, -Math.PI, -0.5 * Math.PI );
    ctx.strokeStyle = '#fef';
    ctx.stroke();

    // Top right.
    ctx.beginPath();
    ctx.arc( 0, 0, 0.22 * width, -0.5 * Math.PI, 0 );
    ctx.strokeStyle = '#cbe';
    ctx.stroke();

    // Bottom right.
    ctx.beginPath();
    ctx.arc( 0, 0, 0.22 * width, 0, 0.5 * Math.PI );
    ctx.strokeStyle = '#98b';
    ctx.stroke();

    // Bottom left.
    ctx.beginPath();
    ctx.arc( 0, 0, 0.22 * width, 0.5 * Math.PI, Math.PI );
    ctx.strokeStyle = '#658';
    ctx.stroke();

    // Draw main body.
    ctx.beginPath();
    ctx.arc( 0, 0, 0.2 * width, 0, PI2 );
    ctx.fillStyle = '#ecf';
    ctx.fill();

    // Strokes.
    ctx.lineWidth = 0.02 * width;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc( 0, 0, 0.18 * width, 0, PI2 );
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    if ( this.angle ) {
      ctx.save();
      ctx.rotate( -this.angle - this.game.camera.angle );
    }

    this.drawFace( ctx, width, height );

    if ( this.angle ) {
      ctx.restore();
    }

    this.drawRing( ctx, width );
  };

  Player.prototype.drawFace = function( ctx, width, height ) {
    var faceColor = Colors.Face;

    // Determine direction of movement.
    var dx = Utils.inverseLerp( Math.abs( this.vx ), 0, 20 ),
        dy = Utils.inverseLerp( Math.abs( this.vy ), 0, 20 );

    dx = Utils.clamp( dx, 0, 1 );
    dy = Utils.clamp( dy, 0, 1 );

    dx *= this.vx < 0 ? -1 : 1;
    dy *= this.vy < 0 ? -1 : 1;

    dx *= 0.05 * width;
    dy *= 0.05 * width;

    dx += this.game.camera.x;
    dy += this.game.camera.y;

    var d = this.game.camera.toLocal( dx, dy );
    dx = d.x;
    dy = d.y;

    if ( this.emotion === Emotion.NORMAL ) {
      // Draw eyes.
      ctx.beginPath();

      ctx.save();
      ctx.scale( 0.6, 1 );

      // // Draw left eye.
      ctx.arc( -0.12 * width + dx, dy, 0.07 * width, 0, PI2 );
      // // Draw right eye.
      ctx.arc(  0.12 * width + dx, dy, 0.07 * width, 0, PI2 );

      ctx.fillStyle = faceColor;
      ctx.fill();
      ctx.restore();
    } else if ( this.emotion === Emotion.HIT ) {
      // Draw X.
      ctx.beginPath();
      ctx.lineCap = 'round';

      // Smaller eye movements.
      dx *= 0.5;
      dy *= 0.5;

      // Left diagonal.
      ctx.moveTo( -0.08 * width + dx, -0.07 * height + dy );
      ctx.lineTo(  0.08 * width + dx,  0.07 * height + dy );
      // Right diagonal.
      ctx.moveTo( -0.08 * width + dx,  0.07 * height + dy );
      ctx.lineTo(  0.08 * width + dx, -0.07 * height + dy );

      ctx.lineWidth = 0.04 * width;
      ctx.strokeStyle = faceColor;
      ctx.stroke();

      ctx.lineCap = 'butt';
    }
  };

  Player.prototype.drawRing = function( ctx, width ) {
    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    ctx.beginPath();
    ctx.arc( 0, 0, 0.35 * width, 0, PI2 );

    var glowColor = Colors.Glow[ Material.type( this.material ) ];

    if ( glowColor ) {
      ctx.lineWidth = ( 0.1 + Math.random() * 0.08 ) * width;
      ctx.strokeStyle = glowColor;
      ctx.stroke();
    }

    ctx.lineWidth = 0.07 * width;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  };

  Player.prototype.toggleMaterial = function() {
    this.material = this.material ^ ( Material.MATTER | Material.ANTIMATTER );
  };

  return Player;
});
