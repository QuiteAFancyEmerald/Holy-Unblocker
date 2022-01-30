import * as log from "ui/log.js";
import * as keyboard from "util/keyboard";

let resolve = null;
let count = 0;

const SPACE = String.fromCharCode(160, 160);

function end(value) {
	keyboard.pop();
	resolve(value);
}

function handleKeyEvent(e) {
	if (keyboard.isEscape(e)) { return end(-1); }

	let number = keyboard.getNumber(e);
	if (number === null) { return; }

	if (number >= 0 && number <= count) { end(number-1); }
}

export default function choice(options) {
	count = options.length;

	options.forEach((o, index) => {
		log.add(`\n${SPACE}{#fff}${index+1}{} ${o}`);
	});
	log.add(`\n${SPACE}{#fff}0{} or {#fff}Escape{} to abort`);
	log.pause();

	keyboard.push({handleKeyEvent});
	return new Promise(r => resolve = r);
}