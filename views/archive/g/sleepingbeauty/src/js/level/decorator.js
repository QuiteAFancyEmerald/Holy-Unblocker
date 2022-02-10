import XY from "util/xy.js";
import { generate } from "./generator.js";
import { dangerToRadius } from "./level.js";

import * as factory from "util/factory.js";
import * as beings from "being/beings.js";
import * as items from "item/items.js";
import * as cells from "./cells.js";
import * as room from "./room.js";
import * as rules from "rules.js";

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
		if (level.getEntity(xy) != cells.WALL) { continue; }
		level.setCell(xy, cells.BRAMBLES);
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
	level.setCell(bed, new cells.Princess());

	level.setCell(bed.plus(new XY(-1, -1)), new cells.Pillar());
	level.setCell(bed.plus(new XY(+1, -1)), new cells.Pillar());
	level.setCell(bed.plus(new XY(-1, +1)), new cells.Pillar());
	level.setCell(bed.plus(new XY(+1, +1)), new cells.Pillar());

	let xy = new XY();
	for (xy.x = bed.x-3; xy.x <= bed.x+3; xy.x++) {
		for (xy.y = bed.y-3; xy.y <= bed.y+3; xy.y++) {
			if (xy.is(bed)) { continue; }
			if (level.getEntity(xy) != cells.ROOM) { continue; }

			if (xy.dist8(bed) == 1) { // close heroes
				let hero = new beings.Hero();
				hero.ai.mobile = false;
				hero.moveTo(xy.clone(), level);
				continue;
			}

			if (ROT.RNG.getUniform() > 0.5) { continue;  }
			let hero = new beings.Hero(); // remote heroes
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
				let rat = new beings.Rat();
				rat.ai.hostile = false;
				rat.moveTo(room.center.clone(), level);
			break;

			case "potion":
				level.setItem(room.center.clone(), new items.HealthPotion());
			break;

			case "dagger":
				level.setItem(room.center.clone(), new items.Dagger());
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
	}

	level.rooms.forEach(room => {
		level.carveDoors(room);
		if (room.center.is(level.start) || room.center.is(level.end)) { return; }
		
		for (let i=0; i<2; i++) {
			let xy = new XY(
				ROT.RNG.getUniformInt(room.lt.x, room.rb.x),
				ROT.RNG.getUniformInt(room.lt.y, room.rb.y)
			);
			if (level.getEntity(xy) != cells.ROOM) { continue; } // wrong place

			let feature = ROT.RNG.getWeightedValue(features);
			switch (feature) {
				case "item": level.setItem(xy, factory.getItem(level.danger)); break;
				case "potion": level.setItem(xy, factory.getPotion()); break;
				case "lutefisk": level.setItem(xy, new items.Lutefisk()); break;
				case "gold": level.setItem(xy, new items.Gold()); break;
				case "enemy": factory.getBeing(level.danger).moveTo(xy, level); break;
				case "hero": new beings.Hero().moveTo(xy, level); break;
			}
		}
	});
}

function decorateRegular(level) {
	let r1 = room.furthestRoom(level.rooms, level.rooms[0]);
	let r2 = room.furthestRoom(level.rooms, r1);

	level.start = r1.center;
	level.end = r2.center;

	/* staircase up, all non-last levels */
	let up = new cells.Staircase(true, staircaseCallback(level.danger+1, true));
	level.setCell(level.end, up);

	/* staircase down, when available */
	let d = level.danger-1;
	if (d in levels) {
		let down = new cells.Staircase(false, staircaseCallback(level.danger-1, false));
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

export default function decorate(level) {
	levels[level.danger] = level;

	if (level.danger == rules.LAST_LEVEL) {
		decorateLast(level);
	} else {
		decorateRegular(level);
	}
}
