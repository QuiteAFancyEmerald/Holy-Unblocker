##########
# constructor params: callbacks, options.
#   object with mouse event callback functions
#   object with rect options.
#     strokeColor
#     fillColor
#     shapeWidth
#     shapeHeight
#     strokeWiddth
class RectShape extends Container
  constructor: (@options) ->
    super
    @fillColor = @options?.fillColor ? '#f00'
    @strokeColor = @options?.strokeColor ? '#000'
    @shapeWidth = @options?.shapeWidth ? 100
    @shapeHeight = @options?.shapeHeight ? 100
    @strokeWidth = @options?.strokeWidth ? 1
    @changeFillColor(@fillColor)
    @cache 0, 0, @shapeWidth, @shapeHeight


  changeFillColor: (@fillColor) ->
    @removeAllChildren()
    g = new Graphics()
    g.setStrokeStyle(@strokeWidth).beginStroke(@strokeColor).beginFill(@fillColor).drawRect(0, 0, @shapeWidth, @shapeHeight)
    shape = new Shape(g)
    @addChild(shape)
    @cache 0, 0, @shapeWidth, @shapeHeight
    @updateCache()

##########
class Tile extends RectShape
  constructor : ->
    super
      strokeColor: '#f00'
      fillColor: '#00f'
      shapeWidth: 100
      shapeHeight: 50

  onClick: (e) ->
    console.log('clicked me')

##########

class ClearButton extends RectShape
  constructor: ->
    super
      strokeColor: '#000'
      fillColor: '#abb'
      shapeWidth: 53
      shapeHeight: 30
      strokeWidth: 1

    @x = stage.canvas.width - 56
    @y = stage.canvas.height - 160

  onClick:(e)->
    console.log 'clear please'
    game.clearCalculator()
    game.calText.text = ''

##########

class NumberBox extends RectShape
  constructor:(@value=0) ->
    @width = 53
    @height = 53
    super
      strokeColor: '#000'
      fillColor: '#f33'
      shapeWidth: @width
      shapeHeight: @height
      strokeWidth: 0
    @text = new Text(@value, '24px Impact', '#fff')
    @text.textBaseline = 'middle'
    @text.textAlign = 'center'
    @text.x += @width/2
    @text.y += @height/2
    @addChild(@text)
    @x = Utils.randomInt 50, 250
    @y = -@height
    @updateCache()

  changeFillColor: (@fillColor) ->
    super @fillColor
    @addChild(@text)
    @updateCache()


##########
class ClickableNumberBox extends NumberBox
  constructor:(@value=0) ->
    super @value

  onPress: (e)->
    console.log "Clicked #{@value}"
    @changeFillColor '#000'

  onMouseOut:(e)->
    @changeFillColor '#f33'

  onClick: (e)->
    @changeFillColor '#f33'
    game.addCalParam @value



##########
class ControlBox extends Container
  constructor: ->
    super
    values = [1..12]
    for value, i in values
      box = new ClickableNumberBox(value)
      @addChild box
      if i < 6
        box.x = i * box.width
        box.y = 0
      else
        box.x = (i-6) * box.width
        box.y = box.height
    @y = stage.canvas.height - box.height*2

##########

class ColorBox extends RectShape
  constructor: (@color='#f00', boxWidth=25, boxHeight=25) ->
    super '#000', @color, boxWidth, boxHeight


  onClick : (e) ->
    console.log "clicked color box with color #{@color}"
    game.changeColorOnSelectedPart(@color)

##########
class ColorChooser extends Container
  constructor: ->
    super
    colors = ['#efefef', '#222','#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff']
    for color, i in colors
      colorBox = new ColorBox(color)
      colorBox.x = i * 25
      console.log colorBox.width
      @addChild colorBox

    @y = stage.bounds.height - 25


##########
class RobotPart extends RectShape
  constructor: (@name, partWidth, partHeight, @x, @y)->
    super '#aaa', '#fff', partWidth, partHeight

  onClick: (e) ->
    game.selectPart(this)


##########
class Utils
  @randomInt: (min=0, max=10)->
    Math.floor(Math.random() * (max-min+1)) + min


##########
class Game extends Container
  self = @
  constructor: () ->
    super
    self = @
    @numberBoxes = []
    @calText = new Text '1x1=1', '18px Impact', '#fff'
    @calText.x = 10
    @calText.y = 460 - 130
    @addChild @calText
    @reset()

  reset: ->
    @clearCalculator()
    _.each @numberBoxes, (box) ->
    for box in @numberBoxes
      @removeChild box
    @numberBoxes = []
    @calText.text = ''

  clearCalculator: ->
    @calResult = 1
    @calParams = []

  generateNumberBox: ->
    value = Utils.randomInt(1, 12) * Utils.randomInt(1, 12)
    @addNumberBox value

  addNumberBox: (value) ->
    box = new NumberBox(value)
    @numberBoxes.push box
    @addChild box

  removeNumberBox: (box) ->
    @numberBoxes = _.without @numberBoxes, box
    @removeChild box

  addCalParam: (number) ->
    @calParams.push number
    @calResult *= number
    @calText.text = @calParams.join('x') + '=' + @calResult
    @checkResult()
    @clearCalculator() if @calParams.length >= 2

  checkResult: ->
    _.each @numberBoxes , (box) ->
      console.log box, box.value, self.calResult, box.value is self.calResult
      if box.value is self.calResult
        self.removeNumberBox box
        self.clearCalculator()
    @generateNumberBox() if @numberBoxes.length is 0

  logDebugMessage: ->
    console.log @calResult, @calParams





##########

fps = 30

stage = null

canvas = undefined

game = new Game()

isPause = no

fpsDiv = undefined

tickCount = 0

# entry point
$ ->
  console.log 'Multiply Defense starts.'

  console.log 'UID:',UID.get()

  fpsDiv = $('#fps')

  canvas = document.getElementById('game-canvas')

  stage = new Stage(canvas)


  stage.addChild game

  # enable touch interactions if supported on the current device:
  Touch.enable stage if Touch.isSupported()
  # enabled mouse over / out events
  #  stage.enableMouseOver 10

  game.addChild(new ControlBox())

  game.addNumberBox(121)

  game.addChild(new ClearButton())
#
#  button = new Button(
#    onClick: (e)->
#      console.log 'onClick'
#    onDoubleClick: (e)->
#      console.log 'onDoubleClick'
#  )
#  game.addChild button
#
#  button2 = new Button()
#  game.addChild button2
#  button2.x = 200;
#  button2.y = 200;

  stage.update()

  Ticker.setFPS(40)

  Ticker.addListener(window)




window.tick = ->
  if (not isPause)
    tickCount++
    if tickCount % 80 is 0
      game.generateNumberBox()
    moveObjects()
    stage.update()
    fpsDiv.text(Math.round(Ticker.getMeasuredFPS() * 100) / 100)

moveObjects = ->
  speed = 1
  for box in game.numberBoxes
    box.y += speed
    game.removeNumberBox(box) if (box.y > 460 + 100)

