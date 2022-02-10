import * as cells from "level/cells.js";
import pc from "being/pc.js";

const GRASS_1 = new cells.Grass("\"");
const GRASS_2 = new cells.Grass("'");
const TREE = new cells.Tree();

const NOISE = new ROT.Noise.Simplex();

const memories = {};

function darken(color) {
	if (!color) { return color; }
	return ROT.Color.toRGB(ROT.Color.fromString(color).map(x => x>>1));
}

export default class Memory {
	static forLevel(level) {
		if (!(level.id in memories)) { memories[level.id] = new this(level); }
		return memories[level.id];
	}

	constructor(level) {
		this._level = level;
		this._memoized = {};
	}

	visualAt(xy) {
		if (this._level.isOutside(xy)) {
			let entity;
			let noise = NOISE.get(xy.x/20, xy.y/20);
			if (noise < 0) {
				entity = GRASS_1;
			} else if (noise < 0.8) {
				entity = GRASS_2;
			} else {
				entity = TREE;
			}
			return entity.getVisual();
		}

		let fov = pc.fov;
		if (xy in fov) {
			this._memoize(xy, this._level.getCell(xy).getVisual()); // memoize cell only
			return this._level.getEntity(xy).getVisual();
		} else if (xy in this._memoized) {
			return this._memoized[xy];
		} else {
			return null;
		}
	}

	_memoize(xy, visual) {
		this._memoized[xy] = {
			ch: visual.ch,
			fg: darken(visual.fg)
		}
	}
}
