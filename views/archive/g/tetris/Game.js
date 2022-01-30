function Game(inputMapping, autoRepeat, threshold) {
    var thisObject = this,
    i;

    this.firstLoop = true;

    this.blocks = [];    
    this.controlGroup = null;

    // make the preview blocks
    this.previewBlocks = [];
    for (i = 0; i < 4; i += 1) {
	this.previewBlocks.push(new Block({blockX: -10, blockY: -10, preview: true}));
    }

    this.scoreOutput = new TtyBlock("scoreDiv", 3);
    this.linesOutput = new TtyBlock("linesDiv", 3);
    this.levelOutput = new TtyBlock("levelDiv", 3);
    this.tickerOutput = new TtyBlock("tickerDiv", 5);
    this.scoreTracker = new ScoreTracker(this.scoreOutput, this.linesOutput, this.levelOutput, this.tickerOutput);

    this.dropPeriod = this.scoreTracker.getLevelPeriod();
    this.timeToNextDrop = this.dropPeriod;

    // TODO: find the official values for these constants
    this.keyChargeTime = threshold;
    this.keyRepeatTime = autoRepeat;
    
    this.bottomTimer = null;
    this.bottomLockTime = 500;
    this.lastBottomedState = false;

    this.lastTime = null;
    
    this.gameLost = false;

    // evenly distributed random piece generator
    this.previewLength = 5;
    this.randBag = new RandomBag(this.previewLength);
    // make the preview blocks
    this.previewGroups = [];
    for (i = 0; i < this.previewLength; i += 1) {
	this.previewGroups.push(new PreviewGroup(330, 70 * i + 35));
    }

    this.swapGroup = null;
    this.swapAllowed = true;

    // the currently occupied positions, number of blocks at a position
    // indexed by the position as a string
    this.occupiedPositions = {};

    this.input = {
	shiftLeft: { 
	    autoRepeat: true,
	    handler: function () {
		if (thisObject.controlGroup.shift(true)) {
		    thisObject.resetLockCounter(true);
		}
	    }
	},
	shiftRight: { 
	    autoRepeat: true,
	    handler: function() {
		if (thisObject.controlGroup.shift(false)) {
		    thisObject.resetLockCounter(true);
		}
	    }
	},
	softDrop: {
	    autoRepeat: true,
	    preCharged: true,
	    handler: function() {
		thisObject.dropBlock();
		thisObject.scoreTracker.softDrop();
	    }
	},
	hardDrop: { handler: function() {
	    var dist = thisObject.controlGroup.fall();
	    thisObject.scoreTracker.hardDrop(dist);
	    thisObject.lockBlocks();
	}},
	rotateLeft: { handler: function() {
	    if (thisObject.controlGroup.turn(false)) {
		thisObject.resetLockCounter(true);
	    }
	}},
	rotateRight: { handler: function() {
	    if (thisObject.controlGroup.turn(true)) {
		thisObject.resetLockCounter(true);
	    }
	}},
	swap: { handler: function() {
	    thisObject.swap();
	}}
    };

    this.inputMapping = inputMapping;
}

/**
* drops a new block into the game
*/
Game.prototype.newBlock = function (calledBySwap) {
    var thisObject = this,
    shape = this.randBag.popQueue(),
    newBlocks = [],
    curBlock,
    i;

    this.dropPeriod = this.scoreTracker.getLevelPeriod();

    // create some new blocks
    for (i = 0; i < 4; i += 1) {
	curBlock = new Block({blockX: -10, blockY: -10, shape: shape, occupiedPositions: this.occupiedPositions});
	newBlocks.push(curBlock);
	this.blocks.push(curBlock);
    }

    this.controlGroup = new ControlGroup(newBlocks, shape, function(x, y){
	return thisObject.isLegalPosition(x, y);
    });
    
    if (this.controlGroup.isIllegalStart) {
	this.gameLost = true;
    }

    if (!calledBySwap) {
	// the user is allowed to swap blocks again
	this.swapAllowed = true;
    }

    this.updatePreviews(this.randBag.getQueue());
};

