/*globals define*/
define([
  'utils'
], function( Utils ) {
  'use strict';

  function Input() {
    this.mouse = {
      x: 0,
      y: 0,

      down: false
    };

    this.controls = {
      TOP:    false,
      RIGHT:  false,
      BOTTOM: false,
      LEFT:   false
    };

    this.keys = [];
    this.game = null;

    this.touches = [];

    this.initialTouch = null;
    this.touch = null;

    // Pixel radius where touch difference does nothing.
    this.deadzone = 20;
    // Maximum radius for touch movement.
    this.touchLimit = 100;
  }

  Input.prototype = {
    onKeyDown: function( event ) {
      this.keys[ event.which ] = true;

      // Arrow keys.
      if ( event.which === 37 ||
           event.which === 38 ||
           event.which === 39 ||
           event.which === 40 ) {
        event.preventDefault();
      }
    },

    onKeyUp: function( event ) {
      this.keys[ event.which ] = false;
    },

    /**
     * Accounts for difference between canvas dimensions and
     * computed CSS-specified dimensions, as well as any canvas offsets.
     */
    normalizeTouch: function( event ) {
      var x = event.pageX,
          y = event.pageY;

      if ( this.game ) {
        var canvasWidth  = this.game.canvas.width,
            canvasHeight = this.game.canvas.height;

        var computedStyle = window.getComputedStyle( this.game.canvas );

        var computedWidth  = parseInt( computedStyle.width,  10 ),
            computedHeight = parseInt( computedStyle.height, 10 );

        var xRatio = canvasWidth  / computedWidth,
            yRatio = canvasHeight / computedHeight;

        x -= this.game.canvas.offsetLeft;
        y -= this.game.canvas.offsetTop;

        x *= xRatio;
        y *= yRatio;
      }

      return {
        pageX: x,
        pageY: y
      };
    },

    onTouchStart: function( event ) {
      this.touches = [].slice.call( event.touches );
      if ( !this.initialTouch ) {
        this.initialTouch = this.normalizeTouch( this.touches[0] );
      }
    },

    onTouchMove: function( event ) {
      event.preventDefault();
      this.touches = [].slice.call( event.touches );
      this.touch = this.normalizeTouch( this.touches[0] );
    },

    onTouchEnd: function( event ) {
      this.touches = [].slice.call( event.touches );
      if ( !this.touches.length ) {
        this.initialTouch = null;
        this.touch = null;
      }
    },

    update: function( dt ) {
      var controls = this.controls;

      Object.keys( controls ).forEach(function( control ) {
        controls[ control ] = false;
      });

      // Keyboard update.
      // Arrow keys.
      if ( this.keys[ 37 ] ) { controls.LEFT   = true; }
      if ( this.keys[ 38 ] ) { controls.TOP    = true; }
      if ( this.keys[ 39 ] ) { controls.RIGHT  = true; }
      if ( this.keys[ 40 ] ) { controls.BOTTOM = true; }

      // WASD.
      if ( this.keys[ 65 ] ) { controls.LEFT   = true; }
      if ( this.keys[ 87 ] ) { controls.TOP    = true; }
      if ( this.keys[ 68 ] ) { controls.RIGHT  = true; }
      if ( this.keys[ 83 ] ) { controls.BOTTOM = true; }

      this.updatePlayer( dt );
    },

    updatePlayer: function( dt ) {
      if ( this.game ) {
        var controls = this.game.input.controls;

        var ax = 0,
            ay = 0;

        if ( controls.LEFT   ) { ax -= 800; }
        if ( controls.RIGHT  ) { ax += 800; }
        if ( controls.TOP    ) { ay -= 800; }
        if ( controls.BOTTOM ) { ay += 800; }

        if ( this.touch ) {
          var x = this.touch.pageX,
              y = this.touch.pageY;

          var xi = this.initialTouch.pageX,
              yi = this.initialTouch.pageY;

          var dx = x - xi,
              dy = y - yi;

          var dz = this.deadzone;

          var angle;
          // Parameters of touch extents.
          var xt, yt;

          if ( Utils.distanceSquared( x, y, xi, yi ) > dz * dz ) {
            angle = Math.atan2( dy, dx );

            // Subtract deadzone.
            dx -= dz * Math.cos( angle );
            dy -= dz * Math.sin( angle );

            // Get parameter up to touch limit.
            xt = Utils.inverseLerp( Math.abs( dx ), 0, this.touchLimit );
            yt = Utils.inverseLerp( Math.abs( dy ), 0, this.touchLimit );

            xt = Utils.clamp( xt, 0, 1 );
            yt = Utils.clamp( yt, 0, 1 );

            // Determine sign.
            xt *= ( dx < 0 ? -1 : 1 );
            yt *= ( dy < 0 ? -1 : 1 );

            ax = xt * 800;
            ay = yt * 800;
          }
        }

        // Move along camera direction.
        var camera = this.game.camera;
        if ( camera.angle ) {
          var cos = Math.cos( -camera.angle ),
              sin = Math.sin( -camera.angle );

          var rax = cos * ax - sin * ay,
              ray = sin * ax + cos * ay;

          ax = rax;
          ay = ray;
        }

        this.game.player.accelerate( ax * dt, ay * dt );
      }
    },

    draw: function( ctx ) {
      if ( this.game && this.initialTouch ) {
        var x = this.initialTouch.pageX,
            y = this.initialTouch.pageY;

        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';

        ctx.beginPath();
        ctx.arc( x, y, this.deadzone, 0, Utils.PI2 );

        ctx.moveTo( x + this.touchLimit, y );
        ctx.arc( x, y, this.touchLimit, 0, Utils.PI2 );

        ctx.moveTo( x + this.deadzone + this.touchLimit, y );
        ctx.arc( x, y, this.deadzone + this.touchLimit, 0, Utils.PI2 );
        ctx.stroke();
      }
    }
  };

  return Input;
});
