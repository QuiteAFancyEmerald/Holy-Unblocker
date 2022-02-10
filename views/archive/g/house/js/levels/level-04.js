/*globals define*/
define(function( require ) {
  'use strict';

  var Utils = require( 'utils' );
  var LevelUtils = require( 'levels/utils-level' );

  var Door = require( 'entities/door' );
  var Laser = require( 'entities/laser' );
  var Emitter = require( 'entities/emitter' );
  var TractorBeam = require( 'entities/tractor-beam' );
  var Trigger = require( 'entities/trigger' );
  var TriggerWire = require( 'effects/trigger-wire' );

  var Material = require( 'config/material' );

  var DEG_TO_RAD = Utils.DEG_TO_RAD;

  var level04Data = require( 'text!../../json/level-04.json' );
  var levelEnd = require( 'levels/level-end' );

  return function( game ) {
    game.clear();

    game.player.x = -54;
    game.player.y = -35;

    game.background.hueSpread = 10;
    game.background.lightnessSpread = 15;

    LevelUtils.playerMaterialOn( game );
    LevelUtils.addTrail( game );
    LevelUtils.addBackground( game, 75, 34, 12, 1 );
    LevelUtils.loadData( game, level04Data );

    game.camera.setHeight( 33, {
      maintainAspectRatio: true
    });

    // Lasers.
    var laser0 = new Laser( -57, 7, Material.ANTIMATTER );
    laser0.angle = -60 * DEG_TO_RAD;
    game.add( laser0 );

    var laser1 = new Laser( -4, -18, Material.MATTER );
    game.add( laser1 );

    // Tractor beam.
    var tractorBeam = new TractorBeam( -55, 22, 20, 5 );
    tractorBeam.angle = -80 * DEG_TO_RAD;
    tractorBeam.force = 2000;
    game.add( tractorBeam );

    // Trash.
    var trashM = LevelUtils.normalTrash( Material.MATTER );
    var trashAM = LevelUtils.normalTrash( Material.ANTIMATTER );

    // Emitters.
    var em0 = new Emitter( -37, -9 );
    em0.spawnArea = LevelUtils.normalSpawnArea(4);
    em0.rate = 0.8;
    em0.lifeTime = 9;
    em0.speed = 200;
    em0.angle = -90 * DEG_TO_RAD;

    em0.particle = trashAM;
    em0.properties = LevelUtils.normalTrashProperties( trashAM, Material.ANTIMATTER );
    em0.properties.fixture.restitution = 0.5;

    em0.start();
    game.add( em0 );

    var em1 = new Emitter( 40, -36 );
    em1.spawnArea = LevelUtils.normalSpawnArea(4);
    em1.rate = 0.6;
    em1.lifeTime = 2;
    em1.speed = 200;
    em1.angle = -90 * DEG_TO_RAD;

    em1.particle = trashM;
    em1.properties = LevelUtils.normalTrashProperties( trashM, Material.MATTER );

    em1.start();
    game.add( em1 );


    // Triggers.
    var trig0 = new Trigger( -20, 35, 3, Material.ANTIMATTER );
    game.add( trig0 );


    var trig1 = new Trigger( 43, -8, 3, Material.MATTER );
    game.add( trig1 );

    // Door.
    var door = new Door( 57, 25, 3, {
      callback: function() {
        levelEnd( game );
      }
    });
    door.triggers.push( trig0 );
    door.triggers.push( trig1 );
    game.add( door );

    // Trigger wires.
    var wire0 = new TriggerWire( trig0, door, {
      vertices: [
        0.5, 0,
        0.5, 0.5,
        0.5, 1
      ],
      sourceDirection: TriggerWire.Direction.RIGHT,
      targetDirection: TriggerWire.Direction.LEFT
    });
    game.add( wire0 );

    var wire1 = new TriggerWire( trig1, door, {
      vertices: [
        0, 0.5,
        0.5, 0.5,
        0.5, 1
      ],
      sourceDirection: TriggerWire.Direction.BOTTOM,
      targetDirection: TriggerWire.Direction.TOP
    });
    game.add( wire1 );
  };
});
