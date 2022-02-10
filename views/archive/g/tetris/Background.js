
var Background = function (config) {
    var x, y,
    curTile;

    config = config || {};

    this.originX = (config.x || 0) + FIELD_OFFSET_X;
    this.originY = (config.y || 0) + FIELD_OFFSET_Y;

    this.width = 10;
    this.height = 20;

    this.tiles = [];
    for (x = 0; x < this.width; x += 1) {
	for (y = 0; y < this.height; y += 1) {
	    curTile = new Block({ empty: true, blockX: x, blockY: y });
	    this.tiles.push(curTile);
	}
    }

    this.backdrop = new jaws.Sprite({image: 'media/background/backdrop.png'});
    this.backdrop.x = 0;
    this.backdrop.y = 0;

    this.topBar = new jaws.Sprite({image: 'media/background/topbar.png'});
    this.topBar.x = 181;
    this.topBar.y = 0;

    this.fullRedrawNeeded = true;
};


Background.prototype.draw = function (lastPaused) {
    var i;

    if (this.fullRedrawNeeded || lastPaused) {
	this.backdrop.draw();
	
	for (i = 0; i < this.tiles.length; i += 1) {
	    this.tiles[i].draw();
	}
	
	this.fullRedrawNeeded = false;

    } else {

	this.topBar.draw();

	// clear the swap group / previews
	jaws.context.fillstyle = "#000D00";
	jaws.context.fillRect(24, 42, 118, 60);
	jaws.context.fillRect(457, 18, 107, 341);

	for (i = 0; i < this.tiles.length; i += 1) {
	    this.tiles[i].drawIfInvalid();
	}
    }
};