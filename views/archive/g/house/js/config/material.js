/*jshint bitwise: false*/
/*globals define*/
define(function() {
  'use strict';

  var MATTER     = 0x0002,
      ANTIMATTER = 0x0004;

  var BIMATTER = MATTER | ANTIMATTER;

  function type( material ) {
    if ( material & MATTER ) {
      return 'MATTER';
    } else if ( material & ANTIMATTER ) {
      return 'ANTIMATTER';
    }
  }

  return {
    MATTER:     MATTER,
    ANTIMATTER: ANTIMATTER,
    BIMATTER:   BIMATTER,

    type: type
  };
});
