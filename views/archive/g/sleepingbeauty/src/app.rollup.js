(function () {
'use strict';

class XY {
	static fromString(str) {
		let numbers = str.split(",").map(Number);
		return new this(...numbers);
	}

	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	clone() {
		return new XY(this.x, this.y);
	}

	toString() {
		return `${this.x},${this.y}`;
	}

	is(xy) {
		return (this.x==xy.x && this.y==xy.y);
	}

	norm8() {
		return Math.max(Math.abs(this.x), Math.abs(this.y));
	}

	norm4() {
		return Math.abs(this.x) + Math.abs(this.y);
	}

	norm() {
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}

	dist8(xy) {
		return this.minus(xy).norm8();
	}

	dist4(xy) {
		return this.minus(xy).norm4();
	}

	dist(xy) {
		return this.minus(xy).norm();
	}

	lerp(xy, frac) {
		let diff = xy.minus(this);
		return this.plus(diff.scale(frac));
	}

	scale(sx, sy = sx) {
		return new XY(this.x*sx, this.y*sy);
	}

	plus(xy) {
		return new XY(this.x+xy.x, this.y+xy.y);
	}

	minus(xy) {
		return this.plus(xy.scale(-1));
	}

	round() {
		return new XY(Math.round(this.x), Math.round(this.y));
	}

	floor() {
		return new XY(Math.floor(this.x), Math.floor(this.y));
	}

	ceil() {
		return new XY(Math.ceil(this.x), Math.ceil(this.y));
	}

	mod(xy) {
		let x = this.x % xy.x;
		if (x < 0) { x += xy.x; }
		let y = this.y % xy.y;
		if (y < 0) { y += xy.y; }
		return new XY(x, y);
	}
}

const SPEED = 10; // cells per second

class Animation {
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
		let promise = new Promise(resolve => this._resolve = resolve);
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

const BLOCKS_NONE = 0;
const BLOCKS_MOVEMENT = 1;
const BLOCKS_LIGHT = 2;

class Entity {
	constructor(visual) {
		this._visual = visual;
		this.blocks = BLOCKS_NONE; 
	}

	getVisual() { return this._visual; }

	toString() { return this._visual.name; }

	describeThe() { return `the ${this}`; }
	describeA() {
		let first = this._visual.name.charAt(0);
		let article = (first.match(/[aeiou]/i) ? "an" : "a");
		return `${article} ${this}`;
	}
}

String.format.map.the = "describeThe";
String.format.map.a = "describeA";

const storage = Object.create(null);

function publish(message, publisher, data) {
	let subscribers = storage[message] || [];
	subscribers.forEach(subscriber => {
		typeof(subscriber) == "function"
			? subscriber(message, publisher, data)
			: subscriber.handleMessage(message, publisher, data);
	});
}

function subscribe(message, subscriber) {
	if (!(message in storage)) { storage[message] = []; }
	storage[message].push(subscriber);
}

class Inventory {
	constructor() {
		this._items = [];
	}

	getItems() {
		return this._items;
	}

	getItemByType(type) {
		return this._items.filter(i => i.getType() == type)[0];
	}

	removeItem(item) {
		let index = this._items.indexOf(item);
		if (index > -1) { this._items.splice(index, 1); }
		publish("status-change");
		return this;
	}

	addItem(item) {
		this._items.push(item);
		publish("status-change");
		return this;
	}
}

let queue = [];

function add(actor) {
	queue.push(actor);
}

function clear() {
	queue = [];
}

function remove(actor) {
	let index = queue.indexOf(actor);
	if (index > -1) { queue.splice(index, 1); }
}

function loop() {
	if (!queue.length) { return; } // endgame
	let actor = queue.shift();
	queue.push(actor);
	actor.act().then(loop);
}

let node;
let current = null;

function add$1() {
	let str = String.format.apply(String, arguments);
	str = str.replace(/{(.*?)}(.*?){}/g, (match, color, str) => {
		return `<span style="color:${color}">${str}</span>`;
	});
	str = str.replace(/\n/g, "<br/>");
	
	let item = document.createElement("span");
	item.innerHTML = `${str} `;
	current.appendChild(item);
}

function pause() {
	if (current && current.childNodes.length == 0) { return; }
	current = document.createElement("p");
	node.appendChild(current);
	
	while (node.childNodes.length > 50) { node.removeChild(node.firstChild); }
}

function init$2(n) {
	node = n;
	node.classList.remove("hidden");

	pause();

	setInterval(() => {
		node.scrollTop += 3;
	}, 20);
}

class Brambles extends Entity {
	constructor() {
		super({ch:"%", fg:"#483", name:"dense brambles"});
	}

	describeA() { return this.toString(); }
}

class Princess extends Entity {
	constructor() {
		super({ch:"P", fg:"#ff0", name:"princess"});
		this.blocks = BLOCKS_MOVEMENT;
	}
}

class Pillar extends Entity {
	constructor() {
		super({ch:"T", fg:"#fff", name:"pillar"});
		this.blocks = BLOCKS_MOVEMENT;
	}
}

class Floor extends Entity {
	constructor() {
		super({ch:".", fg:"#aaa", name:"stone floor"});
	}
}

class Wall extends Entity {
	constructor() {
		super({ch:"#", fg:"#666", name:"solid wall"});
		this.blocks = BLOCKS_LIGHT;
	}
}

class Grass extends Entity {
	constructor(ch) {
		super({ch, fg:"#693"});
	}
}

class Tree extends Entity {
	constructor() {
		super({ch:"T", fg:"green"});
	}
}

class Door extends Entity {
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
		publish("topology-change", this);
	}

	open() {
		this._open();
		publish("topology-change", this);
	}
}

class Staircase extends Entity {
	constructor(up, callback) {
		let ch = (up ? "<" : ">");
		let fg = "#aaa";
		let name = `staircase leading ${up ? "up" : "down"}`;
		super({ch, fg, name});

		this._callback = callback;
	}

	activate(who) {
		add$1("You enter the staircase...");
		return this._callback(who);
	}
}

const ROOM = new Floor();
const CORRIDOR = new Floor();
const WALL = new Wall();
const BRAMBLES = new Brambles();

const IT = ["it", "her", "him"];

class Being extends Entity {
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
		remove(this);
		
		let items = this.inventory.getItems();
		if (items.length > 0 && level.getEntity(xy) instanceof Floor) {
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

const AI_RANGE = 7;
const AI_IDLE = 0.4;
const PC_SIGHT = 8;
const LAST_LEVEL = 8;

const POTION_HP = 10;
const POTION_MANA = 10;

const COMBAT_MODIFIER = 0.4;
const HOSTILE_CHANCE = 0.7;

const BRAMBLE_CHANCE = 0.5;
const LEVEL_HP = 4;

const REGEN_HP = 0.05;
const REGEN_MANA = 0.1;

const ATTACK_1 = "a1";
const ATTACK_2 = "a2";
const MAGIC_1 = "m1";
const MAGIC_2 = "m2";

const COLORS = {
	[ATTACK_1]: "#0f0",
	[ATTACK_2]: "#f00",
	[MAGIC_1]: "#00f",
	[MAGIC_2]: "#ff3"
};

const SUFFIXES = {
	[ATTACK_1]: "power",
	[ATTACK_2]: "treachery",
	[MAGIC_1]: "magical domination",
	[MAGIC_2]: "magical weakness"
};

class Item extends Entity {
	constructor(type, visual) {
		super(visual);
		this._type = type;
	}

	getType() { return this._type; }

	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		add$1("You pick up %the.", this);
	}
}

class Drinkable extends Item {
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
		add$1("You drink %the.", this);
	}
}

class Wearable extends Item {
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

		if (ROT.RNG.getUniform() < COMBAT_MODIFIER) {
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
			add$1("You drop %the.", other);
		}

		who.inventory.addItem(this);
	}
}

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

class Dagger extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#ccd", name:"dagger"}, 1, WEAPON_PREFIXES);
	}
}
Dagger.danger = 1;

