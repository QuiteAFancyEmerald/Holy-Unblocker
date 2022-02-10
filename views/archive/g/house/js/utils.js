/*globals define*/
define(function() {
  'use strict';

  var PI2 = 2 * Math.PI,
      HALF_PI = 0.5 * Math.PI;

  var RAD_TO_DEG = 180 / Math.PI,
      DEG_TO_RAD = Math.PI / 180;

  var EPSILON = 1e-1;

  function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
  }

  function randomFloat( min, max ) {
    return min + Math.random() * ( max - min );
  }

  function randomInt( min, max ) {
    return Math.round( randomFloat( min, max ) );
  }

  /**
   * Returns a float: value +/- spread.
   */
  function floatSpread( value, spread ) {
    return randomFloat( value - spread, value + spread );
  }

  /**
   * Returns an int: value +/- spread.
   */
  function intSpread( value, spread ) {
    return randomInt( value - spread, value + spread );
  }

  function lerp( a, b, t ) {
    return a + t * ( b - a );
  }

  function inverseLerp( value, a, b ) {
    return ( value - a ) / ( b - a );
  }

  /**
   * Project along the line given by [(x0, y0), (x1, y1)] by parameter.
   */
  function lerp2d( x0, y0, x1, y1, parameter ) {
    if ( parameter === null ) {
      return null;
    }

    return {
      x: lerp( x0, x1, parameter ),
      y: lerp( y0, y1, parameter )
    };
  }

  function distanceSquared( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    return dx * dx + dy * dy;
  }

  function distance( x0, y0, x1, y1 ) {
    return Math.sqrt( distanceSquared( x0, y0, x1, y1 ) );
  }

    /**
   * Rounds a value to the given precision, removes any trailing zeros produced
   * by Number.prototype.toFixed().
   *
   * Example:
   *   var x = 100;
   *   x.toFixed(2); // "100.00"
   *   round( 100, 2 ); // "100"
   */
  function round( value, precision ) {
    return parseFloat( value.toFixed( precision ) );
  }

  function roundNearZero( value, epsilon ) {
    return Math.abs( value ) > ( epsilon || EPSILON ) ? value : 0;
  }

  /**
   * Assuming the line is CW, the normal of the line is (-dy, dx).
   */
  function lineNormal( x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    var lengthSquared = dx * dx + dy * dy;
    if ( !lengthSquared ) {
      return null;
    }

    var invLength = 1 / Math.sqrt( lengthSquared );
    return {
      x:  dy * invLength,
      y: -dx * invLength
    };
  }

  function angleFrom( x0, y0, x1, y1 ) {
    return Math.atan2( y1 - y0, x1 - x0 );
  }

  /**
   * Remove all values in array with an index in indices.
   */
  function removeIndices( array, indices ) {
    indices.sort();

    var index = indices.length;
    while( index-- ) {
      array.splice( indices[ index ], 1 );
    }
  }

  /**
   * Set the pre-existing properties of a given object with the values in attrs.
   * Recursively handles properties that are also objects.
   */
  function set( object, attrs ) {
    if ( !object || !attrs ) {
      return;
    }

    for ( var key in attrs ) {
      if ( object.hasOwnProperty( key ) ) {
        if ( typeof object[ key ] === 'object' &&
             typeof  attrs[ key ] === 'object' ) {
          set( object[ key ], attrs[ key ] );
        } else {
          object[ key ] = attrs[ key ];
        }
      }
    }
  }

  /**
   * Sets any undefined values to given default values.
   * Can have more than one defaults object.
   *
   * This is pretty much underscore.js's defaults().
   */
  function defaults( object ) {
    var args = [].slice.call( arguments, 1 );

    args.forEach(function( arg ) {
      if ( arg ) {
        for ( var key in arg ) {
          if ( typeof object[ key ] === 'undefined' ) {
            object[ key ] = arg[ key ];
          }
        }
      }
    });

    return object;
  }

  /**
   * Rotates the axis-aligned bounding box defined by
   * [(left, top), (right, bottom)] by rotation. Translates by (tx, ty).
   */
  function rotateAABB( tx, ty, left, top, right, bottom, rotation ) {
    var cos = Math.cos( -rotation ),
        sin = Math.sin( -rotation );

    // Coordinates of rotated extents.
    var x = [],
        y = [];

    // Top left.
    x.push( cos * left - sin * top );
    y.push( sin * left + cos * top );

    // Bottom left.
    x.push( cos * left - sin * bottom );
    y.push( sin * left + cos * bottom );

    // Top right.
    x.push( cos * right - sin * top );
    y.push( sin * right + cos * top );

    // Bottom right.
    x.push( cos * right - sin * bottom );
    y.push( sin * right + cos * bottom );

    return {
      xmin: Math.min.apply( null, x ) + tx,
      ymin: Math.min.apply( null, y ) + ty,
      xmax: Math.max.apply( null, x ) + tx,
      ymax: Math.max.apply( null, y ) + ty
    };
  }

  function relativeExpandAABB( aabb, dw, dh ) {
    dw *= 0.5;
    dh *= 0.5;

    return {
      xmin: aabb.xmin - dw,
      ymin: aabb.ymin - dh,
      xmax: aabb.xmax + dw,
      ymax: aabb.ymax + dh
    };
  }

  function expandAABB( aabb, width, height ) {
    var dw = width  - ( aabb.xmax - aabb.xmin ),
        dh = height - ( aabb.ymax - aabb.ymin );

    return relativeExpandAABB( aabb, dw, dh );
  }

  function ratioExpandAABB( aabb, widthRatio, heightRatio ) {
    var dw = aabb.xmax - aabb.xmin,
        dh = aabb.ymax - aabb.ymin;

    dw = ( dw *  widthRatio ) - dw;
    dh = ( dh * heightRatio ) - dh;

    return relativeExpandAABB( aabb, dw, dh );
  }


  return {
    PI2: PI2,
    HALF_PI: HALF_PI,

    RAD_TO_DEG: RAD_TO_DEG,
    DEG_TO_RAD: DEG_TO_RAD,

    EPSILON: EPSILON,

    clamp: clamp,

    randomFloat: randomFloat,
    randomInt: randomInt,

    floatSpread: floatSpread,
    intSpread: intSpread,

    lerp: lerp,
    inverseLerp : inverseLerp,
    lerp2d: lerp2d,

    distanceSquared: distanceSquared,
    distance: distance,

    round: round,
    roundNearZero: roundNearZero,
    lineNormal: lineNormal,
    angleFrom: angleFrom,

    removeIndices: removeIndices,

    set: set,
    defaults: defaults,

    rotateAABB: rotateAABB,

    expandAABB: expandAABB,
    ratioExpandAABB: ratioExpandAABB,
    relativeExpandAABB: relativeExpandAABB
  };
});
