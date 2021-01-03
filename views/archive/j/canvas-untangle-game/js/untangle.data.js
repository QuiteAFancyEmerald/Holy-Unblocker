if (untangleGame === undefined) {
  var untangleGame = {};
}

untangleGame.circles = [];

untangleGame.Circle = function(x,y,radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
};

untangleGame.Line = function(startPoint, endPoint, thickness) {
  this.startPoint = startPoint;
  this.endPoint = endPoint;
  this.thickness = thickness;
};

untangleGame.createRandomCircles = function(width, height) {
  // randomly draw 5 circles
  var circlesCount = 5;
  var circleRadius = 10;
  for (var i=0;i<circlesCount;i++) {
    var x = Math.random()*width;
    var y = Math.random()*height;
    untangleGame.circles.push(new untangleGame.Circle(x,y,circleRadius));
    untangleGame.drawCircle(x, y, circleRadius);
  }
};

untangleGame.isIntersect = function(line1, line2) {
  // convert line1 to general form of line: Ax+By = C
  var a1 = line1.endPoint.y - line1.startPoint.y;
  var b1 = line1.startPoint.x - line1.endPoint.x;
  var c1 = a1 * line1.startPoint.x + b1 * line1.startPoint.y;

  // convert line2 to general form of line: Ax+By = C
  var a2 = line2.endPoint.y - line2.startPoint.y;
  var b2 = line2.startPoint.x - line2.endPoint.x;
  var c2 = a2 * line2.startPoint.x + b2 * line2.startPoint.y;

  // calculate the intersection point
  var d = a1*b2 - a2*b1;

  // parallel when d is 0
  if (d === 0) {
    return false;
  }

  // solve the interception point at (x, y)
  var x = (b2*c1 - b1*c2) / d;
  var y = (a1*c2 - a2*c1) / d;

  // check if the interception point is on both line segments
  if ((untangleGame.isInBetween(line1.startPoint.x, x, line1.endPoint.x) || untangleGame.isInBetween(line1.startPoint.y, y, line1.endPoint.y)) &&
      (untangleGame.isInBetween(line2.startPoint.x, x, line2.endPoint.x) || untangleGame.isInBetween(line2.startPoint.y, y, line2.endPoint.y))) {
    return true;
  }

  // be default the given lines is not intersected.
  return false;
};

// return true if b is between a and c,
// we exclude the result when a==b or b==c
untangleGame.isInBetween = function(a, b, c) {
  // return false if b is almost equal to a or c.
  // this is to eliminate some floating point when
  // two value is equal to each other but different with 0.00000...0001
  if (Math.abs(a-b) < 0.000001 || Math.abs(b-c) < 0.000001) {
    return false;
  }

  // true when b is in between a and c
  return (a < b && b < c) || (c < b && b < a);
};

untangleGame.updateLineIntersection = function() {
  // checking lines intersection and bold those lines.
  for (var i=0;i<untangleGame.lines.length;i++) {
    var line1 = untangleGame.lines[i];
    line1.thickness = untangleGame.thinLineThickness;

    for(var j=0;j<i;j++) {
      var line2 = untangleGame.lines[j];

      // we check if two lines are intersected,
      // and bold the line if they are.
      if (untangleGame.isIntersect(line1, line2)) {
        line1.thickness = untangleGame.boldLineThickness;
        line2.thickness = untangleGame.boldLineThickness;
      }
    }
  }
};
