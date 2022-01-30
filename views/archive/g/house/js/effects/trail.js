/*globals define*/
define([
  'base-object',
  'utils',
  'color',
  'config/settings'
], function( BaseObject, Utils, Color, Settings ) {
  'use strict';

  var PI2 = Utils.PI2;

  var defaults = {
    shrink: 0.95,
    radius: 1.5,
  };

  function Trail( options ) {
    BaseObject.call( this );

    this.target = null;
    this.particles = [];
    this.fill = new Color();
    this.period = 1 / 4;

    Utils.defaults( this, options, defaults );

    this.time = 0;
    this.game = null;
  }

  Trail.prototype = new BaseObject();
  Trail.prototype.constructor = Trail;

  Trail.prototype.update = function( dt ) {
    if ( !Settings.trail ) {
      return;
    }

    this.time += dt;

    if ( this.time > this.period ) {
      this.time = 0;

      // If the target is moving, add a trail particle.
      if ( this.target && ( this.target.vx || this.target.vy ) ) {
        var x = this.target.x,
            y = this.target.y;

        this.particles.push({
          x: x,
          y: y,
          radius: this.radius
        });
      }
    }

    var removed = [];
    this.particles.forEach(function( particle, index ) {
      particle.radius *= this.shrink;
      if ( particle.radius < this.minRadius ) {
        removed.push( index );
      }
    }.bind( this ));

    Utils.removeIndices( this.particles, removed );
  };

  Trail.prototype.draw = function( ctx ) {
    if ( !this.particles.length || !Settings.trail ) {
      return;
    }

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    ctx.beginPath();

    this.particles.forEach(function( particle ) {
      ctx.moveTo( particle.x, particle.y );
      ctx.arc( particle.x, particle.y, particle.radius, 0, PI2 );
    }.bind( this ));

    ctx.fillStyle = this.fill.rgba();
    ctx.fill();

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  Trail.prototype.aabb = function() {
    return null;
  };

  Object.defineProperty( Trail.prototype, 'frequency', {
    get: function() {
      return 1 / this.period;
    },

    set: function( frequency ) {
      this.period = 1 / frequency;
    }
  });

  return Trail;
});
