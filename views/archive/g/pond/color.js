function Color(r, g, b) {
  if(r instanceof Array) {
    return Color.apply(this, r)
  }
  this.r = r
  this.g = g
  this.b = b
}

Color.prototype.rgb = function() {
  return 'rgb(' + this.r + ',' +this.g + ',' +this.b+ ')'
}

Color.prototype.equals = function(col) {
  return col.r === this.r && col.g === this.g && col.b === this.b
}
