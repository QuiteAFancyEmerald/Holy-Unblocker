import * as pubsub from "util/pubsub.js";

export default class Inventory {
	constructor() {
		this._items = [];
	}

	getItems() {
		return this._items;
	}

	getItemByType(type) {
		return this._items.filter(i => i.getType() == type)[0];
	}

	removeItem(item) {
		let index = this._items.indexOf(item);
		if (index > -1) { this._items.splice(index, 1); }
		pubsub.publish("status-change");
		return this;
	}

	addItem(item) {
		this._items.push(item);
		pubsub.publish("status-change");
		return this;
	}
}
