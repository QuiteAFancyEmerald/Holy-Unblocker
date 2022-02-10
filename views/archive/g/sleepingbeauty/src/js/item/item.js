import Entity from "entity.js";
import * as log from "ui/log.js";
import * as rules from "rules.js";
import { ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2, COLORS } from "combat/types.js";

const SUFFIXES = {
	[ATTACK_1]: "power",
	[ATTACK_2]: "treachery",
	[MAGIC_1]: "magical domination",
	[MAGIC_2]: "magical weakness"
}

export default class Item extends Entity {
	constructor(type, visual) {
		super(visual);
		this._type = type;
	}

	getType() { return this._type; }

	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		log.add("You pick up %the.", this);
	}
}

export class Drinkable extends Item {
	constructor(strength, visual) {
		super("potion", visual);
		this._strength = strength;

		if (ROT.RNG.getUniform() > 0.5) {
			let diff = Math.round(strength/2);
			if (ROT.RNG.getUniform() > 0.5) { diff *= -1; }
			this._strength += diff;
			this._visual.name = `${diff > 0 ? "strong" : "weak"} ${this._visual.name}`;
		}
	}

	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		log.add("You drink %the.", this);
	}
}

export class Wearable extends Item {
	constructor(type, visual, modifier, prefixes) {
		super(type, visual);
		this.modifies = (type == "weapon" ? "attack" : "defense");
		this.modifier = modifier;

		this.combat = null;

		let avail = Object.keys(prefixes);
		if (avail.length > 0 && ROT.RNG.getUniform() > 0.5) {
			let prefix = avail.random();
			this._visual.name = `${prefix} ${this._visual.name}`;
			this.modifier += prefixes[prefix];
		}

		if (ROT.RNG.getUniform() < rules.COMBAT_MODIFIER) {
			let combat = [ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2].random();
			this.combat = combat;
			this._visual.name = `${this._visual.name} of ${SUFFIXES[combat]}`;
			let color1 = ROT.Color.fromString(COLORS[combat]);
			let color2 = ROT.Color.fromString(this._visual.fg);
			let color3 = ROT.Color.interpolate(color1, color2, 0.5);
			this._visual.fg = ROT.Color.toRGB(color3);
		}
	}

	pick(who) {
		super.pick(who);

		let other = who.inventory.getItemByType(this._type);
		if (other) {
			who.inventory.removeItem(other);
			who.getLevel().setItem(who.getXY(), other);
			log.add("You drop %the.", other);
		}

		who.inventory.addItem(this);
	}
}

