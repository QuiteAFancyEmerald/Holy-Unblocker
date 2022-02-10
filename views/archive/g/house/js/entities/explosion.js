/*globals define*/
define([
  'entities/entity',
  'utils',
  'config/settings'
], function( Entity, Utils, Settings ) {
  'use strict';

  var PI2 = Utils.PI2;

  var defaults = {
    particleCount: 10,

    radius: 1.0,
    radiusSpread: 0.6,

    minRadius: 0.05,

    drag: 0.925,
    dragSpread: 0.025,

    force: 10,
    forceSpread: 5,

    spin: 1.5,
    spinSpread: 0.5,

    shrink: 0.95
  };

  function Explosion( x, y, options ) {
    Entity.call( this, x, y );

    this.area = null;
    this.particles = [];

    Utils.defaults( this, options, defaults );

    this.initialize();
  }

  Explosion.prototype = new Entity();
  Explosion.prototype.constructor = Explosion;

  Explosion.prototype.initialize = function() {
    var particleCount = this.particleCount;

    var x, y;
    var point;
    var angle, force;
    while ( particleCount-- ) {
      x = 0;
      y = 0;

      if ( this.area ) {
        point = this.area.random();
        x = point.x;
        y = point.y;
      }

      angle = Math.random() * PI2;
      force = Utils.floatSpread( this.force, this.forceSpread );

      this.particles.push({
        x: x,
        y: y,
        radius: Utils.floatSpread( this.radius, this.radiusSpread ),
        angle: angle,
        vx: Math.cos( angle ) * force,
        vy: Math.sin( angle ) * force,
        drag: Utils.floatSpread( this.drag, this.dragSpread ),
        spin: Utils.floatSpread( this.spin, this.spinSpread )
      });
    }
  };

  Explosion.prototype.update = function( dt ) {
    Entity.prototype.update.call( this, dt );

    var removed = [];
    this.particles.forEach(function( particle, index ) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      particle.vx *= particle.drag;
      particle.vy *= particle.drag;

      particle.angle += Utils.randomFloat( -0.5, 0.5 ) * particle.spin;

      particle.vx += Math.cos( particle.angle ) * 0.1;
      particle.vy += Math.sin( particle.angle ) * 0.1;

      particle.radius *= this.shrink;
      if ( particle.radius < this.minRadius ) {
        removed.push( index );
      }
    }.bind( this ));

    Utils.removeIndices( this.particles, removed );

    if ( !this.particles.length ) {
      this.game.removed.push( this );
    }
  };

  Explosion.prototype.draw = function( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( -this.angle );

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    ctx.fillStyle = this.fill.rgba();
    this.particles.forEach(function( particle ) {
      ctx.beginPath();
      ctx.arc( particle.x, particle.y, particle.radius, 0, PI2 );
      ctx.fill();
    });

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  };

  Explosion.prototype.aabb = function() {
    return {
      xmin: this.x - 8,
      ymin: this.y - 8,
      xmax: this.x + 8,
      ymax: this.y + 8
    };
  };

  return Explosion;
});