class Sword extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#dde", name:"sword"}, 2, WEAPON_PREFIXES);
	}
}
Sword.danger = 2;

class Axe extends Wearable {
	constructor() {
		super("weapon", {ch:")", fg:"#ccd", name:"axe"}, 3, WEAPON_PREFIXES);
	}
}
Axe.danger = 3;

class Mace extends Wearable {
	constructor() {
		super("weapon", {ch:")", fg:"#bbc", name:"mace"}, 3, WEAPON_PREFIXES);
	}
}
Mace.danger = 4;

class GreatSword extends Wearable {
	constructor() {
		super("weapon", {ch:"(", fg:"#fff", name:"greatsword"}, 4, WEAPON_PREFIXES);
	}
}
GreatSword.danger = 5;

class Shield extends Wearable {
	constructor() {
		super("shield", {ch:"[", fg:"#841", name:"shield"}, 2, SHIELD_PREFIXES);
	}
}
Shield.danger = 2;

class Helmet extends Wearable {
	constructor() {
		super("helmet", {ch:"]", fg:"#631", name:"helmet"}, 1, ARMOR_PREFIXES);
	}
}
Helmet.danger = 2;

class Armor extends Wearable {
	constructor() {
		super("armor", {ch:"]", fg:"#a62", name:"armor"}, 2, ARMOR_PREFIXES);
	}
}
Armor.danger = 3;

class HealthPotion extends Drinkable {
	constructor() {
		super(POTION_HP, {ch:"!", fg:"#e00", name:"health potion"});
	}

	pick(who) {
		super.pick(who);
		if (who.maxhp == who.hp) {
			add$1("Nothing happens.");
		} else if (who.maxhp - who.hp <= this._strength) {
			add$1("You are completely healed.");
		} else {
			add$1("Some of your health is restored.");
		}
		who.adjustStat("hp", this._strength);
	}
}

class Lutefisk extends Drinkable {
	constructor() {
		super(0, {ch:"?", fg:"#ff0", name:"lutefisk"});
		this._visual.name = "lutefisk"; // no modifiers, sry
	}

	pick(who) {
		who.getLevel().setItem(who.getXY(), null);
		add$1("You eat %the. You feel weird.", this);
		who.adjustStat("hp", who.maxhp);
		who.adjustStat("mana", -who.maxmana);
	}
}

class ManaPotion extends Drinkable {
	constructor() {
		super(POTION_MANA, {ch:"!", fg:"#00e", name:"mana potion"});
	}

	pick(who) {
		super.pick(who);
		if (who.maxmana == who.mana) {
			add$1("Nothing happens.");
		} else if (who.maxmana - who.mana <= this._strength) {
			add$1("Your mana is completely refilled.");
		} else {
			add$1("Some of your mana is refilled.");
		}
		who.adjustStat("mana", this._strength);
	}
}

class Gold extends Item {
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

		publish("status-change");
	}
}


var items = Object.freeze({
	Dagger: Dagger,
	Sword: Sword,
	Axe: Axe,
	Mace: Mace,
	GreatSword: GreatSword,
	Shield: Shield,
	Helmet: Helmet,
	Armor: Armor,
	HealthPotion: HealthPotion,
	Lutefisk: Lutefisk,
	ManaPotion: ManaPotion,
	Gold: Gold
});

const RATIO = 1.6;

const DIRS = [
	new XY(-1, -1),
	new XY( 0, -1),
	new XY( 1, -1),
	new XY( 1,  0),
	new XY( 1,  1),
	new XY( 0,  1),
	new XY(-1,  1),
	new XY(-1,  0)
];

function wander(who) {
	let result = Promise.resolve();

	if (ROT.RNG.getUniform() < AI_IDLE) { return result; }

	let level = who.getLevel();
	let xy = who.getXY();

	let dirs = DIRS.filter(dxy => {
		let entity = level.getEntity(xy.plus(dxy));
		return entity.blocks < BLOCKS_MOVEMENT;
	});
	
	if (!dirs.length) { return result; }
	
	let dir = dirs.random();
	who.moveTo(xy.plus(dir));
	return result;
}

function getCloserToPC(who) {
	let best = 1/0;
	let avail = [];

	DIRS.forEach(dxy => {
		let xy = who.getXY().plus(dxy);
		let entity = who.getLevel().getEntity(xy);
		if (entity.blocks >= BLOCKS_MOVEMENT) { return; }
		
		let dist = xy.dist8(pc.getXY());
		if (dist < best) {
			best = dist;
			avail = [];
		}
		
		if (dist == best) { avail.push(xy); }
	});
	
	if (avail.length) {
		who.moveTo(avail.random());
	}

	return Promise.resolve();
}

function actHostile(who) {
	let dist = who.getXY().dist8(pc.getXY());
	if (dist == 1) {
		add$1("{#f00}You are attacked by %a!{}", who);
		return start(who);
	}

	if (!who.ai.mobile) { return Promise.resolve(); }

	if (dist <= AI_RANGE) {
		return getCloserToPC(who);
	} else {
		return wander(who);
	}
}

function actNonHostile(who) {
	if (!who.ai.mobile) { return Promise.resolve(); }
	return wander(who);
}

function act(who) {
	if (who.ai.hostile) {
		return actHostile(who);
	} else {
		return actNonHostile(who);
	}
}

const HERO_RACES = ["dwarven", "halfling", "orcish", "human", "elvish", "noble"];
const HERO_TYPES = ["knight", "adventurer", "hero", "explorer"];
const HERO_CHATS = [
	"Hi there, fellow adventurer!",
	"I wonder how many tower floors are there...",
	"Some monsters in this tower give a pretty hard fight!",
	"Look out for potions, they might save your butt.",
	"So, you are also looking for that sleeping princess?",
	"A sharp sword is better than a blunt one.",
	"I used to be an adventurer like you. But then I got hurt on a thorn..."
];

class Autonomous extends Being {
	constructor(visual) {
		super(visual);
		this.ai = {
			hostile: ROT.RNG.getUniform() < HOSTILE_CHANCE,
			mobile: true
		};
		this.inventory.addItem(new Gold());
	}

	act() {
		return act(this);
	}

	getChat() {
		return null;
	}
}

class Rat extends Autonomous {
	constructor() {
		super({ch:"r", fg:"#aaa", name:"rat"});
		this.mana = this.maxmana = 0;
		this.hp = this.maxhp = 1;
	}
}
Rat.danger = 1;

class Bat extends Autonomous {
	constructor() {
		super({ch:"b", fg:"#a83", name:"bat"});
		this.mana = this.maxmana = 0;
		this.hp = this.maxhp = 10;
	}
}
Bat.danger = 1;

class Goblin extends Autonomous {
	constructor() {
		super({ch:"g", fg:"#33a", name:"goblin"});
		this.hp = this.maxhp = 10;
		this.mana = this.maxmana = 5;
	}
}
Goblin.danger = 2;

class Orc extends Autonomous {
	constructor() {
		super({ch:"o", fg:"#3a3", name:"orc"});
		this.hp = this.maxhp = 15;
		this.mana = this.maxmana = 10;
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Dagger()); }
	}
}
Orc.danger = 3;

class OrcWitch extends Autonomous {
	constructor() {
		super({ch:"O", fg:"#33a", name:"orcish witch"});
		this.hp = this.maxhp = 15;
		this.sex = 1;
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Helmet()); }
	}
}
OrcWitch.danger = 4;

class Skeleton extends Autonomous {
	constructor() {
		super({ch:"s", fg:"#eee", name:"skeleton"});
		this.hp = this.maxhp = 25;
		this.attack = 15;
		if (ROT.RNG.getUniform() > 0.5) { 
			this.inventory.addItem(new Dagger());
		} else {
			this.inventory.addItem(new Sword());
		}
	}
}
Skeleton.danger = 5;

class Ogre extends Autonomous {
	constructor() {
		super({ch:"O", fg:"#3a3", name:"ogre"});
		this.hp = this.maxhp = 30;
		this.attack = 15;
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Mace()); }
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Shield()); }
	}
}
Ogre.danger = 6;

