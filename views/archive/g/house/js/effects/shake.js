/*globals define*/
define([
  'utils'
], function( Utils ) {
  'use strict';

  function Shake() {
    this.magnitude = 0;
    this.duration = 0;

    this.time = 0;

    // Variables pertaining to the current shake cycle.
    // Change shake angle at frequency (20 fps).
    this.shakePeriod = 1 / 20;
    this.shakeTime = 0;
    this.shakeMagnitude = 0;
    this.shakeAngle = 0;
  }

  Shake.prototype.applyTransform = function( ctx ) {
    if ( !this.magnitude ) {
      return;
    }

    ctx.translate(
      Math.cos( this.shakeAngle ) * this.shakeMagnitude,
      Math.sin( this.shakeAngle ) * this.shakeMagnitude
    );
  };

  Shake.prototype.update = function( dt ) {
    if ( !this.magnitude ) {
      return;
    }

    this.time += dt;
    if ( this.time > this.duration ) {
      this.magnitude = 0;
      this.time = 0;
      return;
    }

    this.shakeTime += dt;
    // A new oscillation!
    if ( this.shakeTime > this.shakePeriod ) {
      this.shakeTime = 0;
      this.shakeAngle = Math.random() * Utils.PI2;

      // Lerp scale magnitude down to zero.
      var scale = ( this.duration - this.time ) / this.duration;
      this.shakeMagnitude = this.magnitude * scale;
    }
  };

  Shake.prototype.shake = function( magnitude, duration ) {
    this.magnitude = magnitude || 0;
    this.duration  = duration || 0;

    this.update(0);
  };

  Object.defineProperty( Shake.prototype, 'frequency', {
    get: function() {
      return 1 / this.shakePeriod;
    },

    set: function( frequency ) {
      this.shakePeriod = 1 / frequency;
    }
  });

  return Shake;
});
