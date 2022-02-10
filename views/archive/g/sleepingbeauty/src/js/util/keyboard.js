import XY from "util/xy.js";
import { DIRS } from "conf.js";

const CONSUMERS = [];

const DIR_NUMPAD = [ROT.VK_NUMPAD7, ROT.VK_NUMPAD8, ROT.VK_NUMPAD9, ROT.VK_NUMPAD6, ROT.VK_NUMPAD3, ROT.VK_NUMPAD2, ROT.VK_NUMPAD1, ROT.VK_NUMPAD4];
const DIR_CODES = [ROT.VK_HOME, ROT.VK_UP, ROT.VK_PAGE_UP, ROT.VK_RIGHT, ROT.VK_PAGE_DOWN, ROT.VK_DOWN, ROT.VK_END, ROT.VK_LEFT];
const DIR_CHARS = ["y", "k", "u", "l", "n", "j", "b", "h"];

export function getDirection(e) {
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

export function hasModifier(e) {
	return (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey);
}

export function isEnter(e) {
	if (e.type != "keydown") { return null; }
	return (e.keyCode == 13);
}

export function isEscape(e) {
	if (e.type != "keydown") { return null; }
	return (e.keyCode == 27);
}

export function getNumber(e) {
	if (e.type != "keypress") { return null; }
	let num = e.charCode - "0".charCodeAt(0);
	if (num < 0 || num > 9) { return null; }
	return num;
}

export function push(consumer) {
	CONSUMERS.push(consumer);
}

export function pop() {
	CONSUMERS.pop();
}

function handler(e) {
	let consumer = CONSUMERS[CONSUMERS.length-1];
	if (!consumer) { return; }
	consumer.handleKeyEvent(e);
}

document.addEventListener("keydown", handler);
document.addEventListener("keypress", handler);