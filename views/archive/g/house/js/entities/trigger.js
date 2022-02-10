/*jshint camelcase: false*/
/*globals define*/
define([
  'entities/physics-entity',
  'config/colors',
  'config/material',
  'config/settings',
  'utils'
], function( PhysicsEntity, Colors, Material, Settings, Utils ) {
  'use strict';

  var HALF_PI = Utils.HALF_PI;

  var defaults = {
    duration: 0.4,

    // So we know the actual drawn size.
    frameRatio: 1.2,

    platformAngle: 0,
    platformAngularVelocity: 2
  };

  function Trigger( x, y, radius, material, options ) {
    this.radius = radius || 0;

    PhysicsEntity.call( this, {
      shape: 'circle',
      radius: this.radius,
      fixture: {
        isSensor: true,
        filter: {
          categoryBits: material
        }
      },
      body: {
        position: {
          x: x,
          y: y
        }
      }
    });

    Utils.defaults( this, options, defaults );

    this.object = null;
    // If there is an object AND the trigger has caught it.
    this.active = false;

    this.time = 0;
  }

  Trigger.prototype = new PhysicsEntity();
  Trigger.prototype.constructor = Trigger;

  Trigger.prototype.update = function( dt ) {
    PhysicsEntity.prototype.update.call( this, dt );

    // When the correct trash object enters the trigger,
    // set its lifeTime to infinite.
    if ( this.object && !this.active ) {
      this.object.x = this.x;
      this.object.y = this.y;
      this.object.vx = 0;
      this.object.vy = 0;
      this.object.fixture.SetSensor( true );
      if ( typeof this.object.lifeTime !== 'undefined' ) {
        this.object.lifeTime = Number.POSITIVE_INFINITY;
      }

      this.active = true;

      // Super hacky last minute audio.
      var sound = document.getElementById( 'trigger-activate-audio' );
      if ( sound ) {
        sound.volume = 0.1;
        sound.load();
        sound.play();
      }
    }

    // Opening animation.
    if ( this.active && this.time < this.duration ) {
      this.time += dt;
    }

    // Rotating animation.
    if ( this.active ) {
      this.platformAngle += this.platformAngularVelocity * dt;
    }
  };

  Trigger.prototype.drawPath = function( ctx ) {
    var radius = this.radius;

    var size = this.frameRatio * ( 2 * radius ),
        halfSize = 0.5 * size,
        quarterSize = 0.5 * halfSize;

    // Draw base.
    ctx.beginPath();
    ctx.rect( -halfSize, -halfSize, size, size );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fill();

    // Draw frame/border.
    var glowColor = Colors.Glow[ Material.type( this.material ) ];

    if ( glowColor ) {
      ctx.beginPath();

      // Top left.
      ctx.moveTo( -quarterSize, -halfSize );
      ctx.lineTo( -halfSize, -halfSize );
      ctx.lineTo( -halfSize, -quarterSize );

      // Bottom left.
      ctx.moveTo( -halfSize, quarterSize );
      ctx.lineTo( -halfSize, halfSize );
      ctx.lineTo( -quarterSize, halfSize );

      // Bottom right.
      ctx.moveTo( quarterSize, halfSize );
      ctx.lineTo( halfSize, halfSize );
      ctx.lineTo( halfSize, quarterSize );

      // Top right.
      ctx.moveTo( halfSize, -quarterSize );
      ctx.lineTo( halfSize, -halfSize );
      ctx.lineTo( quarterSize, -halfSize );

      ctx.lineWidth = 0.3 * radius;
      ctx.strokeStyle = glowColor;
      ctx.stroke();

      ctx.lineWidth = 0.1 * radius;
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }

    var halfRadius = 0.5 * radius;

    var t = 1;
    if ( this.time < this.duration ) {
      t = this.time / this.duration;
    }

    t *= 0.5 * halfRadius;

    if ( this.platformAngle ) {
      ctx.save();
      ctx.rotate( this.platformAngle );
    }

    // Draw beams.
    if ( glowColor && this.time >= this.duration ) {
      if ( Settings.glow ) {
        ctx.globalCompositeOperation = 'lighter';
      }

      // 45 degrees.
      var diagonal = 0.5 * Math.sqrt( 2 ) * halfRadius;

      ctx.beginPath();
      // Left diagonal.
      ctx.moveTo( -t - diagonal, -t - diagonal );
      ctx.lineTo(  t + diagonal,  t + diagonal );
      // Right diagonal.
      ctx.moveTo(  t + diagonal, -t - diagonal );
      ctx.lineTo( -t - diagonal,  t + diagonal );

      ctx.lineWidth = ( 0.3 + Math.random() * 0.2 )  * radius;
      ctx.strokeStyle = glowColor;
      ctx.stroke();

      ctx.lineWidth = 0.2 * radius;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      if ( Settings.glow ) {
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // Draw sensor.
    ctx.beginPath();

    // Top left.
    ctx.moveTo( -halfRadius - t, -t );
    ctx.arc( -t, -t, halfRadius, -Math.PI, -HALF_PI );

    // Top right.
    ctx.moveTo( t, -halfRadius - t );
    ctx.arc( t, -t, halfRadius, -HALF_PI, 0 );

    // Bottom right.
    ctx.moveTo( halfRadius + t, t );
    ctx.arc( t, t, halfRadius, 0, HALF_PI );

    // Bottom left.
    ctx.moveTo( -t, halfRadius + t );
    ctx.arc( -t, t, halfRadius, HALF_PI, Math.PI );

    ctx.lineWidth = 0.5 * radius;
    ctx.strokeStyle = '#333';
    ctx.stroke();

    ctx.lineWidth = 0.2 * radius;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    if ( this.platformAngle ) {
      ctx.restore();
    }

    PhysicsEntity.prototype.drawPath.call( this, ctx );
  };

  Trigger.prototype.aabb = function() {
    var aabb = PhysicsEntity.prototype.aabb.call( this );
    // Add half lineWidth of frame.
    var ratio = this.frameRatio + 0.15;
    return Utils.ratioExpandAABB( aabb, ratio, ratio );
  };

  return Trigger;
});
