/*globals define*/
define(function( require ) {
  'use strict';

  var Utils = require( 'utils' );
  var LevelUtils = require( 'levels/utils-level' );

  var Door = require( 'entities/door' );
  var Laser = require( 'entities/laser' );
  var Emitter = require( 'entities/emitter' );
  var Trigger = require( 'entities/trigger' );
  var TriggerWire = require( 'effects/trigger-wire' );

  var Material = require( 'config/material' );

  var DEG_TO_RAD = Utils.DEG_TO_RAD;

  var level02Data = require( 'text!../../json/level-02.json' );
  var level03 = require( 'levels/level-03' );

  return function( game ) {
    game.clear();

    game.player.x = 60;
    game.player.y = -40;
    game.material = Material.ANTIMATTER;

    game.font = '16pt "Helvetica Neue", Helvetica, Arial, sans-serif';
    var materialText = 'Press button or spacebar to change matter type.';
    game.text = materialText;

    var checkMaterial = setInterval(function() {
      if ( game.player.material === Material.MATTER ) {
        game.text = '';
        clearInterval( checkMaterial );
      }

      if ( game.text !== materialText ) {
        clearInterval( checkMaterial );
      }
    }, 200 );

    LevelUtils.playerMaterialOn( game );
    LevelUtils.addTrail( game );
    LevelUtils.addBackground( game, 96, 75, 32, 1 );
    LevelUtils.loadData( game, level02Data );

    game.camera.setHeight( 36, {
      maintainAspectRatio: true
    });

    // Emitters.
    var trashM = LevelUtils.normalTrash( Material.MATTER );

    var em0 = new Emitter( 70, -40 );
    em0.spawnArea = LevelUtils.normalSpawnArea(4);
    em0.rate = 0.1;
    em0.lifeTime = 6;
    em0.speed = 100;
    em0.angle = -180 * DEG_TO_RAD;

    em0.particle = trashM;
    em0.properties = LevelUtils.normalTrashProperties( trashM, Material.MATTER );
    em0.properties.body.linearDamping = 0;

    em0.start();
    game.add( em0 );

    // Lasers.
    var laser0 = new Laser( 44, -59, Material.MATTER );
    laser0.angle = -90 * DEG_TO_RAD;
    game.add( laser0 );

    var laser1 = new Laser( 14, -59, Material.MATTER );
    laser1.angle = -90 * DEG_TO_RAD;
    game.add( laser1 );

    var laser2 = new Laser( -16, -57, Material.MATTER );
    laser2.angle = -90 * DEG_TO_RAD;
    game.add( laser2 );

    // Trigger.
    var trig0 = new Trigger( -60, -40, 3, Material.MATTER );
    game.add( trig0 );

    // Door.
    var door = new Door( -45, -17, 3, {
      callback: function() {
        level03( game );
      }
    });

    door.triggers.push( trig0 );
    game.add( door );

    // Trigger wire.
    var triggerWire = new TriggerWire( trig0, door, {
      vertices: [
        0.4, 0,
        0.4, 0.5,
        1, 0.5
      ],
      sourceDirection: TriggerWire.Direction.RIGHT,
      targetDirection: TriggerWire.Direction.TOP
    });
    game.add( triggerWire );
  };
});
