
// TODO: constants file???
var BLOCK_WIDTH = 24;

function Block(config) {
    var parent, key;

    config = config || {};

    this.boX = (config.boardOriginX || 0) + FIELD_OFFSET_X;
    this.boY = (config.boardOriginY || 0) + FIELD_OFFSET_Y;
    this.blockX = config.blockX;
    this.blockY = config.blockY;

    this.occupiedPositions = config.occupiedPositions;
    this.addOccupied(this.blockX, this.blockY);

    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;

    config.x = this.boX + BLOCK_WIDTH * this.blockX;
    config.y = this.boY + BLOCK_WIDTH * this.blockY;

    if (config.preview) {
	config.image = 'media/greyblock.png';
    } else if (config.empty) {
	config.image = 'media/emptyblock.png';
    }else {
	config.image = SHAPES[config.shape].image;
    }

    parent = new jaws.Sprite(config);
    for (key in parent) {
	this[key] = parent[key];
    }
}

Block.invalidSpaces = {};
Block.allInvalidated = false;
Block.invalidFlushed = function() {
    Block.invalidSpaces = {};
    Block.allInvalidated = false;
};
Block.invalidateAll = function() {
    Block.allInvalidated = true;
};

Block.prototype.setColor = function(shape, preview) {
    if (preview) {
	this.setImage('media/greyblock.png');
    } else {
	this.setImage(SHAPES[shape].image);
    }
    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;
};

Block.prototype.moveBlock = function(dx, dy) {
    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;
    this.removeOccupied(this.blockX, this.blockY);
    this.blockX += dx;
    this.blockY += dy;
    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;
    this.addOccupied(this.blockX, this.blockY);
    this.x += dx * BLOCK_WIDTH;
    this.y += dy * BLOCK_WIDTH;
};

Block.prototype.setPosition = function(blockX, blockY) {
    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;
    this.removeOccupied(this.blockX, this.blockY);
    this.blockX = blockX;
    this.blockY = blockY;
    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;
    this.addOccupied(this.blockX, this.blockY);
    this.x = this.boX + blockX * BLOCK_WIDTH;
    this.y = this.boY + blockY * BLOCK_WIDTH;
};

Block.prototype.getX = function() { return this.blockX; };
Block.prototype.getY = function() { return this.blockY; };

Block.prototype.isPosition = function(x, y) {
    return this.blockX === x && this.blockY === y;
};

Block.prototype.drawIfInvalid = function() {
    if (Block.invalidSpaces[this.blockX + "," + this.blockY] || Block.allInvalidated || this.blockY < 0) {
	this.draw();
    }
};

Block.prototype.kill = function() {
    Block.invalidSpaces[this.blockX + "," + this.blockY] = true;
    this.removeOccupied(this.blockX, this.blockY);
};

Block.prototype.removeOccupied = function(x, y) {
    var posString = x + ',' + y;
    if (this.occupiedPositions && this.occupiedPositions[posString]) {
	this.occupiedPositions[posString] -= 1;
    }
};

Block.prototype.addOccupied = function(x, y) {
    var posString = x + ',' + y;
    if (this.occupiedPositions) {
	if (this.occupiedPositions[posString] === undefined) {
	    this.occupiedPositions[posString] = 0;
	}
	this.occupiedPositions[posString] += 1;
    }
};
