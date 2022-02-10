function Particle(x, y, color, targetFish, dir, r, speed, arcSpeed) {
  this.x = x || 0
  this.y = y || 0
  this.color = color || '#fff'
  this.target = targetFish
  this.dir = dir || 0
  this.r = r || 2
  this.speed = speed || 8
  this.arcSpeed = arcSpeed || 0.4
}
Particle.prototype.draw = function(ctx) {
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.strokeStyle = this.color.rgb()
    ctx.arc(this.x, this.y, this.r*3, 0, 2 * Math.PI, false)
    ctx.stroke()
}
Particle.prototype.physics = function() {
  var p = this
  var targetDir = directionTowards(p.target, p)

  // this code makes the particles (mostly) end up at the target eventually
  var t1 = p.dir
  var t2 = targetDir
  var arcSpeed = this.arcSpeed
  var moveDir = 1
  if(Math.abs(t1-t2)>Math.PI) {
    moveDir = -1
  }
  if(t1 > t2) {
    p.dir -= moveDir * Math.min(arcSpeed, Math.abs(t1-t2))
  } else if(t1 < t2) {
    p.dir += moveDir * Math.min(arcSpeed, Math.abs(t1-t2))
  }
  if(p.dir>Math.PI){
    p.dir = p.dir - Math.PI*2
  }
  if(p.dir<-Math.PI){
    p.dir = p.dir + Math.PI*2
  }

  var dir = p.dir
  var dist = distance(p.target, p)
  p.x+=Math.cos(dir) * this.speed + (Math.random()*2 - 1) + Math.cos(dir) * (1/(dist+1))
  p.y+=Math.sin(dir) * this.speed + (Math.random()*2 - 1) + Math.sin(dir) * (1/(dist+1))
  p.r = Math.log(dist)/4
  p.r = p.r<0?0:p.r
  return dist
}
