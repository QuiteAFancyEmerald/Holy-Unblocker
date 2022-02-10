import Board from "./board.js";
import XY from "util/xy.js";

import * as ui from "ui/combat.js";
import * as keyboard from "util/keyboard.js";
import * as map from "ui/map/map.js";
import * as log from "ui/log.js";

import pc from "being/pc.js";
import { ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2 } from "./types.js";

const AMOUNTS = ["slightly", "moderately", "severely", "critically"].reverse();

let tutorial = false;

let board = new Board().randomize();
let resolve = null;
let enemy = null;
let cursor = new XY(0, 0);

function end() {
	map.activate();
	map.zoomOut();
	ui.deactivate();
	keyboard.pop();
	resolve();
}

function doDamage(attacker, defender, options = {}) {
//	console.log("combat", options);
	if (options.isMagic) { // check mana
		if (attacker.mana < options.power) {
			log.add("%The %{verb,do} not have enough mana to attack.", attacker, attacker);
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
		log.add(`%The ${verb} and ${amount} %{verb,damage} %it.`, attacker, attacker, defender);
	} else {
		log.add(`%The ${verb} and %{verb,kill} %it!`, attacker, attacker, defender);
	}

	defender.adjustStat("hp", -damage);
	if (defender.hp <= 0) { end(); }
}

function activate(xy) {
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
	if (keyboard.isEnter(e)) { return activate(cursor); }

	let dir = keyboard.getDirection(e);
	if (!dir) { return; }

	dir = dir.scale(1, -1);
	cursor = cursor.plus(dir).mod(board.getSize());
	drawFull();
}

function drawFast() {
	ui.draw(board, cursor);
}

function drawFull() {
	let highlight = board.findSegment(cursor);
	if (highlight && highlight.length < 2) { highlight = null; }
	ui.draw(board, cursor, highlight || []);
}

export function init(parent) {
	ui.init(parent);
	checkSegments();
	drawFull();
}

export function start(e) {
	map.deactivate();
	map.zoomIn();
	ui.activate();

	if (!tutorial) {
		tutorial = true;
		log.add("Combat in Sleeping Beauty happens by playing the {goldenrod}Game of Thorns{} on a square game board.");
		log.add("Match sequences ({#fff}direction keys{} and {#fff}Enter{}) of colored blocks to perform individual actions. This includes both your attacks as well as your enemy's.");
		log.add("Note that certain items in your inventory can modify the frequency of colors on the game board.");
		log.pause();
	}

	enemy = e;
	let promise = new Promise(r => resolve = r);
	keyboard.push({handleKeyEvent});

	return promise;
}
