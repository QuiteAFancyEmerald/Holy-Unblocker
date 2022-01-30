import XY from "util/xy.js";
import { RATIO } from "conf.js";

import * as rules from "rules.js";
import * as actors from "util/actors.js";
import * as cells from "./cells.js";
import * as pubsub from "util/pubsub.js";
import * as map from "ui/map/map.js";
import * as log from "ui/log.js";
import * as keyboard from "util/keyboard.js";

const D1_RADIUS = 15;
const D2_RADIUS = 30;
const LAST1_RADIUS = 20;
const LAST_RADIUS = 10;

export function dangerToRadius(danger) {
	if (danger == 1) { return D1_RADIUS; }
	if (danger == rules.LAST_LEVEL) { return LAST_RADIUS; }

	let diff = LAST1_RADIUS-D2_RADIUS;
	let regularCount = rules.LAST_LEVEL-2;
	if (regularCount == 1) { return D2_RADIUS; }

	return D2_RADIUS + Math.round((danger-2)/(regularCount-1) * diff);
}

export default class Level {
	constructor(danger) {
		this.danger = this.id = danger;
		this.rooms = [];
		this.start = this.end = null;
		this._beings = {};
		this._items = {};
		this._cells = {};
	}

	activate(xy, who) { // async, because outro
		actors.clear();

		who.moveTo(null); // remove from old
		map.setLevel(this);
		who.moveTo(xy, this); // put to new

		let beings = Object.keys(this._beings).map(key => this._beings[key]).filter(b => b); /* filter because of empty values */
		beings.forEach(being => actors.add(being));

		pubsub.publish("status-change");

		if (this.danger == rules.LAST_LEVEL) { 
			return this._outro(who);
		} else {
			log.add(`Welcome to tower floor ${this.danger}.`);
			return Promise.resolve();
		}
	}

	isInside(xy) {
		xy = xy.scale(1, RATIO);
		return xy.norm() < dangerToRadius(this.danger);
	}

	isOutside(xy) {
		xy = xy.scale(1, RATIO);
		return xy.norm() > dangerToRadius(this.danger)+2;
	}

	trim() {
		Object.keys(this._cells).forEach(key => {
			let xy = XY.fromString(key);
			if (!this.isInside(xy)) { delete this._cells[key]; }
		});
	}

	fits(room) {
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				let key = xy.toString();
				if (key in this._cells) { return false; }
			}
		}

		return true;
	}

	getEntity(xy) {
		let key = xy.toString();
		return this._beings[key] || this._items[key] || this._cells[key] || cells.WALL;
	}

	setCell(xy, cell) {
		this._cells[xy] = cell;
	}

	getCell(xy) { return this._cells[xy] || cells.WALL; }
	getItem(xy) { return this._items[xy]; }

	setBeing(xy, being) {
		this._beings[xy] = being;
		pubsub.publish("visual-change", this, {xy});
	}

	setItem(xy, item) {
		this._items[xy] = item;
		pubsub.publish("visual-change", this, {xy});
	}

	carveRoom(room) {
		this.rooms.push(room);
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				this.setCell(xy, cells.ROOM);
			}
		}
	}

	carveCorridor(xy1, xy2) {
		let diff = xy2.minus(xy1);
		let steps = diff.norm8() + 1;

		for (let i=0; i<=steps; i++) {
			let xy = xy1.lerp(xy2, i/steps).floor();
			this.setCell(xy, cells.CORRIDOR);
		}
	}

	carveDoors(room, options = {}) {
		options = Object.assign({doorChance:0.5, closedChance:0.5}, options);
		let xy;
		let size = room.rb.minus(room.lt);

		for (let i=-1;i<=size.x+1;i++) {
			for (let j=-1;j<=size.y+1;j++) {
				if (i == -1 && j == -1) continue;
				if (i == -1 && j == size.y+1) continue;
				if (i == size.x+1 && j == -1) continue;
				if (i == size.x+1 && j == size.y+1) continue;

				if (i > -1 && i <= size.x && j > -1 && j <= size.y) continue;
				xy = room.lt.plus(new XY(i, j));
				let key = xy.toString();
				if (this._cells[key] != cells.CORRIDOR) { continue; }

				if (ROT.RNG.getUniform() > options.doorChance) { continue; }
				let closed = (ROT.RNG.getUniform() < options.closedChance);
				this.setCell(xy, new cells.Door(closed));
			}
		}
	}

	_outro(who) {
		log.add("{#33f}Welcome to the last floor!{}");
		log.add("You finally managed to reach the princess and finish the game.");
		log.add("{goldenrod}Congratulations{}!");
		log.pause();

		let gold = who.inventory.getItemByType("gold");
		if (gold) {
			let color = gold.getVisual().fg;
			log.add(`Furthermore, you were able to accumulate a total of {${color}}${gold.amount}{} golden coins.`);
			log.pause();
		}

		log.add("The game is over now, but you are free to look around.");
		log.add("{#fff}Press Escape to continue...{}");

		map.deactivate();
		let resolve;
		let promise = new Promise(r => resolve = r);
		let handleKeyEvent = (e) => {
			if (!keyboard.isEscape(e)) { return; }
			map.activate();
			keyboard.pop();
			resolve();
		} 
		keyboard.push({handleKeyEvent});
		return promise;
	}
}
