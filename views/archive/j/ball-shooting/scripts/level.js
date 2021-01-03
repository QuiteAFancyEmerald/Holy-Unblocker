var game = this.game || (this.game={});

(function(game){

  var degrees = Math.PI / 180

  game.balls = {
    'slow ball': {
      className: 'SlowBall',
      radius: 13,
      density: 0.6,
      friction: 0.8,
      restitution: 0.1
    },
    'bouncy ball': {
      className: 'BouncyBall',
      radius: 10,
      density: 1.1,
      friction: 0.8,
      restitution: 0.4
    }
  };
  game.levels = [
    {
      hoopPosition: {x:50, y:150},
      ballName: 'slow ball',
      ballPosition: {x:350, y:250},
      ballRandomRange: {x:60, y:60},
      obstacles: []
    },
    {
      hoopPosition: {x:50, y:200},
      ballName: 'slow ball',
      ballPosition: {x:350, y:200},
      ballRandomRange: {x:160, y:0},
      obstacles: []
    },
    {
      hoopPosition: {x:50, y:160},
      ballName: 'bouncy ball',
      ballPosition: {x:350, y:250},
      ballRandomRange: {x:80, y:80},
      obstacles: []
    },
    {
      hoopPosition: {x:50, y:160},
      ballName: 'slow ball',
      ballPosition: {x:350, y:250},
      ballRandomRange: {x:80, y:80},
      obstacles: [
        {
          type: 'rect',
          graphicName: 'BrownSquare',
          position: {x: 200, y: 160},
          dimension: {width: 10, height:10},
          angle: 0
        },
        {
          type: 'rect',
          graphicName: 'BrownSquare',
          position: {x: 200, y: 120},
          dimension: {width: 10, height:10},
          angle: 0
        },
      ]
    },
    {
      hoopPosition: {x:50, y:160},
      ballName: 'slow ball',
      ballPosition: {x:350, y:250},
      ballRandomRange: {x:80, y:80},
      obstacles: [
        {
          type: 'cross',
          graphicName: 'Cross',
          position: {x: 165, y: 140},
          length: 60,
          width: 10,
          enableMotor: true,
          maxTorque: 25,
          motorSpeed: 3.0
        },
      ]
    },
    {
      hoopPosition: {x:50, y:150},
      ballName: 'slow ball',
      ballPosition: {x:350, y:250},
      ballRandomRange: {x:60, y:60},
      obstacles: [
        {
          type: 'cross',
          graphicName: 'Cross',
          position: {x: 165, y: 140},
          length: 60,
          width: 10,
          enableMotor: true,
          maxTorque: 25,
          motorSpeed: 3.0
        },
        {
          type: 'rect',
          graphicName: 'BrownSquare',
          position: {x: 200, y: 55},
          dimension: {width: 10, height:10},
          angle: 0
        },
        {
          type: 'rect',
          graphicName: 'BrownSquare',
          position: {x: 260, y: 100},
          dimension: {width: 10, height:10},
          angle: 0
        },
        {
          type: 'rect',
          graphicName: 'BrownSquare',
          position: {x: 300, y: 100},
          dimension: {width: 10, height:10},
          angle: 0
        }
      ]
    }
  ];
  game.currentLevel = game.levels[0]; // default the 1st level.
}).call(this, game);