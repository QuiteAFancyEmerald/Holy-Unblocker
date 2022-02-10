/*globals define*/
define([
  'object2d',
  'utils'
], function( Object2D, Utils ) {
  'use strict';

  function Segment( x0, y0, x1, y1 ) {
    Object2D.call( this, 0, 0 );

    this.x0 = x0 || 0;
    this.y0 = y0 || 0;
    this.x1 = x1 || 0;
    this.y1 = y1 || 0;
  }

  Segment.prototype = new Object2D();
  Segment.prototype.constructor = Segment;

  Segment.prototype.drawPath = function( ctx ) {
    ctx.beginPath();
    ctx.moveTo( this.x0, this.y0 );
    ctx.lineTo( this.x1, this.y1 );
    ctx.closePath();
  };

  Segment.prototype.drawNormals = function( ctx, options ) {
    options = options || {};

    var length    = options.length || 10,
        lineWidth = options.lineWidth || 2,
        stroke    = options.stroke || '#0f0';

    ctx.beginPath();

    var x0 = this.x0,
        y0 = this.y0,
        x1 = this.x1,
        y1 = this.y1;

    var mx = 0.5 * ( x0 + x1 ),
        my = 0.5 * ( y0 + y1 );

    var normal = Utils.lineNormal( x0, y0, x1, y1 );
    if ( !normal ) {
      return;
    }

    ctx.moveTo( mx, my );
    ctx.lineTo( mx + normal.x * length, my + normal.y * length );

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  };

  Segment.prototype.random = function() {
    return Utils.lerp2d(
      this.x0, this.y0,
      this.x1, this.y1,
      Math.random()
    );
  };

  Object.defineProperty( Segment.prototype, 'width', {
    get: function() {
      return Math.abs( this.x1 - this.x0 );
    }
  });

  Object.defineProperty( Segment.prototype, 'height', {
    get: function() {
      return Math.abs( this.y1 - this.y0 );
    }
  });

  return Segment;
});
