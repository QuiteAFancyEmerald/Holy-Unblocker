import XY from "util/xy.js";
import {dangerToRadius} from "level/level.js";

const CELL = new XY(8, 12);

function drawCell(ctx, xy, color="#000") {
	ctx.fillStyle = color;
	ctx.fillRect(xy.x, xy.y, CELL.x-1, CELL.y-1);
}

export function draw(level) {
	let canvas = document.createElement("canvas");
	canvas.style.backgroundColor = "#000";
	document.body.appendChild(canvas);

	let ctx = canvas.getContext("2d");
	let radius = dangerToRadius(level.danger);

	let offset = new XY(1.5*radius, 1*radius).round(); // level center from canvas left-top
	ctx.canvas.width = CELL.x * 2 * offset.x;
	ctx.canvas.height = CELL.y * 2 * offset.y;

	let xy = new XY();
	for (xy.x=-offset.x; xy.x<=offset.x; xy.x++) {
		for (xy.y=-offset.y; xy.y<=offset.y; xy.y++) {
			let visual = level.getEntity(xy).getVisual();

			let pxy = xy.plus(offset).scale(CELL.x, CELL.y);
			drawCell(ctx, pxy, visual.fg);
		}
	}

	return canvas;
}
