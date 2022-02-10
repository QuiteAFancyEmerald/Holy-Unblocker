/*globals define*/
define([
  'object2d',
  'utils'
], function( Object2D, Utils ) {
  'use strict';

  var defaults = {
    count: 100,
    parallax: 0.25,

    hueSpread: 50,
    saturationSpread: 15,
    lightnessSpread: 25
  };

  function Background( width, height, options ) {
    Object2D.call( this, 0, 0 );

    Utils.defaults( this, options, defaults );

    this.canvas = document.createElement( 'canvas' );
    this.ctx = this.canvas.getContext( '2d' );

    this.width  = width || 0;
    this.height = height || 0;

    this.game = null;
    this.camera = null;
  }

  Background.prototype = new Object2D();
  Background.prototype.constructor = Background;

  Background.prototype.prerender = function() {
    var hsl = this.fill.hslObject();

    var hue        = hsl.hue,
        saturation = hsl.saturation,
        lightness  = hsl.lightness;

    var width  = this.width,
        height = this.height;

    var rects = [];
    var rectCount = this.count;

    var rectHue, rectSaturation, rectLightness;
    while ( rectCount-- ) {
      rectHue = this.hueSpread ? Utils.intSpread( hue, this.hueSpread ) : hue;
      rectSaturation = this.saturationSpread ? Utils.intSpread( saturation, this.saturationSpread ) : saturation;
      rectLightness = this.lightnessSpread ? Utils.intSpread( lightness, this.lightnessSpread ): lightness;

      rects.push({
        x: Math.random() * width,
        y: Math.random() * height,
        width: Utils.randomFloat( 0.05, 0.3 ) * width,
        height: Utils.randomFloat( 0.05, 0.3 ) * height,
        hue: rectHue,
        saturation: rectSaturation + '%',
        lightness: rectLightness + '%'
      });
    }

    var ctx = this.ctx;
    ctx.fillStyle = this.fill.rgba();
    ctx.fillRect( 0, 0, width, height );

    rects.forEach(function( rect ) {
      ctx.save();
      ctx.translate( rect.x, rect.y );

      ctx.beginPath();
      ctx.rect( -0.5 * rect.width, -0.5 * rect.height, rect.width, rect.height );
      ctx.fillStyle = 'hsla(' +
        rect.hue + ', ' +
        rect.saturation + ', ' +
        rect.lightness + ', ' +
        Math.random() +
      ')';

      ctx.fill();

      ctx.restore();
    });
  };

  Background.prototype.draw = function( ctx ) {
    if ( !this.game || !this.camera ) {
      return;
    }

    ctx.save();
    ctx.translate( this.camera.x * this.parallax, this.camera.y * this.parallax );
    ctx.scale( this.parallax, this.parallax );

    ctx.drawImage( this.canvas, -0.5 * this.width, -0.5 * this.height );

    ctx.restore();
  };

  Object.defineProperty( Background.prototype, 'width', {
    get: function() {
      return this.canvas.width;
    },

    set: function( width ) {
      this.canvas.width = width || 0;
    }
  });

  Object.defineProperty( Background.prototype, 'height', {
    get: function() {
      return this.canvas.height;
    },

    set: function( height ) {
      this.canvas.height = height || 0;
    }
  });

  return Background;
});
