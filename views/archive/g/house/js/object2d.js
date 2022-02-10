/*globals define*/
define([
  'base-object',
  'color'
], function( BaseObject, Color ) {
  'use strict';

  function Object2D( x, y ) {
    BaseObject.call( this );

    this.x = x || 0;
    this.y = y || 0;

    this.angle = 0;

    this.fill   = new Color();
    this.stroke = new Color();

    this.lineWidth = 0;
  }

  Object2D.prototype = new BaseObject();
  Object2D.prototype.constructor = Object2D;

  Object2D.prototype.update = function() {};
  Object2D.prototype.drawPath = function() {};

  Object2D.prototype.draw = function( ctx ) {
    ctx.save();

    ctx.translate( this.x, this.y );
    ctx.rotate( -this.angle );

    this.drawPath( ctx );

    ctx.restore();

    if ( this.fill.alpha ) {
      ctx.fillStyle = this.fill.rgba();
      ctx.fill();
    }

    if ( this.lineWidth && this.stroke.alpha ) {
      ctx.lineWidth = this.lineWidth;
      ctx.strokeStyle = this.stroke.rgba();
      ctx.stroke();
    }
  };

  Object2D.prototype.toWorld = function( x, y ) {
    var cos, sin;
    var rx, ry;

    if ( this.angle ) {
      cos = Math.cos( -this.angle );
      sin = Math.sin( -this.angle );

      rx = cos * x - sin * y;
      ry = sin * x + cos * y;

      x = rx;
      y = ry;
    }

    return {
      x: x + this.x,
      y: y + this.y
    };
  };

  Object2D.prototype.toLocal = function( x, y ) {
    x -= this.x;
    y -= this.y;

    var cos, sin;
    var rx, ry;

    if ( this.angle ) {
      cos = Math.cos( this.angle );
      sin = Math.sin( this.angle );

      rx = cos * x - sin * y;
      ry = sin * x + cos * y;

      x = rx;
      y = ry;
    }

    return {
      x: x,
      y: y
    };
  };

  Object2D.prototype.aabb = function() {
    return {
      xmin: this.x,
      ymin: this.y,
      xmax: this.x,
      ymax: this.y
    };
  };

  return Object2D;
});
