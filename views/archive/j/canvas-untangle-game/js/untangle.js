if (untangleGame === undefined) {
  var untangleGame = {};
}

untangleGame.layers = [];

// Entry point
$(document).ready(function(){
  // prepare layer 0 (bg)
  var canvas_bg = document.getElementById("bg");
  untangleGame.layers[0] = canvas_bg.getContext("2d");

  // prepare layer 1 (guide)
  var canvas_guide = document.getElementById("guide");
  untangleGame.layers[1] = canvas_guide.getContext("2d");

  // prepare layer 2 (game)
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  untangleGame.layers[2] = ctx;

  // prepare layer 3 (ui)
  var canvas_ui = document.getElementById("ui");
  untangleGame.layers[3] = canvas_ui.getContext("2d");


  var width = canvas.width;
  var height = canvas.height;

  untangleGame.handleInput();

  untangleGame.setupCurrentLevel();

  untangleGame.loadImages();


  // setup an interval to loop the game loop
  setInterval(gameloop, 30);

  function gameloop() {

    // clear the canvas before re-drawing.
    untangleGame.clear(2);
    untangleGame.clear(3);



    untangleGame.drawAllLines();

    untangleGame.drawAllCircles();

    untangleGame.drawLevelProgress();

    untangleGame.dimUILayerIfNeeded();
  }

});
