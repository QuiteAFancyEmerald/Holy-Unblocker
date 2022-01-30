/*globals define*/
define([
  'object2d'
], function( Object2D ) {
  'use strict';

  function Entity( x, y ) {
    Object2D.call( this, x, y );

    this.shapes = [];
    this.game = null;
  }

  Entity.prototype = new Object2D();
  Entity.prototype.constructor = Entity;

  Entity.prototype.update = function() {};

  Entity.prototype.drawPath = function( ctx ) {
    this.shapes.forEach(function( shape ) {
      shape.draw( ctx );
    });
  };

  Entity.prototype.add = function( shape ) {
    this.shapes.push( shape );
  };

  Entity.prototype.remove = function( shape ) {
    var index = this.shapes.indexOf ( shape );
    if ( index !== -1 ) {
      this.shapes.splice( index, 1 );
    }
  };

  return Entity;
});
