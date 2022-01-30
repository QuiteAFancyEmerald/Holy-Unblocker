/*globals define*/
define([
  'box2d'
], function( Box2D ) {
  'use strict';

  var Vec2 = Box2D.Common.Math.b2Vec2;

  /**
   * Converts a flat array of numbers into a b2Vec2 array.
   */
  function b2Vec2Array( array ) {
    var vector = [];

    for ( var i = 0, il = 0.5 * array.length; i < il; i++ ) {
      vector.push( new Vec2( array[ 2 * i ], array[ 2 * i + 1 ] ) );
    }

    return vector;
  }

  return {
    b2Vec2Array: b2Vec2Array
  };
});
