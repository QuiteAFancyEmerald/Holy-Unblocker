// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else      
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
        "use strict";
        var O = Object(this);
        var len = parseInt(O.length, 10) || 0;
        if (len === 0) { return false; }
        var n = parseInt(arguments[1], 10) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {k = 0;}
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement) { // FIXME NaN !== NaN
                return true;
            }
            k++;
        }
        return false;
    };
}
if (!("classList" in document.documentElement) && window.Element) {
	(function () {
		var prototype = Array.prototype,
		indexOf = prototype.indexOf,
		slice = prototype.slice,
		push = prototype.push,
		splice = prototype.splice,
		join = prototype.join;

		function DOMTokenList(elm) {
			this._element = elm;
			if (elm.className == this._classCache) { return; }
			this._classCache = elm.className;
			if (!this._classCache) { return; }

			var classes = this._classCache.replace(/^\s+|\s+$/g,'').split(/\s+/);
			for (var i = 0; i < classes.length; i++) {
				push.call(this, classes[i]);
			}
		}
		window.DOMTokenList = DOMTokenList;

		function setToClassName(el, classes) {
			el.className = classes.join(" ");
		}

		DOMTokenList.prototype = {
			add: function(token) {
				if (this.contains(token)) { return; }
				push.call(this, token);
				setToClassName(this._element, slice.call(this, 0));
			},
			contains: function(token) {
				return (indexOf.call(this, token) != -1);
			},
			item: function(index) {
				return this[index] || null;
			},
			remove: function(token) {
				var i = indexOf.call(this, token);
				if (i == -1) { return; }
				splice.call(this, i, 1);
				setToClassName(this._element, slice.call(this, 0));
			},
			toString: function() {
				return join.call(this, " ");
			},
			toggle: function(token) {
				if (indexOf.call(this, token) == -1) {
					this.add(token);
					return true;
				} else {
					this.remove(token);
					return false;
				}
			}
		};

		function defineElementGetter (obj, prop, getter) {
			if (Object.defineProperty) {
				Object.defineProperty(obj, prop, {
					get: getter
				});
			} else {
				obj.__defineGetter__(prop, getter);
			}
		}

		defineElementGetter(Element.prototype, "classList", function() {
			return new DOMTokenList(this);
		});
	})();
}

;(function() {
	if (!window.SVGElement) { return; }
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	if (!("classList" in svg)) {
		var d = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "classList");
		Object.defineProperty(SVGElement.prototype, "classList", d);
	}
})();

