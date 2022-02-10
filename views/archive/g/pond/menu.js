function drawMenu() {
  sizeMenu()


  // background
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, $canv.width, $canv.height)
  drawMenuLogo()
  drawMenuButton()
  drawSoundControl()
}

function drawMenuLogo() {
  var title = GAME.MENU.title
  ctx.drawImage(ASSETS[usingSmallLogo ? 'logoSmall' : 'logo'], title.x, title.y, title.width, title.height)
}

function fadeInMenu() {
  GAME.state = 'menu'
  GAME.MENU.opacity = 0
  requestAnimFrame(menuFade)
  //drawMenu()
}

function menuFade() {
  GAME.MENU.opacity+=0.02
  drawMenu()
  var alpha = 1-GAME.MENU.opacity
  ctx.fillStyle = 'rgba(17,17,17,'+(alpha > 0 ? alpha : 0)+')'
  ctx.fillRect(0, 0, $canv.width, $canv.height)
  if(GAME.MENU.opacity < 1 && GAME.state === 'menu'){
    requestAnimFrame(menuFade)
  }
}

function drawMenuButton(hitting) {
  var button = GAME.MENU.button
  // button
  ctx.lineWidth = 4
  ctx.strokeStyle = '#444'
  roundRect(ctx, button.x, button.y, button.width, button.height, 20)
  ctx.fillStyle= hitting ? '#222' : '#1a1a1a'
  ctx.fill()
  ctx.stroke()
  var width = ASSETS.enter.width
  var height = ASSETS.enter.height
  var scale = scaleSize(width, height, button.width - 5, button.height - 5)
  width *= scale
  height *= scale
  var x = button.x + button.width/2 - width/2
  var y = button.y + button.height/2 - height/2
  ctx.drawImage(ASSETS.enter, x, y, width, height)
}

function sizeMenu() {
  var title = {
    width : ASSETS[usingSmallLogo ? 'logoSmall' : 'logo'].width,
    height : ASSETS[usingSmallLogo ? 'logoSmall' : 'logo'].height,
    minPaddingX : 50,
    minPaddingY : 15,
    x: null,
    y: null
  }

  var button = {
    x : null,
    y : $canv.height / 1.8,
    width : $canv.width * .5,
    height : $canv.height / 6
  }
  button.x = $canv.width / 2 - button.width/2

  // title
  var scale = scaleSize(title.width, title.height, $canv.width - title.minPaddingX, $canv.height - button.y - title.minPaddingY*2)
  title.width *= scale
  title.height *= scale
  title.x = $canv.width/2 - title.width/2
  title.y = button.y - title.height - title.minPaddingY

  GAME.MENU.title = title
  GAME.MENU.button = button

  // check to see if we should use lower resolution logo
  if(title.width <= 300 && !usingSmallLogo) {
    usingSmallLogo = true
    sizeMenu()
  } else if(scale === 1 && usingSmallLogo){
    usingSmallLogo = false
    sizeMenu()
  }
}
