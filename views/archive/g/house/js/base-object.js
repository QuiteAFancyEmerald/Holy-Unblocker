/*globals define*/
define(function() {
  'use strict';

  function BaseObject() {
    this.type = this.constructor.name.toLowerCase();
  }

  BaseObject.prototype.set = function( attrs ) {
    for ( var key in attrs ) {
      if ( this.hasOwnProperty( key ) ) {
        this[ key ] = attrs[ key ];
      }
    }
  };

  return BaseObject;
});
