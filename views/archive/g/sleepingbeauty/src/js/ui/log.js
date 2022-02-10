let node;
let current = null;

export function add() {
	let str = String.format.apply(String, arguments);
	str = str.replace(/{(.*?)}(.*?){}/g, (match, color, str) => {
		return `<span style="color:${color}">${str}</span>`;
	});
	str = str.replace(/\n/g, "<br/>");
	
	let item = document.createElement("span");
	item.innerHTML = `${str} `;
	current.appendChild(item);
}

export function pause() {
	if (current && current.childNodes.length == 0) { return; }
	current = document.createElement("p");
	node.appendChild(current);
	
	while (node.childNodes.length > 50) { node.removeChild(node.firstChild); }
}

export function init(n) {
	node = n;
	node.classList.remove("hidden");

	pause();

	setInterval(() => {
		node.scrollTop += 3;
	}, 20);
}