/**
* processes the input keys
* @param {Number} dTime - the time in milliseconds since the last frame
*/
Game.prototype.processInput = function(dTime) {
    var curInput,
    keyName,
    curKeys,
    pressed,
    curInput,
    i;

    for (actionType in this.inputMapping) {
	curKeys = this.inputMapping[actionType];
	curInput = this.input[actionType];
	pressed = false;
	for (i = 0; i < curKeys.length; i += 1) {
	    if (jaws.pressed(curKeys[i])) {
		pressed = true;
	    }
	}
	
	//  if the key is down
	if (pressed) {
	    // if it is a 'press' frame
	    if (!curInput.lastState) {
		curInput.handler();
		curInput.lastState = true;
		curInput.charged = (curInput.preCharged ? true : false);
		curInput.holdTime = 0;
	    }
	    // if it supports auto-repeat
	    if (curInput.autoRepeat) {
		curInput.holdTime += dTime;

		// if not charged and past the charge time
		if ((!curInput.charged) && (curInput.holdTime > this.keyChargeTime)) {
		    // call the handler, and reset the hold time
		    curInput.holdTime -= this.keyChargeTime;
		    curInput.handler();
		    curInput.charged = true;
		}
		// if charged and past the repeat time
		if (curInput.charged && (curInput.holdTime > this.keyRepeatTime)) {
		    curInput.holdTime -= this.keyRepeatTime;
		    curInput.handler();
		}
	    }
	} else {
	    // it was released
	    curInput.lastState = false;
	}
    }
};

Game.prototype.update = function(time) {
    var curTime,
    dTime,
    i;

    // if the first block needs to be made
    if (this.firstLoop) {
	this.firstLoop = false;

	this.newBlock();

	this.lastTime = time;
    }

    curTime = time;
    dTime = curTime - this.lastTime;
    this.lastTime = curTime;

    this.processInput(dTime);

    if (!this.controlGroup.isBottomed()) {
	this.lastBottomedState = false;
	this.applyGravity(dTime);

    } else {
	// if it has just touched hte bottom
	if (!this.lastBottomedState) {
	    this.resetLockCounter(false);
	} else {
	    this.bottomTimer -= dTime;
	    
	    if (this.bottomTimer <= 0 || this.slideCount >= 15) {
		this.lockBlocks();
	    }
	}
	this.lastBottomedState = true;
    }

    // update the position of the preview blocks
    if (this.controlGroup) {
	// ask the control group to move the preview blocks
	this.controlGroup.configurePreviewBlocks(this.previewBlocks);
    } else {
	// if there is no contorl group, just move them off the screen
	for (i = 0; i < 4; i += 1) {
	    this.previewBlocks[i].setPosition(-10, -10);
	}
    }
};

/**
* Renders the entire game scene
*/
Game.prototype.draw = function(dTime) {
    var i;
    
    this.scoreOutput.draw(dTime);
    this.linesOutput.draw(dTime);
    this.levelOutput.draw(dTime);
    this.tickerOutput.draw(dTime);

    // draw the preview blocks
    for (i = 0; i < 4; i += 1) {
	this.previewBlocks[i].drawIfInvalid();
    }

    // draw the swap block
    if (this.swapGroup) {
	this.swapGroup.draw();
    }

    // draw the queue
    for (i = 0; i < this.previewGroups.length; i += 1) {
	this.previewGroups[i].draw();
    }

    for (i = 0; i < this.blocks.length; i += 1) {
	this.blocks[i].drawIfInvalid();
    }

};

/**
* Returns true iff the given position can be moved into
* @param {Number} x - the x position
* @param {Number} y - the y position
* @returns {Boolean} true iff the new position is legal
*/
Game.prototype.isLegalPosition = function (x, y) {
    // if there is a block in the way
    if (this.occupiedPositions[x+','+y]) {
	return false;
    }
    
    // if it's on the field
    if (x >= 10 || x < 0 || y >= 20) {
	return false;
    }
    return true;
};

/**
* drops the controlled blocks by one
*/
Game.prototype.dropBlock = function (causedByGravity) {
    if (!causedByGravity) {
	this.timeToNextDrop = this.dropPeriod;
    }

    this.controlGroup.drop();
};
