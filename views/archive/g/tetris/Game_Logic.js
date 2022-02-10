
/**
* @returns {[Number]} the line numbers of all the completed rows
*/ 
Game.prototype.getRows = function () {
    var i,
    rows = [],
    res = [],
    curRow;

    // initialize the rows to 0
    for (i = 0; i < 20; i += 1) {
	rows[i] = 0;
    }
    // for each block
    for (i = 0; i < this.blocks.length; i += 1) {
	// increment the appropriate row
	curRow = this.blocks[i].getY();
	rows[curRow] += 1;
	// if the row is full
	if (rows[curRow] === 10) {
	    res.push(curRow);
	}
    }

    return res;
};

/**
* Removes the rows from the field
*/
Game.prototype.removeRows = function (rows) {
    var dropDist = {},
    i, j,
    remove = {},
    curBlock,
    curY;

    // initialize drops to 0
    for (i = -4; i < 20; i += 1) {
	dropDist[i] = 0;
    }

    // for each removed row
    for (i = 0; i < rows.length; i += 1) {
	remove[rows[i]] = true;
	
	// every row above this should be dropped another spot
	for (j = -4; j < rows[i]; j += 1) {
	    dropDist[j] += 1;
	}
    }

    // for each block
    for (i = 0; i < this.blocks.length; i += 1) {
	curBlock = this.blocks[i];
	curY = curBlock.getY();

	// if it is being removed
	if (remove[curY]) {
	    // remove the block
	    this.removeBlock(i);
	    i -= 1;
	} else {
	    // it is being dropped
	    curBlock.setPosition(curBlock.getX(), curBlock.getY() + dropDist[curY]);
	}
    }
};

Game.prototype.removeBlock = function(index) {
    this.blocks[index].kill();
    return this.blocks.splice(index, 1);
};

Game.prototype.applyGravity = function (dTime) {
    this.timeToNextDrop -= dTime;

    // drop until there is a positive time until the next drop time is positive, or the control group s bottomed out
    while (this.timeToNextDrop < 0 && (!this.controlGroup.isBottomed())) {
	this.dropBlock(true);
	this.timeToNextDrop += this.dropPeriod;
    }

    // if it exited through bottoming, reset the drop period
    if (this.controlGroup.isBottomed()) {
	this.timeToNextDrop = this.dropPeriod;
    }
};

/**
* Changes the shapes of the preview along the side
* @param {[Char]} queue - the queue of pieces
*/
Game.prototype.updatePreviews = function(queue) {
    var i;
    for (i = 0; i < queue.length; i += 1) {
	this.previewGroups[i].setShape(queue[i]);
    }
};

/**
* called when the user attempts to swap a block
*/
Game.prototype.swap = function() {
    var i, j,
    newShape,
    oldShape = this.controlGroup.getShape(),
    oldBlocks = this.controlGroup.getBlocks(),
    newBlocks = [],
    thisObject = this;

    // can only be called once per drop
    if (!this.swapAllowed) {
	return;
    }
    this.swapAllowed = false;

    // Reset the locking
    this.resetLockCounter(false);

    // remove the blocks
    // for each block on the field
    for (i = 0; i < this.blocks.length; i += 1) {
	// if the block is part of the control group, remove it
	for (j = 0; j < 4; j += 1) {
	    if (oldBlocks[j] === this.blocks[i]) {
		this.removeBlock(i);
		i -= 1;
	    }
	}
    }
    
    // if there is a block waiting
    if (this.swapGroup) {
	newShape = this.swapGroup.getShape();
	for (i = 0; i < 4; i += 1) {
	    newBlocks.push(new Block({blockX:-10, blockY:-10, shape: newShape, occupiedPositions: this.occupiedPositions}));
	    this.blocks.push(newBlocks[i]);
	}
	
	this.controlGroup = new ControlGroup(newBlocks, newShape, function(x, y){
	    return thisObject.isLegalPosition(x, y);
	});

	this.swapGroup.setShape(oldShape);

	return;
    }

    // if there is no block waiting
    this.swapGroup = new PreviewGroup(-100, 60);
    this.swapGroup.setShape(oldShape);
    this.newBlock(true);    

};

/**
* locks the currnt piece in, registers lines and makes a new block
*/
Game.prototype.lockBlocks = function() {
    // figure out if it a t-spin/t-spin mini
    var tSpinType = this.controlGroup.getTSpin(),
    scoreObject = {},
    rows;

    if (tSpinType === 'mini') {
	scoreObject.miniT = true;
    } else if (tSpinType === 'normal') {
	scoreObject.normalT = true;
    }

    // look for rows
    rows = this.getRows();
    scoreObject.lines = rows.length;
    if (rows.length > 0) {
	this.removeRows(rows);
    }

    // apply the score
    this.scoreTracker.updateScore(scoreObject);

    this.newBlock();
    this.resetLockCounter(false);
};

/**
* Resets the lock counter, and the slide counter if not soft
* @param {Boolean} soft = true if a soft reset, and the slide counter should not be reset
*/
Game.prototype.resetLockCounter = function (soft) {
    if (soft) {
	this.slideCount += 1;
    } else {
	this.slideCount = 0;
    }
    this.bottomTimer = this.bottomLockTime;
};

/**
 * Determines if the game is over and returns a score object
 * if it is. Otherwise, returns null
 */
Game.prototype.getResults = function() {
    if (this.gameLost || this.scoreTracker.gameWon()) {
	return this.scoreTracker.getResults();
    }
    return null;
};