class Zombie extends Autonomous {
	constructor() {
		super({ch:"z", fg:"#d3d", name:"zombie"});
	}
}
Zombie.danger = 6;

class Spider extends Autonomous {
	constructor() {
		super({ch:"s", fg:"#c66", name:"spider"});
		this.hp = this.maxhp = 10;
		this.mana = this.maxmana = 0;
		this.attack = 15;
	}
}
Spider.danger = 3;

class Snake extends Autonomous {
	constructor() {
		super({ch:"s", fg:"#6c6", name:"poisonous snake"});
		this.hp = this.maxhp = 10;
		this.mana = this.maxmana = 0;
		this.attack = 15;
	}
}
Snake.danger = 4;

class Minotaur extends Autonomous {
	constructor() {
		super({ch:"M", fg:"#ca7", name:"minotaur warrior"});
		this.hp = this.maxhp = 30;
		this.mana = this.maxmana = 30;
		this.attack = 15;
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Mace()); }
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Shield()); }
		if (ROT.RNG.getUniform() > 0.5) { this.inventory.addItem(new Armor()); }
	}
}
Minotaur.danger = 8;

class Tree$1 extends Autonomous {
	constructor() {
		super({ch:"T", fg:"#3c3", name:"animated tree"});
		this.hp = this.maxhp = 30;
		this.mana = this.maxmana = 30;
		this.defense = 15;
		this.ai.mobile = false;
	}
}
Tree$1.danger = 8;

class Hero extends Autonomous {
	constructor() {
		let race = HERO_RACES.random();
		let type = HERO_TYPES.random();
		let visual = {
			ch: type.charAt(0),
			fg: ROT.Color.toRGB([
				ROT.RNG.getUniformInt(100, 255),
				ROT.RNG.getUniformInt(100, 255),
				ROT.RNG.getUniformInt(100, 255)
			]),
			name: `${race} ${type}`
		};
		super(visual);
		this.sex = 2;
		this.ai.hostile = false;
	}

	getChat() {
		if (this._level.danger == LAST_LEVEL) {
			return [
				"You can do whatever you want here, but beware - no kissing!",
				"We only have one rule here: no kissing!",
				"Make sure you don't wake her up!",
				"Sssh! She is sleeping, don't you see?",
				"I see, another lucky adventurer!"
			].random();
		} else {
			return HERO_CHATS.random();
		}
	}
}


var beings = Object.freeze({
	Rat: Rat,
	Bat: Bat,
	Goblin: Goblin,
	Orc: Orc,
	OrcWitch: OrcWitch,
	Skeleton: Skeleton,
	Ogre: Ogre,
	Zombie: Zombie,
	Spider: Spider,
	Snake: Snake,
	Minotaur: Minotaur,
	Tree: Tree$1,
	Hero: Hero
});

const CONSUMERS = [];

const DIR_NUMPAD = [ROT.VK_NUMPAD7, ROT.VK_NUMPAD8, ROT.VK_NUMPAD9, ROT.VK_NUMPAD6, ROT.VK_NUMPAD3, ROT.VK_NUMPAD2, ROT.VK_NUMPAD1, ROT.VK_NUMPAD4];
const DIR_CODES = [ROT.VK_HOME, ROT.VK_UP, ROT.VK_PAGE_UP, ROT.VK_RIGHT, ROT.VK_PAGE_DOWN, ROT.VK_DOWN, ROT.VK_END, ROT.VK_LEFT];
const DIR_CHARS = ["y", "k", "u", "l", "n", "j", "b", "h"];

function getDirection(e) {
	if (e.type == "keypress") {
		let ch = String.fromCharCode(e.charCode).toLowerCase();
		let index = DIR_CHARS.indexOf(ch);
		if (index in DIRS) { return DIRS[index]; }
	}
	if (e.type == "keydown") {
		let index = DIR_CODES.indexOf(e.keyCode);
		if (index in DIRS) { return DIRS[index]; }

		index = DIR_NUMPAD.indexOf(e.keyCode);
		if (index in DIRS) { return DIRS[index]; }
	}
	return null;
}

function hasModifier(e) {
	return (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey);
}

function isEnter(e) {
	if (e.type != "keydown") { return null; }
	return (e.keyCode == 13);
}

function isEscape(e) {
	if (e.type != "keydown") { return null; }
	return (e.keyCode == 27);
}

function getNumber(e) {
	if (e.type != "keypress") { return null; }
	let num = e.charCode - "0".charCodeAt(0);
	if (num < 0 || num > 9) { return null; }
	return num;
}

function push(consumer) {
	CONSUMERS.push(consumer);
}

function pop() {
	CONSUMERS.pop();
}

function handler(e) {
	let consumer = CONSUMERS[CONSUMERS.length-1];
	if (!consumer) { return; }
	consumer.handleKeyEvent(e);
}

document.addEventListener("keydown", handler);
document.addEventListener("keypress", handler);

let resolve$1 = null;
let count = 0;

const SPACE = String.fromCharCode(160, 160);

function end$1(value) {
	pop();
	resolve$1(value);
}

function handleKeyEvent$1(e) {
	if (isEscape(e)) { return end$1(-1); }

	let number = getNumber(e);
	if (number === null) { return; }

	if (number >= 0 && number <= count) { end$1(number-1); }
}

function choice(options) {
	count = options.length;

	options.forEach((o, index) => {
		add$1(`\n${SPACE}{#fff}${index+1}{} ${o}`);
	});
	add$1(`\n${SPACE}{#fff}0{} or {#fff}Escape{} to abort`);
	pause();

	push({handleKeyEvent: handleKeyEvent$1});
	return new Promise(r => resolve$1 = r);
}

let COMBAT_OPTIONS = {
	[ATTACK_1]: 2,
	[ATTACK_2]: 2,
	[MAGIC_1]: 2,
	[MAGIC_2]: 2
};

const TUTORIAL = {
	staircase: false,
	item: false,
	door: false,
	enemy: false
};

class PC extends Being {
	constructor() {
		super({ch:"@", fg:"#fff", name:"you"});
		this._resolve = null; // end turn
		this._maxDanger = 1;
		this.fov = {};

		subscribe("topology-change", this);
	}

	describeThe() { return this.toString(); }
	describeA() { return this.toString(); }
	describeIt() { return this.toString(); }
	describeVerb(verb) { return verb; }

	getCombatOption() {
		let options = Object.assign({}, COMBAT_OPTIONS);
		this.inventory.getItems().forEach(item => {
			if (item.combat) { options[item.combat] += 1; }
		});
		return ROT.RNG.getWeightedValue(options);
	}

	act() {
		pause();
		let promise = new Promise(resolve => this._resolve = resolve);

		if (ROT.RNG.getUniform() < REGEN_HP) { this.adjustStat("hp", 1); }
		if (ROT.RNG.getUniform() < REGEN_MANA) { this.adjustStat("mana", 1); }

		promise = promise.then(() => pop());
		push(this);

		return promise;
	}

	handleKeyEvent(e) {
		if (isEnter(e)) { return this._activate(this._xy); }

		let dir = getDirection(e);
		if (!dir) { return; }

		let modifier = hasModifier(e);
		let xy = this._xy.plus(dir);
		if (modifier) {
			this._interact(xy);
		} else {
			this._move(xy);
		}
	}

	handleMessage(message, publisher, data) {
		switch (message) {
			case "topology-change":
				this._updateFOV();
			break;
		}
	}

	adjustStat(stat, diff) {
		super.adjustStat(stat, diff);
		publish("status-change");
	}

	die() {
		super.die();
		clear();
		pause();
		add$1("Game over! Reload the page to try again...");
	}

