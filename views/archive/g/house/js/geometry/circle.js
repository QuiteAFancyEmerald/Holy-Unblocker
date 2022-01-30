/*globals define*/
define([
  'object2d',
  'utils'
], function( Object2D, Utils ) {
  'use strict';

  function Circle( x, y, radius ) {
    Object2D.call( this, x, y );

    this.radius = radius || 0;
  }

  Circle.prototype = new Object2D();
  Circle.prototype.constructor = Circle;

  Circle.prototype.drawPath = function( ctx ) {
    ctx.beginPath();
    ctx.arc( 0, 0, this.radius, 0, 2 * Math.PI );
    ctx.closePath();
  };

  Circle.prototype.random = function() {
    // Calculates r in [0, 1) and theta in [0, 2PI).
    // Note that using sqrt() results in a uniform distribution:
    //   x^2 + y^2 = r^2.
    var radius = this.radius * Math.sqrt( Math.random() ),
        theta  = 2 * Math.PI * Math.random();

    return {
      x: radius * Math.cos( theta ),
      y: radius * Math.sin( theta )
    };
  };

  Circle.prototype.contains = function( x, y ) {
    return Utils.distanceSquared( x, y, this.x, this.y ) <= this.radius * this.radius;
  };

  Object.defineProperty( Circle.prototype, 'left', {
    get: function() {
      return this.x - this.radius;
    },

    set: function( left ) {
      this.x = left + this.radius;
    }
  });

  Object.defineProperty( Circle.prototype, 'right', {
    get: function() {
      return this.x + this.radius;
    },

    set: function( right ) {
      this.x = right - this.radius;
    }
  });

  Object.defineProperty( Circle.prototype, 'top', {
    get: function() {
      return this.y - this.radius;
    },

    set: function( top ) {
      this.y = top + this.radius;
    }
  });

  Object.defineProperty( Circle.prototype, 'bottom', {
    get: function() {
      return this.y + this.radius;
    },

    set: function( bottom ) {
      this.y = bottom - this.radius;
    }
  });

  Object.defineProperty( Circle.prototype, 'diameter', {
    get: function() {
      return this.radius * 2;
    }
  });

  Object.defineProperty( Circle.prototype, 'width', {
    get: function() {
      return this.diameter;
    }
  });

  Object.defineProperty( Circle.prototype, 'height', {
    get: function() {
      return this.diameter;
    }
  });

  return Circle;
});