;(function() {
	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod("add");
		createMethod("remove");
	}

	testElement.classList.toggle("c3", false);

	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};
	}

	testElement = null;
})();
if (!Object.assign) {
	Object.defineProperty(Object, "assign", {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function(target) {
			if (target === undefined || target === null) {
				throw new TypeError("Cannot convert first argument to object");
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}
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
function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
	'use strict';

	var _COLORS, _SUFFIXES, _COMBAT_OPTIONS, _LABELS;

	var XY = function () {
		XY.fromString = function fromString(str) {
			var numbers = str.split(",").map(Number);
			return new (Function.prototype.bind.apply(this, [null].concat(numbers)))();
		};

		function XY() {
			var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

			_classCallCheck(this, XY);

			this.x = x;
			this.y = y;
		}

		XY.prototype.clone = function clone() {
			return new XY(this.x, this.y);
		};

		XY.prototype.toString = function toString() {
			return this.x + "," + this.y;
		};

		XY.prototype.is = function is(xy) {
			return this.x == xy.x && this.y == xy.y;
		};

		XY.prototype.norm8 = function norm8() {
			return Math.max(Math.abs(this.x), Math.abs(this.y));
		};

		XY.prototype.norm4 = function norm4() {
			return Math.abs(this.x) + Math.abs(this.y);
		};

		XY.prototype.norm = function norm() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		};

		XY.prototype.dist8 = function dist8(xy) {
			return this.minus(xy).norm8();
		};

		XY.prototype.dist4 = function dist4(xy) {
			return this.minus(xy).norm4();
		};

		XY.prototype.dist = function dist(xy) {
			return this.minus(xy).norm();
		};

		XY.prototype.lerp = function lerp(xy, frac) {
			var diff = xy.minus(this);
			return this.plus(diff.scale(frac));
		};

		XY.prototype.scale = function scale(sx) {
			var sy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sx;

			return new XY(this.x * sx, this.y * sy);
		};

		XY.prototype.plus = function plus(xy) {
			return new XY(this.x + xy.x, this.y + xy.y);
		};

		XY.prototype.minus = function minus(xy) {
			return this.plus(xy.scale(-1));
		};

		XY.prototype.round = function round() {
			return new XY(Math.round(this.x), Math.round(this.y));
		};

		XY.prototype.floor = function floor() {
			return new XY(Math.floor(this.x), Math.floor(this.y));
		};

		XY.prototype.ceil = function ceil() {
			return new XY(Math.ceil(this.x), Math.ceil(this.y));
		};

		XY.prototype.mod = function mod(xy) {
			var x = this.x % xy.x;
			if (x < 0) {
				x += xy.x;
			}
			var y = this.y % xy.y;
			if (y < 0) {
				y += xy.y;
			}
			return new XY(x, y);
		};

		return XY;
	}();

	var SPEED = 10; // cells per second

	var Animation = function () {
		function Animation() {
			_classCallCheck(this, Animation);

			this._items = [];
			this._ts = null;
			this._resolve = null;
		}

		Animation.prototype.add = function add(item) {
			this._items.push(item);
			item.cell.animated = item.from;
		};

		Animation.prototype.start = function start(drawCallback) {
			var _this = this;

			var promise = new Promise(function (resolve) {
				return _this._resolve = resolve;
			});
			this._drawCallback = drawCallback;
			this._ts = Date.now();
			this._step();
			return promise;
		};

		Animation.prototype._step = function _step() {
			var _this2 = this;

			var time = Date.now() - this._ts;

			var i = this._items.length;
			while (i-- > 0) {
				/* down so we can splice */
				var item = this._items[i];
				var finished = this._stepItem(item, time);
				if (finished) {
					this._items.splice(i, 1);
					item.cell.animated = null;
				}
			}

			this._drawCallback();
			if (this._items.length > 0) {
				requestAnimationFrame(function () {
					return _this2._step();
				});
			} else {
				this._resolve();
			}
		};

		Animation.prototype._stepItem = function _stepItem(item, time) {
			var dist = item.from.dist8(item.to);

			var frac = time / 1000 * SPEED / dist;
			var finished = false;
			if (frac >= 1) {
				finished = true;
				frac = 1;
			}

			item.cell.animated = item.from.lerp(item.to, frac);

			return finished;
		};

		return Animation;
	}();

	var BLOCKS_NONE = 0;
	var BLOCKS_MOVEMENT = 1;
	var BLOCKS_LIGHT = 2;

	var Entity = function () {
		function Entity(visual) {
			_classCallCheck(this, Entity);

			this._visual = visual;
			this.blocks = BLOCKS_NONE;
		}

		Entity.prototype.getVisual = function getVisual() {
			return this._visual;
		};

		Entity.prototype.toString = function toString() {
			return this._visual.name;
		};

		Entity.prototype.describeThe = function describeThe() {
			return "the " + this;
		};

		Entity.prototype.describeA = function describeA() {
			var first = this._visual.name.charAt(0);
			var article = first.match(/[aeiou]/i) ? "an" : "a";
			return article + " " + this;
		};

		return Entity;
	}();

	String.format.map.the = "describeThe";
	String.format.map.a = "describeA";

	var storage = Object.create(null);

	function publish(message, publisher, data) {
		var subscribers = storage[message] || [];
		subscribers.forEach(function (subscriber) {
			typeof subscriber == "function" ? subscriber(message, publisher, data) : subscriber.handleMessage(message, publisher, data);
		});
	}

	function subscribe(message, subscriber) {
		if (!(message in storage)) {
			storage[message] = [];
		}
		storage[message].push(subscriber);
	}

	var Inventory = function () {
		function Inventory() {
			_classCallCheck(this, Inventory);

			this._items = [];
		}

		Inventory.prototype.getItems = function getItems() {
			return this._items;
		};

		Inventory.prototype.getItemByType = function getItemByType(type) {
			return this._items.filter(function (i) {
				return i.getType() == type;
			})[0];
		};

		Inventory.prototype.removeItem = function removeItem(item) {
			var index = this._items.indexOf(item);
			if (index > -1) {
				this._items.splice(index, 1);
			}
			publish("status-change");
			return this;
		};

		Inventory.prototype.addItem = function addItem(item) {
			this._items.push(item);
			publish("status-change");
			return this;
		};

		return Inventory;
	}();

	var queue = [];

	function add(actor) {
		queue.push(actor);
	}

	function clear() {
		queue = [];
	}

	function remove(actor) {
		var index = queue.indexOf(actor);
		if (index > -1) {
			queue.splice(index, 1);
		}
	}

	function loop() {
		if (!queue.length) {
			return;
		} // endgame
		var actor = queue.shift();
		queue.push(actor);
		actor.act().then(loop);
	}

	var node = void 0;
	var current = null;

	function add$1() {
		var str = String.format.apply(String, arguments);
		str = str.replace(/{(.*?)}(.*?){}/g, function (match, color, str) {
			return "<span style=\"color:" + color + "\">" + str + "</span>";
		});
		str = str.replace(/\n/g, "<br/>");

		var item = document.createElement("span");
		item.innerHTML = str + " ";
		current.appendChild(item);
	}

	function pause() {
		if (current && current.childNodes.length == 0) {
			return;
		}
		current = document.createElement("p");
		node.appendChild(current);

		while (node.childNodes.length > 50) {
			node.removeChild(node.firstChild);
		}
	}

	function init$2(n) {
		node = n;
		node.classList.remove("hidden");

		pause();

		setInterval(function () {
			node.scrollTop += 3;
		}, 20);
	}

	var Brambles = function (_Entity) {
		_inherits(Brambles, _Entity);

		function Brambles() {
			_classCallCheck(this, Brambles);

			return _possibleConstructorReturn(this, _Entity.call(this, { ch: "%", fg: "#483", name: "dense brambles" }));
		}

		Brambles.prototype.describeA = function describeA() {
			return this.toString();
		};

		return Brambles;
	}(Entity);

	var Princess = function (_Entity2) {
		_inherits(Princess, _Entity2);

		function Princess() {
			_classCallCheck(this, Princess);

			var _this4 = _possibleConstructorReturn(this, _Entity2.call(this, { ch: "P", fg: "#ff0", name: "princess" }));

			_this4.blocks = BLOCKS_MOVEMENT;
			return _this4;
		}

		return Princess;
	}(Entity);

	var Pillar = function (_Entity3) {
		_inherits(Pillar, _Entity3);

		function Pillar() {
			_classCallCheck(this, Pillar);

			var _this5 = _possibleConstructorReturn(this, _Entity3.call(this, { ch: "T", fg: "#fff", name: "pillar" }));

			_this5.blocks = BLOCKS_MOVEMENT;
			return _this5;
		}

		return Pillar;
	}(Entity);

	var Floor = function (_Entity4) {
		_inherits(Floor, _Entity4);

		function Floor() {
			_classCallCheck(this, Floor);

			return _possibleConstructorReturn(this, _Entity4.call(this, { ch: ".", fg: "#aaa", name: "stone floor" }));
		}

		return Floor;
	}(Entity);

	var Wall = function (_Entity5) {
		_inherits(Wall, _Entity5);

		function Wall() {
			_classCallCheck(this, Wall);

			var _this7 = _possibleConstructorReturn(this, _Entity5.call(this, { ch: "#", fg: "#666", name: "solid wall" }));

			_this7.blocks = BLOCKS_LIGHT;
			return _this7;
		}

		return Wall;
	}(Entity);

	var Grass = function (_Entity6) {
		_inherits(Grass, _Entity6);

		function Grass(ch) {
			_classCallCheck(this, Grass);

			return _possibleConstructorReturn(this, _Entity6.call(this, { ch: ch, fg: "#693" }));
		}

		return Grass;
	}(Entity);

	var Tree = function (_Entity7) {
		_inherits(Tree, _Entity7);

		function Tree() {
			_classCallCheck(this, Tree);

			return _possibleConstructorReturn(this, _Entity7.call(this, { ch: "T", fg: "green" }));
		}

		return Tree;
	}(Entity);

	var Door = function (_Entity8) {
		_inherits(Door, _Entity8);

		function Door(closed) {
			_classCallCheck(this, Door);

			var _this10 = _possibleConstructorReturn(this, _Entity8.call(this, { ch: "/", fg: "#963" }));

			closed ? _this10._close() : _this10._open();
			return _this10;
		}

		Door.prototype.isOpen = function isOpen() {
			return this._isOpen;
		};

		Door.prototype._close = function _close() {
			this.blocks = BLOCKS_LIGHT;
			this._visual.ch = "+";
			this._isOpen = false;
			this._visual.name = "closed door";
		};

		Door.prototype._open = function _open() {
			this.blocks = BLOCKS_NONE;
			this._visual.ch = "/";
			this._isOpen = true;
			this._visual.name = "open door";
		};

		Door.prototype.close = function close() {
			this._close();
			publish("topology-change", this);
		};

		Door.prototype.open = function open() {
			this._open();
			publish("topology-change", this);
		};

		return Door;
	}(Entity);

	var Staircase = function (_Entity9) {
		_inherits(Staircase, _Entity9);

		function Staircase(up, callback) {
			_classCallCheck(this, Staircase);

			var ch = up ? "<" : ">";
			var fg = "#aaa";
			var name = "staircase leading " + (up ? "up" : "down");

			var _this11 = _possibleConstructorReturn(this, _Entity9.call(this, { ch: ch, fg: fg, name: name }));

			_this11._callback = callback;
			return _this11;
		}

		Staircase.prototype.activate = function activate(who) {
			add$1("You enter the staircase...");
			return this._callback(who);
		};

		return Staircase;
	}(Entity);

	var ROOM = new Floor();
	var CORRIDOR = new Floor();
	var WALL = new Wall();
	var BRAMBLES = new Brambles();

	var IT = ["it", "her", "him"];

	var Being = function (_Entity10) {
		_inherits(Being, _Entity10);

		function Being(visual) {
			_classCallCheck(this, Being);

			var _this12 = _possibleConstructorReturn(this, _Entity10.call(this, visual));

			_this12.inventory = new Inventory();

			_this12.blocks = BLOCKS_MOVEMENT;
			_this12._xy = null;
			_this12._level = null;
			_this12.attack = 10;
			_this12.defense = 10;
			_this12.sex = 0;
			_this12.hp = _this12.maxhp = 20;
			_this12.mana = _this12.maxmana = 50;
			return _this12;
		}

		Being.prototype.getXY = function getXY() {
			return this._xy;
		};

		Being.prototype.getLevel = function getLevel() {
			return this._level;
		};

		Being.prototype.getAttack = function getAttack() {
			var modifier = this.inventory.getItems().reduce(function (acc, item) {
				return acc + (item.modifies == "attack" ? item.modifier : 0);
			}, 0);
			return this.attack + modifier;
		};

		Being.prototype.getDefense = function getDefense() {
			var modifier = this.inventory.getItems().reduce(function (acc, item) {
				return acc + (item.modifies == "defense" ? item.modifier : 0);
			}, 0);
			return this.defense + modifier;
		};

		Being.prototype.adjustStat = function adjustStat(stat, diff) {
			this[stat] += diff;
			this[stat] = Math.max(this[stat], 0);
			this[stat] = Math.min(this[stat], this["max" + stat]);
			if (stat == "hp" && this[stat] == 0) {
				this.die();
			}
		};

		Being.prototype.die = function die() {
			var level = this._level;
			var xy = this._xy;

			this.moveTo(null);
			remove(this);

			var items = this.inventory.getItems();
			if (items.length > 0 && level.getEntity(xy) instanceof Floor) {
				var item = items.random();
				this.inventory.removeItem(item);
				level.setItem(xy, item);
			}
		};

		Being.prototype.act = function act() {
			return Promise.resolve();
		};

		Being.prototype.moveBy = function moveBy(dxy) {
			return this.moveTo(this._xy.plus(dxy));
		};

		Being.prototype.moveTo = function moveTo(xy, level) {
			this._xy && this._level.setBeing(this._xy, null); // remove from old position

			this._level = level || this._level;
			this._xy = xy;

			this._xy && this._level.setBeing(this._xy, this); // draw at new position

			return this;
		};

		Being.prototype.describeIt = function describeIt() {
			return IT[this.sex];
		};

		Being.prototype.describeVerb = function describeVerb(verb) {
			return "" + verb + (verb.charAt(verb.length - 1) == "s" || verb == "do" ? "es" : "s");
		};

		return Being;
	}(Entity);

	String.format.map.verb = "describeVerb";
	String.format.map.it = "describeIt";

	var AI_RANGE = 7;
	var AI_IDLE = 0.4;
	var PC_SIGHT = 8;
	var LAST_LEVEL = 8;

	var POTION_HP = 10;
	var POTION_MANA = 10;

	var COMBAT_MODIFIER = 0.4;
	var HOSTILE_CHANCE = 0.7;

	var BRAMBLE_CHANCE = 0.5;
	var LEVEL_HP = 4;

	var REGEN_HP = 0.05;
	var REGEN_MANA = 0.1;

	var ATTACK_1 = "a1";
	var ATTACK_2 = "a2";
	var MAGIC_1 = "m1";
	var MAGIC_2 = "m2";

	var COLORS = (_COLORS = {}, _COLORS[ATTACK_1] = "#0f0", _COLORS[ATTACK_2] = "#f00", _COLORS[MAGIC_1] = "#00f", _COLORS[MAGIC_2] = "#ff3", _COLORS);

	var SUFFIXES = (_SUFFIXES = {}, _SUFFIXES[ATTACK_1] = "power", _SUFFIXES[ATTACK_2] = "treachery", _SUFFIXES[MAGIC_1] = "magical domination", _SUFFIXES[MAGIC_2] = "magical weakness", _SUFFIXES);

	var Item = function (_Entity11) {
		_inherits(Item, _Entity11);

		function Item(type, visual) {
			_classCallCheck(this, Item);

			var _this13 = _possibleConstructorReturn(this, _Entity11.call(this, visual));

			_this13._type = type;
			return _this13;
		}

		Item.prototype.getType = function getType() {
			return this._type;
		};

		Item.prototype.pick = function pick(who) {
			who.getLevel().setItem(who.getXY(), null);
			add$1("You pick up %the.", this);
		};

		return Item;
	}(Entity);

	var Drinkable = function (_Item) {
		_inherits(Drinkable, _Item);

		function Drinkable(strength, visual) {
			_classCallCheck(this, Drinkable);

			var _this14 = _possibleConstructorReturn(this, _Item.call(this, "potion", visual));

			_this14._strength = strength;

			if (ROT.RNG.getUniform() > 0.5) {
				var diff = Math.round(strength / 2);
				if (ROT.RNG.getUniform() > 0.5) {
					diff *= -1;
				}
				_this14._strength += diff;
				_this14._visual.name = (diff > 0 ? "strong" : "weak") + " " + _this14._visual.name;
			}
			return _this14;
		}

		Drinkable.prototype.pick = function pick(who) {
			who.getLevel().setItem(who.getXY(), null);
			add$1("You drink %the.", this);
		};

		return Drinkable;
	}(Item);

	var Wearable = function (_Item2) {
		_inherits(Wearable, _Item2);

		function Wearable(type, visual, modifier, prefixes) {
			_classCallCheck(this, Wearable);

			var _this15 = _possibleConstructorReturn(this, _Item2.call(this, type, visual));

			_this15.modifies = type == "weapon" ? "attack" : "defense";
			_this15.modifier = modifier;

			_this15.combat = null;

			var avail = Object.keys(prefixes);
			if (avail.length > 0 && ROT.RNG.getUniform() > 0.5) {
				var prefix = avail.random();
				_this15._visual.name = prefix + " " + _this15._visual.name;
				_this15.modifier += prefixes[prefix];
			}

			if (ROT.RNG.getUniform() < COMBAT_MODIFIER) {
				var combat = [ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2].random();
				_this15.combat = combat;
				_this15._visual.name = _this15._visual.name + " of " + SUFFIXES[combat];
				var color1 = ROT.Color.fromString(COLORS[combat]);
				var color2 = ROT.Color.fromString(_this15._visual.fg);
				var color3 = ROT.Color.interpolate(color1, color2, 0.5);
				_this15._visual.fg = ROT.Color.toRGB(color3);
			}
			return _this15;
		}

		Wearable.prototype.pick = function pick(who) {
			_Item2.prototype.pick.call(this, who);

			var other = who.inventory.getItemByType(this._type);
			if (other) {
				who.inventory.removeItem(other);
				who.getLevel().setItem(who.getXY(), other);
				add$1("You drop %the.", other);
			}

			who.inventory.addItem(this);
		};

		return Wearable;
	}(Item);

	var WEAPON_PREFIXES = {
		"sharp": +1,
		"blunt": -1,
		"epic": 2
	};

	var SHIELD_PREFIXES = {
		"small": -1,
		"large": 1,
		"tower": 2
	};

	var ARMOR_PREFIXES = {
		"leather": 1,
		"iron": 2,
		"tempered": 3
	};

	var Dagger = function (_Wearable) {
		_inherits(Dagger, _Wearable);

		function Dagger() {
			_classCallCheck(this, Dagger);

			return _possibleConstructorReturn(this, _Wearable.call(this, "weapon", { ch: "(", fg: "#ccd", name: "dagger" }, 1, WEAPON_PREFIXES));
		}

		return Dagger;
	}(Wearable);

	Dagger.danger = 1;

	var Sword = function (_Wearable2) {
		_inherits(Sword, _Wearable2);

		function Sword() {
			_classCallCheck(this, Sword);

			return _possibleConstructorReturn(this, _Wearable2.call(this, "weapon", { ch: "(", fg: "#dde", name: "sword" }, 2, WEAPON_PREFIXES));
		}

		return Sword;
	}(Wearable);

	Sword.danger = 2;

	var Axe = function (_Wearable3) {
		_inherits(Axe, _Wearable3);

		function Axe() {
			_classCallCheck(this, Axe);

			return _possibleConstructorReturn(this, _Wearable3.call(this, "weapon", { ch: ")", fg: "#ccd", name: "axe" }, 3, WEAPON_PREFIXES));
		}

		return Axe;
	}(Wearable);

	Axe.danger = 3;

	var Mace = function (_Wearable4) {
		_inherits(Mace, _Wearable4);

		function Mace() {
			_classCallCheck(this, Mace);

			return _possibleConstructorReturn(this, _Wearable4.call(this, "weapon", { ch: ")", fg: "#bbc", name: "mace" }, 3, WEAPON_PREFIXES));
		}

		return Mace;
	}(Wearable);

	Mace.danger = 4;

	var GreatSword = function (_Wearable5) {
		_inherits(GreatSword, _Wearable5);

		function GreatSword() {
			_classCallCheck(this, GreatSword);

			return _possibleConstructorReturn(this, _Wearable5.call(this, "weapon", { ch: "(", fg: "#fff", name: "greatsword" }, 4, WEAPON_PREFIXES));
		}

		return GreatSword;
	}(Wearable);

	GreatSword.danger = 5;

	var Shield = function (_Wearable6) {
		_inherits(Shield, _Wearable6);

		function Shield() {
			_classCallCheck(this, Shield);

			return _possibleConstructorReturn(this, _Wearable6.call(this, "shield", { ch: "[", fg: "#841", name: "shield" }, 2, SHIELD_PREFIXES));
		}

		return Shield;
	}(Wearable);

	Shield.danger = 2;

	var Helmet = function (_Wearable7) {
		_inherits(Helmet, _Wearable7);

		function Helmet() {
			_classCallCheck(this, Helmet);

			return _possibleConstructorReturn(this, _Wearable7.call(this, "helmet", { ch: "]", fg: "#631", name: "helmet" }, 1, ARMOR_PREFIXES));
		}

		return Helmet;
	}(Wearable);

	Helmet.danger = 2;

	var Armor = function (_Wearable8) {
		_inherits(Armor, _Wearable8);

		function Armor() {
			_classCallCheck(this, Armor);

			return _possibleConstructorReturn(this, _Wearable8.call(this, "armor", { ch: "]", fg: "#a62", name: "armor" }, 2, ARMOR_PREFIXES));
		}

		return Armor;
	}(Wearable);

	Armor.danger = 3;

	var HealthPotion = function (_Drinkable) {
		_inherits(HealthPotion, _Drinkable);

		function HealthPotion() {
			_classCallCheck(this, HealthPotion);

			return _possibleConstructorReturn(this, _Drinkable.call(this, POTION_HP, { ch: "!", fg: "#e00", name: "health potion" }));
		}

		HealthPotion.prototype.pick = function pick(who) {
			_Drinkable.prototype.pick.call(this, who);
			if (who.maxhp == who.hp) {
				add$1("Nothing happens.");
			} else if (who.maxhp - who.hp <= this._strength) {
				add$1("You are completely healed.");
			} else {
				add$1("Some of your health is restored.");
			}
			who.adjustStat("hp", this._strength);
		};

		return HealthPotion;
	}(Drinkable);

	var Lutefisk = function (_Drinkable2) {
		_inherits(Lutefisk, _Drinkable2);

		function Lutefisk() {
			_classCallCheck(this, Lutefisk);

			var _this25 = _possibleConstructorReturn(this, _Drinkable2.call(this, 0, { ch: "?", fg: "#ff0", name: "lutefisk" }));

			_this25._visual.name = "lutefisk"; // no modifiers, sry
			return _this25;
		}

		Lutefisk.prototype.pick = function pick(who) {
			who.getLevel().setItem(who.getXY(), null);
			add$1("You eat %the. You feel weird.", this);
			who.adjustStat("hp", who.maxhp);
			who.adjustStat("mana", -who.maxmana);
		};

		return Lutefisk;
	}(Drinkable);

	var ManaPotion = function (_Drinkable3) {
		_inherits(ManaPotion, _Drinkable3);

		function ManaPotion() {
			_classCallCheck(this, ManaPotion);

			return _possibleConstructorReturn(this, _Drinkable3.call(this, POTION_MANA, { ch: "!", fg: "#00e", name: "mana potion" }));
		}

		ManaPotion.prototype.pick = function pick(who) {
			_Drinkable3.prototype.pick.call(this, who);
			if (who.maxmana == who.mana) {
				add$1("Nothing happens.");
			} else if (who.maxmana - who.mana <= this._strength) {
				add$1("Your mana is completely refilled.");
			} else {
				add$1("Some of your mana is refilled.");
			}
			who.adjustStat("mana", this._strength);
		};

		return ManaPotion;
	}(Drinkable);

	var Gold = function (_Item3) {
		_inherits(Gold, _Item3);

		function Gold() {
			_classCallCheck(this, Gold);

			var _this27 = _possibleConstructorReturn(this, _Item3.call(this, "gold", { ch: "$", fg: "#fc0", name: "golden coin" }));

			_this27.amount = 1;
			return _this27;
		}

		Gold.prototype.pick = function pick(who) {
			_Item3.prototype.pick.call(this, who);

			var other = who.inventory.getItemByType(this._type);
			if (other) {
				other.amount++;
			} else {
				who.inventory.addItem(this);
			}

			publish("status-change");
		};

		return Gold;
	}(Item);

	var items = Object.freeze({
		Dagger: Dagger,
		Sword: Sword,
		Axe: Axe,
		Mace: Mace,
		GreatSword: GreatSword,
		Shield: Shield,
		Helmet: Helmet,
		Armor: Armor,
		HealthPotion: HealthPotion,
		Lutefisk: Lutefisk,
		ManaPotion: ManaPotion,
		Gold: Gold
	});

	var RATIO = 1.6;

	var DIRS = [new XY(-1, -1), new XY(0, -1), new XY(1, -1), new XY(1, 0), new XY(1, 1), new XY(0, 1), new XY(-1, 1), new XY(-1, 0)];

	function wander(who) {
		var result = Promise.resolve();

		if (ROT.RNG.getUniform() < AI_IDLE) {
			return result;
		}

		var level = who.getLevel();
		var xy = who.getXY();

		var dirs = DIRS.filter(function (dxy) {
			var entity = level.getEntity(xy.plus(dxy));
			return entity.blocks < BLOCKS_MOVEMENT;
		});

		if (!dirs.length) {
			return result;
		}

		var dir = dirs.random();
		who.moveTo(xy.plus(dir));
		return result;
	}

	function getCloserToPC(who) {
		var best = 1 / 0;
		var avail = [];

		DIRS.forEach(function (dxy) {
			var xy = who.getXY().plus(dxy);
			var entity = who.getLevel().getEntity(xy);
			if (entity.blocks >= BLOCKS_MOVEMENT) {
				return;
			}

			var dist = xy.dist8(pc.getXY());
			if (dist < best) {
				best = dist;
				avail = [];
			}

			if (dist == best) {
				avail.push(xy);
			}
		});

		if (avail.length) {
			who.moveTo(avail.random());
		}

		return Promise.resolve();
	}

	function actHostile(who) {
		var dist = who.getXY().dist8(pc.getXY());
		if (dist == 1) {
			add$1("{#f00}You are attacked by %a!{}", who);
			return start(who);
		}

		if (!who.ai.mobile) {
			return Promise.resolve();
		}

		if (dist <= AI_RANGE) {
			return getCloserToPC(who);
		} else {
			return wander(who);
		}
	}

	function actNonHostile(who) {
		if (!who.ai.mobile) {
			return Promise.resolve();
		}
		return wander(who);
	}

	function _act(who) {
		if (who.ai.hostile) {
			return actHostile(who);
		} else {
			return actNonHostile(who);
		}
	}

	var HERO_RACES = ["dwarven", "halfling", "orcish", "human", "elvish", "noble"];
	var HERO_TYPES = ["knight", "adventurer", "hero", "explorer"];
	var HERO_CHATS = ["Hi there, fellow adventurer!", "I wonder how many tower floors are there...", "Some monsters in this tower give a pretty hard fight!", "Look out for potions, they might save your butt.", "So, you are also looking for that sleeping princess?", "A sharp sword is better than a blunt one.", "I used to be an adventurer like you. But then I got hurt on a thorn..."];

	var Autonomous = function (_Being) {
		_inherits(Autonomous, _Being);

		function Autonomous(visual) {
			_classCallCheck(this, Autonomous);

			var _this28 = _possibleConstructorReturn(this, _Being.call(this, visual));

			_this28.ai = {
				hostile: ROT.RNG.getUniform() < HOSTILE_CHANCE,
				mobile: true
			};
			_this28.inventory.addItem(new Gold());
			return _this28;
		}

		Autonomous.prototype.act = function act() {
			return _act(this);
		};

		Autonomous.prototype.getChat = function getChat() {
			return null;
		};

		return Autonomous;
	}(Being);

	var Rat = function (_Autonomous) {
		_inherits(Rat, _Autonomous);

		function Rat() {
			_classCallCheck(this, Rat);

			var _this29 = _possibleConstructorReturn(this, _Autonomous.call(this, { ch: "r", fg: "#aaa", name: "rat" }));

			_this29.mana = _this29.maxmana = 0;
			_this29.hp = _this29.maxhp = 1;
			return _this29;
		}

		return Rat;
	}(Autonomous);

	Rat.danger = 1;

	var Bat = function (_Autonomous2) {
		_inherits(Bat, _Autonomous2);

		function Bat() {
			_classCallCheck(this, Bat);

			var _this30 = _possibleConstructorReturn(this, _Autonomous2.call(this, { ch: "b", fg: "#a83", name: "bat" }));

			_this30.mana = _this30.maxmana = 0;
			_this30.hp = _this30.maxhp = 10;
			return _this30;
		}

		return Bat;
	}(Autonomous);

	Bat.danger = 1;

	var Goblin = function (_Autonomous3) {
		_inherits(Goblin, _Autonomous3);

		function Goblin() {
			_classCallCheck(this, Goblin);

			var _this31 = _possibleConstructorReturn(this, _Autonomous3.call(this, { ch: "g", fg: "#33a", name: "goblin" }));

			_this31.hp = _this31.maxhp = 10;
			_this31.mana = _this31.maxmana = 5;
			return _this31;
		}

		return Goblin;
	}(Autonomous);

	Goblin.danger = 2;

	var Orc = function (_Autonomous4) {
		_inherits(Orc, _Autonomous4);

		function Orc() {
			_classCallCheck(this, Orc);

			var _this32 = _possibleConstructorReturn(this, _Autonomous4.call(this, { ch: "o", fg: "#3a3", name: "orc" }));

			_this32.hp = _this32.maxhp = 15;
			_this32.mana = _this32.maxmana = 10;
			if (ROT.RNG.getUniform() > 0.5) {
				_this32.inventory.addItem(new Dagger());
			}
			return _this32;
		}

		return Orc;
	}(Autonomous);

	Orc.danger = 3;

	var OrcWitch = function (_Autonomous5) {
		_inherits(OrcWitch, _Autonomous5);

		function OrcWitch() {
			_classCallCheck(this, OrcWitch);

			var _this33 = _possibleConstructorReturn(this, _Autonomous5.call(this, { ch: "O", fg: "#33a", name: "orcish witch" }));

			_this33.hp = _this33.maxhp = 15;
			_this33.sex = 1;
			if (ROT.RNG.getUniform() > 0.5) {
				_this33.inventory.addItem(new Helmet());
			}
			return _this33;
		}

		return OrcWitch;
	}(Autonomous);

	OrcWitch.danger = 4;

	var Skeleton = function (_Autonomous6) {
		_inherits(Skeleton, _Autonomous6);

		function Skeleton() {
			_classCallCheck(this, Skeleton);

			var _this34 = _possibleConstructorReturn(this, _Autonomous6.call(this, { ch: "s", fg: "#eee", name: "skeleton" }));

			_this34.hp = _this34.maxhp = 25;
			_this34.attack = 15;
			if (ROT.RNG.getUniform() > 0.5) {
				_this34.inventory.addItem(new Dagger());
			} else {
				_this34.inventory.addItem(new Sword());
			}
			return _this34;
		}

		return Skeleton;
	}(Autonomous);

	Skeleton.danger = 5;

	var Ogre = function (_Autonomous7) {
		_inherits(Ogre, _Autonomous7);

		function Ogre() {
			_classCallCheck(this, Ogre);

			var _this35 = _possibleConstructorReturn(this, _Autonomous7.call(this, { ch: "O", fg: "#3a3", name: "ogre" }));

			_this35.hp = _this35.maxhp = 30;
			_this35.attack = 15;
			if (ROT.RNG.getUniform() > 0.5) {
				_this35.inventory.addItem(new Mace());
			}
			if (ROT.RNG.getUniform() > 0.5) {
				_this35.inventory.addItem(new Shield());
			}
			return _this35;
		}

		return Ogre;
	}(Autonomous);

	Ogre.danger = 6;

	var Zombie = function (_Autonomous8) {
		_inherits(Zombie, _Autonomous8);

		function Zombie() {
			_classCallCheck(this, Zombie);

			return _possibleConstructorReturn(this, _Autonomous8.call(this, { ch: "z", fg: "#d3d", name: "zombie" }));
		}

		return Zombie;
	}(Autonomous);

	Zombie.danger = 6;

	var Spider = function (_Autonomous9) {
		_inherits(Spider, _Autonomous9);

		function Spider() {
			_classCallCheck(this, Spider);

			var _this37 = _possibleConstructorReturn(this, _Autonomous9.call(this, { ch: "s", fg: "#c66", name: "spider" }));

			_this37.hp = _this37.maxhp = 10;
			_this37.mana = _this37.maxmana = 0;
			_this37.attack = 15;
			return _this37;
		}

		return Spider;
	}(Autonomous);

	Spider.danger = 3;

	var Snake = function (_Autonomous10) {
		_inherits(Snake, _Autonomous10);

		function Snake() {
			_classCallCheck(this, Snake);

			var _this38 = _possibleConstructorReturn(this, _Autonomous10.call(this, { ch: "s", fg: "#6c6", name: "poisonous snake" }));

			_this38.hp = _this38.maxhp = 10;
			_this38.mana = _this38.maxmana = 0;
			_this38.attack = 15;
			return _this38;
		}

		return Snake;
	}(Autonomous);

	Snake.danger = 4;

	var Minotaur = function (_Autonomous11) {
		_inherits(Minotaur, _Autonomous11);

		function Minotaur() {
			_classCallCheck(this, Minotaur);

			var _this39 = _possibleConstructorReturn(this, _Autonomous11.call(this, { ch: "M", fg: "#ca7", name: "minotaur warrior" }));

			_this39.hp = _this39.maxhp = 30;
			_this39.mana = _this39.maxmana = 30;
			_this39.attack = 15;
			if (ROT.RNG.getUniform() > 0.5) {
				_this39.inventory.addItem(new Mace());
			}
			if (ROT.RNG.getUniform() > 0.5) {
				_this39.inventory.addItem(new Shield());
			}
			if (ROT.RNG.getUniform() > 0.5) {
				_this39.inventory.addItem(new Armor());
			}
			return _this39;
		}

		return Minotaur;
	}(Autonomous);

	Minotaur.danger = 8;

	var Tree$1 = function (_Autonomous12) {
		_inherits(Tree$1, _Autonomous12);

		function Tree$1() {
			_classCallCheck(this, Tree$1);

			var _this40 = _possibleConstructorReturn(this, _Autonomous12.call(this, { ch: "T", fg: "#3c3", name: "animated tree" }));

			_this40.hp = _this40.maxhp = 30;
			_this40.mana = _this40.maxmana = 30;
			_this40.defense = 15;
			_this40.ai.mobile = false;
			return _this40;
		}

		return Tree$1;
	}(Autonomous);

	Tree$1.danger = 8;

	var Hero = function (_Autonomous13) {
		_inherits(Hero, _Autonomous13);

		function Hero() {
			_classCallCheck(this, Hero);

			var race = HERO_RACES.random();
			var type = HERO_TYPES.random();
			var visual = {
				ch: type.charAt(0),
				fg: ROT.Color.toRGB([ROT.RNG.getUniformInt(100, 255), ROT.RNG.getUniformInt(100, 255), ROT.RNG.getUniformInt(100, 255)]),
				name: race + " " + type
			};

			var _this41 = _possibleConstructorReturn(this, _Autonomous13.call(this, visual));

			_this41.sex = 2;
			_this41.ai.hostile = false;
			return _this41;
		}

		Hero.prototype.getChat = function getChat() {
			if (this._level.danger == LAST_LEVEL) {
				return ["You can do whatever you want here, but beware - no kissing!", "We only have one rule here: no kissing!", "Make sure you don't wake her up!", "Sssh! She is sleeping, don't you see?", "I see, another lucky adventurer!"].random();
			} else {
				return HERO_CHATS.random();
			}
		};

		return Hero;
	}(Autonomous);

	var beings = Object.freeze({
		Rat: Rat,
		Bat: Bat,
		Goblin: Goblin,
		Orc: Orc,
		OrcWitch: OrcWitch,
		Skeleton: Skeleton,
		Ogre: Ogre,
		Zombie: Zombie,
		Spider: Spider,
		Snake: Snake,
		Minotaur: Minotaur,
		Tree: Tree$1,
		Hero: Hero
	});

	var CONSUMERS = [];

	var DIR_NUMPAD = [ROT.VK_NUMPAD7, ROT.VK_NUMPAD8, ROT.VK_NUMPAD9, ROT.VK_NUMPAD6, ROT.VK_NUMPAD3, ROT.VK_NUMPAD2, ROT.VK_NUMPAD1, ROT.VK_NUMPAD4];
	var DIR_CODES = [ROT.VK_HOME, ROT.VK_UP, ROT.VK_PAGE_UP, ROT.VK_RIGHT, ROT.VK_PAGE_DOWN, ROT.VK_DOWN, ROT.VK_END, ROT.VK_LEFT];
	var DIR_CHARS = ["y", "k", "u", "l", "n", "j", "b", "h"];

	function getDirection(e) {
		if (e.type == "keypress") {
			var ch = String.fromCharCode(e.charCode).toLowerCase();
			var index = DIR_CHARS.indexOf(ch);
			if (index in DIRS) {
				return DIRS[index];
			}
		}
		if (e.type == "keydown") {
			var _index = DIR_CODES.indexOf(e.keyCode);
			if (_index in DIRS) {
				return DIRS[_index];
			}

			_index = DIR_NUMPAD.indexOf(e.keyCode);
			if (_index in DIRS) {
				return DIRS[_index];
			}
		}
		return null;
	}

	function hasModifier(e) {
		return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey;
	}

	function isEnter(e) {
		if (e.type != "keydown") {
			return null;
		}
		return e.keyCode == 13;
	}

	function isEscape(e) {
		if (e.type != "keydown") {
			return null;
		}
		return e.keyCode == 27;
	}

	function getNumber(e) {
		if (e.type != "keypress") {
			return null;
		}
		var num = e.charCode - "0".charCodeAt(0);
		if (num < 0 || num > 9) {
			return null;
		}
		return num;
	}

	function push(consumer) {
		CONSUMERS.push(consumer);
	}

	function pop() {
		CONSUMERS.pop();
	}

	function handler(e) {
		var consumer = CONSUMERS[CONSUMERS.length - 1];
		if (!consumer) {
			return;
		}
		consumer.handleKeyEvent(e);
	}

	document.addEventListener("keydown", handler);
	document.addEventListener("keypress", handler);

	var resolve$1 = null;
	var count = 0;

	var SPACE = String.fromCharCode(160, 160);

	function end$1(value) {
		pop();
		resolve$1(value);
	}

	function handleKeyEvent$1(e) {
		if (isEscape(e)) {
			return end$1(-1);
		}

		var number = getNumber(e);
		if (number === null) {
			return;
		}

		if (number >= 0 && number <= count) {
			end$1(number - 1);
		}
	}

	function choice(options) {
		count = options.length;

		options.forEach(function (o, index) {
			add$1("\n" + SPACE + "{#fff}" + (index + 1) + "{} " + o);
		});
		add$1("\n" + SPACE + "{#fff}0{} or {#fff}Escape{} to abort");
		pause();

		push({ handleKeyEvent: handleKeyEvent$1 });
		return new Promise(function (r) {
			return resolve$1 = r;
		});
	}

	var COMBAT_OPTIONS = (_COMBAT_OPTIONS = {}, _COMBAT_OPTIONS[ATTACK_1] = 2, _COMBAT_OPTIONS[ATTACK_2] = 2, _COMBAT_OPTIONS[MAGIC_1] = 2, _COMBAT_OPTIONS[MAGIC_2] = 2, _COMBAT_OPTIONS);

	var TUTORIAL = {
		staircase: false,
		item: false,
		door: false,
		enemy: false
	};

	var PC = function (_Being2) {
		_inherits(PC, _Being2);

		function PC() {
			_classCallCheck(this, PC);

			var _this42 = _possibleConstructorReturn(this, _Being2.call(this, { ch: "@", fg: "#fff", name: "you" }));

			_this42._resolve = null; // end turn
			_this42._maxDanger = 1;
			_this42.fov = {};

			subscribe("topology-change", _this42);
			return _this42;
		}

		PC.prototype.describeThe = function describeThe() {
			return this.toString();
		};

		PC.prototype.describeA = function describeA() {
			return this.toString();
		};

		PC.prototype.describeIt = function describeIt() {
			return this.toString();
		};

		PC.prototype.describeVerb = function describeVerb(verb) {
			return verb;
		};

		PC.prototype.getCombatOption = function getCombatOption() {
			var options = Object.assign({}, COMBAT_OPTIONS);
			this.inventory.getItems().forEach(function (item) {
				if (item.combat) {
					options[item.combat] += 1;
				}
			});
			return ROT.RNG.getWeightedValue(options);
		};

		PC.prototype.act = function act() {
			var _this43 = this;

			pause();
			var promise = new Promise(function (resolve) {
				return _this43._resolve = resolve;
			});

			if (ROT.RNG.getUniform() < REGEN_HP) {
				this.adjustStat("hp", 1);
			}
			if (ROT.RNG.getUniform() < REGEN_MANA) {
				this.adjustStat("mana", 1);
			}

			promise = promise.then(function () {
				return pop();
			});
			push(this);

			return promise;
		};

		PC.prototype.handleKeyEvent = function handleKeyEvent(e) {
			if (isEnter(e)) {
				return this._activate(this._xy);
			}

			var dir = getDirection(e);
			if (!dir) {
				return;
			}

			var modifier = hasModifier(e);
			var xy = this._xy.plus(dir);
			if (modifier) {
				this._interact(xy);
			} else {
				this._move(xy);
			}
		};

		PC.prototype.handleMessage = function handleMessage(message, publisher, data) {
			switch (message) {
				case "topology-change":
					this._updateFOV();
					break;
			}
		};

		PC.prototype.adjustStat = function adjustStat(stat, diff) {
			_Being2.prototype.adjustStat.call(this, stat, diff);
			publish("status-change");
		};

		PC.prototype.die = function die() {
			_Being2.prototype.die.call(this);
			clear();
			pause();
			add$1("Game over! Reload the page to try again...");
		};

		PC.prototype.moveTo = function moveTo(xy, level) {
			_Being2.prototype.moveTo.call(this, xy, level);
			if (!this._xy) {
				return;
			}

			this._updateFOV();

			if (level && level.danger > this._maxDanger) {
				this._maxDanger = level.danger;
				add$1("You feel healthier.");
				this.maxhp += LEVEL_HP;
				this.adjustStat("hp", LEVEL_HP);
			}

			// getEntity not possible, because *we* are standing here :)

			var cell = this._level.getCell(this._xy);
			if (cell == BRAMBLES && ROT.RNG.getUniform() < BRAMBLE_CHANCE) {
				add$1("You make your way through %s. Ouch! You injure yourself on a thorn.", cell);
				this.adjustStat("hp", -1);
			}

			var item = this._level.getItem(this._xy);
			if (item) {
				add$1("%A is lying here.", item);
				if (!TUTORIAL.item) {
					add$1("To pick it up, press {#fff}Enter{}.");
					TUTORIAL.item = true;
				}
				return;
			}

			if (cell instanceof Door) {
				add$1("You pass through %a.", cell);
			} else if (cell instanceof Staircase) {
				add$1("%A is here.", cell);
				if (!TUTORIAL.staircase) {
					TUTORIAL.staircase = true;
					add$1("To use the staircase, press {#fff}Enter{}.");
				}
			}
		};

		PC.prototype._activate = function _activate(xy) {
			var _this44 = this;

			// pick or enter
			var item = this._level.getItem(xy);
			if (item) {
				item.pick(this);
				this._resolve();
				return;
			}

			var cell = this._level.getCell(xy);
			if (cell.activate) {
				cell.activate(this).then(function () {
					return _this44._resolve();
				});
			} else {
				add$1("There is nothing you can do here.");
			}
		};

		PC.prototype._interact = function _interact(xy) {
			var entity = this._level.getEntity(xy);
			if (entity instanceof Door) {
				if (entity.isOpen()) {
					add$1("You close the door.");
					entity.close();
				} else {
					add$1("You open the door.");
					entity.open();
				}
				return this._resolve(); // successful door interaction
			}

			add$1("You see %a.", entity);

			if (entity instanceof Being) {
				this._interactWithBeing(entity);
			}
		};

		PC.prototype._chat = function _chat(being) {
			var text = being.getChat();
			if (text) {
				add$1("%The says, \"" + text + "\"", being);
			} else {
				add$1("%The does not say anything.", being);
			}
		};

		PC.prototype._attack = function _attack(being) {
			var _this45 = this;

			add$1("You attack %the.", being);
			start(being).then(function () {
				return _this45._resolve();
			});
		};

		PC.prototype._kiss = function _kiss(being) {
			add$1("%The does not seem to be amused!", being);
			this._resolve(); // successful kiss interaction
		};

		PC.prototype._interactWithBeing = function _interactWithBeing(being) {
			var _this46 = this;

			var callbacks = [];
			var options = [];

			callbacks.push(function () {
				return _this46._kiss(being);
			});
			options.push("Kiss %it gently to wake %it up".format(being, being));

			callbacks.push(function () {
				return _this46._chat(being);
			});
			options.push("Talk to %it".format(being));

			if (being instanceof Hero) {} else {
				callbacks.push(function () {
					return _this46._attack(being);
				});
				options.push("Attack %it".format(being));
			}

			choice(options).then(function (index) {
				if (index == -1) {
					add$1("You decide to do nothing.");
					return;
				}
				callbacks[index]();
			});
		};

		PC.prototype._move = function _move(xy) {
			var entity = this._level.getEntity(xy);

			if (entity.blocks >= BLOCKS_MOVEMENT) {
				add$1("You bump into %a.", entity);
				if (entity instanceof Door && !TUTORIAL.door) {
					TUTORIAL.door = true;
					add$1("To interact with stuff, press both a {#fff}modifier key{} (Ctrl, Alt, Shift or Command) and a {#fff}direction key{} (used for movement).");
				}
				if (entity instanceof Being && !TUTORIAL.enemy) {
					add$1("If you wish to interact with beings (attack them, for example), press both a {#fff}modifier key{} (Ctrl, Alt, Shift or Command) and a {#fff}direction key{} (used for movement).");
					TUTORIAL.enemy = true;
				}
				return;
			}

			this.moveTo(xy);
			this._resolve(); // successful movement
		};

		PC.prototype._updateFOV = function _updateFOV() {
			var level = this._level;
			var fov = new ROT.FOV.PreciseShadowcasting(function (x, y) {
				return level.getEntity(new XY(x, y)).blocks < BLOCKS_LIGHT;
			});

			var newFOV = {};
			var cb = function cb(x, y, r, amount) {
				var xy = new XY(x, y);
				newFOV[xy] = xy;
			};
			fov.compute(this._xy.x, this._xy.y, PC_SIGHT, cb);
			this.fov = newFOV;

			publish("visibility-change", this, { xy: this._xy });
		};

		return PC;
	}(Being);

	var pc = new PC();

	var W = 6;
	var H = W;

	var Board = function () {
		function Board() {
			_classCallCheck(this, Board);

			this._data = [];

			for (var i = 0; i < W; i++) {
				var col = [];
				this._data.push(col);
				for (var j = 0; j < H; j++) {
					col.push(null);
				}
			}
		}

		Board.prototype.randomize = function randomize() {
			this._data.forEach(function (col) {
				col.forEach(function (cell, i) {
					col[i] = { value: pc.getCombatOption() };
				});
			});
			return this;
		};

		Board.prototype.getSize = function getSize() {
			return new XY(W, H);
		};

		Board.prototype.at = function at(xy) {
			return this._data[xy.x][xy.y];
		};

		Board.prototype.set = function set(xy, value) {
			this._data[xy.x][xy.y] = value;
		};

		Board.prototype._clone = function _clone() {
			var clone = new this.constructor();
			clone._data = JSON.parse(JSON.stringify(this._data));
			return clone;
		};

		Board.prototype.fall = function fall() {
			var _this47 = this;

			var animation = new Animation();

			this._data.forEach(function (col, index) {
				_this47._fallColumn(index, animation);
			});

			return animation;
		};

		Board.prototype._fallColumn = function _fallColumn(x, animation) {
			var totalFall = 0;
			var col = this._data[x];

			col.forEach(function (cell, y) {
				if (cell) {
					if (totalFall == 0) {
						return;
					}
					var targetY = y - totalFall;

					col[targetY] = cell;
					col[y] = null;

					animation.add({
						cell: cell,
						from: new XY(x, y),
						to: new XY(x, targetY)
					});
				} else {
					totalFall++;
				}
			});

			/* new cells */
			for (var i = 0; i < totalFall; i++) {
				var cell = { value: pc.getCombatOption() };
				var sourceY = col.length + i;
				var targetY = sourceY - totalFall;
				col[targetY] = cell;

				animation.add({
					cell: cell,
					from: new XY(x, sourceY),
					to: new XY(x, targetY)
				});
			}
		};

		Board.prototype.findSegment = function findSegment(xy) {
			function is(sxy) {
				return sxy.is(xy);
			}
			return this.getAllSegments().filter(function (segment) {
				return segment.some(is);
			})[0];
		};

		Board.prototype.getAllSegments = function getAllSegments() {
			var clone = this._clone();
			var segments = [];
			var xy = new XY();
			for (xy.x = 0; xy.x < W; xy.x++) {
				for (xy.y = 0; xy.y < H; xy.y++) {
					var cell = clone.at(xy);
					if (!cell) {
						continue;
					}
					var segment = clone.extractSegment(xy);
					segments.push(segment);
				}
			}

			return segments.sort(function (a, b) {
				return b.length - a.length;
			});
		};

		/* mutates! */


		Board.prototype.extractSegment = function extractSegment(xy) {
			var _this48 = this;

			var segment = [];
			var value = this.at(xy).value;

			var tryIt = function tryIt(xy) {
				if (xy.x < 0 || xy.y < 0 || xy.x >= W || xy.y >= H) {
					return;
				}
				var cell = _this48.at(xy);
				if (!cell || cell.value != value) {
					return;
				}

				_this48.set(xy, null);
				segment.push(xy.clone());
				tryIt(xy.plus(new XY(1, 0)));
				tryIt(xy.plus(new XY(-1, 0)));
				tryIt(xy.plus(new XY(0, -1)));
				tryIt(xy.plus(new XY(0, 1)));
			};

			tryIt(xy);
			return segment;
		};

		return Board;
	}();

	var CELL = 30;
	var CTX = document.createElement("canvas").getContext("2d");
	var LEGEND = document.createElement("ul");

	var LABELS = (_LABELS = {}, _LABELS[ATTACK_1] = "You attack", _LABELS[ATTACK_2] = "Enemy attacks", _LABELS[MAGIC_1] = "You attack (magic)", _LABELS[MAGIC_2] = "Enemy attacks (magic)", _LABELS);

	function buildLegend() {
		[ATTACK_1, ATTACK_2, MAGIC_1, MAGIC_2].forEach(function (id) {
			var li = document.createElement("li");
			LEGEND.appendChild(li);
			li.setAttribute("data-id", id);
			var hash = document.createElement("span");
			hash.style.color = COLORS[id];
			hash.innerHTML = "# ";
			li.appendChild(hash);
			li.appendChild(document.createTextNode(LABELS[id]));
		});
	}

	function updateLegend(id) {
		Array.from(LEGEND.querySelectorAll("[data-id]")).forEach(function (item) {
			item.classList.toggle("inactive", item.getAttribute("data-id") != id);
		});
	}

	function drawCell(xy, color, highlight) {
		var x = (xy.x + 0.5) * CELL;
		var y = CTX.canvas.height - (xy.y + 0.5) * CELL;

		var alpha = 0.8;
		var bold = false;
		if (highlight.some(function (hxy) {
			return hxy.is(xy);
		})) {
			alpha = 1;
			bold = true;
		}

		CTX.font = "" + (bold ? "bold " : "") + CELL * 0.8 + "px metrickal, monospace";
		CTX.globalAlpha = alpha;

		CTX.fillStyle = color;
		CTX.fillText("#", x, y);
	}

	function drawCursor(xy) {
		CTX.strokeStyle = "#999";
		CTX.lineWidth = 2;

		var X = xy.x * CELL;
		var Y = CTX.canvas.height - (xy.y + 1) * CELL;
		CTX.strokeRect(X + 2, Y + 2, CELL - 4, CELL - 4);
	}

	function draw(board, cursor) {
		var highlight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

		var size = board.getSize();
		CTX.canvas.width = size.x * CELL;
		CTX.canvas.height = size.y * CELL;
		CTX.textAlign = "center";
		CTX.textBaseline = "middle";

		var xy = new XY();
		for (xy.x = 0; xy.x < size.x; xy.x++) {
			for (xy.y = 0; xy.y < size.y; xy.y++) {
				var cell = board.at(xy);
				if (!cell) {
					return;
				}
				var pos = cell.animated || xy;
				var color = COLORS[cell.value];
				drawCell(pos, color, highlight);
			}
		}

		drawCursor(cursor);
		updateLegend(highlight.length > 0 ? board.at(cursor).value : null);
	}

	function init$3(parent) {
		var heading = document.createElement("p");
		heading.innerHTML = "Game of Thorns";
		parent.appendChild(heading);
		parent.appendChild(CTX.canvas);
		buildLegend();
		parent.appendChild(LEGEND);
	}

	function activate$1() {
		var node = CTX.canvas.parentNode;
		node.classList.remove("hidden");
		node.classList.remove("inactive");
	}

	function deactivate() {
		var node = CTX.canvas.parentNode;
		node.classList.add("inactive");
	}

	var GRASS_1 = new Grass("\"");
	var GRASS_2 = new Grass("'");
	var TREE = new Tree();

	var NOISE = new ROT.Noise.Simplex();

	var memories = {};

	function darken(color) {
		if (!color) {
			return color;
		}
		return ROT.Color.toRGB(ROT.Color.fromString(color).map(function (x) {
			return x >> 1;
		}));
	}

	var Memory = function () {
		Memory.forLevel = function forLevel(level) {
			if (!(level.id in memories)) {
				memories[level.id] = new this(level);
			}
			return memories[level.id];
		};

		function Memory(level) {
			_classCallCheck(this, Memory);

			this._level = level;
			this._memoized = {};
		}

		Memory.prototype.visualAt = function visualAt(xy) {
			if (this._level.isOutside(xy)) {
				var entity = void 0;
				var noise = NOISE.get(xy.x / 20, xy.y / 20);
				if (noise < 0) {
					entity = GRASS_1;
				} else if (noise < 0.8) {
					entity = GRASS_2;
				} else {
					entity = TREE;
				}
				return entity.getVisual();
			}

			var fov = pc.fov;
			if (xy in fov) {
				this._memoize(xy, this._level.getCell(xy).getVisual()); // memoize cell only
				return this._level.getEntity(xy).getVisual();
			} else if (xy in this._memoized) {
				return this._memoized[xy];
			} else {
				return null;
			}
		};

		Memory.prototype._memoize = function _memoize(xy, visual) {
			this._memoized[xy] = {
				ch: visual.ch,
				fg: darken(visual.fg)
			};
		};

		return Memory;
	}();

	var FONT_BASE = 18;
	var FONT_ZOOM = 120;
	var ZOOM_TIME = 1000;

	var level = null;
	var options = {
		width: 1,
		height: 1,
		spacing: 1.1,
		fontSize: FONT_BASE,
		fontFamily: "metrickal, monospace"
	};
	var display = new ROT.Display(options);
	var center = new XY(0, 0); // level coords in the middle of the map
	var memory = null;

	function levelToDisplay(xy) {
		// level XY to display XY; center = middle point
		var half = new XY(options.width, options.height).scale(0.5).floor();
		return xy.minus(center).plus(half);
	}

	function displayToLevel(xy) {
		// display XY to level XY; middle point = center
		var half = new XY(options.width, options.height).scale(0.5).floor();
		return xy.minus(half).plus(center);
	}

	function fit() {
		var node = display.getContainer();
		var parent = node.parentNode;
		var avail = new XY(parent.offsetWidth, parent.offsetHeight);

		var size = display.computeSize(avail.x, avail.y);
		size[0] += size[0] % 2 ? 2 : 1;
		size[1] += size[1] % 2 ? 2 : 1;
		options.width = size[0];
		options.height = size[1];
		display.setOptions(options);

		var current = new XY(node.offsetWidth, node.offsetHeight);
		var offset = avail.minus(current).scale(0.5);
		node.style.left = offset.x + "px";
		node.style.top = offset.y + "px";
	}

	function update(levelXY) {
		var visual = memory.visualAt(levelXY);
		if (!visual) {
			return;
		}
		var displayXY = levelToDisplay(levelXY);
		display.draw(displayXY.x, displayXY.y, visual.ch, visual.fg);
	}

	function setCenter(newCenter) {
		center = newCenter.clone();
		display.clear();

		var displayXY = new XY();
		for (displayXY.x = 0; displayXY.x < options.width; displayXY.x++) {
			for (displayXY.y = 0; displayXY.y < options.height; displayXY.y++) {
				update(displayToLevel(displayXY));
			}
		}
	}

	function setLevel(l) {
		level = l;
		memory = Memory.forLevel(level);
	}

	function zoom(size2) {
		var node = display.getContainer();
		node.style.transition = "transform " + ZOOM_TIME + "ms";

		var size1 = options.fontSize;
		var scale = size2 / size1;

		node.style.transform = "scale(" + scale + ")";
		setTimeout(function () {
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
				if (publisher != level) {
					return;
				}
				update(data.xy);
				break;
		}
	}

	function zoomIn() {
		return zoom(FONT_ZOOM);
	}

	function zoomOut() {
		return zoom(FONT_BASE);
	}

	function init$4(parent) {
		parent.appendChild(display.getContainer());
		subscribe("visual-change", handleMessage);
		subscribe("visibility-change", handleMessage);

		window.addEventListener("resize", function (e) {
			fit();
			setCenter(center);
		});

		fit();
		activate$2();
	}

	function activate$2() {
		var node = display.getContainer().parentNode;
		node.classList.remove("hidden");
		node.classList.remove("inactive");
	}

	function deactivate$1() {
		var node = display.getContainer().parentNode;
		node.classList.add("inactive");
	}

	var AMOUNTS = ["slightly", "moderately", "severely", "critically"].reverse();

	var tutorial = false;

	var board = new Board().randomize();
	var resolve = null;
	var enemy = null;
	var cursor = new XY(0, 0);

	function end() {
		activate$2();
		zoomOut();
		deactivate();
		pop();
		resolve();
	}

	function doDamage(attacker, defender) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		//	console.log("combat", options);
		if (options.isMagic) {
			// check mana
			if (attacker.mana < options.power) {
				add$1("%The %{verb,do} not have enough mana to attack.", attacker, attacker);
				return;
			}
			attacker.adjustStat("mana", -options.power);
		}

		var attack = attacker.getAttack();
		var defense = defender.getDefense();
		var damage = attack + options.power - defense;
		//	console.log("attack %s, defense %s, damage %s", attack, defense, damage);
		damage = Math.max(1, damage);

		var verb = (options.isMagic ? "%{verb,cast} a spell at %the" : "%{verb,hit} %the").format(attacker, defender);
		var newHP = Math.max(0, defender.hp - damage);
		if (newHP > 0) {
			var frac = newHP / defender.maxhp; // >0, < maxhp
			var amount = AMOUNTS[Math.floor(frac * AMOUNTS.length)];
			add$1("%The " + verb + " and " + amount + " %{verb,damage} %it.", attacker, attacker, defender);
		} else {
			add$1("%The " + verb + " and %{verb,kill} %it!", attacker, attacker, defender);
		}

		defender.adjustStat("hp", -damage);
		if (defender.hp <= 0) {
			end();
		}
	}

	function activate$$1(xy) {
		var segment = board.findSegment(xy);
		if (!segment || segment.length < 2) {
			return;
		}

		var value = board.at(xy).value;

		segment.forEach(function (xy) {
			board.set(xy, null);
		});

		var animation = board.fall();
		animation.start(drawFast).then(function () {
			checkSegments();
			drawFull();
		});

		var power = segment.length;
		var isMagic = value == MAGIC_1 || value == MAGIC_2;
		var attacker = pc;
		var defender = enemy;
		if (value == ATTACK_2 || value == MAGIC_2) {
			attacker = enemy;
			defender = pc;
		}

		doDamage(attacker, defender, { power: power, isMagic: isMagic });
	}

	function checkSegments() {
		while (1) {
			var segments = board.getAllSegments();
			if (segments[0].length >= 2) {
				return;
			}
			board.randomize();
		}
	}

	function handleKeyEvent(e) {
		if (isEnter(e)) {
			return activate$$1(cursor);
		}

		var dir = getDirection(e);
		if (!dir) {
			return;
		}

		dir = dir.scale(1, -1);
		cursor = cursor.plus(dir).mod(board.getSize());
		drawFull();
	}

	function drawFast() {
		draw(board, cursor);
	}

	function drawFull() {
		var highlight = board.findSegment(cursor);
		if (highlight && highlight.length < 2) {
			highlight = null;
		}
		draw(board, cursor, highlight || []);
	}

	function init$1(parent) {
		init$3(parent);
		checkSegments();
		drawFull();
	}

	function start(e) {
		deactivate$1();
		zoomIn();
		activate$1();

		if (!tutorial) {
			tutorial = true;
			add$1("Combat in Sleeping Beauty happens by playing the {goldenrod}Game of Thorns{} on a square game board.");
			add$1("Match sequences ({#fff}direction keys{} and {#fff}Enter{}) of colored blocks to perform individual actions. This includes both your attacks as well as your enemy's.");
			add$1("Note that certain items in your inventory can modify the frequency of colors on the game board.");
			pause();
		}

		enemy = e;
		var promise = new Promise(function (r) {
			return resolve = r;
		});
		push({ handleKeyEvent: handleKeyEvent });

		return promise;
	}

	var node$1 = void 0;

	function init$5(n) {
		node$1 = n;
		node$1.classList.remove("hidden");
		subscribe("status-change", update$1);
	}

	function update$1() {
		var str = "";
		var level = pc.getLevel();
		if (level) {
			str = "Tower floor " + level.danger + ". ";
		}
		str = str + "You have:";
		node$1.innerHTML = str;

		var ul = document.createElement("ul");
		node$1.appendChild(ul);

		ul.appendChild(buildStatus());
		ul.appendChild(buildItems());
	}

	function buildStatus() {
		var node = document.createElement("li");

		var hp = buildPercentage(pc.hp, pc.maxhp);
		var mana = buildPercentage(pc.mana, pc.maxmana);
		var str = hp + " health, " + mana + " mana";

		var gold = pc.inventory.getItemByType("gold");
		var coins = gold ? gold.amount : 0;
		if (coins > 0) {
			var color = gold.getVisual().fg;
			var suffix = coins > 1 ? "s" : "";
			str = str + ", <span style=\"color:" + color + "\">" + coins + "</span> " + gold.toString() + suffix;
		}

		node.innerHTML = str;
		return node;
	}

	function buildPercentage(value, limit) {
		var frac = value / limit;
		var color = ROT.Color.interpolateHSL([255, 0, 0], [0, 255, 0], frac);
		color = ROT.Color.toRGB(color);
		return "<span style=\"color:" + color + "\">" + value + "</span>/" + limit;
	}

	function buildItems() {
		var frag = document.createDocumentFragment();
		var items = pc.inventory.getItems().filter(function (i) {
			return i.getType() != "gold";
		});
		items.forEach(function (item) {
			var node = document.createElement("li");
			var str = item.toString();
			if (item.modifier) {
				str = str + " (" + (item.modifier > 0 ? "+" : "") + item.modifier + ")";
			}
			if (item.combat) {
				str = str + " (+<strong style=\"color:" + COLORS[item.combat] + "\">#</strong>)";
			}
			node.innerHTML = str;
			frag.appendChild(node);
		});
		return frag;
	}

	var START = [" _     _     _     _ ", "[_]___[_]___[_]___[_]", "[__#__][__#I_]__I__#]", "[_I_#_I__*[__]__#_*_]", "   [_]_#_]__I_#__]   ", "   [I_|/     \\|*_]   ", '   [#_||  ?  ||_#]   ', "   [_I||     ||_#]   ", "   [__]|     ||#_]   "];

	var END = [" \\\\[__]#_I__][__#]// "];

	var WIDTH = 13;

	var TEST = new Array(11).join("\n");

	var node$3 = document.createElement("div");
	node$3.classList.add("tower");

	function mid() {
		var content = "";
		var separatorDistance = 0;
		var vineDistance = 0;

		for (var i = 0; i < WIDTH; i++) {
			var ch = "";
			var separatorChance = (separatorDistance - 0.5) / 3;
			var vineChance = (vineDistance + 1) / 15;

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

		return "   [" + content + "]   ";
	}

	function colorize(ch, index, str) {
		var color = ["#888", "#aaa", "#999"].random();
		var transparent = false;

		switch (ch) {
			case "?":
				color = "red";
				transparent = true;
				break;
			case "/":
			case "\\":
				if (str.charAt(index - 1) == ch || str.charAt(index + 1) == ch) {
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

		if (ch == "_" && str.charAt(index - 1) == " ") {
			transparent = true;
		}
		return "<span style=\"color:" + color + "\" " + (transparent ? "class='transparent'" : "") + ">" + ch + "</span>";
	}

	function fit$1() {
		var avail = node$3.parentNode.offsetHeight;
		node$3.innerHTML = TEST;
		var rows = Math.floor(TEST.length * avail / node$3.offsetHeight) - 4;

		rows -= START.length;
		rows -= END.length;

		var all = START.slice();
		for (var i = 0; i < rows; i++) {
			all.push(mid());
		}
		all = all.concat(END);

		node$3.innerHTML = all.join("\n").replace(/\S/g, colorize);
	}

	function getNode() {
		return node$3;
	}

	var node$4 = document.createElement("div");
	node$4.classList.add("title");
	node$4.innerHTML = ".oPYo. 8                       o             \n" + "8      8                                     \n" + "`Yooo. 8 .oPYo. .oPYo. .oPYo. o8 odYo. .oPYo.\n" + "    `8 8 8oooo8 8oooo8 8    8  8 8' `8 8    8\n" + "     8 8 8.     8.     8    8  8 8   8 8    8\n" + "`YooP' 8 `Yooo' `Yooo' 8YooP'  8 8   8 `YooP8\n" + "                       8                    8\n" + "                       8                 ooP'\n" + " .oPYo.                        o             \n" + " 8   `8                        8             \n" + "o8YooP' .oPYo. .oPYo. o    o  o8P o    o     \n" + " 8   `b 8oooo8 .oooo8 8    8   8  8    8     \n" + " 8    8 8.     8    8 8    8   8  8    8     \n" + " 8oooP' `Yooo' `YooP8 `YooP'   8  `YooP8     \n" + "                                       8     \n" + "                                    ooP'     ";

	function getNode$1() {
		return node$4;
	}

	var node$5 = document.createElement("div");
	node$5.classList.add("bottom");
	node$5.innerHTML = "BOTTOM";

	var TEST$1 = "xxxxxxxxxx";
	var PAD = "  ";

	var KNIGHT = ["   .-.   ", " __|=|__ ", "(_/'-'\\_)", "//\\___/\\\\", "<>/   \\<>", " \\|_._|/ ", "  <_I_>  ", "   |||   ", "  /_|_\\  "];

	var FLOWER = ["     ", "     ", "     ", "     ", "     ", " .:. ", "-=o=-", " ':' ", " \\|/ "];

	function colorizeKnight(ch) {
		var color = "#aae";
		return "<span style=\"color:" + color + "\">" + ch + "</span>";
	}

	function colorizeFlower(ch) {
		var color = "#f00";
		if (ch == "o") {
			color = "#ff0";
		}
		if (ch == "\\" || ch == "/" || ch == "|") {
			color = "lime";
		}
		ch = ch.replace(/</, "&lt;").replace(/>/, "&gt;");
		return "<span style=\"color:" + color + "\">" + ch + "</span>";
	}

	function fit$2() {
		var avail = node$5.parentNode.offsetWidth;
		node$5.innerHTML = TEST$1;
		var columns = Math.floor(TEST$1.length * avail / node$5.offsetWidth) - 2;

		var knight = KNIGHT.join("\n").replace(/\S/g, colorizeKnight).split("\n");
		var flower = FLOWER.join("\n").replace(/\S/g, colorizeFlower).split("\n");

		var result = [];
		for (var i = 0; i < knight.length; i++) {
			var remain = columns;
			remain -= PAD.length; // padding
			remain -= 9; // knight
			remain -= 5; // flower

			var row = "" + PAD + knight[i] + new Array(remain + 1).join(" ") + flower[i];
			result.push(row);
		}

		var final = "<span class='grass'>" + new Array(columns + 1).join("^") + "</span>";
		result.push(final);

		node$5.innerHTML = result.join("\n");
	}

	function getNode$2() {
		return node$5;
	}

	var node$6 = document.createElement("div");
	node$6.classList.add("text");
	node$6.innerHTML = "Into a profound slumber she sank, surrounded only by dense brambles, thorns and roses.\nMany adventurers tried to find and rescue her, but none came back...\n<br/><br/><span>Hit [Enter] to start the game</span>";

	function getNode$3() {
		return node$6;
	}

	var FACTS = ["This game was created in one week", "This game was written using rot.js, the JavaScript Roguelike Toolkit", "The tower is procedurally generated. Try resizing this page!", "You can reload this page to get another Fun Fact", "The original Sleeping Beauty fairy tale was written by Charles Perrault", "This game is best played with a maximized browser window", "This game can be won!", "This game can be lost!", "This game features permadeath and procedural generation", "This game uses the awesome 'Metrickal' font face", "This game runs even in Microsoft Internet Explorer 11", "Eating a lutefisk might be dangerous"];

	var node$7 = document.createElement("div");
	node$7.classList.add("funfact");
	node$7.innerHTML = "Fun Fact: " + FACTS.random();

	function getNode$4() {
		return node$7;
	}

	var resolve$2 = null;
	var node$2 = null;

	function handleKeyEvent$2(e) {
		if (!isEnter(e)) {
			return;
		}

		pop();
		window.removeEventListener("resize", onResize);
		node$2.parentNode.removeChild(node$2);

		resolve$2();
	}

	function onResize(e) {
		fit$1();
		fit$2();
	}

	function start$1(n) {
		node$2 = n;
		node$2.appendChild(getNode$1());
		node$2.appendChild(getNode$2());
		node$2.appendChild(getNode$3());
		node$2.appendChild(getNode());
		node$2.appendChild(getNode$4());

		fit$1();
		fit$2();

		push({ handleKeyEvent: handleKeyEvent$2 });

		window.addEventListener("resize", onResize);
		window.addEventListener("load", onResize);

		return new Promise(function (r) {
			return resolve$2 = r;
		});
	}

	var D1_RADIUS = 15;
	var D2_RADIUS = 30;
	var LAST1_RADIUS = 20;
	var LAST_RADIUS = 10;

	function dangerToRadius(danger) {
		if (danger == 1) {
			return D1_RADIUS;
		}
		if (danger == LAST_LEVEL) {
			return LAST_RADIUS;
		}

		var diff = LAST1_RADIUS - D2_RADIUS;
		var regularCount = LAST_LEVEL - 2;
		if (regularCount == 1) {
			return D2_RADIUS;
		}

		return D2_RADIUS + Math.round((danger - 2) / (regularCount - 1) * diff);
	}

	var Level = function () {
		function Level(danger) {
			_classCallCheck(this, Level);

			this.danger = this.id = danger;
			this.rooms = [];
			this.start = this.end = null;
			this._beings = {};
			this._items = {};
			this._cells = {};
		}

		Level.prototype.activate = function activate(xy, who) {
			var _this49 = this;

			// async, because outro
			clear();

			who.moveTo(null); // remove from old
			setLevel(this);
			who.moveTo(xy, this); // put to new

			var beings = Object.keys(this._beings).map(function (key) {
				return _this49._beings[key];
			}).filter(function (b) {
				return b;
			}); /* filter because of empty values */
			beings.forEach(function (being) {
				return add(being);
			});

			publish("status-change");

			if (this.danger == LAST_LEVEL) {
				return this._outro(who);
			} else {
				add$1("Welcome to tower floor " + this.danger + ".");
				return Promise.resolve();
			}
		};

		Level.prototype.isInside = function isInside(xy) {
			xy = xy.scale(1, RATIO);
			return xy.norm() < dangerToRadius(this.danger);
		};

		Level.prototype.isOutside = function isOutside(xy) {
			xy = xy.scale(1, RATIO);
			return xy.norm() > dangerToRadius(this.danger) + 2;
		};

		Level.prototype.trim = function trim() {
			var _this50 = this;

			Object.keys(this._cells).forEach(function (key) {
				var xy = XY.fromString(key);
				if (!_this50.isInside(xy)) {
					delete _this50._cells[key];
				}
			});
		};

		Level.prototype.fits = function fits(room) {
			var xy = new XY();

			for (xy.x = room.lt.x; xy.x <= room.rb.x; xy.x++) {
				for (xy.y = room.lt.y; xy.y <= room.rb.y; xy.y++) {
					var key = xy.toString();
					if (key in this._cells) {
						return false;
					}
				}
			}

			return true;
		};

		Level.prototype.getEntity = function getEntity(xy) {
			var key = xy.toString();
			return this._beings[key] || this._items[key] || this._cells[key] || WALL;
		};

		Level.prototype.setCell = function setCell(xy, cell) {
			this._cells[xy] = cell;
		};

		Level.prototype.getCell = function getCell(xy) {
			return this._cells[xy] || WALL;
		};

		Level.prototype.getItem = function getItem(xy) {
			return this._items[xy];
		};

		Level.prototype.setBeing = function setBeing(xy, being) {
			this._beings[xy] = being;
			publish("visual-change", this, { xy: xy });
		};

		Level.prototype.setItem = function setItem(xy, item) {
			this._items[xy] = item;
			publish("visual-change", this, { xy: xy });
		};

		Level.prototype.carveRoom = function carveRoom(room) {
			this.rooms.push(room);
			var xy = new XY();

			for (xy.x = room.lt.x; xy.x <= room.rb.x; xy.x++) {
				for (xy.y = room.lt.y; xy.y <= room.rb.y; xy.y++) {
					this.setCell(xy, ROOM);
				}
			}
		};

		Level.prototype.carveCorridor = function carveCorridor(xy1, xy2) {
			var diff = xy2.minus(xy1);
			var steps = diff.norm8() + 1;

			for (var i = 0; i <= steps; i++) {
				var xy = xy1.lerp(xy2, i / steps).floor();
				this.setCell(xy, CORRIDOR);
			}
		};

		Level.prototype.carveDoors = function carveDoors(room) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			options = Object.assign({ doorChance: 0.5, closedChance: 0.5 }, options);
			var xy = void 0;
			var size = room.rb.minus(room.lt);

			for (var i = -1; i <= size.x + 1; i++) {
				for (var j = -1; j <= size.y + 1; j++) {
					if (i == -1 && j == -1) continue;
					if (i == -1 && j == size.y + 1) continue;
					if (i == size.x + 1 && j == -1) continue;
					if (i == size.x + 1 && j == size.y + 1) continue;

					if (i > -1 && i <= size.x && j > -1 && j <= size.y) continue;
					xy = room.lt.plus(new XY(i, j));
					var key = xy.toString();
					if (this._cells[key] != CORRIDOR) {
						continue;
					}

					if (ROT.RNG.getUniform() > options.doorChance) {
						continue;
					}
					var closed = ROT.RNG.getUniform() < options.closedChance;
					this.setCell(xy, new Door(closed));
				}
			}
		};

		Level.prototype._outro = function _outro(who) {
			add$1("{#33f}Welcome to the last floor!{}");
			add$1("You finally managed to reach the princess and finish the game.");
			add$1("{goldenrod}Congratulations{}!");
			pause();

			var gold = who.inventory.getItemByType("gold");
			if (gold) {
				var color = gold.getVisual().fg;
				add$1("Furthermore, you were able to accumulate a total of {" + color + "}" + gold.amount + "{} golden coins.");
				pause();
			}

			add$1("The game is over now, but you are free to look around.");
			add$1("{#fff}Press Escape to continue...{}");

			deactivate$1();
			var resolve = void 0;
			var promise = new Promise(function (r) {
				return resolve = r;
			});
			var handleKeyEvent = function handleKeyEvent(e) {
				if (!isEscape(e)) {
					return;
				}
				activate$2();
				pop();
				resolve();
			};
			push({ handleKeyEvent: handleKeyEvent });
			return promise;
		};

		return Level;
	}();

	function get(classes, danger) {
		var d = ROT.RNG.getNormal(danger, 1);
		d = Math.max(1, d);

		if (d <= danger + 1) {// okay, take this one
		} else {
			// too large -- take any other lower value
			d = ROT.RNG.getUniformInt(1, danger);
		}

		classes = Object.keys(classes).map(function (key) {
			return classes[key];
		});
		var avail = classes.filter(function (c) {
			return "danger" in c;
		});

		var best = [];
		var bestDist = Infinity;
		avail.forEach(function (c) {
			var dist = Math.abs(c.danger - d);
			if (dist < bestDist) {
				bestDist = dist;
				best = [];
			}
			if (dist == bestDist) {
				best.push(c);
			}
		});
		var ctor = best.random();
		return new ctor();
	}

	function getItem(danger) {
		return get(items, danger);
	}

	function getBeing(danger) {
		return get(beings, danger);
	}

	function getPotion() {
		var avail = [HealthPotion, ManaPotion];
		var ctor = avail.random();
		return new ctor();
	}

	var DIST = 10;

	function roomSize() {
		var w = 2 * ROT.RNG.getUniformInt(2, 5);
		var h = w + 2 * ROT.RNG.getUniformInt(-1, 1);
		return new XY(w, h);
	}

	function cloneRoom(room) {
		return {
			neighbors: room.neighbors.slice(),
			lt: room.lt.clone(),
			rb: room.rb.clone(),
			center: room.center.clone()
		};
	}

	function centerRoom(halfSize) {
		return {
			neighbors: [],
			center: new XY(0, 0),
			lt: halfSize.scale(-1),
			rb: halfSize.scale(1)
		};
	}

	function roomNearTo(xy) {
		var cx = xy.x + ROT.RNG.getUniformInt(-DIST, DIST);
		var cy = xy.y + ROT.RNG.getUniformInt(-DIST, DIST);
		var center = new XY(cx, cy);

		var size = roomSize();

		return {
			neighbors: [],
			center: center,
			lt: center.minus(size.scale(0.5)),
			rb: center.plus(size.scale(0.5))
		};
	}

	function enlarge(room, diff) {
		var clone = cloneRoom(room);
		clone.lt.x -= diff;
		clone.lt.y -= diff;
		clone.rb.x += diff;
		clone.rb.y += diff;
		return clone;
	}

	function furthestRoom(rooms, start) {
		var bestDist = 0;
		var bestRoom = null;

		var visited = [];

		function visit(room, dist) {
			visited.push(room);

			if (dist > bestDist) {
				bestDist = dist;
				bestRoom = room;
			}

			room.neighbors.filter(function (r) {
				return !visited.includes(r);
			}).forEach(function (r) {
				return visit(r, dist + 1);
			});
		}

		visit(start, null, 0);
		return bestRoom;
	}

	var levels = {};

	function decorateBrambles(level) {
		var radius = dangerToRadius(level.danger);
		var dist = ROT.RNG.getUniformInt(2 * radius, 5 * radius);
		var angle = ROT.RNG.getUniform() * 2 * Math.PI;

		var center = new XY(Math.cos(angle), Math.sin(angle)).scale(dist);
		var da = radius / dist;

		angle += Math.PI;
		dist += (ROT.RNG.getUniform() - 0.5) * radius;

		for (var a = angle - da; a < angle + da; a += .01) {
			var xy = center.plus(new XY(Math.cos(a), Math.sin(a)).scale(dist)).round();
			if (!level.isInside(xy)) {
				continue;
			}
			if (level.getEntity(xy) != WALL) {
				continue;
			}
			level.setCell(xy, BRAMBLES);
		}
	}

	function staircaseCallback(danger, start) {
		return function (who) {
			if (!(danger in levels)) {
				generate(danger);
			} /* create another level */
			var level = levels[danger];
			return level.activate(start ? level.start : level.end, who);
		};
	}

	function decorateLast(level) {
		var radius = dangerToRadius(level.danger);
		level.start = level.rooms[0].center.minus(new XY(radius - 2, 0));

		var bed = level.rooms[0].center.plus(new XY(3, 0));
		level.setCell(bed, new Princess());

		level.setCell(bed.plus(new XY(-1, -1)), new Pillar());
		level.setCell(bed.plus(new XY(+1, -1)), new Pillar());
		level.setCell(bed.plus(new XY(-1, +1)), new Pillar());
		level.setCell(bed.plus(new XY(+1, +1)), new Pillar());

		var xy = new XY();
		for (xy.x = bed.x - 3; xy.x <= bed.x + 3; xy.x++) {
			for (xy.y = bed.y - 3; xy.y <= bed.y + 3; xy.y++) {
				if (xy.is(bed)) {
					continue;
				}
				if (level.getEntity(xy) != ROOM) {
					continue;
				}

				if (xy.dist8(bed) == 1) {
					// close heroes
					var _hero = new Hero();
					_hero.ai.mobile = false;
					_hero.moveTo(xy.clone(), level);
					continue;
				}

				if (ROT.RNG.getUniform() > 0.5) {
					continue;
				}
				var hero = new Hero(); // remote heroes
				hero.moveTo(xy.clone(), level);
			}
		}
	}

	function decorateFirst(level) {
		var features = ["rat", "potion", "dagger"];
		level.rooms.forEach(function (room) {
			if (room.center.is(level.start)) {
				// first room
				level.carveDoors(room, { doorChance: 1, closedChance: 1 });
				return;
			}

			if (room.center.is(level.end)) {
				level.carveDoors(room);
				return;
			}

			level.carveDoors(room);
			if (!features.length) {
				return;
			}
			var feature = features.shift();
			switch (feature) {
				case "rat":
					var rat = new Rat();
					rat.ai.hostile = false;
					rat.moveTo(room.center.clone(), level);
					break;

				case "potion":
					level.setItem(room.center.clone(), new HealthPotion());
					break;

				case "dagger":
					level.setItem(room.center.clone(), new Dagger());
					break;
			}
		});
	}

	function decorateFull(level) {
		decorateBrambles(level);

		var features = {
			item: 4,
			potion: 3,
			lutefisk: 0.1,
			gold: 2,
			enemy: 5,
			hero: 1,
			empty: 2
		};

		level.rooms.forEach(function (room) {
			level.carveDoors(room);
			if (room.center.is(level.start) || room.center.is(level.end)) {
				return;
			}

			for (var i = 0; i < 2; i++) {
				var xy = new XY(ROT.RNG.getUniformInt(room.lt.x, room.rb.x), ROT.RNG.getUniformInt(room.lt.y, room.rb.y));
				if (level.getEntity(xy) != ROOM) {
					continue;
				} // wrong place

				var feature = ROT.RNG.getWeightedValue(features);
				switch (feature) {
					case "item":
						level.setItem(xy, getItem(level.danger));break;
					case "potion":
						level.setItem(xy, getPotion());break;
					case "lutefisk":
						level.setItem(xy, new Lutefisk());break;
					case "gold":
						level.setItem(xy, new Gold());break;
					case "enemy":
						getBeing(level.danger).moveTo(xy, level);break;
					case "hero":
						new Hero().moveTo(xy, level);break;
				}
			}
		});
	}

	function decorateRegular(level) {
		var r1 = furthestRoom(level.rooms, level.rooms[0]);
		var r2 = furthestRoom(level.rooms, r1);

		level.start = r1.center;
		level.end = r2.center;

		/* staircase up, all non-last levels */
		var up = new Staircase(true, staircaseCallback(level.danger + 1, true));
		level.setCell(level.end, up);

		/* staircase down, when available */
		var d = level.danger - 1;
		if (d in levels) {
			var down = new Staircase(false, staircaseCallback(level.danger - 1, false));
			level.setCell(level.start, down);
		}

		if (level.danger == 1) {
			decorateFirst(level);
		} else {
			decorateFull(level);
		}

		/*
  	let xy = new XY();
  	for (xy.x = r1.lt.x; xy.x <= r1.rb.x; xy.x++) {
  		for (xy.y = r1.lt.y; xy.y <= r1.rb.y; xy.y++) {
  			let item = factory.getItem(2);
  			level.setItem(xy, item);
  		}
  	}
  */
	}

	function decorate(level) {
		levels[level.danger] = level;

		if (level.danger == LAST_LEVEL) {
			decorateLast(level);
		} else {
			decorateRegular(level);
		}
	}

	function connectHorizontal(level, room1, room2) {
		var min = Math.max(room1.lt.x, room2.lt.x);
		var max = Math.min(room1.rb.x, room2.rb.x);
		var x = ROT.RNG.getUniformInt(min, max);
		level.carveCorridor(new XY(x, room1.center.y), new XY(x, room2.center.y));
	}

	function connectVertical(level, room1, room2) {
		var min = Math.max(room1.lt.y, room2.lt.y);
		var max = Math.min(room1.rb.y, room2.rb.y);
		var y = ROT.RNG.getUniformInt(min, max);
		level.carveCorridor(new XY(room1.center.x, y), new XY(room2.center.x, y));
	}

	function connectL(level, room1, room2) {
		var p1 = new XY(room1.center.x, room2.center.y);
		var p2 = new XY(room2.center.x, room1.center.y);

		/* pick the one closer to the center */
		var P = p1.norm() < p2.norm() ? p1 : p2;

		level.carveCorridor(room1.center, P);
		level.carveCorridor(room2.center, P);
	}

	function connect(level, room1, room2) {
		room1.neighbors.push(room2);
		room2.neighbors.push(room1);

		var overlapHorizontal = !(room1.lt.x > room2.rb.x || room2.lt.x > room1.rb.x);
		var overlapVertical = !(room1.lt.y > room2.rb.y || room2.lt.y > room1.rb.y);

		if (overlapHorizontal) {
			connectHorizontal(level, room1, room2);
		} else if (overlapVertical) {
			connectVertical(level, room1, room2);
		} else {
			connectL(level, room1, room2);
		}
	}

	function generateNextRoom(level) {
		var center = new XY(0, 0);
		var failed = -1;

		while (failed < 1000) {
			failed++;
			var oldRoom = void 0;
			if (level.rooms.length > 0) {
				oldRoom = level.rooms.random();
				center = oldRoom.center;
			}

			var newRoom = roomNearTo(center);
			if (!level.isInside(newRoom.center)) {
				continue;
			}
			if (!level.fits(enlarge(newRoom, 2))) {
				continue;
			}
			level.carveRoom(newRoom);

			if (oldRoom) {
				connect(level, oldRoom, newRoom);
			}

			//		console.log("room #%s after %s failures", level.rooms.length, failed);
			return true;
		}

		//	console.log("failed to add after %s failures", failed);
		return false;
	}

	function connectWithClosest(room, level) {
		var COMPARE = function COMPARE(r1, r2) {
			return r1.center.minus(room.center).norm() - r2.center.minus(room.center).norm();
		};

		var avail = level.rooms.filter(function (r) {
			return !r.neighbors.includes(room) && r != room;
		});
		avail.sort(COMPARE);
		if (!avail) {
			return;
		}

		connect(level, room, avail[0]);
	}

	function generate(danger) {
		var level = new Level(danger);

		if (danger == LAST_LEVEL) {
			var radius = dangerToRadius(danger);
			var centerRoom$$1 = centerRoom(new XY(radius, radius));
			level.carveRoom(centerRoom$$1);
		} else {
			while (true) {
				var ok = generateNextRoom(level);
				if (!ok) {
					break;
				}
			}
			var r1 = furthestRoom(level.rooms, level.rooms[0]);
			var r2 = furthestRoom(level.rooms, r1);
			connectWithClosest(r1, level);
			connectWithClosest(r2, level);
		}

		level.trim();
		decorate(level);

		return level;
	}

	// import { draw } from "ui/map/debug.js"

	var seed = Date.now();
	console.log("seed", seed);
	ROT.RNG.setSeed(seed);

	function init$$1() {
		init$4(document.querySelector("#map"));
		init$1(document.querySelector("#combat"));
		init$2(document.querySelector("#log"));
		init$5(document.querySelector("#status"));

		update$1();

		add$1("A truly beautiful day for a heroic action!");
		add$1("This tower is surrounded by plains and trees and there might be a princess sleeping on the last floor.");
		pause();
		add$1("Apparently the only way to get to her is to advance through all tower levels.");
		add$1("To move around, use {#fff}arrow keys{}, {#fff}numpad{} or {#fff}vim-keys{}.");
		pause();

		var level = generate(1);
		level.activate(level.start, pc);

		//	let canvas = draw(level);
		//	canvas.style.left = canvas.style.top = 0;

		loop();
	}

	start$1(document.querySelector("#intro")).then(init$$1);
})();

