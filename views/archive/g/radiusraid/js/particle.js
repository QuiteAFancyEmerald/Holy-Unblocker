/*==============================================================================
Init
==============================================================================*/
$.Particle = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
};

/*==============================================================================
Update
==============================================================================*/
$.Particle.prototype.update = function( i ) {
	/*==============================================================================
	Apply Forces
	==============================================================================*/
	this.x += Math.cos( this.direction ) * ( this.speed * $.dt );
	this.y += Math.sin( this.direction ) * ( this.speed * $.dt );
	this.ex = this.x - Math.cos( this.direction ) * this.speed;
	this.ey = this.y - Math.sin( this.direction ) * this.speed;
	this.speed *= this.friction;

	/*==============================================================================
	Lock Bounds
	==============================================================================*/
	if( !$.util.pointInRect( this.ex, this.ey, 0, 0, $.ww, $.wh ) || this.speed <= 0.05 ) {
		this.parent.splice( i, 1 );
	}

	/*==============================================================================
	Update View
	==============================================================================*/
	if( $.util.pointInRect( this.ex, this.ey, -$.screen.x, -$.screen.y, $.cw, $.ch ) ) {
		this.inView = 1;
	} else {
		this.inView = 0;
	}
};

/*==============================================================================
Render
==============================================================================*/
$.Particle.prototype.render = function( i ) {
	if( this.inView ) {
		$.ctxmg.beginPath();
		$.ctxmg.moveTo( this.x, this.y );
		$.ctxmg.lineTo( this.ex, this.ey );
		$.ctxmg.lineWidth = this.lineWidth;
		$.ctxmg.strokeStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand( 50, 100 ) + '%, 1)';
		$.ctxmg.stroke();
	}
}