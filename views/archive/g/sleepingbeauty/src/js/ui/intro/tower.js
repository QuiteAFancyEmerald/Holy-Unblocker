const START = [
	" _     _     _     _ ",
	"[_]___[_]___[_]___[_]",
	"[__#__][__#I_]__I__#]",
	"[_I_#_I__*[__]__#_*_]",
	"   [_]_#_]__I_#__]   ",
	"   [I_|/     \\|*_]   ",
	'   [#_||  ?  ||_#]   ',
	"   [_I||     ||_#]   ",
	"   [__]|     ||#_]   "];

const END = [
	" \\\\[__]#_I__][__#]// "
];

const WIDTH = 13;

const TEST = new Array(11).join("\n");

let node = document.createElement("div");
node.classList.add("tower");

function mid() {
	let content = "";
	let separatorDistance = 0;
	let vineDistance = 0;

	for (let i=0; i<WIDTH; i++) {
		let ch = "";
		let separatorChance = (separatorDistance-0.5) / 3;
		let vineChance = (vineDistance+1) / 15;

		if (ROT.RNG.getUniform() < separatorChance) {
			ch = ["I", "]", "["].random();
			separatorDistance = 0;
		} else {
			separatorDistance++;
			ch = "_";
		}

		if (ROT.RNG.getUniform() < vineChance) {
			ch = ["#", "#", "*"].random();
			vineDistance = 0;
		} else {
			vineDistance++;
		}

		content += ch;
	}

	return `   [${content}]   `;
}

function colorize(ch, index, str) {
	let color = ["#888", "#aaa", "#999"].random();
	let transparent = false;

	switch (ch) {
		case "?":
			color = "red";
			transparent = true;
		break;
		case "/":
		case "\\":
			if (str.charAt(index-1) == ch || str.charAt(index+1) == ch) { 
				color = "lime";
				transparent = true;
			}
		break;
		case "#":
			color = ["#383", "#262"].random();
		break;
		case "*":
			color = "pink";
		break;
	}

	if (ch == "_" && str.charAt(index-1) == " ") { transparent = true; }
	return `<span style="color:${color}" ${transparent ? "class='transparent'" : ""}>${ch}</span>`;
}

export function fit() {
	let avail = node.parentNode.offsetHeight;
	node.innerHTML = TEST;
	let rows = Math.floor(TEST.length*avail/node.offsetHeight) - 4;

	rows -= START.length;
	rows -= END.length;

	let all = START.slice();
	for (let i=0;i<rows;i++) {
		all.push(mid());
	}
	all = all.concat(END);

	node.innerHTML = all.join("\n").replace(/\S/g, colorize);
}

export function getNode() {
	return node;
}
