import XY from "util/xy.js";
import Level, {dangerToRadius} from "./level.js";
import decorate from "./decorator.js";
import * as room from "./room.js";
import * as rules from "rules.js";

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

		let newRoom = room.roomNearTo(center);
		if (!level.isInside(newRoom.center)) { continue; }
		if (!level.fits(room.enlarge(newRoom, 2))) { continue; }
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

export function generate(danger) {
	let level = new Level(danger);

	if (danger == rules.LAST_LEVEL) {
		let radius = dangerToRadius(danger);
		let centerRoom = room.centerRoom(new XY(radius, radius));
		level.carveRoom(centerRoom);
	} else {
		while (true) {
			let ok = generateNextRoom(level);
			if (!ok) { break; }
		}
		let r1 = room.furthestRoom(level.rooms, level.rooms[0]);
		let r2 = room.furthestRoom(level.rooms, r1);
		connectWithClosest(r1, level);
		connectWithClosest(r2, level);
	}
	
	level.trim();
	decorate(level);

	return level;
}