	moveTo(xy, level) {
		super.moveTo(xy, level);
		if (!this._xy) { return; }

		this._updateFOV();

		if (level && level.danger > this._maxDanger) {
			this._maxDanger = level.danger;
			add$1("You feel healthier.");
			this.maxhp += LEVEL_HP;
			this.adjustStat("hp", LEVEL_HP);
		}

		// getEntity not possible, because *we* are standing here :)

		let cell = this._level.getCell(this._xy);
		if (cell == BRAMBLES && ROT.RNG.getUniform() < BRAMBLE_CHANCE) {
			add$1("You make your way through %s. Ouch! You injure yourself on a thorn.", cell);
			this.adjustStat("hp", -1);
		}

		let item = this._level.getItem(this._xy);
		if (item) {
			add$1("%A is lying here.", item);
			if (!TUTORIAL.item) {
				add$1("To pick it up, press {#fff}Enter{}.");
				TUTORIAL.item = true;
			}
			return;
		}

		if (cell instanceof Door) {
			add$1("You pass through %a.", cell);
		} else if (cell instanceof Staircase) {
			add$1("%A is here.", cell);
			if (!TUTORIAL.staircase) {
				TUTORIAL.staircase = true;
				add$1("To use the staircase, press {#fff}Enter{}.");
			}
		}
	}

	_activate(xy) { // pick or enter
		let item = this._level.getItem(xy);
		if (item) { 
			item.pick(this);
			this._resolve();
			return;
		}

		let cell = this._level.getCell(xy);
		if (cell.activate) {
			cell.activate(this).then(() => this._resolve());
		} else {
			add$1("There is nothing you can do here.");
		}
	}

	_interact(xy) {
		let entity = this._level.getEntity(xy);
		if (entity instanceof Door) {
			if (entity.isOpen()) {
				add$1("You close the door.");
				entity.close();
			} else {
				add$1("You open the door.");
				entity.open();
			}
			return this._resolve(); // successful door interaction
		}

		add$1("You see %a.", entity);

		if (entity instanceof Being) { this._interactWithBeing(entity); }
	}

	_chat(being) {
		let text = being.getChat();
		if (text) {
			add$1(`%The says, \"${text}\"`, being);
		} else {
			add$1("%The does not say anything.", being);
		}
	}

	_attack(being) {
		add$1("You attack %the.", being);
		start(being).then(() => this._resolve());
	}

	_kiss(being) {
		add$1("%The does not seem to be amused!", being);
		this._resolve(); // successful kiss interaction
	}

	_interactWithBeing(being) {
		let callbacks = [];
		let options = [];

		callbacks.push(() => this._kiss(being));
		options.push("Kiss %it gently to wake %it up".format(being, being));

		callbacks.push(() => this._chat(being));
		options.push("Talk to %it".format(being));

		if (being instanceof Hero) {
		} else {
			callbacks.push(() => this._attack(being));
			options.push("Attack %it".format(being));
		}

		choice(options).then(index => {
			if (index == -1) { 
				add$1("You decide to do nothing.");
				return;
			}
			callbacks[index]();
		});

	}

	_move(xy) {
		let entity = this._level.getEntity(xy);

		if (entity.blocks >= BLOCKS_MOVEMENT) {
			add$1("You bump into %a.", entity);
			if (entity instanceof Door && !TUTORIAL.door) {
				TUTORIAL.door = true;
				add$1("To interact with stuff, press both a {#fff}modifier key{} (Ctrl, Alt, Shift or Command) and a {#fff}direction key{} (used for movement).");
			}
			if (entity instanceof Being && !TUTORIAL.enemy) {
				add$1("If you wish to interact with beings (attack them, for example), press both a {#fff}modifier key{} (Ctrl, Alt, Shift or Command) and a {#fff}direction key{} (used for movement).");
				TUTORIAL.enemy = true;
			}
			return;
		}

		this.moveTo(xy);
		this._resolve(); // successful movement
	}

	_updateFOV() {
		let level = this._level;
		let fov = new ROT.FOV.PreciseShadowcasting((x, y) => {
			return level.getEntity(new XY(x, y)).blocks < BLOCKS_LIGHT;
		});

		let newFOV = {};
		let cb = (x, y, r, amount) => {
			let xy = new XY(x, y);
			newFOV[xy] = xy;
		};
		fov.compute(this._xy.x, this._xy.y, PC_SIGHT, cb);
		this.fov = newFOV;

		publish("visibility-change", this, {xy:this._xy});
	}
}

var pc = new PC();

const W = 6;
const H = W;

class Board {
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
		};

		tryIt(xy);
		return segment;
	}
}

const CELL = 30;
const CTX = document.createElement("canvas").getContext("2d");
const LEGEND = document.createElement("ul");

const LABELS = {
	[ATTACK_1]: "You attack",
	[ATTACK_2]: "Enemy attacks",
	[MAGIC_1]: "You attack (magic)",
	[MAGIC_2]: "Enemy attacks (magic)"
};

function buildLegend() {
	[ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2].forEach(id => {
		let li = document.createElement("li");
		LEGEND.appendChild(li);
		li.setAttribute("data-id", id);
		let hash = document.createElement("span");
		hash.style.color = COLORS[id];
		hash.innerHTML = "# ";
		li.appendChild(hash);
		li.appendChild(document.createTextNode(LABELS[id]));
	});
}

function updateLegend(id) {
	Array.from(LEGEND.querySelectorAll("[data-id]")).forEach(item => {
		item.classList.toggle("inactive", item.getAttribute("data-id") != id);
	});
}

function drawCell(xy, color, highlight) {
	let x = (xy.x+0.5)*CELL;
	let y = CTX.canvas.height-(xy.y+0.5)*CELL;

	let alpha = 0.8;
	let bold = false;
	if (highlight.some(hxy => hxy.is(xy))) { 
		alpha = 1; 
		bold = true;
	}

	CTX.font = `${bold ? "bold " : ""}${CELL*0.8}px metrickal, monospace`;
	CTX.globalAlpha = alpha;

	CTX.fillStyle = color;
	CTX.fillText("#", x, y);
}

function drawCursor(xy) {
	CTX.strokeStyle = "#999";
	CTX.lineWidth = 2;

	let X = xy.x * CELL;
	let Y = CTX.canvas.height-(xy.y+1)*CELL;
	CTX.strokeRect(X+2, Y+2, CELL-4, CELL-4);
}

function draw(board, cursor, highlight = []) {
	let size = board.getSize();
	CTX.canvas.width = size.x*CELL;
	CTX.canvas.height = size.y*CELL;
	CTX.textAlign = "center";
	CTX.textBaseline = "middle";

	let xy = new XY();
	for (xy.x=0; xy.x<size.x; xy.x++) {
		for (xy.y=0; xy.y<size.y; xy.y++) {
			let cell = board.at(xy);
			if (!cell) { return; }
			let pos = cell.animated || xy;
			let color = COLORS[cell.value];
			drawCell(pos, color, highlight);
		}
	}

	drawCursor(cursor);
	updateLegend(highlight.length > 0 ? board.at(cursor).value : null);
}

function init$3(parent) {
	let heading = document.createElement("p");
	heading.innerHTML = "Game of Thorns";
	parent.appendChild(heading);
	parent.appendChild(CTX.canvas);
	buildLegend();
	parent.appendChild(LEGEND);
}

function activate$1() {
	let node = CTX.canvas.parentNode;
	node.classList.remove("hidden");
	node.classList.remove("inactive");
}

function deactivate() {
	let node = CTX.canvas.parentNode;
	node.classList.add("inactive");
}

const GRASS_1 = new Grass("\"");
const GRASS_2 = new Grass("'");
const TREE = new Tree();

const NOISE = new ROT.Noise.Simplex();

const memories = {};

function darken(color) {
	if (!color) { return color; }
	return ROT.Color.toRGB(ROT.Color.fromString(color).map(x => x>>1));
}

class Memory {
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
		};
	}
}

const FONT_BASE = 18;
const FONT_ZOOM = 120;
const ZOOM_TIME = 1000;

let level = null;
let options = {
	width: 1,
	height: 1,
	spacing: 1.1,
	fontSize: FONT_BASE,
	fontFamily: "metrickal, monospace"
};
let display = new ROT.Display(options);
let center = new XY(0, 0); // level coords in the middle of the map
let memory = null;

