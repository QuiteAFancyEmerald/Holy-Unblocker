/*globals define*/
define(function( require ) {
  'use strict';

  var LevelUtils = require( 'levels/utils-level' );

  var Settings = require( 'config/settings' );

  return function( game ) {
    game.clear();

    game.player.x = 0;
    game.player.y = 0;

    Settings.background = false;

    LevelUtils.playerMaterialOn( game );
    LevelUtils.addTrail( game );

    game.camera.setHeight( 24, {
      maintainAspectRatio: true
    });

    game.font = '48pt Georgia, Times New Roman, serif';
    game.text = 'the end';
  };
});
