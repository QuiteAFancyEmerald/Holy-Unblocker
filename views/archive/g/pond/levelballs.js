function LevelBalls(width, height) {
  this.balls = []
  this.nextColors = Array.apply([], new Array(2)).map(function(){ return {col: randColor()}})
  this.ballRadius = 14
  this.maxWidth = width
  this.maxHeight = height
  this.thickness = 2
  this.width = this.maxWidth
  this.height = this.ballRadius * 2 + this.thickness * 2
  this.x = this.ballRadius * 2
  this.y = this.maxHeight - this.ballRadius * 2 - this.thickness * 4
  this.updating = false
  this.canv = document.createElement('canvas')
  this.canv.width = this.maxWidth
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
  this.ctx.lineWidth = this.thickness
}
LevelBalls.prototype.resize = function(width, height) {
  this.maxWidth = width
  this.maxHeight = height
  this.width = this.maxWidth
  this.height = this.ballRadius * 2 + this.thickness * 2
  this.y = this.maxHeight - this.ballRadius * 2 - this.thickness * 4
  this.canv.width = this.maxWidth
  this.canv.height = this.height
  this.ctx = this.canv.getContext('2d')
  this.ctx.lineWidth = this.thickness
  for(var i=0;i<this.balls.length;i++){
    this.balls[i].x = i*(this.width/13 + this.ballRadius) + this.ballRadius * 2
  }
}
LevelBalls.prototype.draw = function(outputCtx) {
  if (!this.balls.length) return
  
  this.ctx.clearRect(0, 0, this.canv.width, this.canv.height)
  for(var i=0, l=this.balls.length;i<l;i++) {
    this.balls[i].draw(this.ctx)
  }
  outputCtx.drawImage(this.canv, 0, this.y)
}
LevelBalls.prototype.physics = function() {
  var cnt = 0
  for(var i=0;i<this.balls.length;i++) {
    cnt += this.balls[i].physics() ? 1 : 0
  }
  return cnt === 10
}
LevelBalls.prototype.toParticles = function(target) {
  return particalize.call(this, target, this.y, 8, 0.16)
}
LevelBalls.prototype.shift = function() {
  this.x += this.width/13 + this.ballRadius
}

LevelBalls.prototype.addBall = function() {
  var colors =  this.nextColors
  this.balls.push(new LevelBall(this.x, this.ballRadius + this.thickness, colors, this.ballRadius))
}

function LevelBall(x, y, colors, r) {
  this.x = x || 0
  this.y = y || 0
  this.colors = colors || []
  this.size = 1
  this.targetSize = r || 10
}
LevelBall.prototype.draw = function(ctx) {
  var width = 10

  for(var i=this.colors.length-1;i>=0;i--) {
    var color = this.colors[i]
    ctx.strokeStyle = color.col.rgb()
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size/2*(i+1), 0, Math.PI*2)
    ctx.stroke()
  }

}
LevelBall.prototype.physics = function() {
  if(this.size < this.targetSize) {
    this.size += 0.2
  }
  if(this.size >= this.targetSize) return true
  return false
}
