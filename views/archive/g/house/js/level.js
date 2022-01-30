/*globals define*/
define([
  'object2d',
  'geometry/geometry-factory',
  'entities/physics-entity',
  'utils'
], function( Object2D, GeometryFactory, PhysicsEntity, Utils ) {
  'use strict';

  function Level() {
    Object2D.call( this );

    this.entities = [];
    this.shapes = [];
  }

  Level.prototype = new Object2D();
  Level.prototype.constructor = Level;

  Level.loadEntities = function( data ) {
    var entities = [];
    data.forEach(function() {});
    return entities;
  };

  Level.loadPhysicsEntities = function( data ) {
    var entities = [];

    data.forEach(function( entityData ) {
      entities.push( new PhysicsEntity( entityData ) );
    });

    return entities;
  };

  Level.loadBatchPhysicsEntities = function( data ) {
    var entities = [];
    /**
     * WARNING: This only takes PolygonShapes, SetAsVector.
     */
    data.forEach(function( batchData ) {
      var properties = batchData.properties;

      batchData.data.forEach(function( data ) {
        // Create basic entityData, filling in all object fields so that they
        // won't be overriden by defaults().
        var entityData = {
          data: data.data,
          fixture: {
            filter: {}
          },
          body: {
            position: {
              x: data.x || 0,
              y: data.y || 0
            },
            angle: data.angle || 0
          }
        };

        Utils.defaults( entityData, properties );

        // Now fill in the fixture/filter/body objects, pretty much a deep clone.
        if ( properties.fixture ) {
          if ( properties.fixture.filter ) {
            Utils.defaults( entityData.fixture.filter, properties.fixture.filter );
          }

          Utils.defaults( entityData.fixture, properties.fixture );
        }

        if ( properties.body ) {
          Utils.defaults( entityData.body, properties.body );
        }

        // Hacky hack-hack for shapes.
        if ( !entityData.shapes ) {
          entityData.shapes = [];
        }

        // Add one pure black shape.
        if ( !entityData.shapes.length ) {
          entityData.shapes.push({
            type: 'polygon',
            fill: {
              type: 'color',
              alpha: 1
            }
          });
        }

        // We just copy over the vertices data from the main
        // b2PolygonShape definition.
        entityData.shapes[0].vertices = entityData.data;

        entities.push( new PhysicsEntity( entityData ) );
      });
    });

    return entities;
  };

  Level.prototype.fromJSON = function( json ) {
    var jsonObject = JSON.parse( json );

    var entities = [];
    if ( jsonObject.entities ) {
      entities = entities.concat( Level.loadEntities( jsonObject.entities ) );
    }

    if ( jsonObject.physicsEntities ) {
      entities = entities.concat( Level.loadPhysicsEntities( jsonObject.physicsEntities ) );
    }

    if ( jsonObject.batchPhysicsEntities ) {
      entities = entities.concat( Level.loadBatchPhysicsEntities( jsonObject.batchPhysicsEntities ) );
    }

    this.entities = entities;
  };

  return Level;
});
