/*globals define*/
define([
  'base-object',
  'geometry/rect',
  'geometry/intersection',
  'utils'
], function( BaseObject, Rect, Intersection, Utils ) {
  'use strict';

  // Absolute width, height, and angle.
  function Keyframe( width, height, angle ) {
    BaseObject.call( this );

    this.width  = width  || 0;
    this.height = height || 0;
    this.angle  = angle  || 0;
  }

  Keyframe.prototype = new BaseObject();
  Keyframe.prototype.constructor = Keyframe;


  function CameraPath( x, y, width, height ) {
    Rect.call( this, x, y, width, height );

    this.camera = null;
    // This is usually the player.
    this.target = null;

    this.start = new Keyframe();
    this.end   = new Keyframe();
  }

  CameraPath.prototype = new Rect();
  CameraPath.prototype.constructor = CameraPath;

  CameraPath.Keyframe = Keyframe;

  CameraPath.prototype.update = function() {
    if ( !this.target || !this.camera ) {
      return;
    }

    var x = this.target.x,
        y = this.target.y;

    if ( !this.contains( x, y ) ) {
      return;
    }

    var x0 = this.left,
        y0 = this.top,
        x1 = this.right,
        y1 = this.bottom;

    var t = Intersection.closestPointOnLineParameter( x, y, x0, y0, x1, y1 );
    if ( 0 > t || t > 1 ) {
      return;
    }

    if ( t === 0 ) {
      this.camera.set( this.start );
    }

    if ( t === 1 ) {
      this.camera.set( this.end );
    }

    this.camera.width  = Utils.lerp( this.start.width, this.end.width, t );
    this.camera.height = Utils.lerp( this.start.height, this.end.height, t );
    this.camera.angle  = Utils.lerp( this.start.angle, this.end.angle, t );
  };

  CameraPath.prototype.relativeTo = function( keyframe, ratio, rotation ) {
    this.start.set( keyframe );
    this.end.set({
      width:  keyframe.width * ratio,
      height: keyframe.height * ratio,
      angle:  keyframe.angle + rotation
    });
  };

  return CameraPath;
});
