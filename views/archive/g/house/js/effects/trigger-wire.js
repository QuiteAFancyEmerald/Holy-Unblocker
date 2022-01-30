/*globals define*/
define([
  'base-object',
  'config/colors',
  'config/material',
  'config/settings',
  'utils'
], function( BaseObject, Colors, Material, Settings, Utils ) {
  'use strict';

  var Direction = {
    TOP:    0,
    LEFT:   1,
    BOTTOM: 2,
    RIGHT:  3
  };

  var defaults = {
    sourceDirection: Direction.TOP,
    targetDirection: Direction.TOP,

    // Relative coordinates.
    vertices: []
  };

  function TriggerWire( source, target, options ) {
    BaseObject.call( this );

    // Trigger.
    this.source = source;
    // Door.
    this.target = target;

    Utils.defaults( this, options, defaults );
  }

  TriggerWire.prototype = new BaseObject();
  TriggerWire.prototype.constructor = TriggerWire;

  TriggerWire.prototype.update = function() {};

  TriggerWire.prototype.draw = function( ctx ) {
    if ( !this.source || !this.target ) {
      return;
    }

    var x0 = this.source.x,
        y0 = this.source.y,
        r0 = this.source.radius;

    var frameRatio = this.source.frameRatio,
        frameRadius = frameRatio * r0;

    var x1 = this.target.x,
        y1 = this.target.y,
        r1 = this.target.radius;

    // Calculate endpoint locations.
    var horizontal = this.sourceDirection % 2,
        sign = this.sourceDirection < 2 ? -1 : 1;

    x0 +=  horizontal * sign * frameRadius;
    y0 += !horizontal * sign * frameRadius;

    horizontal = this.targetDirection % 2;
    sign = this.targetDirection < 2 ? -1 : 1;

    x1 +=  horizontal * sign * r1;
    y1 += !horizontal * sign * r1;

    var glowColor = Colors.Glow[ Material.type( this.source.material ) ];

    // Draw wire.
    var dx = x1 - x0,
        dy = y1 - y0;

    ctx.beginPath();
    ctx.moveTo( x0, y0 );

    var xi, yi;
    for ( var i = 0, il = 0.5 * this.vertices.length; i < il; i++ ) {
      xi = this.vertices[ 2 * i ];
      yi = this.vertices[ 2 * i + 1 ];
      ctx.lineTo( x0 + xi * dx, y0 + yi * dy );
    }

    ctx.lineTo( x1, y1 );

    if ( this.source.active && glowColor ) {
      ctx.strokeStyle = glowColor;
    } else {
      ctx.strokeStyle = '#333';
    }

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'lighter';
    }

    ctx.lineWidth = 0.2 * r0;
    ctx.stroke();

    if ( Settings.glow ) {
      ctx.globalCompositeOperation = 'source-over';
    }

    // Draw endpoints.
    ctx.beginPath();
    ctx.rect( -0.2 * r0 + x0, -0.2 * r0 + y0, 0.4 * r0, 0.4 * r0 );
    ctx.fillStyle = '#fff';
    ctx.fill();

    if ( this.source.active && glowColor ) {
      ctx.strokeStyle = glowColor;
    } else {
      ctx.strokeStyle = '#333';
    }

    ctx.lineWidth = 0.1 * r0;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc( x1, y1, 0.2 * r1, 0, Utils.PI2 );
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.lineWidth = 0.1 * r1;
    ctx.stroke();
  };

  // This doesn't handle negative vertex values.
  TriggerWire.prototype.aabb = function() {
    if ( !this.source || !this.target ) {
      return null;
    }

    var x0 = this.source.x,
        y0 = this.source.y,
        r0 = this.source.radius;

    var x1 = this.target.x,
        y1 = this.target.y;

    var aabb = {
      xmin: Math.min( x0, x1 ),
      ymin: Math.min( y0, y1 ),
      xmax: Math.max( x0, x1 ),
      ymax: Math.max( y0, y1 )
    };

    // AABB radius.
    var radius = 0.1 * r0;
    return Utils.relativeExpandAABB( aabb, radius, radius );
  };

  TriggerWire.Direction = Direction;

  return TriggerWire;
});
