/*globals define*/
define([
  'entities/entity',
  'utils'
], function( Entity, Utils ) {
  'use strict';

  function Camera( x, y, width, height ) {
    Entity.call( this, x, y );

    this.width  = width  || 64;
    this.height = height || 48;

    this.target = null;
    this.margin = 0;

    this.weight = 4;
  }

  Camera.prototype = new Entity();
  Camera.prototype.constructor = Camera;

  Camera.prototype.update = function( dt ) {
    if ( !this.target || !this.world ) {
      return;
    }

    var margin = this.margin;

    var halfWidth  = 0.5 * this.width,
        halfHeight = 0.5 * this.height;

    var left   = -halfWidth,
        top    = -halfHeight,
        right  = halfWidth,
        bottom = halfHeight;

    // Target coordinates in local space.
    var point = this.toLocal( this.target.x, this.target.y );
    var x = point.x,
        y = point.y;

    // Recenter at a rate influenced by weight and dt.
    var dx = this.weight * x * dt,
        dy = this.weight * y * dt;

    // Make sure the target stays within the margins.
    if ( x < left + margin ) {
      dx += x - ( left + margin );
    } else if ( x > right - margin ) {
      dx += x - ( right - margin );
    }

    if ( y < top + margin ) {
      dy += y - ( top + margin );
    } else if  ( y > bottom - margin ) {
      dy += y - ( bottom - margin );
    }

    var d = this.toWorld( dx, dy );
    this.x = d.x;
    this.y = d.y;
  };

  Camera.prototype.applyTransform = function( ctx ) {
    ctx.translate( 0.5 * this.world.canvas.width, 0.5 * this.world.canvas.height );
    ctx.scale( this.world.canvas.width / this.width, this.world.canvas.height / this.height );
    ctx.rotate( this.angle );
    ctx.translate( -this.x, -this.y );
  };

  Camera.prototype.drawPath = function( ctx ) {
    var margin = this.margin;

    var width  = this.width,
        height = this.height;

    var halfWidth  = 0.5 * width,
        halfHeight = 0.5 * height;

    ctx.beginPath();
    ctx.rect( -halfWidth, -halfHeight, width, height );
    ctx.rect( -halfWidth + margin, -halfHeight + margin, width - 2 * margin, height - 2 * margin );
    ctx.closePath();
  };

  Camera.prototype.setHeight = function( height, options ) {
    height = height || 1;
    options = options || {};

    var aspectRatio;
    if ( options.maintainAspectRatio ) {
      aspectRatio = this.width / this.height;
      this.width = height * aspectRatio;
    }

    this.height = height;
  };

  Camera.prototype.aabb = function() {
    var halfWidth = 0.5 * this.width,
       halfHeight = 0.5 * this.height;

    var left   = -halfWidth,
        top    = -halfHeight,
        right  = halfWidth,
        bottom = halfHeight;

    return Utils.rotateAABB(
      this.x, this.y,
      left, top, right, bottom,
      this.angle
    );
  };

  return Camera;
});
