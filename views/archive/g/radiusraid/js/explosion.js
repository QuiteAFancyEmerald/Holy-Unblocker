/*==============================================================================
Init
==============================================================================*/
$.Explosion = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.tick = 0;
	this.tickMax = 20;
	if( $.slow ) {
		$.audio.play( 'explosionAlt' );
	} else {
		$.audio.play( 'explosion' );
	}
};

/*==============================================================================
Update
==============================================================================*/
$.Explosion.prototype.update = function( i ) {
	if( this.tick >= this.tickMax ) {
		$.explosions.splice( i, 1 );
	} else {
		this.tick += $.dt;
	}
};

/*==============================================================================
Render
==============================================================================*/
$.Explosion.prototype.render = function( i ) {
	if( $.util.arcInRect( this.x, this.y, this.radius, -$.screen.x, -$.screen.y, $.cw, $.ch ) ) {
		var radius = 1 + ( this.tick / ( this.tickMax / 2 ) ) * this.radius,
			lineWidth = $.util.rand( 1, this.radius / 2 );
		$.util.strokeCircle( $.ctxmg, this.x, this.y, radius, 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand( 40, 80 ) + '%, ' + Math.min( 1, Math.max( 0, ( 1 - ( this.tick / this.tickMax ) ) ) ) + ')', lineWidth);
		$.ctxmg.beginPath();
		var size = $.util.rand( 1, 1.5 );
		for( var i = 0; i < 20; i++ ) {
			var angle = $.util.rand( 0, $.twopi ),
				x = this.x + Math.cos( angle ) * radius,
				y = this.y + Math.sin( angle ) * radius;
				
			$.ctxmg.rect( x - size / 2, y - size / 2, size, size );
		}
		$.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand( 50, 100 ) + '%, 1)';
		$.ctxmg.fill();

		$.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, 50%, ' + Math.min( 1, Math.max( 0, ( 0.03 - ( this.tick / this.tickMax ) * 0.03 ) ) ) + ')';
		$.ctxmg.fillRect( -$.screen.x, -$.screen.y, $.cw, $.ch );
	}
};