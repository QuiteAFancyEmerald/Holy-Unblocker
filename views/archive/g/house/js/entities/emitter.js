/*jshint bitwise: false*/
/*globals define*/
define([
  'entities/physics-entity',
  'entities/trash',
  'geometry/geometry-factory',
  'config/colors',
  'config/material',
  'config/settings',
  'utils'
], function( PhysicsEntity, Trash, GeometryFactory, Colors, Material, Settings, Utils ) {
  'use strict';

  var defaults = {
    aspectRatio: 0.1,

    portalRadiusRatio: 0.6,
    coneRadiusRatio: 1.5,
    coneLengthRatio: 2,

    speed: 0,

    // Both are in seconds.
    rate: 0,
    lifeTime: 0
  };

  function Emitter( x, y, options ) {
    PhysicsEntity.call( this, {
      fixture: {
        isSensor: true
      },
      body: {
        position: {
          x: x,
          y: y
        }
      }
    });

    Utils.defaults( this, options, defaults );

    this.spawnArea = null;
    this.particle = null;
    // Any custom particle physics properties go here.
    this.properties = {};

    this.time = 0;
    this.firing = false;
  }

  Emitter.prototype = new PhysicsEntity();
  Emitter.prototype.constructor = Emitter;

  Emitter.prototype.update = function( dt ) {
    PhysicsEntity.prototype.update.call( this, dt );

    if ( !this.firing ) {
      return;
    }

    this.time += dt;
    if ( this.time > this.rate ) {
      this.time = 0;
      this.fire();
    }
  };

  Emitter.prototype.fire = function() {
    if ( !this.particle || !this.game ) {
      return;
    }

    // Initial state of a random point.
    var state = this.random();

    // Create entities with the properties of the initial state.
    var entity = new Trash( this.properties, this.lifeTime );

    entity.x = state.x;
    entity.y = state.y;
    entity.accelerate( state.vx, state.vy );

    // Add any specified shapes.
    var particleJSON = JSON.stringify( this.particle );
    entity.add( GeometryFactory.create( particleJSON ) );

    this.game.add( entity );
  };

  /**
   * Get the initial position and acceleration of particle.
   */
  Emitter.prototype.random = function() {
    var x = this.x,
        y = this.y;

    var cos = 1,
        sin = 0;

    if ( this.angle ) {
      cos = Math.cos( -this.angle );
      sin = Math.sin( -this.angle );
    }

    // Spawn inside an area (rect, circle, segment).
    var point;
    if ( this.spawnArea ) {
      point = this.spawnArea.random();
      point = this.toWorld( point.x, point.y );
      x = point.x;
      y = point.y;
    }

    return {
      x: x,
      y: y,
      vx: cos * this.speed,
      vy: sin * this.speed
    };
  };

  Emitter.prototype.start = function( when ) {
    when = when || 0;

    setTimeout(function() {
      this.firing = true;
      this.time = 0;
    }.bind( this ), when );
  };

  Emitter.prototype.stop = function( when ) {
    when = when || 0;

    setTimeout(function() {
      this.firing = false;
    }.bind( this ), when );
  };

  Emitter.prototype.drawPath = function( ctx ) {
    var material = this.properties.fixture.filter.categoryBits;

    // The radius of the portal opening.
    var portalRadius = this.portalRadius;

    var coneRadius = portalRadius * this.coneRadiusRatio,
        coneLength = portalRadius * this.coneLengthRatio;

    var glowColor = Colors.Glow[ Material.type( material ) ];

    ctx.save();
    ctx.scale( this.aspectRatio, 1 );
    ctx.beginPath();

    // Draw warp hole.
    ctx.arc( 0, 0, portalRadius, 0, 2 * Math.PI );
    ctx.restore();

    ctx.fillStyle = '#000';
    ctx.fill();

    // Draw ring.
    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    if ( glowColor ) {
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 0.3 + Math.random() * 0.2;
      ctx.stroke();
    }

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.1;
    ctx.stroke();

    if ( Settings.gradients && glowColor ) {
      var grad = ctx.createLinearGradient( 0, 0, coneLength, 0 );
      grad.addColorStop( 0, glowColor );
      grad.addColorStop( 1, 'transparent' );

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo( 0, -portalRadius );
      ctx.lineTo( coneLength, -coneRadius );
      ctx.lineTo( coneLength,  coneRadius );
      ctx.lineTo( 0, portalRadius );
      ctx.fill();
    }

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }

    PhysicsEntity.prototype.drawPath.call( this, ctx );
  };

  Emitter.prototype.aabb = function() {
    return null;
  };

  Object.defineProperty( Emitter.prototype, 'portalRadius', {
    get: function() {
      return this.spawnArea.height * this.portalRadiusRatio;
    }
  });

  return Emitter;
});
