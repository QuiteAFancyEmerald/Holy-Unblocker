function RandomBag(queueSize) {
    // start off empty
    this.available = [];
    this.queue = [];

    // initialize by refilling the queue
    while (this.queue.length < queueSize) {
	this.queue.push(this.nextAvailable());
    }
}

RandomBag.initialList = ['i', 'o', 'j', 'l', 'z', 's', 't'];

/**
* Returns the letters of the queue
* @returns {[Char]} the letters of the queue in order of oldest to newest
*/
RandomBag.prototype.getQueue = function () {
    return this.queue;
};

/**
* Moves the queue forward by one
* @returns {Char} the poped value
*/
RandomBag.prototype.popQueue = function () {
    var res = this.queue.shift();
    this.queue.push(this.nextAvailable());
    return res;
};

/**
* gets the next letter for the queue, and updates the random bag state
* @returns {Char} the next letter for the queue
* @private
*/
RandomBag.prototype.nextAvailable = function() {
    var index, res;

    // if the available needs to be rebuilt
    if (this.available.length === 0) {
	this.available = RandomBag.initialList.slice(0); // shallow copy
    }

    index = Math.floor(Math.random()*this.available.length);
    res = this.available.splice(index, 1)[0];

    return res;
};