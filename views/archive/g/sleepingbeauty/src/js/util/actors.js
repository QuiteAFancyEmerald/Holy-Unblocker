let queue = [];

export function add(actor) {
	queue.push(actor);
}

export function clear() {
	queue = [];
}

export function remove(actor) {
	let index = queue.indexOf(actor);
	if (index > -1) { queue.splice(index, 1); }
}

export function loop() {
	if (!queue.length) { return; } // endgame
	let actor = queue.shift();
	queue.push(actor);
	actor.act().then(loop);
}
