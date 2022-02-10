import XY from "util/xy.js";
import Entity, { BLOCKS_MOVEMENT } from "entity.js";
import Inventory from "./inventory.js";
import * as actors from "util/actors.js";
import * as cells from "level/cells.js";

const IT = ["it", "her", "him"];

export default class Being extends Entity {
	constructor(visual) {
		super(visual);
		this.inventory = new Inventory();

		this.blocks = BLOCKS_MOVEMENT;
		this._xy = null;
		this._level = null;
		this.attack = 10;
		this.defense = 10;
		this.sex = 0;
		this.hp = this.maxhp = 20;
		this.mana = this.maxmana = 50;
	}

	getXY() { return this._xy; }
	getLevel() { return this._level; }

	getAttack() {
		let modifier = this.inventory.getItems().reduce((acc, item) => {
			return acc + (item.modifies == "attack" ? item.modifier : 0);
		}, 0);
		return this.attack + modifier;
	}

	getDefense() {
		let modifier = this.inventory.getItems().reduce((acc, item) => {
			return acc + (item.modifies == "defense" ? item.modifier : 0);
		}, 0);
		return this.defense + modifier;
	}

	adjustStat(stat, diff) {
		this[stat] += diff;
		this[stat] = Math.max(this[stat], 0);
		this[stat] = Math.min(this[stat], this[`max${stat}`]);
		if (stat == "hp" && this[stat] == 0) { this.die(); }
	}

	die() {
		let level = this._level;
		let xy = this._xy;

		this.moveTo(null);
		actors.remove(this);
		
		let items = this.inventory.getItems();
		if (items.length > 0 && level.getEntity(xy) instanceof cells.Floor) {
			let item = items.random();
			this.inventory.removeItem(item);
			level.setItem(xy, item);
		}
	}

	act() {
		return Promise.resolve();
	}

	moveBy(dxy) {
		return this.moveTo(this._xy.plus(dxy));
	}

	moveTo(xy, level) {
		this._xy && this._level.setBeing(this._xy, null); // remove from old position

		this._level = level || this._level;
		this._xy = xy;

		this._xy && this._level.setBeing(this._xy, this); // draw at new position
		
		return this;
	}

	describeIt() {
    	return IT[this.sex];
	}

	describeVerb(verb) {
	    return `${verb}${verb.charAt(verb.length-1) == "s" || verb == "do" ? "es" : "s"}`;
	}
}

String.format.map.verb = "describeVerb";
String.format.map.it = "describeIt";
