import XY from "util/xy.js";
import pc from "being/pc.js";
import { DIRS } from "conf.js";
import { BLOCKS_MOVEMENT } from "entity.js";
import * as rules from "rules.js";
import * as combat from "combat/combat.js";
import * as log from "ui/log.js";

function wander(who) {
	let result = Promise.resolve();

	if (ROT.RNG.getUniform() < rules.AI_IDLE) { return result; }

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
		log.add("{#f00}You are attacked by %a!{}", who);
		return combat.start(who);
	}

	if (!who.ai.mobile) { return Promise.resolve(); }

	if (dist <= rules.AI_RANGE) {
		return getCloserToPC(who);
	} else {
		return wander(who);
	}
}

function actNonHostile(who) {
	if (!who.ai.mobile) { return Promise.resolve(); }
	return wander(who);
}

export function act(who) {
	if (who.ai.hostile) {
		return actHostile(who);
	} else {
		return actNonHostile(who);
	}
}
