window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame
})();

function log(s){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", '/log?l='+s, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;

}

function choice(arr) {
  return arr[Math.floor(Math.random()*arr.length)]
}

function randColor(prevColor) {
  prevColor = prevColor || lastColor

  do {
    var color = choice(pallet)
    var col = new Color(color[0], color[1], color[2])
  } while (lastColor.equals(col))
  lastColor = col

  return col

  var r = 0
  var g = 86
  var b = 255
  var offset = 100
  var value = (r + g + b) / 3
  var newVal = value + 2*Math.random()*offset-offset
  var ratio = newVal / value

  return rgbToHex(r * ratio, g * ratio, b * ratio)
}

function shadeColor(col, percent) {
  var shade = Math.round(2.55 * percent)
  return new Color(col.r + shade, col.g + shade, col.b + shade)
}

function directionTowards(a, b) {
  return Math.atan2(a.y-b.y, a.x-b.x)
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y - b.y, 2))
}

function collideBox(a, b) {
  if (a.y + a.height < b.y
     || a.y > b.y + b.height
     || a.x + a.width < b.x
     || a.x > b.x + b.width) return false
  return true
}

function rot(x, y, dir) {
  /*var rotationMatrix = [
    [Math.cos(dir), -Math.sin(dir)],
    [Math.sin(dir), Math.cos(dir)]
  ]*/
  return [Math.cos(dir)*x - Math.sin(dir)*y, Math.sin(dir)*x + Math.cos(dir)*y]
}

function sign(n){
  if(n<0) return -1
  return 1
}

// used by levelbar and levelballs
function particalize(target, yOffset, speed, arcSpeed) {
  var particles = []

  var pixels = this.ctx.getImageData(0,0,this.canv.width, this.canv.height).data
  for(var i = 0; i < pixels.length; i += (isMobile ? 36 * 30 : 36*10)) {
    var r = pixels[i]
    var g = pixels[i + 1]
    var b = pixels[i + 2]

    // black pixel - no data
    if(!r && !g && !b){
      continue
    }

    var x = i/4 % this.canv.width
    var y = Math.floor(i/4 / this.canv.width) + Math.random() * 2 + 2
    var col = new Color(r, g, b)
    var dir = directionTowards(target, {x: x, y: y})
    particles.push(new Particle(x, yOffset + y, col, target, dir, 2, speed, arcSpeed))
  }
  return particles
}

// scale down w1 and h1 to fit inside w2 and h2 retaining aspect ratio
function scaleSize(w1, h1, w2, h2) {
  function scale(v1, v2) {
    if(v1 > v2) {
      return v2/v1
    }
    return 1
  }
  return Math.min(scale(w1, w2), scale(h1, h2))
}

function roundRect (ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}
