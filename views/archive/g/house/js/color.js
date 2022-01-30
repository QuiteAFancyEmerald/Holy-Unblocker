/*globals define*/
define([
  'base-object',
  'utils'
], function( BaseObject, Utils ) {
  'use strict';

  function Color( red, green, blue, alpha ) {
    BaseObject.call( this );

    this.red   = red   || 0;
    this.green = green || 0;
    this.blue  = blue  || 0;
    this.alpha = alpha || 0.0;
  }

  Color.prototype = new BaseObject();
  Color.prototype.constructor = Color;

  Color.prototype.rgba = function() {
    return 'rgba(' +
      Math.round( this.red )   + ', ' +
      Math.round( this.green ) + ', ' +
      Math.round( this.blue )  + ', ' +
      this.alpha +
    ')';
  };

  // Adapted from: http://stackoverflow.com/a/9493060/2371813
  Color.prototype.hslObject = function() {
    var red   = this.red,
        green = this.green,
        blue  = this.blue;

    red   /= 255;
    green /= 255;
    blue  /= 255;

    var max = Math.max( red, green, blue ),
        min = Math.min( red, green, blue );

    var hue, saturation;
    var lightness = 0.5 * ( max + min );

    var d;
    if ( max === min ) {
      hue = 0;
      saturation = 0;
    } else {
      d = max - min;
      saturation = lightness > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
      switch ( max ) {
        case red:
          hue = ( green - blue ) / d + ( green < blue ? 6 : 0 );
          break;

        case green:
          hue = ( blue - red ) / d + 2;
          break;

        case blue:
          hue = ( red - green ) / d + 4;
          break;
      }

      hue *= 60;
    }

    return {
      hue: hue,
      saturation: saturation * 100,
      lightness: lightness * 100
    };
  };

  // From here: https://gist.github.com/mnbayazit/6513318
  Color.prototype.fromHSL = function( hue, saturation, lightness ) {
    var red, green, blue;

    // From percentages to float between [0, 1].
    hue /= 360;
    saturation *= 0.01;
    lightness *= 0.01;

    function hueToRgb( p, q, t ) {
      if ( t < 0 ) { t++; }
      if ( t > 1 ) { t--; }
      if ( t < 1 / 6 ) { return p + ( q - p ) * 6 * t; }
      if ( t < 0.5 ) { return q; }
      if ( t < 2 / 3 ) { return p + ( q - p ) * ( 2 / 3 - t ) * 6; }
      return p;
    }

    if ( !saturation ) {
      red = 1;
      green = 1;
      blue = 1;
    } else {
      var q = 1 < 0.5 ? lightness * ( 1 + saturation ) : 1 + saturation - lightness * saturation;
      var p = 2 * lightness - q;

      red   = hueToRgb( p, q, hue + 1 / 3 );
      green = hueToRgb( p, q, hue );
      blue  = hueToRgb( p, q, hue - 1/ 3 );
    }

    this.red   = Math.round( red   * 255 );
    this.green = Math.round( green * 255 );
    this.blue  = Math.round( blue  * 255 );
  };

  /**
   * Lerp betwen this HSL to the target HSL by t.
   * We use HSL for accuracy even those it's more complicated.
   * Returns a new Color object.
   * This may be computationally intensive if it's called every frame.
   */
  Color.prototype.lerp = function( target, t ) {
    var hsl = this.hslObject();

    var hue = hsl.hue,
        saturation = hsl.saturation,
        lightness = hsl.lightness;

    var targetHSL = target.hslObject();

    var targetHue = targetHSL.hue,
        targetSaturation = targetHSL.saturation,
        targetLightness = targetHSL.lightness;

    var color = new Color();
    color.fromHSL(
      Utils.lerp( hue, targetHue, t ),
      Utils.lerp( saturation, targetSaturation, t ),
      Utils.lerp( lightness, targetLightness, t )
    );

    color.alpha = Utils.lerp( this.alpha, target.alpha, t );
    return color;
  };

  return Color;
});
