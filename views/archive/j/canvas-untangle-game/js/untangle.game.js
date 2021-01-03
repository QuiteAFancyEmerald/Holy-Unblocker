if (untangleGame === undefined) {
  var untangleGame = {};
}

untangleGame.currentLevel = 0;
untangleGame.levelProgress = 0;

untangleGame.setupCurrentLevel = function() {
  untangleGame.circles = [];
  var level = untangleGame.levels[untangleGame.currentLevel];
  for (var i=0; i<level.circles.length; i++) {
    untangleGame.circles.push(new untangleGame.Circle(level.circles[i].x, level.
    circles[i].y, 10));
  }

  untangleGame.levelProgress = 0;

  // setup line data after setup the circles.
  untangleGame.connectCircles();
  untangleGame.updateLineIntersection();
  untangleGame.checkLevelCompleteness();
  untangleGame.updateLevelProgress();
};

untangleGame.checkLevelCompleteness = function() {
  if (untangleGame.levelProgress === 100) {
    if (untangleGame.currentLevel+1 < untangleGame.levels.length) {
      untangleGame.currentLevel+=1;
    }
    untangleGame.setupCurrentLevel();
  }
};

untangleGame.updateLevelProgress = function() {
  // check the untangle progress of the level
  var progress = 0;
  for (var i=0;i<untangleGame.lines.length;i++) {
    if (untangleGame.lines[i].thickness === untangleGame.
    thinLineThickness) {
      progress+=1;
    }
  }
  var progressPercentage = Math.floor(progress/untangleGame.lines.length*100);

  untangleGame.levelProgress = progressPercentage;

  $("#progress").text(progressPercentage);

  // display the current level
  $("#level").text(untangleGame.currentLevel);
};
