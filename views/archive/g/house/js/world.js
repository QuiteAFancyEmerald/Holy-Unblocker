/*globals define*/
define([
  'box2d'
], function( Box2D ) {
  'use strict';

  var Vec2 = Box2D.Common.Math.b2Vec2;
  var World = Box2D.Dynamics.b2World;

  var world = new World(
    new Vec2( 0, 10 ),
    true
  );

  return world;
});
