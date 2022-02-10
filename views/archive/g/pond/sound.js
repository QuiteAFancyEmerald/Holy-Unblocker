var muted = false
var about = false

popSound = document.createElement('audio')
popSound.src='assets/drop1.ogg'
popSound.volume = 0.4

bgSound = document.createElement('audio')
bgSound.src='assets/bg.ogg'
bgSound.loop = true
bgSound.volume = 0.6
bgSound.addEventListener('canplaythrough', function() {
  bgSound.play()
})
bgSound.play()

if(localStorage.muted === 'true') toggleMute()

function toggleMute(){
  if(!muted) {
    popSound.volume = 0
    bgSound.volume = 0
    muted = true
    localStorage.muted = 'true'
    drawSoundControl()
  } else {
    popSound.volume = 0.4
    bgSound.volume = 0.6
    muted = false
    localStorage.muted = 'false'
    bgSound.play()
    drawSoundControl()
  }
}

function playPop() {
  popSound.play()
}

function drawSoundControl() {
  if(typeof ctx === 'undefined') return
  ctx.fillStyle = '#111'
  ctx.fillRect($canv.width - 25, 10, 50, 25)
  if(muted)
    ctx.drawImage(ASSETS.soundOff, $canv.width - 25, 10)
  else
    ctx.drawImage(ASSETS.soundOn, $canv.width - 25, 10)

  if(GAME.state === 'menu' && about) {
    ctx.fillStyle = '#111'
    ctx.fillRect(10, 10, 50, 20)
    ctx.fillStyle = '#333'
    ctx.font = 'normal 14px sans'
    ctx.fillText('By: Zolmeister', 10, 20)
    ctx.font = 'normal 12px sans'
    ctx.fillText('Music: Chrissi J', 10, 42)
  } else if (GAME.state === 'menu') {
    ctx.fillStyle = '#111'
    ctx.fillRect(10, 10, 50, 20)
    ctx.fillStyle = '#333'
    ctx.font = 'normal 12px sans'
    ctx.fillText('About', 10, 20)
  }

}

function showAbout() {
  about = true
  drawSoundControl()
}
