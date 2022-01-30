import Entity, { BLOCKS_NONE, BLOCKS_MOVEMENT, BLOCKS_LIGHT } from "entity.js";
import * as log from "ui/log.js";
import * as pubsub from "util/pubsub.js";

export class Brambles extends Entity {
	constructor() {
		super({ch:"%", fg:"#483", name:"dense brambles"});
	}

	describeA() { return this.toString(); }
}

export class Princess extends Entity {
	constructor() {
		super({ch:"P", fg:"#ff0", name:"princess"});
		this.blocks = BLOCKS_MOVEMENT;
	}
}

export class Pillar extends Entity {
	constructor() {
		super({ch:"T", fg:"#fff", name:"pillar"});
		this.blocks = BLOCKS_MOVEMENT;
	}
}

export class Floor extends Entity {
	constructor() {
		super({ch:".", fg:"#aaa", name:"stone floor"});
	}
}

export class Wall extends Entity {
	constructor() {
		super({ch:"#", fg:"#666", name:"solid wall"});
		this.blocks = BLOCKS_LIGHT;
	}
}

export class Grass extends Entity {
	constructor(ch) {
		super({ch, fg:"#693"});
	}
}

export class Tree extends Entity {
	constructor() {
		super({ch:"T", fg:"green"});
	}
}

export class Door extends Entity {
	constructor(closed) {
		super({ch:"/", fg:"#963"});
		closed ? this._close() : this._open();
	}

	isOpen() { return this._isOpen; }

	_close() {
		this.blocks = BLOCKS_LIGHT;
		this._visual.ch = "+";
		this._isOpen = false;
		this._visual.name = "closed door";
	}

	_open() {
		this.blocks = BLOCKS_NONE;
		this._visual.ch = "/";
		this._isOpen = true;
		this._visual.name = "open door";
	}

	close() {
		this._close();
		pubsub.publish("topology-change", this);
	}

	open() {
		this._open();
		pubsub.publish("topology-change", this);
	}
}

export class Staircase extends Entity {
	constructor(up, callback) {
		let ch = (up ? "<" : ">");
		let fg = "#aaa";
		let name = `staircase leading ${up ? "up" : "down"}`;
		super({ch, fg, name});

		this._callback = callback;
	}

	activate(who) {
		log.add("You enter the staircase...");
		return this._callback(who);
	}
}

export const ROOM = new Floor();
export const CORRIDOR = new Floor();
export const WALL = new Wall();
export const BRAMBLES = new Brambles();
