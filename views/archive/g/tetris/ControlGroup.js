
/**
* The blocks that can be moved nby the user
* @param {Array} blocks - an array of [Block] of size 4 that can be operated on
* @param {Char} shape - the block type: i, o, j, l, s, z, t
* @param {function({Number}x, {Number}y)} isLegalCallback - a function that retursn true if a block can be moved
* to the new position
*/
function ControlGroup(blocks, shape, isLegalCallback) {
    var i,
    newX, newY,
    shapeConf;
    
    // place the blocks according to the shape
    shapeConf = SHAPES[shape];
    this.pos = shapeConf.pos;
    this.spin = shapeConf.spin;
    this.bottomed = false;

    this.blocks = blocks;
    this.baseX = shapeConf.startX;
    this.baseY = shapeConf.startY;

    this.shape = shape;
    this.kickOffsets = WALL_KICK_OFFSETS[shapeConf.kickType];
    this.dir = 0;

    this.isIllegalStart = false;

    this.isLegalCallback = isLegalCallback || function() {return true;};

    this.lastWasSpin = false;

    for (i = 0; i < blocks.length; i += 1) {
	newX = this.baseX + this.pos[i].x;
	newY = this.baseY + this.pos[i].y;
	// see if the block placement is illegal before placing
	if (!this.isLegalCallback(newX, newY)) {
	    this.isIllegalStart = true;
	}
	this.blocks[i].setPosition(newX, newY);
    }

    this.updateBottomedState();
}

/**
* if the position is legal
* @param {Number} x
* @param {Number} y
* @returns {Boolean} true iff the position is legal to move to
*/
ControlGroup.prototype.isLegalPosition = function (x, y) {
    var i,
    blocks = this.blocks;

    // if it's a currently occupied, it must be legal
    for (i = 0; i < 4; i += 1) {
	if (blocks[i].isPosition(x, y)) {
	    return true;
	}
    }

    // if it's still not proven legal, then defer to the game to decide
    return this.isLegalCallback(x, y);
};

/**
* Shift the block left or right
* @param {Boolean} left - true to shift left false to shift right
* @returns {Boolean} true iff the shift was successful
*/
ControlGroup.prototype.shift = function(left) {
    var dx = (left ? -1 : 1),
    i;

    for (i = 0; i < 4; i += 1) {
	if (!this.isLegalPosition(this.blocks[i].getX()+dx, this.blocks[i].getY())) {
	    return false;
	}
    }

    this.lastWasSpin = false;
    this.baseX += dx;

    for (i = 0; i < this.blocks.length; i += 1) {
	this.blocks[i].moveBlock(dx, 0);
    }
    this.updateBottomedState();

    return true;
};

ControlGroup.prototype.updateBottomedState = function() {
    var i;

    for (i = 0; i < this.blocks.length; i += 1) {
	if (!this.isLegalPosition(this.blocks[i].getX(), this.blocks[i].getY() + 1)) {
	    this.bottomed = true;
	    return;
	}
    }

    this.bottomed = false;
};

/**
* Drop the block by one
*/
ControlGroup.prototype.drop = function() {
    var i;

    // don't drop if bottomed
    if (this.bottomed) {
	return;
    }

    this.lastWasSpin = false;
    this.baseY += 1;

    for (i = 0; i < this.blocks.length; i += 1) {
	this.blocks[i].moveBlock(0, 1);
    }
    this.updateBottomedState();
};

/**
* @returns {Boolean} true if the block is bottomed and another shoudl spawn
*/
ControlGroup.prototype.isBottomed = function() {
    return this.bottomed;
};

/**
* Turns the block
* @param {Boolean} cw - true for clockwise, false for counter-clockwise
* @returns {Boolean} true iff the block was successfully turned
*/
ControlGroup.prototype.turn = function(cw) {
    var kick,
    newPos = null,
    direction = cw ? 'cw' : 'ccw',
    availableKicks = this.kickOffsets[this.dir][direction],
    i;

    // for possible each kick offset
    for (i = 0; i < availableKicks.length; i += 1) {
	kick = availableKicks[i];
	newPos = this.tryTurn(cw, kick);
	if (newPos) {
	    break;
	}
    }

    // if there s still no valid rotation, fail
    if (!newPos) {
	return false;
    }

    this.lastWasSpin = true;

    // must be legal at this point move the bocks
    for (i = 0; i < 4; i += 1) {
	this.blocks[i].setPosition(newPos[i].x, newPos[i].y);
    }
    this.baseX += kick.x;
    this.baseY += kick.y;

    // keep track of the direction
    if (cw) {
	this.dir += 1;
	if (this.dir === 4) {
	    this.dir = 0;
	}
    } else {
	this.dir -= 1;
	if (this.dir === -1) {
	    this.dir = 3;
	}
    }

    this.updateBottomedState();

    return true;
};

