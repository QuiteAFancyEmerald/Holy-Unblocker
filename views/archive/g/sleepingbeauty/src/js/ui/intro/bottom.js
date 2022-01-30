let node = document.createElement("div");
node.classList.add("bottom");
node.innerHTML = "BOTTOM";

const TEST = "xxxxxxxxxx";
const PAD = "  ";

const KNIGHT = [
	"   .-.   ",
	" __|=|__ ",
	"(_/'-'\\_)",
	"//\\___/\\\\",
	"<>/   \\<>",
	" \\|_._|/ ",
	"  <_I_>  ",
	"   |||   ",
	"  /_|_\\  "
];

const FLOWER = [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
	" .:. ",
	"-=o=-",
	" ':' ",
	" \\|/ "
];

function colorizeKnight(ch) {
	let color = "#aae";
	return `<span style="color:${color}">${ch}</span>`;
}

function colorizeFlower(ch) {
	let color = "#f00";
	if (ch == "o") { color = "#ff0"; }
	if (ch == "\\" || ch == "/" || ch == "|") { color = "lime"; }
	ch = ch.replace(/</, "&lt;").replace(/>/, "&gt;");
	return `<span style="color:${color}">${ch}</span>`;
}

export function fit() {
	let avail = node.parentNode.offsetWidth;
	node.innerHTML = TEST;
	let columns = Math.floor(TEST.length*avail/node.offsetWidth) - 2;

	let knight = KNIGHT.join("\n").replace(/\S/g, colorizeKnight).split("\n");
	let flower = FLOWER.join("\n").replace(/\S/g, colorizeFlower).split("\n");

	let result = [];
	for (let i=0;i<knight.length;i++) {
		let remain = columns;
		remain -= PAD.length; // padding
		remain -= 9; // knight
		remain -= 5; // flower

		let row = `${PAD}${knight[i]}${new Array(remain+1).join(" ")}${flower[i]}`;
		result.push(row);
	}

	let final = `<span class='grass'>${new Array(columns+1).join("^")}</span>`;
	result.push(final);

	node.innerHTML = result.join("\n");
}

export function getNode() {
	return node;
}