function levelToDisplay(xy) { // level XY to display XY; center = middle point
	let half = new XY(options.width, options.height).scale(0.5).floor();
	return xy.minus(center).plus(half);
}

function displayToLevel(xy) { // display XY to level XY; middle point = center
	let half = new XY(options.width, options.height).scale(0.5).floor();
	return xy.minus(half).plus(center);
}

function fit() {
	let node = display.getContainer();
	let parent = node.parentNode;
	let avail = new XY(parent.offsetWidth, parent.offsetHeight);

	let size = display.computeSize(avail.x, avail.y);
	size[0] += (size[0] % 2 ? 2 : 1);
	size[1] += (size[1] % 2 ? 2 : 1);
	options.width = size[0];
	options.height = size[1];
	display.setOptions(options);

	let current = new XY(node.offsetWidth, node.offsetHeight);
	let offset = avail.minus(current).scale(0.5);
	node.style.left = `${offset.x}px`;
	node.style.top = `${offset.y}px`;
}

function update(levelXY) {
	let visual = memory.visualAt(levelXY);
	if (!visual) { return; }
	let displayXY = levelToDisplay(levelXY);
	display.draw(displayXY.x, displayXY.y, visual.ch, visual.fg);
}

function setCenter(newCenter) {
	center = newCenter.clone();
	display.clear();

	let displayXY = new XY();
	for (displayXY.x=0; displayXY.x<options.width; displayXY.x++) {
		for (displayXY.y=0; displayXY.y<options.height; displayXY.y++) {
			update(displayToLevel(displayXY));
		}
	}
}

function setLevel(l) {
	level = l;
	memory = Memory.forLevel(level);
}

function zoom(size2) {
	let node = display.getContainer();
	node.style.transition = `transform ${ZOOM_TIME}ms`;

	let size1 = options.fontSize;
	let scale = size2/size1;

	node.style.transform = `scale(${scale})`;
	setTimeout(() => {
		options.fontSize = size2;
		display.setOptions(options);
		fit();
		setCenter(center);
		node.style.transition = "";
		node.style.transform = "";
	}, ZOOM_TIME);
}

function handleMessage(message, publisher, data) {
	switch (message) {
		case "visibility-change":
			setCenter(data.xy);
		break;

		case "visual-change":
			if (publisher != level) { return; }
			update(data.xy);
		break;
	}
}

function zoomIn() {
	return zoom(FONT_ZOOM);
}

function zoomOut() {
	return zoom(FONT_BASE);
}

function init$4(parent) {
	parent.appendChild(display.getContainer());
	subscribe("visual-change", handleMessage);
	subscribe("visibility-change", handleMessage);

	window.addEventListener("resize", e => {
		fit();
		setCenter(center);
	});

	fit();
	activate$2();
}

function activate$2() {
	let node = display.getContainer().parentNode;
	node.classList.remove("hidden");
	node.classList.remove("inactive");
}

function deactivate$1() {
	let node = display.getContainer().parentNode;
	node.classList.add("inactive");
}

const AMOUNTS = ["slightly", "moderately", "severely", "critically"].reverse();

let tutorial = false;

let board = new Board().randomize();
let resolve = null;
let enemy = null;
let cursor = new XY(0, 0);

function end() {
	activate$2();
	zoomOut();
	deactivate();
	pop();
	resolve();
}

function doDamage(attacker, defender, options = {}) {
//	console.log("combat", options);
	if (options.isMagic) { // check mana
		if (attacker.mana < options.power) {
			add$1("%The %{verb,do} not have enough mana to attack.", attacker, attacker);
			return;
		}
		attacker.adjustStat("mana", -options.power);
	}

	let attack = attacker.getAttack();
	let defense = defender.getDefense();
	let damage = attack + options.power - defense;
//	console.log("attack %s, defense %s, damage %s", attack, defense, damage);
	damage = Math.max(1, damage);

	let verb = (options.isMagic ? "%{verb,cast} a spell at %the" : "%{verb,hit} %the").format(attacker, defender);
	let newHP = Math.max(0, defender.hp-damage);
	if (newHP > 0) {
		let frac = newHP/defender.maxhp; // >0, < maxhp
		let amount = AMOUNTS[Math.floor(frac * AMOUNTS.length)];
		add$1(`%The ${verb} and ${amount} %{verb,damage} %it.`, attacker, attacker, defender);
	} else {
		add$1(`%The ${verb} and %{verb,kill} %it!`, attacker, attacker, defender);
	}

	defender.adjustStat("hp", -damage);
	if (defender.hp <= 0) { end(); }
}

function activate$$1(xy) {
	let segment = board.findSegment(xy);
	if (!segment || segment.length < 2) { return; }

	let value = board.at(xy).value;

	segment.forEach(xy => {
		board.set(xy, null);
	});

	let animation = board.fall();
	animation.start(drawFast).then(() => {
		checkSegments();
		drawFull();
	});

	let power = segment.length;
	let isMagic = (value == MAGIC_1 || value == MAGIC_2);
	let attacker = pc;
	let defender = enemy;
	if (value == ATTACK_2 || value == MAGIC_2) {
		attacker = enemy;
		defender = pc;
	}

	doDamage(attacker, defender, {power, isMagic});
}

function checkSegments() {
	while (1) {
		let segments = board.getAllSegments();
		if (segments[0].length >= 2) { return; }
		board.randomize();
	} 
}

function handleKeyEvent(e) {
	if (isEnter(e)) { return activate$$1(cursor); }

	let dir = getDirection(e);
	if (!dir) { return; }

	dir = dir.scale(1, -1);
	cursor = cursor.plus(dir).mod(board.getSize());
	drawFull();
}

function drawFast() {
	draw(board, cursor);
}

function drawFull() {
	let highlight = board.findSegment(cursor);
	if (highlight && highlight.length < 2) { highlight = null; }
	draw(board, cursor, highlight || []);
}

function init$1(parent) {
	init$3(parent);
	checkSegments();
	drawFull();
}

function start(e) {
	deactivate$1();
	zoomIn();
	activate$1();

	if (!tutorial) {
		tutorial = true;
		add$1("Combat in Sleeping Beauty happens by playing the {goldenrod}Game of Thorns{} on a square game board.");
		add$1("Match sequences ({#fff}direction keys{} and {#fff}Enter{}) of colored blocks to perform individual actions. This includes both your attacks as well as your enemy's.");
		add$1("Note that certain items in your inventory can modify the frequency of colors on the game board.");
		pause();
	}

	enemy = e;
	let promise = new Promise(r => resolve = r);
	push({handleKeyEvent});

	return promise;
}

let node$1;

function init$5(n) {
	node$1 = n;
	node$1.classList.remove("hidden");
	subscribe("status-change", update$1);
}

function update$1() {
	let str = "";
	let level = pc.getLevel();
	if (level) {str = `Tower floor ${level.danger}. `; }
	str = `${str}You have:`;
	node$1.innerHTML = str;

	let ul = document.createElement("ul");
	node$1.appendChild(ul);

	ul.appendChild(buildStatus());
	ul.appendChild(buildItems());
}

function buildStatus() {
	let node = document.createElement("li");

	let hp = buildPercentage(pc.hp, pc.maxhp);
	let mana = buildPercentage(pc.mana, pc.maxmana);
	let str = `${hp} health, ${mana} mana`;

	let gold = pc.inventory.getItemByType("gold");
	let coins = (gold ? gold.amount : 0);
	if (coins > 0) { 
		let color = gold.getVisual().fg;
		let suffix = (coins > 1 ? "s" : "");
		str = `${str}, <span style="color:${color}">${coins}</span> ${gold.toString()}${suffix}`;
	}

	node.innerHTML = str;
	return node;
}

function buildPercentage(value, limit) {
	let frac = value/limit;
	let color = ROT.Color.interpolateHSL([255, 0, 0], [0, 255, 0], frac);
	color = ROT.Color.toRGB(color);
	return `<span style="color:${color}">${value}</span>/${limit}`;
}

