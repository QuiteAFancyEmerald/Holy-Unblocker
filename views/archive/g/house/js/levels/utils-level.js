/*globals define*/
define(function( require ) {
  'use strict';

  var Level = require( 'level' );

  var Colors = require( 'config/colors' );
  var Material = require( 'config/material' );

  var Polygon = require( 'geometry/polygon' );
  var Segment = require( 'geometry/segment' );

  var Player = require( 'entities/player' );
  var Trail = require( 'effects/trail' );

  function addTrail( game ) {
    var trail = new Trail();
    trail.fill.set({
      red: 255,
      green: 255,
      blue: 255,
      alpha: 0.2
    });

    trail.target = game.player;
    game.add( trail );
  }

  function addBackground( game, red, green, blue, alpha ) {
    game.background.fill.set({
      red: red,
      green: green,
      blue: blue,
      alpha: alpha
    });

    game.background.prerender();
  }

  function playerMaterialOff( game ) {
    // Prevent player from changing material.
    var materialBtn = document.getElementById( 'material-btn' );
    materialBtn.style.display = 'none';
    game.player.toggleMaterial = function() {};
  }

  function playerMaterialOn( game ) {
    // Allow player to change material.
    var materialBtn = document.getElementById( 'material-btn' );
    materialBtn.style.display = '';
    game.player.toggleMaterial = Player.prototype.toggleMaterial;
  }

  function loadData( game, data ) {
    game.load({
      entities: Level.loadBatchPhysicsEntities( JSON.parse( data ) )
    });
  }

  // Helper functions for emitters.
  function normalSpawnArea( width ) {
    var halfWidth = 0.5 * width;
    return new Segment( 0, -halfWidth, 0, halfWidth );
  }

  function normalTrash( material ) {
    var trash = new Polygon();

    trash.vertices = [ 0.75, 0.75, -0.75, 0.75, -0.75, -0.75, 0.75, -0.75 ];
    trash.fill.set( Colors.Solid[ Material.type( material ) ] );
    trash.stroke.set( Colors.White );
    trash.lineWidth = 0.2;

    return trash;
  }

  function normalTrashProperties( trash, material ) {
    return {
      shape: 'polygon',
      type: 'vector',
      data: trash.vertices.slice(),
      fixture: {
        density: 1.75,
        friction: 0.5,
        restitution: 0.2,
        filter: {
          categoryBits: material
        }
      },
      body: {
        angularVelocity: 3 * Math.PI,
        linearDamping: 0.2,
        type: 'dynamic'
      }
    };
  }

  return {
    addTrail: addTrail,
    addBackground: addBackground,

    playerMaterialOff: playerMaterialOff,
    playerMaterialOn: playerMaterialOn,

    loadData: loadData,

    // emitter helpers.
    normalSpawnArea: normalSpawnArea,
    normalTrash: normalTrash,
    normalTrashProperties: normalTrashProperties
  };
});
