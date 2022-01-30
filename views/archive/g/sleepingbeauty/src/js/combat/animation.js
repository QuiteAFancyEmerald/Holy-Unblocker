const SPEED = 10; // cells per second

export default class Animation {
	constructor() {
		this._items = [];
		this._ts = null;
		this._resolve = null;
	}

	add(item) {
		this._items.push(item);
		item.cell.animated = item.from;
	}

	start(drawCallback) {
		let promise = new Promise(resolve => this._resolve = resolve)
		this._drawCallback = drawCallback;
		this._ts = Date.now();
		this._step();
		return promise;
	}

	_step() {
		let time = Date.now() - this._ts;

		let i = this._items.length;
		while (i --> 0) { /* down so we can splice */
			let item = this._items[i];
			let finished = this._stepItem(item, time);
			if (finished) { 
				this._items.splice(i, 1);
				item.cell.animated = null;
			}
		}

		this._drawCallback();
		if (this._items.length > 0) { 
			requestAnimationFrame(() => this._step());
		} else {
			this._resolve();
		}
	}

	_stepItem(item, time) {
		let dist = item.from.dist8(item.to);

		let frac = (time/1000) * SPEED / dist;
		let finished = false;
		if (frac >= 1) {
			finished = true;
			frac = 1;
		}

		item.cell.animated = item.from.lerp(item.to, frac);

		return finished;
	}
}
