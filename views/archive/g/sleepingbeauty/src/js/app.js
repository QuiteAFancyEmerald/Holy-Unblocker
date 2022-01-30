import * as combat from "combat/combat.js";
import * as map from "ui/map/map.js";
import * as log from "ui/log.js";
import * as status from "ui/status.js";

import * as intro from "ui/intro/intro.js";
import * as actors from "util/actors.js";

import pc from "being/pc.js";
import { generate } from "level/generator.js";

// import { draw } from "ui/map/debug.js"

let seed = Date.now();
console.log("seed", seed);
ROT.RNG.setSeed(seed);

function init() {
	map.init(document.querySelector("#map"));
	combat.init(document.querySelector("#combat"));
	log.init(document.querySelector("#log"));
	status.init(document.querySelector("#status"));

	status.update();

	log.add("A truly beautiful day for a heroic action!")
	log.add("This tower is surrounded by plains and trees and there might be a princess sleeping on the last floor.");
	log.pause();
	log.add("Apparently the only way to get to her is to advance through all tower levels.");
	log.add("To move around, use {#fff}arrow keys{}, {#fff}numpad{} or {#fff}vim-keys{}.");
	log.pause();

	let level = generate(1);
	level.activate(level.start, pc);

//	let canvas = draw(level);
//	canvas.style.left = canvas.style.top = 0;

	actors.loop();
}

intro.start(document.querySelector("#intro")).then(init);
