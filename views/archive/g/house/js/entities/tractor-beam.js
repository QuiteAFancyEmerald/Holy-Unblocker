/*globals define*/
define([
  'entities/physics-entity',
  'geometry/rect',
  'config/settings',
  'utils'
], function( PhysicsEntity, Rect, Settings, Utils ) {
  'use strict';

  var defaults = {
    particleCount: 10,
    particleWidth: 0.05,
    particleHeight: 3
  };

  function TractorBeam( x, y, distance, width, options ) {
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

    // Width of the tractor beam effect.
    this.width = width || 0;
    // Distance to which tractor beam affects other physics entities.
    this.distance = distance || 0;
    // Strength of the tractor beam.
    this.force = 0;

    this.particles = [];
    this.construct();
  }

  TractorBeam.prototype = new PhysicsEntity();
  TractorBeam.prototype.constructor = TractorBeam;

  TractorBeam.prototype.construct = function() {
    var particleCount = this.particleCount;

    var chevronDistance = this.distance + 0.5 * this.particleHeight;
    var spacing = chevronDistance / particleCount;
    while ( particleCount-- ) {
      this.particles.push( particleCount * spacing );
    }
  };

  TractorBeam.prototype.draw = function( ctx ) {
    PhysicsEntity.prototype.draw.call( this, ctx );

    var halfWidth = 0.5 * this.width;

    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( -this.angle );

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    // Draw endpoints.
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo( 0, -halfWidth );
    ctx.lineTo( 0,  halfWidth );
    ctx.moveTo( this.distance, -halfWidth );
    ctx.lineTo( this.distance, halfWidth );

    ctx.lineWidth = 0.3;
    ctx.strokeStyle = '#ddd';
    ctx.stroke();

    ctx.lineCap = 'butt';

    // Draw path.
    ctx.beginPath();
    ctx.rect( 0, -0.5 * this.width, this.distance, this.width );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();

    // Draw particle chevrons.
    var halfParticleHeight = 0.5 * this.particleHeight;

    // Keep chevrons inside the path.
    ctx.save();
    ctx.clip();

    ctx.beginPath();
    this.particles.forEach(function( x ) {
      ctx.moveTo( x - halfParticleHeight, -halfParticleHeight );
      ctx.lineTo( x,  0 );
      ctx.lineTo( x - halfParticleHeight,  halfParticleHeight );
    }.bind( this ));

    ctx.lineWidth = this.particleWidth;
    ctx.strokeStyle = '#aaa';
    ctx.stroke();

    ctx.restore();

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  };

  TractorBeam.prototype.update = function( dt ) {
    PhysicsEntity.prototype.update.call( this, dt );

    if ( !this.game ) {
      return;
    }

    var force = this.force * dt;
    this.updateParticles( force );

    var cos = Math.cos( -this.angle ),
        sin = Math.sin( -this.angle );

    var halfWidth = 0.5 * this.width;

    // Replace with a sensor.
    var entities = this.game.entities.concat( this.game.player );
    entities.forEach(function( entity ) {
      if ( !( entity instanceof PhysicsEntity ) ||
          entity === this ) {
        return;
      }

      var point = this.toLocal( entity.x, entity.y );
      var x = point.x,
          y = point.y;

      if ( -halfWidth <= y && y <= halfWidth &&
            0 <= x && x <= this.distance ) {
        entity.accelerate( cos * force, sin * force );
      }

    }.bind( this ));
  };

  TractorBeam.prototype.updateParticles = function( force ) {
    // Slow it down to resemble ingame effect.
    force *= 1e-2;

    // Keep particle chevrons within path.
    var chevronDistance = this.distance + 0.5 * this.particleHeight;
    for ( var i = 0, il = this.particles.length; i < il; i++ ) {
      this.particles[i] = ( this.particles[i] + force ) % chevronDistance;
    }
  };

  TractorBeam.prototype.aabb = function() {
    return null;
  };

  return TractorBeam;
});