function buildItems() {
	let frag = document.createDocumentFragment();
	let items = pc.inventory.getItems().filter(i => i.getType() != "gold");
	items.forEach(item => {
		let node = document.createElement("li");
		let str = item.toString();
		if (item.modifier) {
			str = `${str} (${item.modifier > 0 ? "+" : ""}${item.modifier})`;
		}
		if (item.combat) {
			str = `${str} (+<strong style="color:${COLORS[item.combat]}">#</strong>)`;
		}
		node.innerHTML = str;
		frag.appendChild(node);
	});
	return frag;
}

const START = [
	" _     _     _     _ ",
	"[_]___[_]___[_]___[_]",
	"[__#__][__#I_]__I__#]",
	"[_I_#_I__*[__]__#_*_]",
	"   [_]_#_]__I_#__]   ",
	"   [I_|/     \\|*_]   ",
	'   [#_||  ?  ||_#]   ',
	"   [_I||     ||_#]   ",
	"   [__]|     ||#_]   "];

const END = [
	" \\\\[__]#_I__][__#]// "
];

const WIDTH = 13;

const TEST = new Array(11).join("\n");

let node$3 = document.createElement("div");
node$3.classList.add("tower");

function mid() {
	let content = "";
	let separatorDistance = 0;
	let vineDistance = 0;

	for (let i=0; i<WIDTH; i++) {
		let ch = "";
		let separatorChance = (separatorDistance-0.5) / 3;
		let vineChance = (vineDistance+1) / 15;

		if (ROT.RNG.getUniform() < separatorChance) {
			ch = ["I", "]", "["].random();
			separatorDistance = 0;
		} else {
			separatorDistance++;
			ch = "_";
		}

		if (ROT.RNG.getUniform() < vineChance) {
			ch = ["#", "#", "*"].random();
			vineDistance = 0;
		} else {
			vineDistance++;
		}

		content += ch;
	}

	return `   [${content}]   `;
}

function colorize(ch, index, str) {
	let color = ["#888", "#aaa", "#999"].random();
	let transparent = false;

	switch (ch) {
		case "?":
			color = "red";
			transparent = true;
		break;
		case "/":
		case "\\":
			if (str.charAt(index-1) == ch || str.charAt(index+1) == ch) { 
				color = "lime";
				transparent = true;
			}
		break;
		case "#":
			color = ["#383", "#262"].random();
		break;
		case "*":
			color = "pink";
		break;
	}

	if (ch == "_" && str.charAt(index-1) == " ") { transparent = true; }
	return `<span style="color:${color}" ${transparent ? "class='transparent'" : ""}>${ch}</span>`;
}

function fit$1() {
	let avail = node$3.parentNode.offsetHeight;
	node$3.innerHTML = TEST;
	let rows = Math.floor(TEST.length*avail/node$3.offsetHeight) - 4;

	rows -= START.length;
	rows -= END.length;

	let all = START.slice();
	for (let i=0;i<rows;i++) {
		all.push(mid());
	}
	all = all.concat(END);

	node$3.innerHTML = all.join("\n").replace(/\S/g, colorize);
}

function getNode() {
	return node$3;
}

let node$4 = document.createElement("div");
node$4.classList.add("title");
node$4.innerHTML =                                               
".oPYo. 8                       o             \n" +
"8      8                                     \n" +
"`Yooo. 8 .oPYo. .oPYo. .oPYo. o8 odYo. .oPYo.\n" +
"    `8 8 8oooo8 8oooo8 8    8  8 8' `8 8    8\n" + 
"     8 8 8.     8.     8    8  8 8   8 8    8\n" +
"`YooP' 8 `Yooo' `Yooo' 8YooP'  8 8   8 `YooP8\n" + 
"                       8                    8\n" +
"                       8                 ooP'\n" +
" .oPYo.                        o             \n" +
" 8   `8                        8             \n" +
"o8YooP' .oPYo. .oPYo. o    o  o8P o    o     \n" +
" 8   `b 8oooo8 .oooo8 8    8   8  8    8     \n" +
" 8    8 8.     8    8 8    8   8  8    8     \n" +
" 8oooP' `Yooo' `YooP8 `YooP'   8  `YooP8     \n" +
"                                       8     \n" +
"                                    ooP'     ";

function getNode$1() {
	return node$4;
}

let node$5 = document.createElement("div");
node$5.classList.add("bottom");
node$5.innerHTML = "BOTTOM";

const TEST$1 = "xxxxxxxxxx";
const PAD = "  ";

const KNIGHT = [
	"   .-.   ",
	" __|=|__ ",
	"(_/'-'\\_)",
	"//\\___/\\\\",
	"<>/   \\<>",
	" \\|_._|/ ",
	"  <_I_>  ",
	"   |||   ",
	"  /_|_\\  "
];

const FLOWER = [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
	" .:. ",
	"-=o=-",
	" ':' ",
	" \\|/ "
];

function colorizeKnight(ch) {
	let color = "#aae";
	return `<span style="color:${color}">${ch}</span>`;
}

function colorizeFlower(ch) {
	let color = "#f00";
	if (ch == "o") { color = "#ff0"; }
	if (ch == "\\" || ch == "/" || ch == "|") { color = "lime"; }
	ch = ch.replace(/</, "&lt;").replace(/>/, "&gt;");
	return `<span style="color:${color}">${ch}</span>`;
}

function fit$2() {
	let avail = node$5.parentNode.offsetWidth;
	node$5.innerHTML = TEST$1;
	let columns = Math.floor(TEST$1.length*avail/node$5.offsetWidth) - 2;

	let knight = KNIGHT.join("\n").replace(/\S/g, colorizeKnight).split("\n");
	let flower = FLOWER.join("\n").replace(/\S/g, colorizeFlower).split("\n");

	let result = [];
	for (let i=0;i<knight.length;i++) {
		let remain = columns;
		remain -= PAD.length; // padding
		remain -= 9; // knight
		remain -= 5; // flower

		let row = `${PAD}${knight[i]}${new Array(remain+1).join(" ")}${flower[i]}`;
		result.push(row);
	}

	let final = `<span class='grass'>${new Array(columns+1).join("^")}</span>`;
	result.push(final);

	node$5.innerHTML = result.join("\n");
}

function getNode$2() {
	return node$5;
}

let node$6 = document.createElement("div");
node$6.classList.add("text");
node$6.innerHTML = 
`Into a profound slumber she sank, surrounded only by dense brambles, thorns and roses.
Many adventurers tried to find and rescue her, but none came back...
<br/><br/><span>Hit [Enter] to start the game</span>`;

function getNode$3() {
	return node$6;
}

const FACTS = [
	"This game was created in one week",
	"This game was written using rot.js, the JavaScript Roguelike Toolkit",
	"The tower is procedurally generated. Try resizing this page!",
	"You can reload this page to get another Fun Fact",
	"The original Sleeping Beauty fairy tale was written by Charles Perrault",
	"This game is best played with a maximized browser window",
	"This game can be won!",
	"This game can be lost!",
	"This game features permadeath and procedural generation",
	"This game uses the awesome 'Metrickal' font face",
	"This game runs even in Microsoft Internet Explorer 11",
	"Eating a lutefisk might be dangerous"
];

let node$7 = document.createElement("div");
node$7.classList.add("funfact");
node$7.innerHTML = `Fun Fact: ${FACTS.random()}`;

function getNode$4() {
	return node$7;
}

let resolve$2 = null;
let node$2 = null;

function handleKeyEvent$2(e) {
	if (!isEnter(e)) { return; }

	pop();
	window.removeEventListener("resize", onResize);
	node$2.parentNode.removeChild(node$2);

	resolve$2();
}

function onResize(e) {
	fit$1();
	fit$2();
}

