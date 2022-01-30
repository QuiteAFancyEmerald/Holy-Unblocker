/*globals define*/
define([
  'object2d',
  'utils'
], function( Object2D, Utils ) {
  'use strict';

  function Polygon( x, y ) {
    Object2D.call( this, x, y );

    this.vertices = [];
  }

  Polygon.prototype = new Object2D();
  Polygon.prototype.constructor = Polygon;

  Polygon.prototype.draw = function( ctx ) {
    if ( !this.vertices.length ) {
      return;
    }

    Object2D.prototype.draw.call( this, ctx );
  };

  Polygon.prototype.drawPath = function( ctx ) {
    var vertexCount = this.vertexCount();

    ctx.beginPath();

    ctx.moveTo( this.vertices[0], this.vertices[1] );
    for ( var i = 1; i < vertexCount; i++ ) {
      ctx.lineTo( this.vertices[ 2 * i ], this.vertices[ 2 * i + 1 ] );
    }

    ctx.closePath();
  };

  Polygon.prototype.drawNormals = function( ctx, options ) {
    options = options || {};

    var length    = options.length || 10,
        lineWidth = options.lineWidth || 2,
        stroke    = options.stroke || '#0f0';

    var vertexCount = this.vertexCount();

    ctx.beginPath();

    var xi, yi, xj, yj;
    var mx, my;
    var normal;
    for ( var i = 0; i < vertexCount; i++ ) {
      xi = this.vertices[ 2 * i ];
      yi = this.vertices[ 2 * i + 1 ];
      xj = this.vertices[ 2 * ( ( i + 1 ) % vertexCount ) ];
      yj = this.vertices[ 2 * ( ( i + 1 ) % vertexCount ) + 1 ];

      mx = 0.5 * ( xi + xj );
      my = 0.5 * ( yi + yj );

      normal = Utils.lineNormal( xi, yi, xj, yj );
      if ( !normal ) {
        continue;
      }

      ctx.moveTo( mx, my );
      ctx.lineTo( mx + normal.x * length, my + normal.y * length );
    }

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  };

  Polygon.prototype.vertexCount = function() {
    return 0.5 * this.vertices.length;
  };

  Polygon.prototype.contains = function( x, y ) {
    var vertexCount = this.vertexCount();

    var point = this.toLocal( x, y );
    x = point.x;
    y = point.y;

    var contains = false;
    var xi, yi, xj, yj;
    for ( var i = 0, j = vertexCount - 1; i < vertexCount; j = i++ ) {
      xi = this.vertices[ 2 * i ];
      yi = this.vertices[ 2 * i + 1 ];
      xj = this.vertices[ 2 * j ];
      yj = this.vertices[ 2 * j + 1 ];

      if ( ( ( yi > y ) !== ( yj > y ) ) &&
           ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi ) ) {
        contains = !contains;
      }
    }

    return contains;
  };

  return Polygon;
});
