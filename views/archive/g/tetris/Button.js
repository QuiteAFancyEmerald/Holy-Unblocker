function Button(config) {

    var parent = new jaws.Sprite(config),
    key;

    for (key in parent) {
	this[key] = parent[key];
    }
}

Button.prototype.isClicked = function(x, y) {
    return this.rect().collidePoint(x, y);
};
