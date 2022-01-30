import XY from "util/xy.js";
import * as pubsub from "util/pubsub.js";
import Memory from "./memory.js";

const FONT_BASE = 18;
const FONT_ZOOM = 120;
const ZOOM_TIME = 1000;

let level = null;
let options = {
	width: 1,
	height: 1,
	spacing: 1.1,
	fontSize: FONT_BASE,
	fontFamily: "metrickal, monospace"
}
let display = new ROT.Display(options);
let center = new XY(0, 0); // level coords in the middle of the map
let memory = null;

function levelToDisplay(xy) { // level XY to display XY; center = middle point
	let half = new XY(options.width, options.height).scale(0.5).floor();
	return xy.minus(center).plus(half);
}

function displayToLevel(xy) { // display XY to level XY; middle point = center
	let half = new XY(options.width, options.height).scale(0.5).floor();
	return xy.minus(half).plus(center);
}

function fit() {
	let node = display.getContainer();
	let parent = node.parentNode;
	let avail = new XY(parent.offsetWidth, parent.offsetHeight);

	let size = display.computeSize(avail.x, avail.y);
	size[0] += (size[0] % 2 ? 2 : 1);
	size[1] += (size[1] % 2 ? 2 : 1);
	options.width = size[0];
	options.height = size[1];
	display.setOptions(options);

	let current = new XY(node.offsetWidth, node.offsetHeight);
	let offset = avail.minus(current).scale(0.5);
	node.style.left = `${offset.x}px`;
	node.style.top = `${offset.y}px`;
}

function update(levelXY) {
	let visual = memory.visualAt(levelXY);
	if (!visual) { return; }
	let displayXY = levelToDisplay(levelXY);
	display.draw(displayXY.x, displayXY.y, visual.ch, visual.fg);
}

export function setCenter(newCenter) {
	center = newCenter.clone();
	display.clear();

	let displayXY = new XY();
	for (displayXY.x=0; displayXY.x<options.width; displayXY.x++) {
		for (displayXY.y=0; displayXY.y<options.height; displayXY.y++) {
			update(displayToLevel(displayXY));
		}
	}
}

export function setLevel(l) {
	level = l;
	memory = Memory.forLevel(level);
}

function zoom(size2) {
	let node = display.getContainer();
	node.style.transition = `transform ${ZOOM_TIME}ms`;

	let size1 = options.fontSize;
	let scale = size2/size1;

	node.style.transform = `scale(${scale})`;
	setTimeout(() => {
		options.fontSize = size2;
		display.setOptions(options);
		fit();
		setCenter(center);
		node.style.transition = "";
		node.style.transform = "";
	}, ZOOM_TIME);
}

function handleMessage(message, publisher, data) {
	switch (message) {
		case "visibility-change":
			setCenter(data.xy);
		break;

		case "visual-change":
			if (publisher != level) { return; }
			update(data.xy);
		break;
	}
}

export function zoomIn() {
	return zoom(FONT_ZOOM);
}

export function zoomOut() {
	return zoom(FONT_BASE);
}

export function init(parent) {
	parent.appendChild(display.getContainer());
	pubsub.subscribe("visual-change", handleMessage);
	pubsub.subscribe("visibility-change", handleMessage);

	window.addEventListener("resize", e => {
		fit();
		setCenter(center);
	});

	fit();
	activate();
}

export function activate() {
	let node = display.getContainer().parentNode;
	node.classList.remove("hidden");
	node.classList.remove("inactive");
}

export function deactivate() {
	let node = display.getContainer().parentNode;
	node.classList.add("inactive");
}
