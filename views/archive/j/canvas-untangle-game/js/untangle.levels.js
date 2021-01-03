if (untangleGame === undefined) {
  var untangleGame = {};
}

// levels data
untangleGame.levels = [
  {
    circles : [
      {x : 400, y : 156},
      {x : 381, y : 241},
      {x : 84, y : 233},
      {x : 88, y : 73}],
    relationship : [
      {connectedPoints : [1,2]},
      {connectedPoints : [0,3]},
      {connectedPoints : [0,3]},
      {connectedPoints : [1,2]}
    ]
  },
  {
    circles : [
      {x : 401, y : 73},
      {x : 400, y : 240},
      {x : 88, y : 241},
      {x : 84, y : 72}],
    relationship : [
      {connectedPoints : [1,2,3]},
      {connectedPoints : [0,2,3]},
      {connectedPoints : [0,1,3]},
      {connectedPoints : [0,1,2]}
    ]
  },
  {
    circles : [
      {x : 192, y : 155},
      {x : 353, y : 109},
      {x : 493, y : 156},
      {x : 490, y : 236},
      {x : 348, y : 276},
      {x : 195, y : 228}],
    relationship : [
      {connectedPoints : [2,3,4]},
      {connectedPoints : [3,5]},
      {connectedPoints : [0,4,5]},
      {connectedPoints : [0,1,5]},
      {connectedPoints : [0,2]},
      {connectedPoints : [1,2,3]}
    ]
  }
];
