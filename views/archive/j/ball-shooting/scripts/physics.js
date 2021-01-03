var game = this.game || (this.game={});
var createjs = createjs || {};

;(function(game, cjs, b2d){

  var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2AABB = Box2D.Collision.b2AABB
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    , b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef
    ;

  var pxPerMeter = 30; // 30 pixels = 1 meter. Box3D uses meters and we use pixels.
  var shouldDrawDebug = false;

  var physics = game.physics = {};

  physics.bodiesToBeRemove = [];

  physics.createWorld = function() {
    var gravity = new b2Vec2(0, 9.8);
    this.world = new b2World(gravity, /*allow sleep= */ true);
  };

  physics.createLevel = function() {

    var level = game.currentLevel;

    this.createObstacles(level);
    this.createHoop(level);

    this.createWorldBoundary();

    this.setupContactListener();

    // the first ball
    game.spawnBall();
  };

  physics.clearWorld = function() {
    var body = this.world.GetBodyList();
    while (body) {
      var sprite = body.GetUserData();
      if (sprite) {
        sprite.parent.removeChild(sprite);
      }
      var b = body;
      body = body.GetNext();
      this.world.DestroyBody(b);
    }
  };

  physics.createWorldBoundary = function() {
    var bodyDef = new b2BodyDef;
    var fixDef = new b2FixtureDef;

    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = -800/pxPerMeter;
    bodyDef.position.y = 500/pxPerMeter;
    bodyDef.angle = 0;

    fixDef.isSensor = true;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(2000/pxPerMeter, 10/pxPerMeter);

    body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);
  };

  physics.createObstacles = function(level) {
    var bodyDef = new b2BodyDef;
    var fixDef = new b2FixtureDef;

    // default fixture
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    // obstacles
    var body, sprite;
    for(var i=0, len=level.obstacles.length; i<len; i++) {
      var o = level.obstacles[i];

      bodyDef.type = b2Body.b2_staticBody;
      bodyDef.position.x = o.position.x/pxPerMeter;
      bodyDef.position.y = o.position.y/pxPerMeter;

      bodyDef.angle = o.angle;

      if (o.type === 'rect') {
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsBox(o.dimension.width/pxPerMeter, o.dimension.height/pxPerMeter);
        body = this.world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);

        game.view.addSpriteToBody(body, o.graphicName);
      } else if (o.type === 'cross') {
        this.createCross(o);
      }
    }
  };

  physics.createCross = function(obstacle) {
    var bodyDef = new b2BodyDef;
    var fixDef = new b2FixtureDef;

    // default fixture
    fixDef.density = 0.2;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = obstacle.position.x/pxPerMeter;
    bodyDef.position.y = obstacle.position.y/pxPerMeter;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(obstacle.length/pxPerMeter, obstacle.width/pxPerMeter);
    var cross = this.world.CreateBody(bodyDef);
    cross.CreateFixture(fixDef);
    fixDef.shape.SetAsBox(obstacle.width/pxPerMeter, obstacle.length/pxPerMeter);
    cross.CreateFixture(fixDef);

    game.view.addSpriteToBody(cross, obstacle.graphicName);

    // a circel as the spinning joint
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2CircleShape(10/pxPerMeter);
    var circle = this.world.CreateBody(bodyDef);
    circle.CreateFixture(fixDef);

    var revoluteJointDef = new b2RevoluteJointDef;
    revoluteJointDef.bodyA = cross;
    revoluteJointDef.bodyB = circle;
    revoluteJointDef.collideConnected = false;

    revoluteJointDef.maxMotorTorque = obstacle.maxTorque;
    revoluteJointDef.motorSpeed = obstacle.motorSpeed;
    revoluteJointDef.enableMotor = obstacle.enableMotor;

    this.world.CreateJoint(revoluteJointDef);
  };

  physics.createHoop = function(level) {
    var bodyDef = new b2BodyDef;
    var fixDef = new b2FixtureDef;

    // default fixture
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var hoopX = level.hoopPosition.x;
    var hoopY = level.hoopPosition.y;

    // hoop
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = hoopX/pxPerMeter;
    bodyDef.position.y = hoopY/pxPerMeter;
    bodyDef.angle = 0;

    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(5/pxPerMeter, 5/pxPerMeter);

    var body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

    game.view.addSpriteToBody(body, 'HoopSquare');

    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = (hoopX+45)/pxPerMeter;
    bodyDef.position.y = hoopY/pxPerMeter;
    bodyDef.angle = 0;

    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(5/pxPerMeter, 5/pxPerMeter);

    body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

    game.view.addSpriteToBody(body, 'HoopSquare');


    // hoop board
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = (hoopX-5)/pxPerMeter;
    bodyDef.position.y = (hoopY-40)/pxPerMeter;
    bodyDef.angle = 0;

    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(5/pxPerMeter, 40/pxPerMeter);
    fixDef.restitution = 0.05;

    var board = this.world.CreateBody(bodyDef);
    board.CreateFixture(fixDef);

    game.view.addSpriteToBody(board, 'HoopBoard');


    // hoop sensor
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = (hoopX+20)/pxPerMeter;
    bodyDef.position.y = hoopY/pxPerMeter;
    bodyDef.angle = 0;

    fixDef.isSensor = true;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(20/pxPerMeter, 3/pxPerMeter);

    body = this.world.CreateBody(bodyDef);
    body.CreateFixture(fixDef);

    game.view.addSpriteToBody(body, 'HoopSensor', 0);
  };

  physics.setupContactListener = function() {
    // contact
    var contactListener = new Box2D.Dynamics.b2ContactListener;
    contactListener.BeginContact = function(contact, manifold) {
      if (contact.GetFixtureA().IsSensor() || contact.GetFixtureB().IsSensor()) {
        // is hoop sensor or world boundary?
        var sensor = contact.GetFixtureA().GetBody();
        var body = contact.GetFixtureB().GetBody();

        if (contact.GetFixtureB().IsSensor()) {
          sensor = contact.GetFixtureB().GetBody();
          body = contact.GetFixtureA().GetBody();
        }

        // hoop sensor has sprite as user data
        if (sensor.GetUserData() !== null) {
          game.increaseScore();
        } else {
          physics.bodiesToBeRemove.push(body);
        }

      }
    };
    this.world.SetContactListener(contactListener);

  };

  physics.spawnBall = function() {
    var level = game.currentLevel;
    var ball = game.balls[level.ballName];

    var bodyDef = new b2BodyDef;

    var fixDef = new b2FixtureDef;
    fixDef.density = ball.density;
    fixDef.friction = ball.friction;
    fixDef.restitution = ball.restitution;

    bodyDef.type = b2Body.b2_staticBody;

    var positionX = level.ballPosition.x + Math.random()*level.ballRandomRange.x - level.ballRandomRange.x/2;
    var positionY = level.ballPosition.y + Math.random()*level.ballRandomRange.y - level.ballRandomRange.y/2;
    bodyDef.position.x = positionX/pxPerMeter;
    bodyDef.position.y = positionY/pxPerMeter;

    fixDef.shape = new b2CircleShape(ball.radius/pxPerMeter);

    this.ball = this.world.CreateBody(bodyDef);
    this.ball.CreateFixture(fixDef);

    game.view.addSpriteToBody(this.ball, ball.className);

  };

  physics.ballPosition = function(){
    var pos = this.ball.GetPosition();
    return {
      x: pos.x * pxPerMeter,
      y: pos.y * pxPerMeter
    };
  };

  physics.launchAngle = function(stageX, stageY) {
    var ballPos = this.ballPosition();

    var diffX = stageX - ballPos.x;
    var diffY = stageY - ballPos.y;

    // Quadrant
    var degreeAddition = 0; // Quadrant I
    if (diffX < 0 && diffY > 0) {
      degreeAddition = Math.PI; // Quadrant II
    } else if (diffX < 0 && diffY < 0) {
      degreeAddition = Math.PI; // Quadrant III
    } else if (diffX > 0 && diffY < 0) {
      degreeAddition = Math.PI * 2; // Quadrant IV
    }

    var theta = Math.atan(diffY / diffX) + degreeAddition;
    return theta;
  };

  physics.shootBall = function(stageX, stageY, ticksDiff) {
    this.ball.SetType(b2Body.b2_dynamicBody);

    var theta = this.launchAngle(stageX, stageY);

    var r = Math.log(ticksDiff) * 50; // power

    var resultX = r * Math.cos(theta);
    var resultY = r * Math.sin(theta);

    this.ball.ApplyTorque(30); // rotate it

    // shoot the ball
    this.ball.ApplyImpulse(new b2Vec2(resultX/pxPerMeter, resultY/pxPerMeter), this.ball.GetWorldCenter());

    this.ball = undefined;
  };

  physics.update = function() {
    this.world.Step(1 / 60, 10, 10);
    if (shouldDrawDebug) {
      this.world.DrawDebugData();
    }
    this.world.ClearForces();

    // draw sprites
    var body = this.world.GetBodyList();
    while (body) {
      var sprite = body.GetUserData();

      if (sprite) {
        var position = body.GetWorldCenter();
        sprite.x = position.x * pxPerMeter;
        sprite.y = position.y * pxPerMeter;
        sprite.rotation = body.GetAngle() * 180 / Math.PI; // rad to degree
      }

      body = body.GetNext();
    }

    // remove bodies
    for (var i=0, len=this.bodiesToBeRemove.length; i<len; i++) {
      var body = this.bodiesToBeRemove[i];
      var sprite = body.GetUserData();
      if (sprite) {
        sprite.parent.removeChild(sprite);
      }
      this.world.DestroyBody(body);
    }
    this.bodiesToBeRemove.length = 0;
  };

  physics.showDebugDraw = function() {
    shouldDrawDebug = true;

    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("debug-canvas").getContext("2d"));
    debugDraw.SetDrawScale(pxPerMeter);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
  };


}).call(this, game, createjs, Box2D);