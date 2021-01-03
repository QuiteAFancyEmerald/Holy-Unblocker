(function() {
  var ClearButton, ClickableNumberBox, ColorBox, ColorChooser, ControlBox, Game, NumberBox, RectShape, RobotPart, Tile, Utils, canvas, fps, fpsDiv, game, isPause, moveObjects, stage, tickCount,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  RectShape = (function(_super) {

    __extends(RectShape, _super);

    function RectShape(options) {
      var _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      this.options = options;
      RectShape.__super__.constructor.apply(this, arguments);
      this.fillColor = (_ref = (_ref2 = this.options) != null ? _ref2.fillColor : void 0) != null ? _ref : '#f00';
      this.strokeColor = (_ref3 = (_ref4 = this.options) != null ? _ref4.strokeColor : void 0) != null ? _ref3 : '#000';
      this.shapeWidth = (_ref5 = (_ref6 = this.options) != null ? _ref6.shapeWidth : void 0) != null ? _ref5 : 100;
      this.shapeHeight = (_ref7 = (_ref8 = this.options) != null ? _ref8.shapeHeight : void 0) != null ? _ref7 : 100;
      this.strokeWidth = (_ref9 = (_ref10 = this.options) != null ? _ref10.strokeWidth : void 0) != null ? _ref9 : 1;
      this.changeFillColor(this.fillColor);
      this.cache(0, 0, this.shapeWidth, this.shapeHeight);
    }

    RectShape.prototype.changeFillColor = function(fillColor) {
      var g, shape;
      this.fillColor = fillColor;
      this.removeAllChildren();
      g = new Graphics();
      g.setStrokeStyle(this.strokeWidth).beginStroke(this.strokeColor).beginFill(this.fillColor).drawRect(0, 0, this.shapeWidth, this.shapeHeight);
      shape = new Shape(g);
      this.addChild(shape);
      this.cache(0, 0, this.shapeWidth, this.shapeHeight);
      return this.updateCache();
    };

    return RectShape;

  })(Container);

  Tile = (function(_super) {

    __extends(Tile, _super);

    function Tile() {
      Tile.__super__.constructor.call(this, {
        strokeColor: '#f00',
        fillColor: '#00f',
        shapeWidth: 100,
        shapeHeight: 50
      });
    }

    Tile.prototype.onClick = function(e) {
      return console.log('clicked me');
    };

    return Tile;

  })(RectShape);

  ClearButton = (function(_super) {

    __extends(ClearButton, _super);

    function ClearButton() {
      ClearButton.__super__.constructor.call(this, {
        strokeColor: '#000',
        fillColor: '#abb',
        shapeWidth: 53,
        shapeHeight: 30,
        strokeWidth: 1
      });
      this.x = stage.canvas.width - 56;
      this.y = stage.canvas.height - 160;
    }

    ClearButton.prototype.onClick = function(e) {
      console.log('clear please');
      game.clearCalculator();
      return game.calText.text = '';
    };

    return ClearButton;

  })(RectShape);

  NumberBox = (function(_super) {

    __extends(NumberBox, _super);

    function NumberBox(value) {
      this.value = value != null ? value : 0;
      this.width = 53;
      this.height = 53;
      NumberBox.__super__.constructor.call(this, {
        strokeColor: '#000',
        fillColor: '#f33',
        shapeWidth: this.width,
        shapeHeight: this.height,
        strokeWidth: 0
      });
      this.text = new Text(this.value, '24px Impact', '#fff');
      this.text.textBaseline = 'middle';
      this.text.textAlign = 'center';
      this.text.x += this.width / 2;
      this.text.y += this.height / 2;
      this.addChild(this.text);
      this.x = Utils.randomInt(50, 250);
      this.y = -this.height;
      this.updateCache();
    }

    NumberBox.prototype.changeFillColor = function(fillColor) {
      this.fillColor = fillColor;
      NumberBox.__super__.changeFillColor.call(this, this.fillColor);
      this.addChild(this.text);
      return this.updateCache();
    };

    return NumberBox;

  })(RectShape);

  ClickableNumberBox = (function(_super) {

    __extends(ClickableNumberBox, _super);

    function ClickableNumberBox(value) {
      this.value = value != null ? value : 0;
      ClickableNumberBox.__super__.constructor.call(this, this.value);
    }

    ClickableNumberBox.prototype.onPress = function(e) {
      console.log("Clicked " + this.value);
      return this.changeFillColor('#000');
    };

    ClickableNumberBox.prototype.onMouseOut = function(e) {
      return this.changeFillColor('#f33');
    };

    ClickableNumberBox.prototype.onClick = function(e) {
      this.changeFillColor('#f33');
      return game.addCalParam(this.value);
    };

    return ClickableNumberBox;

  })(NumberBox);

  ControlBox = (function(_super) {

    __extends(ControlBox, _super);

    function ControlBox() {
      var box, i, value, values, _len;
      ControlBox.__super__.constructor.apply(this, arguments);
      values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      for (i = 0, _len = values.length; i < _len; i++) {
        value = values[i];
        box = new ClickableNumberBox(value);
        this.addChild(box);
        if (i < 6) {
          box.x = i * box.width;
          box.y = 0;
        } else {
          box.x = (i - 6) * box.width;
          box.y = box.height;
        }
      }
      this.y = stage.canvas.height - box.height * 2;
    }

    return ControlBox;

  })(Container);

  ColorBox = (function(_super) {

    __extends(ColorBox, _super);

    function ColorBox(color, boxWidth, boxHeight) {
      this.color = color != null ? color : '#f00';
      if (boxWidth == null) boxWidth = 25;
      if (boxHeight == null) boxHeight = 25;
      ColorBox.__super__.constructor.call(this, '#000', this.color, boxWidth, boxHeight);
    }

    ColorBox.prototype.onClick = function(e) {
      console.log("clicked color box with color " + this.color);
      return game.changeColorOnSelectedPart(this.color);
    };

    return ColorBox;

  })(RectShape);

  ColorChooser = (function(_super) {

    __extends(ColorChooser, _super);

    function ColorChooser() {
      var color, colorBox, colors, i, _len;
      ColorChooser.__super__.constructor.apply(this, arguments);
      colors = ['#efefef', '#222', '#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
      for (i = 0, _len = colors.length; i < _len; i++) {
        color = colors[i];
        colorBox = new ColorBox(color);
        colorBox.x = i * 25;
        console.log(colorBox.width);
        this.addChild(colorBox);
      }
      this.y = stage.bounds.height - 25;
    }

    return ColorChooser;

  })(Container);

  RobotPart = (function(_super) {

    __extends(RobotPart, _super);

    function RobotPart(name, partWidth, partHeight, x, y) {
      this.name = name;
      this.x = x;
      this.y = y;
      RobotPart.__super__.constructor.call(this, '#aaa', '#fff', partWidth, partHeight);
    }

    RobotPart.prototype.onClick = function(e) {
      return game.selectPart(this);
    };

    return RobotPart;

  })(RectShape);

  Utils = (function() {

    function Utils() {}

    Utils.randomInt = function(min, max) {
      if (min == null) min = 0;
      if (max == null) max = 10;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return Utils;

  })();

  Game = (function(_super) {
    var self;

    __extends(Game, _super);

    self = Game;

    function Game() {
      Game.__super__.constructor.apply(this, arguments);
      self = this;
      this.numberBoxes = [];
      this.calText = new Text('1x1=1', '18px Impact', '#fff');
      this.calText.x = 10;
      this.calText.y = 460 - 130;
      this.addChild(this.calText);
      this.reset();
    }

    Game.prototype.reset = function() {
      var box, _i, _len, _ref;
      this.clearCalculator();
      _.each(this.numberBoxes, function(box) {});
      _ref = this.numberBoxes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        box = _ref[_i];
        this.removeChild(box);
      }
      this.numberBoxes = [];
      return this.calText.text = '';
    };

    Game.prototype.clearCalculator = function() {
      this.calResult = 1;
      return this.calParams = [];
    };

    Game.prototype.generateNumberBox = function() {
      var value;
      value = Utils.randomInt(1, 12) * Utils.randomInt(1, 12);
      return this.addNumberBox(value);
    };

    Game.prototype.addNumberBox = function(value) {
      var box;
      box = new NumberBox(value);
      this.numberBoxes.push(box);
      return this.addChild(box);
    };

    Game.prototype.removeNumberBox = function(box) {
      this.numberBoxes = _.without(this.numberBoxes, box);
      return this.removeChild(box);
    };

    Game.prototype.addCalParam = function(number) {
      this.calParams.push(number);
      this.calResult *= number;
      this.calText.text = this.calParams.join('x') + '=' + this.calResult;
      this.checkResult();
      if (this.calParams.length >= 2) return this.clearCalculator();
    };

    Game.prototype.checkResult = function() {
      _.each(this.numberBoxes, function(box) {
        console.log(box, box.value, self.calResult, box.value === self.calResult);
        if (box.value === self.calResult) {
          self.removeNumberBox(box);
          return self.clearCalculator();
        }
      });
      if (this.numberBoxes.length === 0) return this.generateNumberBox();
    };

    Game.prototype.logDebugMessage = function() {
      return console.log(this.calResult, this.calParams);
    };

    return Game;

  })(Container);

  fps = 30;

  stage = null;

  canvas = void 0;

  game = new Game();

  isPause = false;

  fpsDiv = void 0;

  tickCount = 0;

  $(function() {
    console.log('Multiply Defense starts.');
    console.log('UID:', UID.get());
    fpsDiv = $('#fps');
    canvas = document.getElementById('game-canvas');
    stage = new Stage(canvas);
    stage.addChild(game);
    if (Touch.isSupported()) Touch.enable(stage);
    game.addChild(new ControlBox());
    game.addNumberBox(121);
    game.addChild(new ClearButton());
    stage.update();
    Ticker.setFPS(40);
    return Ticker.addListener(window);
  });

  window.tick = function() {
    if (!isPause) {
      tickCount++;
      if (tickCount % 80 === 0) game.generateNumberBox();
      moveObjects();
      stage.update();
      return fpsDiv.text(Math.round(Ticker.getMeasuredFPS() * 100) / 100);
    }
  };

  moveObjects = function() {
    var box, speed, _i, _len, _ref, _results;
    speed = 1;
    _ref = game.numberBoxes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      box = _ref[_i];
      box.y += speed;
      if (box.y > 460 + 100) {
        _results.push(game.removeNumberBox(box));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

}).call(this);
