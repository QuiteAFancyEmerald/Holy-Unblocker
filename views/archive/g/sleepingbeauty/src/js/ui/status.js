import pc from "being/pc.js";
import * as pubsub from "util/pubsub.js";
import { COLORS } from "combat/types.js";

let node;

export function init(n) {
	node = n;
	node.classList.remove("hidden");
	pubsub.subscribe("status-change", update);
}

export function update() {
	let str = "";
	let level = pc.getLevel();
	if (level) {str = `Tower floor ${level.danger}. `; }
	str = `${str}You have:`;
	node.innerHTML = str;

	let ul = document.createElement("ul");
	node.appendChild(ul);

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
