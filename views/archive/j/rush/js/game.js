// window/global scope
var rush = rush || {};


window.onload = function() {
  // entry point
  rush.game = new rush.Game();

  // listen to the a-href buttons
  var startButton = document.getElementById('start-btn');
  startButton.onclick = function() {
    var menuScene = document.getElementById('menu');
    menuScene.classList.add('hidden');
    rush.game.initGame();
  }

  var restartButton = document.getElementById('restart-btn');
  restartButton.onclick = function() {
    var gameoverScene = document.getElementById('gameover');
    gameoverScene.classList.add('hidden');
    rush.game.initGame();
    createjs.Ticker.setPaused(false);
  }

  // non-game top scores leader board
  var topScoresBoard = document.getElementById('top-scores-board');
  topScoresBoard.innerHTML = (new rush.TopScores()).toHTML();
};