/**
* Checks if the given rotation and kick is valid.
* @param {Boolean} cw - true if cw, false if ccw
* @param {Object} kick - the kick offset x/y object to try
* @returns {Array} and array of x/y objects if valid, null if not valid
*/
ControlGroup.prototype.tryTurn = function (cw, kick) {
    var newX, newY,
    oldX, oldY,
    i,
    newPos = [],
    curPos;

    if (this.spin === 'block') {
	for (i = 0; i < this.blocks.length; i += 1) {
	    newX = (cw ? -1 : 1) * (this.blocks[i].blockY - this.baseY) + this.baseX + kick.x;
	    newY = (cw ? 1 : -1) * (this.blocks[i].blockX - this.baseX) + this.baseY + kick.y;

	    newPos[i] = {x: newX, y: newY};
	}
    } else {
	// point turning
	for (i = 0; i < this.blocks.length; i += 1) {
	    oldX = this.blocks[i].blockX - this.baseX;
	    oldY = this.blocks[i].blockY - this.baseY;

	    if (oldX >= 0) { oldX += 1; }
	    if (oldY >= 0) { oldY += 1; }

	    newX = (cw ? -1 : 1) * oldY;
	    newY = (cw ? 1 : -1) * oldX;

	    if (newX > 0) { newX -= 1; }
	    if (newY > 0) { newY -= 1; }

	    newPos[i] = {x: newX + this.baseX + kick.x, y: newY + this.baseY + kick.y};
	}
    }

    
    // for each block
    for (i = 0; i < 4; i += 1) {
	curPos = newPos[i];
	if (!this.isLegalPosition(curPos.x, curPos.y)) {
	    return null;
	}
    }

    return newPos;

};

/**
* Gets the positions that the block will use when it falls
* @returns {Object} {dist:{Number}, positions: {[Object]} array of hashs of {x: Number, y: Number}}
*/
ControlGroup.prototype.getFallPositions = function () {
    var res = [],
    dist = 0,
    i,
    curBlock,
    notDone = true;

    while (notDone) {
	dist += 1;

	// for each block
	for (i = 0; i < 4 && notDone; i += 1) {
	    curBlock = this.blocks[i];
	    // if it's not a legal position
	    if (!this.isLegalPosition(curBlock.getX(), curBlock.getY() + dist)) {
		// back up one and stop dropping
		dist -= 1;
		notDone = false;
	    }
	}
    }

    // for each block
    for (i = 0; i < 4; i += 1) {
	curBlock = this.blocks[i];
	res.push({x: curBlock.getX(), y: curBlock.getY() + dist});
    }

    return {dist: dist, positions: res};
};

/**
* makes the block fall all the way to the bottom
* forces the next cycle to be recognized as bottomed
* @returns {Number} the distance fallen
*/
ControlGroup.prototype.fall = function() {
    var fall = this.getFallPositions(),
    positions = fall.positions,
    dist = fall.dist,
    i, curPos;

    if (dist !== 0) {
	this.lastWasSpin = false;
    }

    // for each block
    for (i = 0; i < 4; i += 1) {
	curPos = positions[i];
	this.blocks[i].setPosition(curPos.x, curPos.y);
    }

    this.bottomed = true;
    return dist;
};

/**
* Sets the preview blocks to the approproriate positions
* @param {[Block]} previews - the 4 blocks to be modified to be put into position as preview blocks
*/
ControlGroup.prototype.configurePreviewBlocks = function(previews) {
    var positions = this.getFallPositions().positions,
    i;
    
    for (i = 0; i < 4; i += 1) {
	previews[i].setPosition(positions[i].x, positions[i].y);
    }
};

ControlGroup.prototype.getShape = function () {
    return this.shape;
};

ControlGroup.prototype.getBlocks = function () {
    return this.blocks;
};

/*
* Gets the type of T spin that the group is in
* @returns {String} 'mini' for a mini-t, 'normal' for a normal t, null for not a t spin
*/
ControlGroup.prototype.getTSpin = function() {
    var i,
    testPoints = [{x:-1,y:-1},{x:1,y:-1},{x:1,y:1},{x:-1,y:1}],
    count = 0,
    mini = false,
    curPoint;
    
    if (!this.lastWasSpin) {
	return null;
    }

    // make sure it's actually a t
    if (this.shape !== 't') {
	return null;
    }

    // t-spin mini tests
    if (this.dir === 0) {
	testPoints[0].miniCheck = true;
	testPoints[1].miniCheck = true;
    } else if (this.dir === 1) {
	testPoints[1].miniCheck = true;
	testPoints[2].miniCheck = true;
    } else if (this.dir === 2) {
	testPoints[2].miniCheck = true;
	testPoints[3].miniCheck = true;
    } else if (this.dir === 3) {
	testPoints[3].miniCheck = true;
	testPoints[0].miniCheck = true;
    } 

    // 3 point t test
    for (i = 0; i < 4; i += 1) {
	curPoint = testPoints[i]
	if (!this.isLegalPosition(this.baseX + curPoint.x, this.baseY + curPoint.y)) {
	    count += 1;
	} else if (curPoint.miniCheck) {
	    mini = true;
	}
    }

    if (count >= 3) {
	if (mini) {
	    return 'mini';
	}
	return 'normal';
    }
    return null;
};
