/*globals define*/
define(function( require ) {
  'use strict';

  var Utils = require( 'utils' );
  var LevelUtils = require( 'levels/utils-level' );

  var Door = require( 'entities/door' );
  var Emitter = require( 'entities/emitter' );
  var Trigger = require( 'entities/trigger' );
  var TriggerWire = require( 'effects/trigger-wire' );

  var Material = require( 'config/material' );

  var DEG_TO_RAD = Utils.DEG_TO_RAD;

  var level03Data = require( 'text!../../json/level-03.json' );
  var level04 = require( 'levels/level-04' );

  return function( game ) {
    game.clear();

    game.player.x = 0;
    game.player.y = -40;

    game.background.hueSpread = 20;

    LevelUtils.playerMaterialOn( game );
    LevelUtils.addTrail( game );
    LevelUtils.addBackground( game, 75, 44, 12, 1 );
    LevelUtils.loadData( game, level03Data );

    game.camera.setHeight( 42, {
      maintainAspectRatio: true
    });

    // Trash.
    var trashM = LevelUtils.normalTrash( Material.MATTER );
    var trashAM = LevelUtils.normalTrash( Material.ANTIMATTER );

    // Emitters.
    var em0 = new Emitter( 20, -20 );
    em0.spawnArea = LevelUtils.normalSpawnArea(4);
    em0.rate = 0.2;
    em0.lifeTime = 2;
    em0.speed = 200;
    em0.angle = -120 * DEG_TO_RAD;

    em0.particle = trashM;
    em0.properties = LevelUtils.normalTrashProperties( trashM, Material.MATTER );
    // Reverse angular velocity so its easier to push.
    em0.properties.body.angularVelocity = -em0.properties.body.angularVelocity;

    em0.start();
    game.add( em0 );

    var em1 = new Emitter( -20, -20 );
    em1.spawnArea = LevelUtils.normalSpawnArea(4);
    em1.rate = 0.2;
    em1.lifeTime = 2;
    em1.speed = 200;
    em1.angle = -60 * DEG_TO_RAD;

    em1.particle = trashAM;
    em1.properties = LevelUtils.normalTrashProperties( trashAM, Material.ANTIMATTER );

    em1.start();
    game.add( em1 );

    // Triggers.
    var trig0 = new Trigger( 20, 20, 3, Material.ANTIMATTER );
    game.add( trig0 );

    var trig1 = new Trigger( -20, 20, 3 , Material.MATTER );
    game.add( trig1 );

    // Door.
    var door = new Door( 0, 40, 3, {
      callback: function() {
        level04( game );
      }
    });
    door.triggers.push( trig0 );
    door.triggers.push( trig1 );
    game.add( door );

    // Trigger wires.
    var wire0 = new TriggerWire( trig0, door, {
      vertices: [
        0, 0.5,
        0.5, 0.5,
        0.5, 1
      ],
      sourceDirection: TriggerWire.Direction.BOTTOM,
      targetDirection: TriggerWire.Direction.RIGHT
    });
    game.add( wire0 );

    var wire1 = new TriggerWire( trig1, door, {
      vertices: wire0.vertices.slice(),
      sourceDirection: TriggerWire.Direction.BOTTOM,
      targetDirection: TriggerWire.Direction.LEFT
    });
    game.add( wire1 );
  };
});
