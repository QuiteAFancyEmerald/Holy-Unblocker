// loaded last

var keymap = {
  38: 'up',
  39: 'right',
  40: 'down',
  37: 'left',
  87: 'up',
  68: 'right',
  83: 'down',
  65: 'left'
}

var userInput = []
var mouseDown = false
var initializeOnUp = false

window.onresize = resizeWindow
function resizeWindow() {
  $canv.width = window.innerWidth * devPixelRatio * quality / 10
  $canv.height = window.innerHeight * devPixelRatio * quality / 10
  ctx = $canv.getContext('2d')
  ctx.lineJoin = 'round'

  if(GAME.state === 'playing') {
    GAME.spawner.resize($canv.width, $canv.height)
    GAME.levelBar.resize($canv.width, $canv.height)
    GAME.levelBalls.resize($canv.width, $canv.height)
  } else {
    if(ASSETS.loaded) drawMenu()
  }
}

function eventPos(e) {
  if (e.type.indexOf('touch') === -1){ // if its a mouse coord
    return {x: e.pageX*devPixelRatio, y: e.pageY*devPixelRatio, width: 1, height: 1}
  }

  // touch event coord
  if(e.type === 'touchend') return {x: 0, y: 0, width: 0, height: 0}
  return {x: e.touches[0].pageX*devPixelRatio - 35, y: e.touches[0].pageY*devPixelRatio - 35, width: 70, height: 70}
}

$canv.addEventListener('mousedown', touchDown)
$canv.addEventListener('touchstart', touchDown)
function touchDown(e){
  e.preventDefault()
  var pos = eventPos(e)
  if(GAME.state === 'playing') {
    GAME.player.updateInput([pos.x - $canv.width/2, pos.y - $canv.height/2], true)
    mouseDown = true
  } else if (GAME.state === 'menu' && GAME.MENU.button) {
    if(collideBox(pos, GAME.MENU.button)) {
      drawMenuButton(true)
      initializeOnUp = true
    }
  }
  
  // audio
  if (collideBox(pos, {
    x: $canv.width - 25,
    y: 10,
    width: 20,
    height: 26
  })){
    toggleMute()
  }
  
  if(!about) {
    // about
    if (collideBox(pos, {
      x: 10,
      y: 10,
      width: 40,
      height: 20
    })){
      showAbout()
    }
  } else {
    // zolmeister
    if (collideBox(pos, {
      x: 32,
      y: 10,
      width: 80,
      height: 12
    })){
      window.open('http://zolmeister.com')
    }
    
    // music attribution
    if (collideBox(pos, {
      x: 48,
      y: 32,
      width: 48,
      height: 12
    })){
      window.open('https://soundcloud.com/chrissij')
    }
  }
  
}

$canv.addEventListener('mouseup', touchUp)
$canv.addEventListener('touchend', touchUp)
function touchUp(e) {
  e.preventDefault()
  var pos = eventPos(e)
  if(GAME.state === 'playing') {
    GAME.player.updateInput([], true)
    mouseDown = false
  } else if (GAME.state === 'menu' && GAME.MENU.button) {
    drawMenuButton(initializeOnUp)
    if(initializeOnUp){
      init()
      initializeOnUp = false
    }
  }
}

$canv.addEventListener('mousemove', touchMove)
$canv.addEventListener('touchmove', touchMove)
function touchMove(e) {
  e.preventDefault()
  var pos = eventPos(e)
  if(GAME.state === 'playing') {
    if(mouseDown) {

      GAME.player.updateInput([pos.x - $canv.width/2, pos.y - $canv.height/2], true)
    }
  }
}

window.onkeydown = function(e){
  if(GAME.state === 'playing') {
    var k = keymap[e.which]
    if (!k) return

    // remove from input list if it was there already
    if(userInput.indexOf(k)!=-1) {
      userInput.splice(userInput.indexOf(k), 1)
    }

    // add to front of input list
    userInput.unshift(k)

    GAME.player.updateInput(userInput, false)
  }
}

window.onkeyup = function(e) {
  if(GAME.state === 'playing') {
    var k = keymap[e.which]
    if (!k) return

    // remove from input list if it was there already
    if(userInput.indexOf(k)!=-1) {
      userInput.splice(userInput.indexOf(k), 1)
    }

    GAME.player.updateInput(userInput, false)
  }
}
