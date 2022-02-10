/**
 * author: pel
 */
;~function(global) {
	'use strict';
	var Game = {};
	global['Game'] = Game;

	/*==================
	 * util functions
	 *==================*/
	/**
	 * extends base with obj
	 * @param base the target object
	 * @param obj a simple object
	 */
	function ext(base, obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				base[key] = obj[key]
			}
		}
		return base;
	}

	function defineClass(constructor, prototype, superClass) {
		var cz = function() {
			superClass && superClass.apply(this, arguments);
			constructor && constructor.apply(this, arguments);
		};
		prototype = ext(superClass ? new superClass() : {}, prototype);
		prototype.constructor = cz;
		cz.prototype = prototype;
		return cz;
	}

	function loadImage(inMap, onload) {
		var outMap = {}
		var keyArr = [];
		for (var key in inMap) {
			keyArr.push(key);
		}

		var loading = 0;

		var doLoadImage = function(keyArr) {
			if (keyArr.length == 0) {
				setTimeout(function() {
					onload(outMap);
				}, 0);
				return;
			}
			var len = Math.min(5, keyArr.length);
			var nextArr = keyArr.slice(len);
			var next = function() {
				if (--loading == 0) {
					doLoadImage(nextArr);
				}
			}
			loading += len;
			for (var i = 0; i < len; ++i) {
				key = keyArr[i];
				var url = inMap[key];
				var img = new Image();
				outMap[key] = img;
				img.onload = next;
				img.src = url;
			}
		}

		doLoadImage(keyArr);
	}

	function roundRect(context, x, y, w, h, r) {
		if (w < 2 * r) r = w * 0.5;
		if (h < 2 * r) r = h * 0.5;
		context.beginPath();
		context.moveTo(x+r, y);
		context.arcTo(x+w, y,   x+w, y+h, r);
		context.arcTo(x+w, y+h, x,   y+h, r);
		context.arcTo(x,   y+h, x,   y,   r);
		context.arcTo(x,   y,   x+w, y,   r);
		context.closePath();
	}

	function clearNode($node) {
		while ($node.hasChildNodes()) {
			$node.removeChild($node.lastChild);
		}
	}

	var customEvents = {};
	function onEvent(e, fn) {
		var fns = customEvents[e] || (customEvents[e] = []);
		if (fns.indexOf(fn) == -1) {
			fns.push(fn);
		}
	}
	function offEvent(e, fn) {
		var fns = customEvents[e];
		var index;
		if (fns && (index = fns.indexOf(fn)) != -1) {
			fns.splice(index, 1);
		}
	}
	function fireEvent(e) {
		var fns = customEvents[e];
		if (fns) {
			var args = [].slice.call(arguments, 1);
			for (var i = 0, len = fns.length; i < len; ++i) {
				fns[i].apply(Game, args);
			}
		}
	}

	/**
	 * constant
	 */
	var MARGIN_TOP = 30;
	var STAGE_WIDTH = 360, STAGE_HEIGHT = 480 + MARGIN_TOP;
	var FLOOR_WIDTH = 100, FLOOR_HEIGHT = 12, FLOOR_DISTANCE = 60;
	var SPRING_HEIGHT = FLOOR_HEIGHT - 4;
	var HERO_WIDTH = 26;
	var ARROW_HEIGHT = 15, ARROW_WIDTH = 5; // 钉子尺寸

	var FLOOR_VELOCITY_BASE = -0.10; // 地板上升速度
	var GRAVITY_ACC = 0.0015; // 重力加速度
	var SPRINGING_VELOCITY = -0.5; // 离开弹簧时的初速度
	var SPRING_TIME = 100; // 弹簧压缩时间
	var FAKE_FLOOR_TIME = 300, FAKE_FLOOR_TIME2 = 600; // 虚踏板的停留时间, 虚踏板的转动时间
	var ROLLING_VELOCITY = 0.1; // 传送带速度
	var CONTROL_VELOCITY = 0.2; // 左右操作的速度
	var MAX_ACTION_INTERVAL = 20;

	/**
	 * var
	 */
	var floorArray, hero;
	var $wrap, $canvas, $ctx, $res;
	var lastTime;
	var drawCountStartTime = 0, drawCount = 0, lastInterval = 0, lastDrawCount = 0;
	var floorVelocity;
	var score, bestScore = 0, level;
	var isRunning = false, isCooldownTime = false;
	var leftPressed = NaN, rightPressed = NaN, spacePressed = NaN;
	var topBarChange = false;
	// var timeCoefficient = 1, timeModifier = 0;

	var FloorSeq = function() {
		var _seq = 0;
		var _running = false;
		return {
			start : function() {
				_running = true;
			},
			get : function() {
				if (!_running) {
					return 0;
				}
				return _seq++;
			},
			reset: function() {
				_seq = 0;
				_running = false;
			}
		};
	}();

	/**
	 * class define
	 */
	var Floor = defineClass(function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
		this.seq = FloorSeq.get();
	}, {
		draw : function(context) {
			context.save();
			context.translate(this.x, this.y);
			context.lineWidth = FLOOR_HEIGHT;
			context.setLineDash([23.5, 2]);
			context.beginPath();
			context.moveTo(0, -FLOOR_HEIGHT * 0.5);
			context.lineTo(FLOOR_WIDTH, -FLOOR_HEIGHT * 0.5);
			context.stroke();
			context.restore();
		},
		getHeight : function() {
			return FLOOR_HEIGHT;
		},
		landing : function(hero, time) {
			hero.vy = floorVelocity;
			hero.regain();
			updateScore(this.seq);
		},
		standing : function(hero, time) {
		},
		leaving : function(hero, time) {
		}
	});

	var SPRING = defineClass(function(x, y) {
		this.spring = SPRING_HEIGHT;
		this.restoring = false;
	}, {
		getHeight : function() {
			return this.spring + 4;
		},
		draw : function(context, time) {
			if (this.restoring) {
				this.restore(time);
			}
			var currentHeight = this.getHeight();
			context.save();
			context.translate(this.x, this.y);
			context.fillRect(0, -2, FLOOR_WIDTH, 2);
			context.fillRect(0, -currentHeight, FLOOR_WIDTH, 2);
			var gap = 10;
			var width = (FLOOR_WIDTH - gap * 4) / 3;
			context.lineWidth = width;
			context.setLineDash([1, 2]);
			context.beginPath();
			var x = gap + width * 0.5;
			context.moveTo(x, -currentHeight + 2);
			context.lineTo(x, -2);
			x += gap + width;
			context.moveTo(x, -currentHeight + 2);
			context.lineTo(x, -2);
			x += gap + width;
			context.moveTo(x, -currentHeight + 2);
			context.lineTo(x, -2);
			context.stroke();
			context.restore();
		},
		landing : function(hero, time) {
			this.touchTime = time;
			this.spring = SPRING_HEIGHT;
			hero.vy = floorVelocity;
			hero.regain();
			updateScore(this.seq);
		},
		standing : function(hero, time) {
			var offset = time - this.touchTime;
			if (offset < SPRING_TIME) {
				this.spring = SPRING_HEIGHT - offset / SPRING_TIME * 5;
			} else if (offset < SPRING_TIME * 2) {
				this.spring = SPRING_HEIGHT - 15 + offset / SPRING_TIME * 10;
			} else {
				hero.vy = SPRINGING_VELOCITY;
				hero.onFloor = null;
				this.leaving(hero, time);
			}
		},
		leaving : function(hero, time) {
			this.leavingTime = time;
			this.restoring = true;
		},
		restore : function(time) {
			var offset = time - this.leavingTime;
			var distance = 5 / SPRING_TIME * offset;
			if (this.spring < SPRING_HEIGHT) {
				this.spring += distance;
				if (this.spring >= SPRING_HEIGHT) {
					this.spring = SPRING_HEIGHT;
					this.restoring = false;
				}
			} else {
				this.spring -= distance;
				if (this.spring <= SPRING_HEIGHT) {
					this.spring = SPRING_HEIGHT;
					this.restoring = false;
				}
			}
		}
	}, Floor);

	var ROLLING_RIGHT = defineClass(function(x, y) {
		this.offset = 20;
	}, {
		draw : function(context) {
			if (--this.offset <0) {
				this.offset = 20;
			}
			context.save();
			context.translate(this.x, this.y);
			context.setLineDash([15, 5]);
			context.lineWidth = 2;
			context.lineDashOffset = this.offset;
			var markX = FLOOR_WIDTH * 0.2;
			var midH = FLOOR_HEIGHT * 0.5;
			// the track
			roundRect(context, 1, -FLOOR_HEIGHT + 1, FLOOR_WIDTH - 2, FLOOR_HEIGHT - 2, midH);
			context.stroke();
			// the arrow
			context.setLineDash([]);
			context.beginPath();
			context.moveTo(markX, -midH - 3);
			context.lineTo(markX + 4, -midH);
			context.lineTo(markX, -midH + 3);
			context.moveTo(markX + 8, -midH - 3);
			context.lineTo(markX + 12, -midH);
			context.lineTo(markX + 8, -midH + 3);
			context.stroke();
			// the bearing
			context.beginPath();
			context.arc(midH, -midH, midH - 3, 0, 2 * Math.PI, false);
			context.arc(FLOOR_WIDTH - midH, -midH, midH - 3, 0, 2 * Math.PI, false);
			context.fill();
			context.restore();
		},
		landing : function(hero, time) {
			hero.vy = floorVelocity;
			hero.vx = ROLLING_VELOCITY;
			hero.regain();
			updateScore(this.seq);
		},
		leaving : function(hero, time) {
			hero.vx = 0;
		}
	}, Floor);

	var ROLLING_LEFT = defineClass(function(x, y) {
		this.offset = 0;
	}, {
		draw : function(context) {
			if (++this.offset >= 20) {
				this.offset = 0;
			}
			context.save();
			context.translate(this.x, this.y);
			context.setLineDash([15, 5]);
			context.lineWidth = 2;
			context.lineDashOffset = this.offset;
			var markX = FLOOR_WIDTH * 0.8;
			var midH = FLOOR_HEIGHT * 0.5;
			// the track
			roundRect(context, 1, -FLOOR_HEIGHT + 1, FLOOR_WIDTH - 2, FLOOR_HEIGHT - 2, midH);
			context.stroke();
			// the arrow
			context.setLineDash([]);
			context.beginPath();
			context.moveTo(markX, -midH - 3);
			context.lineTo(markX - 4, -midH);
			context.lineTo(markX, -midH + 3);
			context.moveTo(markX - 8, -midH - 3);
			context.lineTo(markX - 12, -midH);
			context.lineTo(markX - 8, -midH + 3);
			context.stroke();
			// the bearing
			context.beginPath();
			context.arc(midH, -midH, midH - 3, 0, 2 * Math.PI, false);
			context.arc(FLOOR_WIDTH - midH, -midH, midH - 3, 0, 2 * Math.PI, false);
			context.fill();
			context.restore();
		},
		landing : function(hero, time) {
			hero.vy = floorVelocity;
			hero.vx = -ROLLING_VELOCITY;
			hero.regain();
			updateScore(this.seq);
		},
		leaving : function(hero, time) {
			hero.vx = 0;
		}
	}, Floor);

	var ARROW_FLOOR = defineClass(function(x, y) {
	}, {
		draw : function(context) {
			context.save();
			context.translate(this.x, this.y);
			context.fillRect(0, - this.getHeight(), FLOOR_WIDTH, 3);
			context.fillRect(0, 6 - this.getHeight(), FLOOR_WIDTH, 3);
			context.beginPath();
			var bottom = - this.getHeight() + 0.5;
			var top = bottom - ARROW_HEIGHT;
			var left = 0.5;
			var right = FLOOR_WIDTH - 0.5;
			context.moveTo(left, bottom);
			for (var x = 0; x < right; ) {
				context.lineTo(x += ARROW_WIDTH, top);
				context.lineTo(Math.min(x += ARROW_WIDTH, right), bottom);
			}
			context.closePath();
			context.fillStyle = '#fff';
			context.fill();
			context.stroke();
			context.restore();
		},
		landing : function(hero, time) {
			hero.vy = floorVelocity;
			hero.hurt(4, time);
			updateScore(this.seq);
		}
	}, Floor);

	var FAKE_FLOOR = defineClass(function(x, y) {
		this.height = FLOOR_HEIGHT;
		this.restoring = false;
	}, {
		getHeight : function() {
			return this.height;
		},
		draw : function(context, time) {
			if (this.restoring) {
				this.restore(time);
			}
			context.save();
			context.translate(this.x, this.y);
			if (this.height >= FLOOR_HEIGHT || this.height <= 0) {
				context.fillStyle = '#999';
				context.fillRect(0, -FLOOR_HEIGHT, FLOOR_WIDTH, FLOOR_HEIGHT);
			} else {
				var percent = this.height / FLOOR_HEIGHT;
				var colorInc = Math.round(0x66 * percent);
				var color = 0x33 + colorInc;
				context.fillStyle = 'rgb(' + color +',' + color + ',' + color + ')';
				context.fillRect(0, -this.getHeight(), FLOOR_WIDTH, this.getHeight());
				color = 0x99 + colorInc;
				context.fillStyle = 'rgb(' + color +',' + color + ',' + color + ')';
				context.fillRect(0, -FLOOR_HEIGHT, FLOOR_WIDTH, FLOOR_HEIGHT - this.getHeight());
			}
			context.restore();
		},
		landing : function(hero, time) {
			this.touchTime = time;
			hero.vy = floorVelocity;
			hero.regain();
			updateScore(this.seq);
		},
		standing : function(hero, time) {
			var offset = time - this.touchTime;
			if (offset < FAKE_FLOOR_TIME) {
				this.height = FLOOR_HEIGHT;
			} else if (offset < FAKE_FLOOR_TIME2) {
				this.height = FLOOR_HEIGHT / (FAKE_FLOOR_TIME - FAKE_FLOOR_TIME2) * (offset - FAKE_FLOOR_TIME2);
			} else {
				this.height = 0;
				hero.onFloor = null;
				this.leaving(hero, time);
			}
		},
		leaving : function(hero, time) {
			var offset = time - this.touchTime;
			if (offset >= FAKE_FLOOR_TIME && offset < FAKE_FLOOR_TIME2) {
				this.restoring = true;
			}
		},
		restore : function(time) {
			var offset = time - this.touchTime;
			if (offset < FAKE_FLOOR_TIME2) {
				this.height = FLOOR_HEIGHT / (FAKE_FLOOR_TIME - FAKE_FLOOR_TIME2) * (offset - FAKE_FLOOR_TIME2);
			} else {
				this.height = 0;
				this.restoring = false;
			}
		}
	}, Floor);

	var Hero = defineClass(function(x, y) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = HERO_WIDTH;
		this.height = HERO_WIDTH;
		this.direction = 0; //left -1， stay 0， right 1
		this.onFloor = null;
		this.vx = 0;
		this.vy = 0;
		this.life = 10;
		this.pos = {
			standing : {
				middle : [2],
				right : [62, 32, 62, 92]
			},
			falling : {
				middle : [122, 152],
				right : [182, 212]
			}
		};
		this.hurtTime = 0;
		this.blinkTime = 0;
		this.blink = false;
		this.frameIndex = 0;
		this.frameTime = 0;
	}, {
		turnLeft : function() {
			if (window.DEBUG) {
				console.log('left');
			}
			this.direction = -1;
		}, 
		turnRight : function() {
			if (window.DEBUG) {
				console.log('right');
			}
			this.direction = 1;
		},
		stay : function() {
			if (window.DEBUG) {
				console.log('stay');
			}
			this.direction = 0;
		},
		draw : function(context, time) {
			context.save();
			if (this.direction < 0) {
				context.scale(-1, 1);
				context.translate(-this.x - this.width, this.y);
			} else {
				context.translate(this.x, this.y);
			}

			if (this.life < 10 && this.hurtTime > 0 && time - this.hurtTime < 1000) {
				if (this.blinkTime < this.hurtTime) {
					this.blink = true;
					this.blinkTime = time;
				} else if (time - this.blinkTime >= 100) {
					this.blink = !this.blink;
					this.blinkTime = time;
				}
			} else if (this.blink) {
				this.blink = false;
			}

			var state = this.onFloor ? this.pos.standing : this.pos.falling;
			var frames = this.direction == 0 ? state.middle : state.right;
			if (time - this.frameTime >= 60) {
				this.frameTime = time;
				++this.frameIndex;
			}
			this.frameIndex = this.frameIndex % frames.length;
			context.drawImage($res.hero,
				frames[this.frameIndex], this.blink ? 32 : 2, 26, 26,
				0, -this.height, this.width, this.height);
			context.restore();
		},
		regain : function() {
			if (this.life < 10) {
				++this.life;
				topBarChange = true;
			}
		},
		hurt : function(num, time) {
			this.hurtTime = time;
			this.life = Math.max(0, this.life - num);
			topBarChange = true;
		}
	});

	/**
	 * action
	 */
	function generateFloor() {
		var firstInit = floorArray.length == 0;
		var floor = floorArray[floorArray.length - 1];
		var postion = floor && floor.y || 0;
		while (postion < STAGE_HEIGHT) {
			postion += FLOOR_DISTANCE;
			var floorY = postion;
			var floorX = Math.round(Math.random() * STAGE_WIDTH - FLOOR_WIDTH * 0.5);
			if (firstInit) { // make sure can land on a floor at the beginning
				if (floorY > STAGE_HEIGHT - FLOOR_DISTANCE) {
					FloorSeq.start();
					floorX = (STAGE_WIDTH - FLOOR_WIDTH) * 0.5;
					newFloor = new Floor(floorX, floorY);
					floorArray.push(newFloor);
					continue;
				}
			}
			var newFloor;
			var seed = window.DEBUG_FLOOR || Math.random();
			if (seed > 0.5) {
				newFloor = new Floor(floorX, floorY);
			} else if (seed > 0.4) {
				newFloor = new FAKE_FLOOR(floorX, floorY);
			} else if (seed > 0.3) {
				newFloor = new ARROW_FLOOR(floorX, floorY);
			} else if (seed > 0.2) {
				newFloor = new ROLLING_LEFT(floorX, floorY);
			} else if (seed > 0.1) {
				newFloor = new ROLLING_RIGHT(floorX, floorY);
			} else {
				newFloor = new SPRING(floorX, floorY);
			}
			floorArray.push(newFloor);
		}
	}

	function removeOutboundFloor() {
		var floorIndex, len = floorArray.length;
		for (floorIndex = 0; floorIndex < len; ++floorIndex) {
			var floor = floorArray[floorIndex];
			if (floor.y >= MARGIN_TOP) { // visible
				break;
			}
		}
		if (floorIndex > 0) {
			floorArray.splice(0, floorIndex);
		}
	}

	function updateHeroHorizontalPostion(step, time) {
		var velocity = hero.vx + hero.direction * CONTROL_VELOCITY;
		if (velocity != 0) {
			hero.x = Math.min(Math.max(0, hero.x + velocity * step), STAGE_WIDTH - HERO_WIDTH);
			if (hero.onFloor) {
				var floor = hero.onFloor;
				if (hero.x < floor.x - HERO_WIDTH || hero.x >= floor.x + FLOOR_WIDTH) {
					hero.onFloor = null; //leaving the floor
					floor.leaving(hero, time);
				}
			}
		}
	}

	function updateAllVerticalPosition(step, time) {
		var floorDistance = step * floorVelocity;
		for (var i = 0, len = floorArray.length; i < len; ++i) {
			floorArray[i].y += floorDistance;
		}

		if (hero.onFloor) {
			var floor = hero.onFloor;
			hero.y = floor.y - floor.getHeight();
		} else {
			var heroDistance = hero.vy * step + 0.5 * GRAVITY_ACC * step * step; // v0t + 1/2gt^2
			var newY = hero.y + heroDistance;
			//detect collision
			var hasCollision = false;
			var minX = hero.x - FLOOR_WIDTH, maxX = hero.x + HERO_WIDTH;
			for (var i = 0, len = floorArray.length; i < len; ++i) {
				var floor = floorArray[i];
				if (floor.x >= minX && floor.x < maxX && floor.getHeight() > 0) {
					if (newY >= floor.y - floor.getHeight() && hero.y < floor.y - floor.getHeight() - floorDistance) { //collision
						if (window.DEBUG) {
							console.info(newY, floor.y - floor.getHeight(), hero.y, floor.y - floor.getHeight() - floorDistance);
						}
						hero.y = floor.y - floor.getHeight();
						hero.onFloor = floor;
						floor.landing(hero, time);
						hasCollision = true;
						break;
					}
				}
			}
			if (!hasCollision) {
				hero.y = newY;
				hero.vy += GRAVITY_ACC * step; // v0 + gt;
			}
		}
	}

	function judge() {
		if (hero == null || hero.y > STAGE_HEIGHT + hero.height || hero.life <= 0) {
			return true;
		}
		return false;
	}

	function checkHittingTop(time) {
		if (hero.y - hero.height < /*ARROW_HEIGHT + */MARGIN_TOP) {
			hero.y = /*ARROW_HEIGHT + */MARGIN_TOP + hero.height;
			hero.vy = 0;
			hero.hurt(5, time);
			if (hero.onFloor) {
				var floor = hero.onFloor;
				hero.onFloor = null;
				floor.leaving(hero, time);
			}
		}
	}

	function drawAll(context, time) {
		context.save();
		context.beginPath();
		context.rect(0, MARGIN_TOP, STAGE_WIDTH, STAGE_HEIGHT - MARGIN_TOP);
		context.clip();
		context.drawImage($res.bg, 0, MARGIN_TOP, STAGE_WIDTH, STAGE_HEIGHT - MARGIN_TOP);
		for (var i = 0, len = floorArray.length; i < len; ++i) {
			floorArray[i].draw(context, time);
		}
		hero.draw(context, time);
		context.beginPath();
		context.moveTo(0.5, MARGIN_TOP + 0.5);
		for (var x = 0.5; x < STAGE_WIDTH; ) {
			context.lineTo(x += ARROW_WIDTH, MARGIN_TOP + ARROW_HEIGHT - 0.5);
			context.lineTo(x += ARROW_WIDTH, MARGIN_TOP + 0.5);
		}
		context.closePath();
		context.fillStyle = '#fff';
		context.fill();
		context.stroke();

		if (!isRunning) {
			context.save();
			context.translate(STAGE_WIDTH * 0.5, STAGE_HEIGHT * 0.5);
			if (isCooldownTime) {
				context.textAlign = 'center';
				context.font = 'bold 32pt monospace';
				context.strokeStyle = '#fff';
				context.lineWidth = 6;
				context.strokeText('Game Over', 0, 10);
				context.fillStyle = '#000';
				context.fillText('Game Over', 0, 10);
			} else {
				if (!isFinite(spacePressed)) {
					context.beginPath();
					roundRect(context, -109.5, -29.5, 219, 59, 10);
					context.fillStyle = 'rgba(0, 0, 0, 0.5)';
					context.fill();
					context.translate(-5, -5);
				}
				context.beginPath();
				roundRect(context, -109.5, -29.5, 219, 59, 10);
				context.fillStyle = '#fff';
				context.fill();
				context.fillStyle = '#000';
				context.font = 'bold 24pt monospace';
				context.textAlign = 'center';
				context.fillText(judge() ? 'play again' : 'continue', 0, 10);
			}
			context.restore();
		}

		context.restore();
		
		if (topBarChange) {
			topBarChange = false;
			context.save();
			context.clearRect(0, 0, STAGE_WIDTH, MARGIN_TOP);
			context.fillStyle = '#000';
			context.font = '12pt monospace';
			context.fillText('life: ' + 'oooooooooo----------'.substr(10 - hero.life, 10) + '  score: ' + score, 10, 24);
			context.restore();
		}

		if (window.DEBUG) {
			context.save();
			context.font = '12pt monospace';
			context.fillText(((drawCount + lastDrawCount) * 1000 / (lastInterval + time - drawCountStartTime)).toFixed(2) + ' fps', 10, MARGIN_TOP + 30);
			if (++drawCount > 20) {
				lastInterval = time - drawCountStartTime;
				lastDrawCount = 20;
				drawCount -= 20;
				drawCountStartTime = time;
			}
			context.restore();
		}
	}

	function updateScore(floorSeq) {
		var newScore = Math.floor(floorSeq * 0.2);
		if (newScore != score) {
			topBarChange = true;
			var newLevel = Math.floor(newScore * 0.1);
			if (newLevel > level) {
				console.info('level up', newLevel);
				level = newLevel;
				floorVelocity = (1 + 0.1 * level) * FLOOR_VELOCITY_BASE;
			}
			score = newScore;
		}
	}

	function loop(step, time) {
		if (hero.onFloor) {
			var floor = hero.onFloor;
			floor.standing(hero, time);
		}
		generateFloor();
		removeOutboundFloor();
		updateHeroHorizontalPostion(step, time);
		updateAllVerticalPosition(step, time);
		checkHittingTop(time);
		return judge();
	}

	function frame(time) {
		if (window.DEBUG_TIME) {
			time *= window.DEBUG_TIME;
		}
		if (!lastTime) {
			lastTime = time;
		}
		var duration = time - lastTime;
		if (duration > 2000) {
			console.info('Pause, duration: ' + duration);
			isRunning = false;
			window.addEventListener('touchmove', onMove, false);
		} else {
			var ended = false;
			for (; duration > MAX_ACTION_INTERVAL; duration -= MAX_ACTION_INTERVAL) {
				ended = loop(MAX_ACTION_INTERVAL, time - duration);
				if (ended) {
					break;
				}
			}
			if (!ended) {
				ended = loop(duration, time);
			}
			if (ended) {
				isCooldownTime = true;
				setTimeout(function() {
					isCooldownTime = false;
					drawAll($ctx, time);
				}, 1000);
				bestScore = Math.max(score, bestScore);
				fireEvent('gameOver', score, bestScore);
				isRunning = false;
				window.addEventListener('touchmove', onMove, false);
			}
		}
		drawAll($ctx, time);
		lastTime = time;
		if (isRunning) {
			requestAnimationFrame(frame);
		}
	}

	function resizeCanvas($wrap, $canvas, $ctx) {
		var screenWidth = document.documentElement.clientWidth;
		var screenHeight = document.documentElement.clientHeight;
		var zoomRate = Math.min(screenWidth / STAGE_WIDTH, screenHeight / STAGE_HEIGHT);
		var ratio = window.devicePixelRatio || 1;
		$canvas.style.width = (STAGE_WIDTH * zoomRate) + 'px';
		$canvas.style.height = (STAGE_HEIGHT * zoomRate) + 'px';
		$canvas.width = STAGE_WIDTH * zoomRate * ratio;
		$canvas.height = STAGE_HEIGHT * zoomRate * ratio;
		
		$ctx.setTransform(zoomRate * ratio, 0, 0, zoomRate * ratio, 0, 0);
		topBarChange = true;
		if (lastTime) {
			drawAll($ctx, lastTime);
		}
		console.info('resize rate=' + zoomRate + ", ratio=" + ratio + ", width=" + $canvas.width + ", height=" + $canvas.height);
	}

	function onMove(e) {
		if (isFinite(spacePressed)) {
			spacePressed = NaN;
			drawAll($ctx, lastTime);
		}
	}

	function init(res) {
		$res = res;
		$canvas = document.createElement('canvas');
		// $canvas.width = STAGE_WIDTH;
		// $canvas.height = STAGE_HEIGHT;
		// $canvas.style.width = '0px';
		// $canvas.style.height = '0px';
		// $canvas.style.transition = 'width 0.5s, height 0.5s';
		$canvas.style.display = 'block';
		$canvas.style.margin = '0 auto';
		clearNode($wrap);
		$wrap.appendChild($canvas);

		$ctx = $canvas.getContext('2d');
		
		setTimeout(function() {
			resizeCanvas($wrap, $canvas, $ctx);
		}, 50);
		window.addEventListener('resize', function() {
			resizeCanvas($wrap, $canvas, $ctx);
			if (isRunning) {
				$canvas.scrollIntoView();
			}
		}, false);

		//regist control
		window.addEventListener('keydown', function(e) {
			if (e.keyCode == 37) { // left
				leftPressed = 0;
				hero.turnLeft();
				e.preventDefault();
				e.stopPropagation();
			} else if (e.keyCode == 39) { // right
				rightPressed = 0;
				hero.turnRight();
				e.preventDefault();
				e.stopPropagation();
			} else if (e.keyCode == 32 || e.keyCode == 13) { // space or enter
				if (!isRunning && !isCooldownTime) {
					spacePressed = 0;
					drawAll($ctx, lastTime);
				}
				e.preventDefault();
				e.stopPropagation();
			}
		}, false);
		window.addEventListener('keyup', function(e) {
			if (e.keyCode == 37) {
				leftPressed = NaN;
				if (isFinite(rightPressed)) {
					hero.turnRight();
				} else {
					hero.stay();
				}
			} else if (e.keyCode == 39) {
				rightPressed = NaN;
				if (isFinite(leftPressed)) {
					hero.turnLeft();
				} else {
					hero.stay();
				}
			} else if (isFinite(spacePressed) && (e.keyCode == 32 || e.keyCode == 13)) {
				spacePressed = NaN;
				start();
			}
		}, false);
		window.addEventListener('touchstart', function(e) {
			var touch = e.changedTouches[0];
			if (touch) {
				if (!isRunning) {
					if (!isCooldownTime && e.target == $canvas) {
						spacePressed = touch.identifier;
						drawAll($ctx, lastTime);
					}
				} else if (touch.clientX < document.documentElement.clientWidth * 0.5) {
					leftPressed = touch.identifier;
					hero.turnLeft();
					e.preventDefault();
					e.stopPropagation();
				} else {
					rightPressed = touch.identifier;
					hero.turnRight();
					e.preventDefault();
					e.stopPropagation();
				}
			}
		}, false);
		window.addEventListener('touchend', function(e) {
			var touch = e.changedTouches[0];
			if (touch) {
				if (touch.identifier == spacePressed) {
					spacePressed = NaN;
					start();
				} else if (touch.identifier == leftPressed) {
					leftPressed = NaN;
					if (isFinite(rightPressed)) {
						hero.turnRight();
					} else {
						hero.stay();
					}
				} else if (touch.identifier == rightPressed) {
					rightPressed = NaN;
					if (isFinite(leftPressed)) {
						hero.turnLeft();
					} else {
						hero.stay();
					}
				}
			}
		}, false);
		window.addEventListener('touchcancel', function(e) {
			var touch = e.changedTouches[0];
			if (touch) {
				if (touch.identifier == leftPressed) {
					leftPressed = NaN;
					if (isFinite(rightPressed)) {
						hero.turnRight();
					} else {
						hero.stay();
					}
				} else if (touch.identifier == rightPressed) {
					rightPressed = NaN;
					if (isFinite(leftPressed)) {
						hero.turnLeft();
					} else {
						hero.stay();
					}
				}
			}
		}, false);
		//start loop
		start();
	}

	function start() {
		if (isRunning) {
			return;
		}
		if (judge()) {
			fireEvent('gameStart');
			//create world
			FloorSeq.reset();
			floorArray = [];
			hero = new Hero((STAGE_WIDTH - HERO_WIDTH) * 0.5, STAGE_HEIGHT - FLOOR_DISTANCE);
			floorVelocity = FLOOR_VELOCITY_BASE;
			score = 0;
			level = 0;
			topBarChange = true;
		}
		window.removeEventListener('touchmove', onMove, false);
		isRunning = true;
		lastTime = 0;
		$canvas.scrollIntoView();
		requestAnimationFrame(frame);
	}

	Game.launch = function($wrapNode) {
		$wrap = $wrapNode;
		loadImage({
			bg : 'bg.png',
			hero : 'led.png'
		}, init);
	}

	Game.on = onEvent;
	Game.off = offEvent;

}(window);