function start$1(n) {
	node$2 = n;
	node$2.appendChild(getNode$1());
	node$2.appendChild(getNode$2());
	node$2.appendChild(getNode$3());
	node$2.appendChild(getNode());
	node$2.appendChild(getNode$4());

	fit$1();
	fit$2();

	push({handleKeyEvent: handleKeyEvent$2});

	window.addEventListener("resize", onResize);
	window.addEventListener("load", onResize);

	return new Promise(r => resolve$2 = r);
}

const D1_RADIUS = 15;
const D2_RADIUS = 30;
const LAST1_RADIUS = 20;
const LAST_RADIUS = 10;

function dangerToRadius(danger) {
	if (danger == 1) { return D1_RADIUS; }
	if (danger == LAST_LEVEL) { return LAST_RADIUS; }

	let diff = LAST1_RADIUS-D2_RADIUS;
	let regularCount = LAST_LEVEL-2;
	if (regularCount == 1) { return D2_RADIUS; }

	return D2_RADIUS + Math.round((danger-2)/(regularCount-1) * diff);
}

class Level {
	constructor(danger) {
		this.danger = this.id = danger;
		this.rooms = [];
		this.start = this.end = null;
		this._beings = {};
		this._items = {};
		this._cells = {};
	}

	activate(xy, who) { // async, because outro
		clear();

		who.moveTo(null); // remove from old
		setLevel(this);
		who.moveTo(xy, this); // put to new

		let beings = Object.keys(this._beings).map(key => this._beings[key]).filter(b => b); /* filter because of empty values */
		beings.forEach(being => add(being));

		publish("status-change");

		if (this.danger == LAST_LEVEL) { 
			return this._outro(who);
		} else {
			add$1(`Welcome to tower floor ${this.danger}.`);
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
		return this._beings[key] || this._items[key] || this._cells[key] || WALL;
	}

	setCell(xy, cell) {
		this._cells[xy] = cell;
	}

	getCell(xy) { return this._cells[xy] || WALL; }
	getItem(xy) { return this._items[xy]; }

	setBeing(xy, being) {
		this._beings[xy] = being;
		publish("visual-change", this, {xy});
	}

	setItem(xy, item) {
		this._items[xy] = item;
		publish("visual-change", this, {xy});
	}

	carveRoom(room) {
		this.rooms.push(room);
		let xy = new XY();

		for (xy.x=room.lt.x; xy.x<=room.rb.x; xy.x++) {
			for (xy.y=room.lt.y; xy.y<=room.rb.y; xy.y++) {
				this.setCell(xy, ROOM);
			}
		}
	}

	carveCorridor(xy1, xy2) {
		let diff = xy2.minus(xy1);
		let steps = diff.norm8() + 1;

		for (let i=0; i<=steps; i++) {
			let xy = xy1.lerp(xy2, i/steps).floor();
			this.setCell(xy, CORRIDOR);
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
				if (this._cells[key] != CORRIDOR) { continue; }

				if (ROT.RNG.getUniform() > options.doorChance) { continue; }
				let closed = (ROT.RNG.getUniform() < options.closedChance);
				this.setCell(xy, new Door(closed));
			}
		}
	}

	_outro(who) {
		add$1("{#33f}Welcome to the last floor!{}");
		add$1("You finally managed to reach the princess and finish the game.");
		add$1("{goldenrod}Congratulations{}!");
		pause();

		let gold = who.inventory.getItemByType("gold");
		if (gold) {
			let color = gold.getVisual().fg;
			add$1(`Furthermore, you were able to accumulate a total of {${color}}${gold.amount}{} golden coins.`);
			pause();
		}

		add$1("The game is over now, but you are free to look around.");
		add$1("{#fff}Press Escape to continue...{}");

		deactivate$1();
		let resolve;
		let promise = new Promise(r => resolve = r);
		let handleKeyEvent = (e) => {
			if (!isEscape(e)) { return; }
			activate$2();
			pop();
			resolve();
		}; 
		push({handleKeyEvent});
		return promise;
	}
}

function get(classes, danger) {
	let d = ROT.RNG.getNormal(danger, 1);
	d = Math.max(1, d);

	if (d <= danger+1) { // okay, take this one
	} else { // too large -- take any other lower value
		d = ROT.RNG.getUniformInt(1, danger);
	}

	classes = Object.keys(classes).map(key => classes[key]);
	let avail = classes.filter(c => "danger" in c);

	let best = [];
	let bestDist = Infinity;
	avail.forEach(c => {
		let dist = Math.abs(c.danger - d);
		if (dist < bestDist) {
			bestDist = dist;
			best = [];
		}
		if (dist == bestDist) {
			best.push(c);
		}
	});
	let ctor = best.random();
	return new ctor();
}

function getItem(danger) {
	return get(items, danger);
}

function getBeing(danger) {
	return get(beings, danger);
}

function getPotion() {
	let avail = [HealthPotion, ManaPotion];
	let ctor = avail.random();
	return new ctor();
}

const DIST = 10;

function roomSize() {
	let w = 2*ROT.RNG.getUniformInt(2, 5);
	let h = w + 2*ROT.RNG.getUniformInt(-1, 1);
	return new XY(w, h);
}

function cloneRoom(room) {
	return {
		neighbors: room.neighbors.slice(),
		lt: room.lt.clone(),
		rb: room.rb.clone(),
		center: room.center.clone(),
	}
}

function centerRoom(halfSize) {
	return {
		neighbors: [],
		center: new XY(0, 0),
		lt: halfSize.scale(-1),
		rb: halfSize.scale(1)
	}
}

function roomNearTo(xy) {
	let cx = xy.x + ROT.RNG.getUniformInt(-DIST, DIST);
	let cy = xy.y + ROT.RNG.getUniformInt(-DIST, DIST);
	let center = new XY(cx, cy);

	let size = roomSize();

	return {
		neighbors: [],
		center,
		lt: center.minus(size.scale(0.5)),
		rb: center.plus(size.scale(0.5))
	}
}

function enlarge(room, diff) {
	let clone = cloneRoom(room);
	clone.lt.x -= diff;
	clone.lt.y -= diff;
	clone.rb.x += diff;
	clone.rb.y += diff;
	return clone;
}

function furthestRoom(rooms, start) {
	let bestDist = 0;
	let bestRoom = null;

	let visited = [];

	function visit(room, dist) {
		visited.push(room);

		if (dist > bestDist) {
			bestDist = dist;
			bestRoom = room;
		}

		room.neighbors
			.filter(r => !visited.includes(r))
			.forEach(r => visit(r, dist+1));
	}

	visit(start, null, 0);
	return bestRoom;
}

const levels = {};

function decorateBrambles(level) {
	let radius = dangerToRadius(level.danger);
	let dist = ROT.RNG.getUniformInt(2*radius, 5*radius);
	let angle = ROT.RNG.getUniform()*2*Math.PI;

	let center = new XY(Math.cos(angle), Math.sin(angle)).scale(dist);
	let da = radius/dist;

	angle += Math.PI;
	dist += (ROT.RNG.getUniform()-0.5)*radius;

	for (let a=angle-da; a<angle+da; a+=.01) {
		let xy = center.plus(new XY(Math.cos(a), Math.sin(a)).scale(dist)).round();
		if (!level.isInside(xy)) { continue; }
		if (level.getEntity(xy) != WALL) { continue; }
		level.setCell(xy, BRAMBLES);
	}
}

function staircaseCallback(danger, start) {
	return function(who) {
		if (!(danger in levels)) { generate(danger); } /* create another level */
		let level = levels[danger];
		return level.activate(start ? level.start : level.end, who);
	}
}

