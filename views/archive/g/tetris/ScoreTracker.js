function ScoreTracker(scoreOutput, linesOutput, levelOutput, tickerOutput) {
    this.level = 1;
    this.score = 0;
    this.linesRemaining = ScoreTracker.levelLines(this.level);

    this.scoreOutput = scoreOutput;
    this.linesOutput = linesOutput;
    this.levelOutput = levelOutput;
    this.tickerOutput = tickerOutput;
    
    this.curCombo = -1;
    this.lastWasBonus = false;
    this.backToBackCount = 0;

    this.isGameWon = false;

    this.outputScore();
    this.outputLines();
    this.outputLevel();
}

ScoreTracker.levelLines = function (level) {
    return level*5;
};

ScoreTracker.prototype.updateScore = function(config) {
    var linesCleared = 0,
    isBonus = false,
    scoreDiff = 0,
    tickerLines = [],
    i;

    if (config.miniT) {
	// mini t spin, 1 for no lines, 2 for 1 line
	tickerLines.push("T Spin Mini");
	linesCleared += 1;
	scoreDiff += 100 * this.level;
	if (config.lines === 1) {
	    linesCleared += 1;
	    scoreDiff += 100 * this.level;
	}
    } else if (config.normalT) {
	// normal t spin, bonus for eveything but 0 lines
	switch (config.lines) {
	case 0:
	    tickerLines.push("T Spin");
	    linesCleared += 4;
	    scoreDiff += 400 * this.level;
	    break;
	case 1:
	    tickerLines.push("T Spin Single");
	    linesCleared += 8;
	    isBonus = true;
	    scoreDiff += 800 * this.level;
	    break;
	case 2:
	    tickerLines.push("T Spin Double");
	    linesCleared += 12;
	    isBonus = true;
	    scoreDiff += 1200 * this.level;
	    break;
	case 3:
	    tickerLines.push("T SPIN TRIPLE");
	    linesCleared += 16;
	    isBonus = true;
	    scoreDiff += 1600 * this.level;
	    break;
	}
    } else if (config.lines > 0) {
	// plain old line clears
	switch (config.lines) {
	case 1:
	    tickerLines.push("Single");
	    linesCleared += 1;
	    scoreDiff += 100 * this.level;
	    break;
	case 2:
	    tickerLines.push("Double");
	    linesCleared += 3;
	    scoreDiff += 300 * this.level;
	    break;
	case 3:
	    tickerLines.push("Triple");
	    linesCleared += 5;
	    scoreDiff += 500 * this.level;
	    break;
	case 4:
	    tickerLines.push("TETRIS");
	    linesCleared += 8;
	    isBonus = true;
	    scoreDiff += 800 * this.level;
	    break;
	}
    }

    // apply the combo
    if (linesCleared > 0) {
	this.curCombo += 1;
	linesCleared += Math.floor(this.curCombo * 0.5);
	scoreDiff += 50 * this.curCombo * this.level;
	if (this.curCombo >= 1) {
	    tickerLines.push("Combo x" + this.curCombo);
	}
    } else {
	this.curCombo = -1;
    }

    // apply back-to-back bonus
    if (this.lastWasBonus && isBonus) {
	tickerLines.push("Back-to-Back");
	this.backToBackCount += 1;
	linesCleared = Math.floor(linesCleared * 1.5);	
	scoreDiff += this.backToBackCount * 0.5 * scoreDiff;
    } else {
	this.backToBackCount = 0;
    }
    // only update the last bonus state if a single through triple was gotten
    if (config.lines > 0) {
	this.lastWasBonus = isBonus;
    }
    
    // apply the lines cleared
    this.linesRemaining -= linesCleared;    
    if (this.linesRemaining <= 0) {
	if (this.level < 15) {
	    this.level += 1;
	    this.linesRemaining = ScoreTracker.levelLines(this.level);
	} else {
	    this.isGameWon = true;
	}
	this.outputLevel();
    }

    if (linesCleared > 0) {
	this.outputLines();
    }


    this.score += scoreDiff;
    this.outputScore();

    if (tickerLines.length === 0) {
	this.tickerOutput.addLine("");
    } else {
	for (i = 0; i < tickerLines.length; i += 1) {
	    this.tickerOutput.addLine(tickerLines[i]);
	}
    }
};

ScoreTracker.prototype.softDrop = function() {
    this.score += 1;
};

ScoreTracker.prototype.hardDrop = function(dist) {
    this.score += 2 * dist;
};

ScoreTracker.prototype.getLinesRemaining = function() { return this.linesRemaining; };
ScoreTracker.prototype.getScore = function() { return this.score; };
ScoreTracker.prototype.getLevel = function() { return this.level; };

ScoreTracker.prototype.getLevelPeriod = function() {
    var periods = [
	1000,
	800,
	600,
	470,
	380,
	250,
	200,
	160,
	130,
	90,
	50,
	27,
	20,
	15,
	10
    ],
    res = periods[(this.level < periods.length) ? this.level : periods.length - 1];
    return res;
};

ScoreTracker.prototype.gameWon = function() {
    return this.isGameWon;
};

ScoreTracker.prototype.getResults = function() {
    return {
	score: this.score,
	level: this.level,
	won: this.isGameWon
    };
};

ScoreTracker.prototype.outputScore = function() {
    this.scoreOutput.addLine("Score:");
    this.scoreOutput.addLine("" + this.score);
    this.scoreOutput.addLine("");
};

ScoreTracker.prototype.outputLines = function() {
    this.linesOutput.addLine("Lines:");
    this.linesOutput.addLine("" + this.linesRemaining);
    this.linesOutput.addLine("");
};

ScoreTracker.prototype.outputLevel = function() {
    this.levelOutput.addLine("Level:");
    this.levelOutput.addLine("" + this.level);
    this.levelOutput.addLine("");
};
