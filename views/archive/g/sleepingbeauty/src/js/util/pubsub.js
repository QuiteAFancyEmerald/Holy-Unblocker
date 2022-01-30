const storage = Object.create(null);

export function publish(message, publisher, data) {
	let subscribers = storage[message] || [];
	subscribers.forEach(subscriber => {
		typeof(subscriber) == "function"
			? subscriber(message, publisher, data)
			: subscriber.handleMessage(message, publisher, data);
	});
}

export function subscribe(message, subscriber) {
	if (!(message in storage)) { storage[message] = []; }
	storage[message].push(subscriber);
}

export function unsubscribe(message, subscriber) {
	let index = (storage[message] || []).indexOf(subscriber);
	if (index > -1) { storage[message].splice(index, 1); }
}
