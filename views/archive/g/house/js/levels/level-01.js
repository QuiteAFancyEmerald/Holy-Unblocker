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

  var level01Data = require( 'text!../../json/level-01.json' );
  var level02 = require( 'levels/level-02' );

  return function( game ) {
    game.clear();

    game.player.x = -63;
    game.player.y = 12;

    game.font = 'bold 36pt "Helvetica Neue", Helvetica, Arial, sans-serif';
    var controlsText = 'WASD   ←↑→↓   touch';
    game.text = controlsText;

    var checkMovement = setInterval(function() {
      if ( ( game.player.vx || game.player.vy ) ) {
        game.text = '';
        clearInterval( checkMovement );
      }

      if ( game.text !== controlsText )  {
        clearInterval( checkMovement );
      }
    }, 200 );

    LevelUtils.playerMaterialOff( game );
    LevelUtils.addTrail( game );
    LevelUtils.addBackground( game, 128, 96, 64, 1 );
    LevelUtils.loadData( game, level01Data );

    game.camera.setHeight( 32, {
      maintainAspectRatio: true
    });

    var tractorBeam = new TractorBeam( -55, 14, 40, 14, {
      particleCount: 15,
      particleHeight: 8
    });
    tractorBeam.angle = -25 * DEG_TO_RAD;
    tractorBeam.force = 3000;
    game.add( tractorBeam );

    // Initial laser.
    var laser0 = new Laser( -17, 46, Material.ANTIMATTER );
    laser0.angle = 60 * DEG_TO_RAD;
    game.add( laser0 );

    // Laser web.
    var laser1 = new Laser( 19, 47, Material.MATTER );
    laser1.angle = 120 * DEG_TO_RAD;
    game.add( laser1 );

    var laser2 = new Laser( 35, 33, Material.ANTIMATTER );
    laser2.angle = 160 * DEG_TO_RAD;
    game.add( laser2 );

    var laser3 = new Laser( 14, 16, Material.ANTIMATTER );
    laser3.angle = -60 * DEG_TO_RAD;
    game.add( laser3 );

    var laser4 = new Laser( 22, 10, Material.MATTER );
    laser4.angle = -50 * DEG_TO_RAD;
    game.add( laser4 );

    // Trash.
    var trashAM = LevelUtils.normalTrash( Material.ANTIMATTER );

    // Emitters.
    var em0 = new Emitter( 35, -15 );
    em0.spawnArea = LevelUtils.normalSpawnArea(4);
    em0.rate = 0.4;
    em0.lifeTime = 3;
    em0.speed = 100;
    em0.angle = -110 * DEG_TO_RAD;

    em0.particle = trashAM;
    em0.properties = LevelUtils.normalTrashProperties( trashAM, Material.ANTIMATTER );

    em0.start( 500 );
    game.add( em0 );

    // Lasers to destroy upflow from emitter.
    var laser5 = new Laser( 48, -15, Material.ANTIMATTER );
    laser5.angle = 160 * DEG_TO_RAD;
    game.add( laser5 );

    var laser6 = new Laser( 28, -26, Material.ANTIMATTER );
    laser6.angle = 5 * DEG_TO_RAD;
    game.add( laser6 );

    // End emitter.
    var em1 = new Emitter( -2, -42 );
    em1.spawnArea = LevelUtils.normalSpawnArea(4);
    em1.rate = 0.2;
    em1.lifeTime = 2.5;
    em1.speed = 20;
    em1.angle = -80 * DEG_TO_RAD;

    em1.particle = trashAM;
    em1.properties = LevelUtils.normalTrashProperties( trashAM, Material.ANTIMATTER );
    em1.properties.fixture.density = 1;

    em1.start( 1500 );
    game.add( em1 );

    // Tractor beam leading to trigger.
    var tB1 = new TractorBeam( 35, -34, 20, 5 );
    tB1.angle = -176 * DEG_TO_RAD;
    tB1.force = 3000;
    game.add( tB1 );

    // Trigger.
    var trig0 = new Trigger( -15, -29, 3, Material.ANTIMATTER, {
      duration: 0.5
    });
    game.add( trig0 );

    // Door.
    var door = new Door( -3, -19, 3, {
      duration: 1.2,
      callback: function() {
        level02( game );
      }
    });
    door.triggers.push( trig0 );
    game.add( door );

    // Trigger Wire.
    var triggerWire = new TriggerWire( trig0, door, {
      vertices: [
        0, 0.5,
        1, 0.5
      ],
      sourceDirection: TriggerWire.Direction.BOTTOM,
      targetDirection: TriggerWire.Direction.TOP
    });
    game.add( triggerWire );
  };
});
