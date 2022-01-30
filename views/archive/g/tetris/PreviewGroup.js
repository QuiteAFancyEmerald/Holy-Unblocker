
function PreviewGroup(baseX, baseY) {
    var i;
    
    this.blocks = [];
    this.shape = null;

    // create the blocks
    for (i = 0; i < 4; i += 1) {
	this.blocks.push(new Block({
	    boardOriginX: baseX,
	    boardOriginY: baseY,
	    blockX: 0,
	    blockY: 0,
	    shape: 'i'
	}));
    }
}

/**
* Sets the shape and color of the blocks
* @param {Char} shape - the letter of the new shape
* @param {Boolean} preview - true if it should have preview colors
*/
PreviewGroup.prototype.setShape = function(shape) {
    var shapeConfig = SHAPES[shape],
    i;

    this.shape = shape;
    
    for (i = 0; i < 4; i += 1) {
	this.blocks[i].setPosition(shapeConfig.pos[i].x, shapeConfig.pos[i].y);
	this.blocks[i].setColor(shape, false);
    }
};

PreviewGroup.prototype.getShape = function () {
    return this.shape;
};

PreviewGroup.prototype.draw = function() {
    var i;
    for (i = 0; i < 4; i += 1) {
	this.blocks[i].draw();
    }
};
				