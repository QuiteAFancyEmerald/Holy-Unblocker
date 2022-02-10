;~function(global){
	'use strict';
	var Game = global.Game;
	if (Game) {
		var str;
		if (/zh\-cn/i.test(navigator.language)) {
			str = ['我走了', '层，不服来战 | ', '是男人就下100层'];
		} else if (/zh\-/i.test(navigator.language)) {
			str = ['我走了', '層，不服來戰 | ', '小朋友下樓梯'];
		} else {
			str = ['I finished ', ' floors, challenge me | ', 'NS-SHAFT'];
		}
		Game.on('gameOver', function(score, bestScore) {
			if (bestScore >= 10) {
				document.title = str[0] + bestScore + str[1] + str[2];
			} else {
				document.title = str[2];
			}
		});
		Game.on('gameStart', function() {
			document.title = str[2];
		});
	}
}(window);