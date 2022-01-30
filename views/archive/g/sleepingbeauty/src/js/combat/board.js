import XY from "util/xy.js";
import Animation from "./animation.js";
import pc from "being/pc.js";

const W = 6;
const H = W;

export default class Board {
	constructor() {
		this._data = [];

		for (let i=0;i<W;i++) {
			let col = [];
			this._data.push(col);
			for (let j=0;j<H;j++) { col.push(null); }
		}
	}

	randomize() {
		this._data.forEach(col => {
			col.forEach((cell, i) => {
				col[i] = {value:pc.getCombatOption()};
			});
		});
		return this;
	}

	getSize() {
		return new XY(W, H);
	}

	at(xy) {
		return this._data[xy.x][xy.y];
	}

	set(xy, value) {
		this._data[xy.x][xy.y] = value;
	}

	_clone() {
		let clone = new this.constructor();
		clone._data = JSON.parse(JSON.stringify(this._data));
		return clone;
	}

	fall() {
		let animation = new Animation();

		this._data.forEach((col, index) => {
			this._fallColumn(index, animation);
		});

		return animation;
	}

	_fallColumn(x, animation) {
		let totalFall = 0;
		let col = this._data[x];

		col.forEach((cell, y) => {
			if (cell) {
				if (totalFall == 0) { return; }
				let targetY = y-totalFall;

				col[targetY] = cell;
				col[y] = null;

				animation.add({
					cell,
					from: new XY(x, y),
					to: new XY(x, targetY),
				});
			} else {
				totalFall++;
			}
		});

		/* new cells */
		for (let i=0;i<totalFall;i++) {
			let cell = {value:pc.getCombatOption()};
			let sourceY = col.length+i;
			let targetY = sourceY - totalFall;
			col[targetY] = cell;

			animation.add({
				cell,
				from: new XY(x, sourceY),
				to: new XY(x, targetY),
			});
		}
	}

	findSegment(xy) {
		function is(sxy) { return sxy.is(xy); }
		return this.getAllSegments().filter(segment => segment.some(is))[0];
	}

	getAllSegments() {
		let clone = this._clone();
		let segments = [];
		let xy = new XY();
		for (xy.x=0; xy.x<W; xy.x++) {
			for (xy.y=0; xy.y<H; xy.y++) {
				let cell = clone.at(xy);
				if (!cell) { continue; }
				let segment = clone.extractSegment(xy);
				segments.push(segment);
			}
		}

		return segments.sort((a, b) => b.length-a.length);
	}

	/* mutates! */
	extractSegment(xy) {
		let segment = [];
		let value = this.at(xy).value;

		let tryIt = (xy) => {
			if (xy.x<0 || xy.y<0 || xy.x>=W || xy.y>=H) { return; }
			let cell = this.at(xy);
			if (!cell || cell.value != value) { return; }

			this.set(xy, null);
			segment.push(xy.clone());
			tryIt(xy.plus(new XY( 1,  0)));
			tryIt(xy.plus(new XY(-1,  0)));
			tryIt(xy.plus(new XY( 0, -1)));
			tryIt(xy.plus(new XY( 0,  1)));
		}

		tryIt(xy);
		return segment;
	}
}
