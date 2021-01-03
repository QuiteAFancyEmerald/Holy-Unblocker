if (untangleGame === undefined) {
  var untangleGame = {};
}

untangleGame.handleInput = function(){
  // Add Mouse Event Listener to canvas
  // we find if the mouse down position is on any circle
  // and set that circle as target dragging circle.
  $("#layers").bind("mousedown touchstart", function(e) {
    // disable default drag to scroll behavior
    e.preventDefault();

    // touch or mouse position
    var touch = e.originalEvent.touches && e.originalEvent.touches[0];
    var pageX = (touch||e).pageX;
    var pageY = (touch||e).pageY;

    var canvasPosition = $(this).offset();
    var mouseX = pageX - canvasPosition.left;
    var mouseY = pageY - canvasPosition.top;

    for(var i=0;i<untangleGame.circles.length;i++) {
      var circleX = untangleGame.circles[i].x;
      var circleY = untangleGame.circles[i].y;
      var radius = untangleGame.circles[i].radius;
      if (Math.pow(mouseX-circleX,2) + Math.pow(mouseY-circleY,2) <
      Math.pow(radius,2)) {
        untangleGame.targetCircleIndex = i;
        break;
      }
    }
  });

  // we move the target dragging circle when the mouse is moving
  $("#layers").bind("mousemove touchmove", function(e) {
    // disable default drag to scroll behavior
    e.preventDefault();

    // touch or mouse position
    var touch = e.originalEvent.touches && e.originalEvent.touches[0];
    var pageX = (touch||e).pageX;
    var pageY = (touch||e).pageY;

    var canvasPosition = $(this).offset();
    var mouseX = pageX - canvasPosition.left;
    var mouseY = pageY - canvasPosition.top;

    if (untangleGame.targetCircleIndex !== undefined) {
      var circle = untangleGame.circles[untangleGame.targetCircleIndex];
      circle.x = mouseX;
      circle.y = mouseY;
    }
    untangleGame.connectCircles();
    untangleGame.updateLineIntersection();
    untangleGame.updateLevelProgress();
  });

  // We clear the dragging circle data when mouse is up
  $("#layers").bind("mouseup touchend", function(e) {
    untangleGame.targetCircleIndex = undefined;

    // on every mouse up, check if the untangle puzzle is solved.
    untangleGame.checkLevelCompleteness();
  });
};
