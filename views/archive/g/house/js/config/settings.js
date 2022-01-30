/*globals define*/
define([
  'utils'
], function( Utils ) {
  'use strict';

  // Settings singleton data.
  var settings;

  // Quality levels.
  var lowSettings = {
    background: false,
    explosions: false,
    glow: false,
    gradients: false,
    trail: false
  };

  var highSettings = {
    background: true,
    explosions: true,
    glow: true,
    gradients: true,
    trail: true
  };

  // Basic setter functions for each quality level.
  var settingsFn = function( quality ) {
    return function() {
      settings = Utils.defaults( {}, quality );
    };
  };

  var low  = settingsFn( lowSettings ),
      high = settingsFn( highSettings );

  // Set default to high.
  high();

  // Settings singleton, with quality setters.
  var Settings = {
    low: low,
    high: high
  };

  // Define a getter function for each property.
  var properties = Object.keys( settings ).reduce(function( object, key ) {
    object[ key ] = {
      get: function() {
        return settings[ key ];
      },

      set: function( value ) {
        settings[ key ] = value;
      }
    };

    return object;
  }, {} );

  Object.defineProperties( Settings, properties );

  Object.defineProperty( Settings, 'keys', {
    get: function() {
      return Object.keys( settings );
    }
  });

  return Settings;
});
