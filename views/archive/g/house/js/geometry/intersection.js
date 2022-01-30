/*globals define*/
define([
  'utils'
], function( Utils ) {
  'use strict';

  /**
   * Return if the two axis-aligned bounding-boxes intersect.
   */
  function aabb( a, b ) {
    return a.xmin <= b.xmax &&
           a.xmax >= b.xmin &&
           a.ymin <= b.ymax &&
           a.ymax >= b.ymin;
  }

  function linesParameter( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var det = ( x1 - x0 ) * ( y3 - y2 ) - ( x3 - x2 ) * ( y1 - y0 );
    if ( !det ) {
      return null;
    }

    return ( ( x3 - x2 ) * ( y0 - y2 ) - ( y3 - y2 ) * ( x0 - x2 ) ) / det;
  }

  function lines( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var t = linesParameter( x0, y0, x1, y1, x2, y2, x3, y3 );
    return Utils.lerp2d( x0, y0, x1, y1, t );
  }

  function segmentsParameter( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var s = linesParameter( x0, y0, x1, y1, x2, y2, x3, y3 ),
        t = linesParameter( x2, y2, x3, y3, x0, y0, x1, y1 );

    if ( s === null || t === null ) {
      return null;
    }

    if ( 0 > s || s > 1 ||
         0 > t || t > 1 ) {
      return null;
    }

    return t;
  }

  function segments( x0, y0, x1, y1, x2, y2, x3, y3 ) {
    var t = segmentsParameter( x0, y0, x1, y1, x2, y2, x3, y3 );
    return Utils.lerp2d( x0, y0, x1, y1, t );
  }

  function lineCircleParameter( x0, y0, x1, y1, cx, cy, r ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    // Transform line to circle space.
    x0 -= cx;
    y0 -= cy;

    // Compute coefficients.
    var a = ( dx * dx ) + ( dy * dy );
    var b = 2 * ( x0 * dx + y0 * dy );
    var c = ( x0 * x0 ) + ( y0 * y0 ) - ( r * r );

    // Compute discriminant.
    var d = b * b - 4 * a * c;

    // No intersection.
    if ( d < 0 ) {
      return [];
    }

    // One intersection.
    if ( !d ) {
      return [ -b / ( 2 * a ) ];
    }

    d = Math.sqrt( d );

    // Two intersections.
    return [
      ( -b - d ) / ( 2 * a ),
      ( -b + d ) / ( 2 * a )
    ];
  }

  function lineCircle( x0, y0, x1, y1, cx, cy, r ) {
    return lineCircleParameter( x0, y0, x1, y1, cx, cy, r ).map(function( t ) {
      return Utils.lerp2d( x0, y0, x1, y1, t );
    });
  }

  function segmentCircleParameter( x0, y0, x1, y1, cx, cy, r ) {
    return lineCircleParameter( x0, y0, x1, y1, cx, cy, r ).filter(function( t ) {
      return 0 <= t && t <= 1;
    });
  }

  function segmentCircle( x0, y0, x1, y1, cx, cy, r ) {
    return segmentCircleParameter( x0, y0, x1, y1, cx, cy, r ).map(function( t ) {
      return Utils.lerp2d( x0, y0, x1, y1, t );
    });
  }

  function closestPointOnLineParameter( x, y, x0, y0, x1, y1 ) {
    var dx = x1 - x0,
        dy = y1 - y0;

    // Check for line degeneracy.
    if ( !dx && !dy ) {
      return null;
    }

    var lengthSquared = dx * dx + dy * dy;

    return ( ( x - x0 ) * ( x1 - x0 ) + ( y - y0 ) * ( y1 - y0 ) ) / lengthSquared;
  }

  function closestPointOnLine( x, y, x0, y0, x1, y1 ) {
    var t = closestPointOnLineParameter( x, y, x0, y0, x1, y1 );
    return Utils.lerp2d( x0, y0, x1, y1, t );
  }

  function closestPointOnSegment( x, y, x0, y0, x1, y1 ) {
    var t = closestPointOnLineParameter( x, y, x0, y0, x1, y1 );

    if ( 0 > t ) {
      return {
        x: x0,
        y: y0
      };
    }

    if ( t > 1 ) {
      return {
        x: x1,
        y: y1
      };
    }

    return Utils.lerp2d( x0, y0, x1, y1, t );
  }

  function closestPointOnCircle( x, y, cx, cy, radius ) {
    var angle = Utils.angleFrom( cx, cy, x, y );
    return {
      x: cx + Math.cos( angle ) * radius,
      y: cy + Math.sin( angle ) * radius
    };
  }

  return {
    aabb: aabb,

    linesParameter: linesParameter,
    lines: lines,

    segmentsParameter: segmentsParameter,
    segments: segments,

    lineCircleParameter: lineCircleParameter,
    lineCircle: lineCircle,

    segmentCircleParameter: segmentCircleParameter,
    segmentCircle: segmentCircle,

    closestPointOnLineParameter: closestPointOnLineParameter,
    closestPointOnLine: closestPointOnLine,
    closestPointOnSegment: closestPointOnSegment,

    closestPointOnCircle: closestPointOnCircle
  };
});
