/*jshint camelcase: false*/
/*globals define*/
define([
  'box2d',
  'entities/entity',
  'geometry/geometry-factory',
  'utils',
  'utils-box2d',
  'world'
], function( Box2D, Entity, GeometryFactory, Utils, Box2DUtils, world ) {
  'use strict';

  var Vec2 = Box2D.Common.Math.b2Vec2;
  var Body = Box2D.Dynamics.b2Body;
  var BodyDef = Box2D.Dynamics.b2BodyDef;
  var FixtureDef = Box2D.Dynamics.b2FixtureDef;

  var shapeClasses = {
    circle: Box2D.Collision.Shapes.b2CircleShape,
    polygon: Box2D.Collision.Shapes.b2PolygonShape
  };

  var defaultShape = 'circle';

  var bodyTypes = {
    'static': Body.b2_staticBody,
    'dynamic': Body.b2_dynamicBody,
    'kinematic': Body.b2_kinematicBody
  };

  var setAs = {
    array: 'SetAsArray',
    box: 'SetAsBox',
    edge: 'SetAsEdge',
    orientedBox: 'SetAsOrientedBox',
    vector: 'SetAsVector'
  };

  var set = Utils.set;

  function PhysicsEntity( options ) {
    if ( !options ) {
      return;
    }

    this.fixture = null;
    this.initialize( options );

    // This tautology stops the Entity constructor from changing the position/angle.
    var angle = this.angle;
    Entity.call( this, this.x, this.y );
    this.angle = -angle;

    // Add any shapes.
    if ( options.shapes ) {
      this.shapes = this.shapes.concat( options.shapes.map(function( shapeData ) {
        return GeometryFactory.create( JSON.stringify( shapeData ) );
      }));
    }
  }

  PhysicsEntity.prototype = new Entity();
  PhysicsEntity.prototype.constructor = PhysicsEntity;

  PhysicsEntity.prototype.initialize = function( options ) {
    options = options || {};

    var fixDef = new FixtureDef();
    set( fixDef, options.fixture );
    this.fixtureShape( fixDef, options );

    var bodyDef = new BodyDef();
    set( bodyDef, options.body );
    // Calling set() with a options.body.type will stick a
    // 'static'/'dynamic'/'kinematic' string in bodyDef.type, so we need to
    // convert it to the correct Box2D flag.
    if ( options.body && typeof bodyDef.type === 'string' ) {
      bodyDef.type = bodyTypes[ bodyDef.type ] || Body.b2_staticBody;
    }

    this.fixture = world.CreateBody( bodyDef ).CreateFixture( fixDef );
    this.body.SetUserData( this );
  };

  /**
   * Creates a shape of the class given by the string shape called with a
   * shapeOptions array.
   *
   * Possible values for shape are:
   *  - circle (default)
   *  - polygon
   */
  PhysicsEntity.prototype.fixtureShape = function( fixDef, options ) {
    var shape = typeof options.shape !== 'undefined' ? options.shape : defaultShape;

    var Shape = shapeClasses[ shape ];
    if ( typeof Shape === 'undefined' ) {
      Shape = shapeClasses[ defaultShape ];
    }

    fixDef.shape = new Shape();

    // Set up shape properties.
    if ( shape === 'circle' ) {
      if ( typeof options.radius !== 'undefined' ) {
        fixDef.shape.SetRadius( options.radius );
      }

      return;
    }

    // Handle SetAs functions for each possible type.
    var type = options.type,
        data = options.data;

    if ( shape !== 'polygon' ||
         typeof type === 'undefined' ||
         typeof data === 'undefined' ) {
      return;
    }

    var setAsFunction = setAs[ type ];
    if ( typeof setAsFunction === 'undefined' ) {
      return;
    }

    setAsFunction = fixDef.shape[ setAsFunction ];

    // Data is an array.
    if ( type === 'array' ||
         type === 'vector' ) {
      // Convert flat array of numbers to a Vec2 array.
      var vector = Box2DUtils.b2Vec2Array( data );
      setAsFunction.call( fixDef.shape, vector, vector.length );
    }

    // Data is an object:
    // - hx:Number
    // - hy:Number
    else if ( type === 'box' ) {
      setAsFunction.call( fixDef.shape, data.hx, data.hy );
    }

    // Data is an object:
    // - hx:Number
    // - hy:Number
    // - center:Vec2
    // - angle:Number
    else if ( type === 'orientedbox' ) {
      var center;
      if ( typeof data.center !== 'undefined' ) {
        center = new Vec2( data.center.x, data.center.y );
      } else {
        center = new Vec2( 0, 0 );
      }

      setAsFunction.call( fixDef.shape, data.hx, data.hy, center, data.angle );
    }

    // Data is an array of 4 numbers.
    else if ( type === 'edge' ) {
      setAsFunction.call(
        fixDef.shape,
        new Vec2( data[0], data[1] ),
        new Vec2( data[2], data[3] )
      );
    }
  };

  PhysicsEntity.prototype.accelerate = function( x, y ) {
    this.body.ApplyImpulse(
      new Vec2( x, y ),
      this.worldCenter
    );
  };

  PhysicsEntity.prototype.update = function( dt ) {
    Entity.prototype.update.call( this, dt );
    this.vx = Utils.roundNearZero( this.vx );
    this.vy = Utils.roundNearZero( this.vy );
  };

  PhysicsEntity.prototype.aabb = function() {
    var aabb = this.fixture.GetAABB();

    return {
      xmin: aabb.lowerBound.x,
      ymin: aabb.lowerBound.y,
      xmax: aabb.upperBound.x,
      ymax: aabb.upperBound.y
    };
  };

  Object.defineProperty( PhysicsEntity.prototype, 'body', {
    get: function() {
      return this.fixture.GetBody();
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'material', {
    get: function() {
      return this.fixture.GetFilterData().categoryBits;
    },

    set: function( material ) {
      var filterData = this.fixture.GetFilterData();
      filterData.categoryBits = material;
      this.fixture.SetFilterData( filterData );
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'position', {
    get: function() {
      return this.body.GetPosition();
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'worldCenter', {
    get: function() {
      return this.body.GetWorldCenter();
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'x', {
    enumerable: true,

    get: function() {
      return this.position.x;
    },

    set: function( x ) {
      this.position.x    = x || 0;
      this.worldCenter.x = x || 0;
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'y', {
    enumerable: true,

    get: function() {
      return this.position.y;
    },

    set: function( y ) {
      this.position.y    = y || 0;
      this.worldCenter.y = y || 0;
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'angle', {
    enumerable: true,

    get: function() {
      return -this.body.GetAngle();
    },

    set: function( angle ) {
      this.body.SetAngle( -angle || 0 );
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'velocity', {
    get: function() {
      return this.body.GetLinearVelocity();
    },

    set: function( velocity ) {
      this.body.SetLinearVelocity( velocity );
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'vx', {
    get: function() {
      return this.velocity.x;
    },

    set: function( vx ) {
      this.velocity.x = vx || 0;
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'vy', {
    get: function() {
      return this.velocity.y;
    },

    set: function( vy ) {
      this.velocity.y = vy || 0;
    }
  });

  Object.defineProperty( PhysicsEntity.prototype, 'va', {
    get: function() {
      return this.body.GetAngularVelocity();
    },

    set: function( va ) {
      this.body.SetAngularVelocity( va || 0 );
    }
  });

  return PhysicsEntity;
});
