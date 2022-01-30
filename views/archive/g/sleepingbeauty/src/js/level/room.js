import XY from "util/xy.js";

const DIST = 10;

function roomSize() {
	let w = 2*ROT.RNG.getUniformInt(2, 5)
	let h = w + 2*ROT.RNG.getUniformInt(-1, 1)
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

export function centerRoom(halfSize) {
	return {
		neighbors: [],
		center: new XY(0, 0),
		lt: halfSize.scale(-1),
		rb: halfSize.scale(1)
	}
}

export function roomNearTo(xy) {
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

export function enlarge(room, diff) {
	let clone = cloneRoom(room);
	clone.lt.x -= diff;
	clone.lt.y -= diff;
	clone.rb.x += diff;
	clone.rb.y += diff;
	return clone;
}

export function furthestRoom(rooms, start) {
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


