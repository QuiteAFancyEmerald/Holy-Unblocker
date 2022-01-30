/*==============================================================================
Init
==============================================================================*/
$.TextPop = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.alpha = 2;
	this.vy = 0;
};

/*==============================================================================
Update
==============================================================================*/
$.TextPop.prototype.update = function( i ) {
	this.vy -= 0.05;
	this.y += this.vy * $.dt;
	this.alpha -= 0.03 * $.dt;

	if( this.alpha <= 0 ){
		$.textPops.splice( i, 1 );
	}
};

/*==============================================================================
Render
==============================================================================*/
$.TextPop.prototype.render = function( i ) {
	$.ctxmg.beginPath();
	$.text( {
		ctx: $.ctxmg,
		x: this.x,
		y: this.y,
		text: '+' + this.value,
		hspacing: 1,
		vspacing: 0,
		halign: 'center',
		valign: 'center',
		scale: 2,
		snap: 0,
		render: 1
	} );
	$.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%, ' + this.alpha + ')';
	$.ctxmg.fill();
}