/*
	Any copyright is dedicated to the Public Domain.
	http://creativecommons.org/publicdomain/zero/1.0/
*/

(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define([ "exports" ], factory);
	} else if (typeof exports === "object") {
		factory(exports);
	} else {
		factory(root);
	}
}(this, function (exports) {
	if (exports.Promise) { return; }

	/**
	 * @class A promise - value to be resolved in the future.
	 * Implements the "Promises/A+ 1.1" specification.
	 * @param {function} [resolver]
	 */
	var Promise = function(resolver) {
		this._state = 0; /* 0 = pending, 1 = fulfilled, 2 = rejected */
		this._value = null; /* fulfillment / rejection value */
		this._timeout = null;

		this._cb = {
			fulfilled: [],
			rejected: []
		}

		this._thenPromises = []; /* promises returned by then() */

		if (resolver) { this._invokeResolver(resolver); }
	}

	Promise.resolve = function(value) {
		return new this(function(resolve, reject) {
			resolve(value);
		});
	}

	Promise.reject = function(reason) {
		return new this(function(resolve, reject) {
			reject(reason);
		});
	}

	/**
	 * Wait for all these promises to complete. One failed => this fails too.
	 */
	Promise.all = Promise.when = function(all) {
		return new this(function(resolve, reject) {
			var counter = 0;
			var results = [];

			all.forEach(function(promise, index) {
				counter++;
				promise.then(function(result) {
					results[index] = result;
					counter--;
					if (!counter) { resolve(results); }
				}, function(reason) {
					counter = 1/0;
					reject(reason);
				});
			});
		});
	}

	Promise.race = function(all) {
		return new this(function(resolve, reject) {
			all.forEach(function(promise) {
				promise.then(resolve, reject);
			});
		});
	}

	/**
	 * @param {function} onFulfilled To be called once this promise gets fulfilled
	 * @param {function} onRejected To be called once this promise gets rejected
	 * @returns {Promise}
	 */
	Promise.prototype.then = function(onFulfilled, onRejected) {
		this._cb.fulfilled.push(onFulfilled);
		this._cb.rejected.push(onRejected);

		var thenPromise = new Promise();

		this._thenPromises.push(thenPromise);

		if (this._state > 0) { this._schedule(); }

		/* 2.2.7. then must return a promise. */
		return thenPromise;
	}

	/**
	 * Fulfill this promise with a given value
	 * @param {any} value
	 */
	Promise.prototype.fulfill = function(value) {
		if (this._state != 0) { return this; }

		this._state = 1;
		this._value = value;

		if (this._thenPromises.length) { this._schedule(); }

		return this;
	}

	/**
	 * Reject this promise with a given value
	 * @param {any} value
	 */
	Promise.prototype.reject = function(value) {
		if (this._state != 0) { return this; }

		this._state = 2;
		this._value = value;

		if (this._thenPromises.length) { this._schedule(); }

		return this;
	}

	Promise.prototype.resolve = function(x) {
		/* 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason. */
		if (x == this) {
			this.reject(new TypeError("Promise resolved by its own instance"));
			return;
		}

		/* 2.3.2. If x is a promise, adopt its state */
		if (x instanceof this.constructor) {
			x.chain(this);
			return;
		}

		/* 2.3.3. Otherwise, if x is an object or function,  */
		if (x !== null && (typeof(x) == "object" || typeof(x) == "function")) {
			try {
				var then = x.then;
			} catch (e) {
				/* 2.3.3.2. If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason. */
				this.reject(e);
				return;
			}

			if (typeof(then) == "function") {
				/* 2.3.3.3. If then is a function, call it */
				var called = false;
				var resolvePromise = function(y) {
					/* 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y). */
					if (called) { return; }
					called = true;
					this.resolve(y);
				}
				var rejectPromise = function(r) {
					/* 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r. */
					if (called) { return; }
					called = true;
					this.reject(r);
				}

				try {
					then.call(x, resolvePromise.bind(this), rejectPromise.bind(this));
				} catch (e) { /* 2.3.3.3.4. If calling then throws an exception e, */
					/* 2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it. */
					if (called) { return; }
					/* 2.3.3.3.4.2. Otherwise, reject promise with e as the reason. */
					this.reject(e);
				}
			} else {
				/* 2.3.3.4 If then is not a function, fulfill promise with x. */
				this.fulfill(x);
			}
			return;
		}

		/* 2.3.4. If x is not an object or function, fulfill promise with x. */
		this.fulfill(x);
	}

	/**
	 * Pass this promise's resolved value to another promise
	 * @param {Promise} promise
	 */
	Promise.prototype.chain = function(promise) {
		var resolve = function(value) {
			promise.resolve(value);
		}
		var reject = function(value) {
			promise.reject(value);
		}
		return this.then(resolve, reject);
	}

	/**
	 * @param {function} onRejected To be called once this promise gets rejected
	 * @returns {Promise}
	 */
	Promise.prototype["catch"] = function(onRejected) {
		return this.then(null, onRejected);
	}

	Promise.prototype._schedule = function() {
		if (this._timeout) { return; } /* resolution already scheduled */
		this._timeout = setTimeout(this._processQueue.bind(this), 0);
	}

	Promise.prototype._processQueue = function() {
		this._timeout = null;

		while (this._thenPromises.length) {
			var onFulfilled = this._cb.fulfilled.shift();
			var onRejected = this._cb.rejected.shift();
			this._executeCallback(this._state == 1 ? onFulfilled : onRejected);
		}
	}

	Promise.prototype._executeCallback = function(cb) {
		var thenPromise = this._thenPromises.shift();

		if (typeof(cb) != "function") {
			if (this._state == 1) {
				/* 2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value. */
				thenPromise.fulfill(this._value);
			} else {
				/* 2.2.7.4. If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason. */
				thenPromise.reject(this._value);
			}
			return;
		}

		try {
			var x = cb(this._value);
			/* 2.2.7.1. If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x). */
			thenPromise.resolve(x);
		} catch (e) {
			/* 2.2.7.2. If either onFulfilled or onRejected throws an exception, promise2 must be rejected with the thrown exception as the reason. */
			thenPromise.reject(e);
		}
	}

	Promise.prototype._invokeResolver = function(resolver) {
		try {
			resolver(this.resolve.bind(this), this.reject.bind(this));
		} catch (e) {
			this.reject(e);
		}
	}

	exports.Promise = Promise;
}));