function decorateLast(level) {
	let radius = dangerToRadius(level.danger);
	level.start = level.rooms[0].center.minus(new XY(radius-2, 0));

	let bed = level.rooms[0].center.plus(new XY(3, 0));
	level.setCell(bed, new Princess());

	level.setCell(bed.plus(new XY(-1, -1)), new Pillar());
	level.setCell(bed.plus(new XY(+1, -1)), new Pillar());
	level.setCell(bed.plus(new XY(-1, +1)), new Pillar());
	level.setCell(bed.plus(new XY(+1, +1)), new Pillar());

	let xy = new XY();
	for (xy.x = bed.x-3; xy.x <= bed.x+3; xy.x++) {
		for (xy.y = bed.y-3; xy.y <= bed.y+3; xy.y++) {
			if (xy.is(bed)) { continue; }
			if (level.getEntity(xy) != ROOM) { continue; }

			if (xy.dist8(bed) == 1) { // close heroes
				let hero = new Hero();
				hero.ai.mobile = false;
				hero.moveTo(xy.clone(), level);
				continue;
			}

			if (ROT.RNG.getUniform() > 0.5) { continue;  }
			let hero = new Hero(); // remote heroes
			hero.moveTo(xy.clone(), level);
		}
	}
}

function decorateFirst(level) {
	let features = ["rat", "potion", "dagger"];
	level.rooms.forEach(room => {
		if (room.center.is(level.start)) { // first room
			level.carveDoors(room, {doorChance:1, closedChance:1});
			return;
		}

		if (room.center.is(level.end)) {
			level.carveDoors(room);
			return;
		}

		level.carveDoors(room);
		if (!features.length) { return; }
		let feature = features.shift();
		switch (feature) {
			case "rat":
				let rat = new Rat();
				rat.ai.hostile = false;
				rat.moveTo(room.center.clone(), level);
			break;

			case "potion":
				level.setItem(room.center.clone(), new HealthPotion());
			break;

			case "dagger":
				level.setItem(room.center.clone(), new Dagger());
			break;
		}
	});
}

function decorateFull(level) {
	decorateBrambles(level);

	let features = {
		item: 4,
		potion: 3,
		lutefisk: 0.1,
		gold: 2,
		enemy: 5,
		hero: 1,
		empty: 2
	};

	level.rooms.forEach(room => {
		level.carveDoors(room);
		if (room.center.is(level.start) || room.center.is(level.end)) { return; }
		
		for (let i=0; i<2; i++) {
			let xy = new XY(
				ROT.RNG.getUniformInt(room.lt.x, room.rb.x),
				ROT.RNG.getUniformInt(room.lt.y, room.rb.y)
			);
			if (level.getEntity(xy) != ROOM) { continue; } // wrong place

			let feature = ROT.RNG.getWeightedValue(features);
			switch (feature) {
				case "item": level.setItem(xy, getItem(level.danger)); break;
				case "potion": level.setItem(xy, getPotion()); break;
				case "lutefisk": level.setItem(xy, new Lutefisk()); break;
				case "gold": level.setItem(xy, new Gold()); break;
				case "enemy": getBeing(level.danger).moveTo(xy, level); break;
				case "hero": new Hero().moveTo(xy, level); break;
			}
		}
	});
}

function decorateRegular(level) {
	let r1 = furthestRoom(level.rooms, level.rooms[0]);
	let r2 = furthestRoom(level.rooms, r1);

	level.start = r1.center;
	level.end = r2.center;

	/* staircase up, all non-last levels */
	let up = new Staircase(true, staircaseCallback(level.danger+1, true));
	level.setCell(level.end, up);

	/* staircase down, when available */
	let d = level.danger-1;
	if (d in levels) {
		let down = new Staircase(false, staircaseCallback(level.danger-1, false));
		level.setCell(level.start, down);
	}

	if (level.danger == 1) {
		decorateFirst(level);
	} else {
		decorateFull(level);
	}

/*
	let xy = new XY();
	for (xy.x = r1.lt.x; xy.x <= r1.rb.x; xy.x++) {
		for (xy.y = r1.lt.y; xy.y <= r1.rb.y; xy.y++) {
			let item = factory.getItem(2);
			level.setItem(xy, item);
		}
	}
*/

}

function decorate(level) {
	levels[level.danger] = level;

	if (level.danger == LAST_LEVEL) {
		decorateLast(level);
	} else {
		decorateRegular(level);
	}
}

function connectHorizontal(level, room1, room2) {
	let min = Math.max(room1.lt.x, room2.lt.x);
	let max = Math.min(room1.rb.x, room2.rb.x);
	let x = ROT.RNG.getUniformInt(min, max);
	level.carveCorridor(new XY(x, room1.center.y), new XY(x, room2.center.y));
}

function connectVertical(level, room1, room2) {
	let min = Math.max(room1.lt.y, room2.lt.y);
	let max = Math.min(room1.rb.y, room2.rb.y);
	let y = ROT.RNG.getUniformInt(min, max);
	level.carveCorridor(new XY(room1.center.x, y), new XY(room2.center.x, y));
}

function connectL(level, room1, room2) {
	let p1 = new XY(room1.center.x, room2.center.y);
	let p2 = new XY(room2.center.x, room1.center.y);

	/* pick the one closer to the center */
	let P = (p1.norm() < p2.norm() ? p1 : p2);

	level.carveCorridor(room1.center, P);
	level.carveCorridor(room2.center, P);
}

function connect(level, room1, room2) {
	room1.neighbors.push(room2);
	room2.neighbors.push(room1);

	let overlapHorizontal = !(room1.lt.x > room2.rb.x || room2.lt.x > room1.rb.x);
	let overlapVertical = !(room1.lt.y > room2.rb.y || room2.lt.y > room1.rb.y);

	if (overlapHorizontal) {
		connectHorizontal(level, room1, room2);
	} else if (overlapVertical) {
		connectVertical(level, room1, room2);
	} else {
		connectL(level, room1, room2);
	}
}

function generateNextRoom(level) {
	let center = new XY(0, 0);
	let failed = -1;

	while (failed < 1000) {
		failed++;
		let oldRoom;
		if (level.rooms.length > 0) {
			oldRoom = level.rooms.random();
			center = oldRoom.center;
		}

		let newRoom = roomNearTo(center);
		if (!level.isInside(newRoom.center)) { continue; }
		if (!level.fits(enlarge(newRoom, 2))) { continue; }
		level.carveRoom(newRoom);

		if (oldRoom) { connect(level, oldRoom, newRoom); }

//		console.log("room #%s after %s failures", level.rooms.length, failed);
		return true;
	}

//	console.log("failed to add after %s failures", failed);
	return false;
}

function connectWithClosest(room, level) {
	let COMPARE = (r1, r2) => r1.center.minus(room.center).norm() - r2.center.minus(room.center).norm();

	let avail = level.rooms.filter(r => !r.neighbors.includes(room) && r != room);
	avail.sort(COMPARE);
	if (!avail) { return; }

	connect(level, room, avail[0]);
}

function generate(danger) {
	let level = new Level(danger);

	if (danger == LAST_LEVEL) {
		let radius = dangerToRadius(danger);
		let centerRoom$$1 = centerRoom(new XY(radius, radius));
		level.carveRoom(centerRoom$$1);
	} else {
		while (true) {
			let ok = generateNextRoom(level);
			if (!ok) { break; }
		}
		let r1 = furthestRoom(level.rooms, level.rooms[0]);
		let r2 = furthestRoom(level.rooms, r1);
		connectWithClosest(r1, level);
		connectWithClosest(r2, level);
	}
	
	level.trim();
	decorate(level);

	return level;
}

// import { draw } from "ui/map/debug.js"

let seed = Date.now();
console.log("seed", seed);
ROT.RNG.setSeed(seed);

function init$$1() {
	init$4(document.querySelector("#map"));
	init$1(document.querySelector("#combat"));
	init$2(document.querySelector("#log"));
	init$5(document.querySelector("#status"));

	update$1();

	add$1("A truly beautiful day for a heroic action!");
	add$1("This tower is surrounded by plains and trees and there might be a princess sleeping on the last floor.");
	pause();
	add$1("Apparently the only way to get to her is to advance through all tower levels.");
	add$1("To move around, use {#fff}arrow keys{}, {#fff}numpad{} or {#fff}vim-keys{}.");
	pause();

	let level = generate(1);
	level.activate(level.start, pc);

//	let canvas = draw(level);
//	canvas.style.left = canvas.style.top = 0;

	loop();
}

start$1(document.querySelector("#intro")).then(init$$1);

}());
