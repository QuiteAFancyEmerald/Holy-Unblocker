import Item, {Wearable, Drinkable} from "./item.js";
import * as pubsub from "util/pubsub.js";
import * as log from "ui/log.js";
import * as rules from "rules.js";

const WEAPON_PREFIXES = {
	"sharp": +1,
	"blunt": -1,
	"epic": 2
};

const SHIELD_PREFIXES = {
	"small": -1,
	"large": 1,
	"tower": 2
};

const ARMOR_PREFIXES = {
	"leather": 1,
	"iron": 2,
	"tempered": 3
};

export class Dagger extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#ccd", name:"dagger"}, 1, WEAPON_PREFIXES);
	}
}
Dagger.danger = 1;

export class Sword extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#dde", name:"sword"}, 2, WEAPON_PREFIXES);
	}
}
Sword.danger = 2;

export class Axe extends Wearable {
	constructor() {
		super("weapon", {ch:")", fg:"#ccd", name:"axe"}, 3, WEAPON_PREFIXES);
	}
}
Axe.danger = 3;

export class Mace extends Wearable {
	constructor() {
		super("weapon", {ch:")", fg:"#bbc", name:"mace"}, 3, WEAPON_PREFIXES);
	}
}
Mace.danger = 4;

export class GreatSword extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#fff", name:"greatsword"}, 4, WEAPON_PREFIXES);
	}
}
GreatSword.danger = 5;

export class Shield extends Wearable {
	constructor() {
		super("shield", {ch:"[", fg:"#841", name:"shield"}, 2, SHIELD_PREFIXES);
	}
}
Shield.danger = 2;

export class Helmet extends Wearable {
	constructor() {
		super("helmet", {ch:"]", fg:"#631", name:"helmet"}, 1, ARMOR_PREFIXES);
	}
}
Helmet.danger = 2;

export class Armor extends Wearable {
	constructor() {
		super("armor", {ch:"]", fg:"#a62", name:"armor"}, 2, ARMOR_PREFIXES);
	}
}
Armor.danger = 3;

export class HealthPotion extends Drinkable {
	constructor() {
		super(rules.POTION_HP, {ch:"!", fg:"#e00", name:"health potion"});
	}

	pick(who) {
		super.pick(who);
		if (who.maxhp == who.hp) {
			log.add("Nothing happens.");
		} else if (who.maxhp - who.hp <= this._strength) {
			log.add("You are completely healed.");
		} else {
			log.add("Some of your health is restored.");
		}
		who.adjustStat("hp", this._strength);
	}
}

export class Lutefisk extends Drinkable {
	constructor() {
		super(0, {ch:"?", fg:"#ff0", name:"lutefisk"});
		this._visual.name = "lutefisk"; // no modifiers, sry
	}

	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		log.add("You eat %the. You feel weird.", this);
		who.adjustStat("hp", who.maxhp);
		who.adjustStat("mana", -who.maxmana);
	}
}

export class ManaPotion extends Drinkable {
	constructor() {
		super(rules.POTION_MANA, {ch:"!", fg:"#00e", name:"mana potion"});
	}

	pick(who) {
		super.pick(who);
		if (who.maxmana == who.mana) {
			log.add("Nothing happens.");
		} else if (who.maxmana - who.mana <= this._strength) {
			log.add("Your mana is completely refilled.");
		} else {
			log.add("Some of your mana is refilled.");
		}
		who.adjustStat("mana", this._strength);
	}
}

export class Gold extends Item {
	constructor() {
		super("gold", {ch:"$", fg:"#fc0", name:"golden coin"});
		this.amount = 1;
	}

	pick(who) {
		super.pick(who);

		let other = who.inventory.getItemByType(this._type);
		if (other) {
			other.amount++;
		} else {
			who.inventory.addItem(this);
		}

		pubsub.publish("status-change");
	}
}
