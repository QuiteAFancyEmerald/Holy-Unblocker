/*==============================================================================
Init
==============================================================================*/
$.Button = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	var text = $.text( {
		ctx: $.ctxmg,
		x: 0,
		y: 0,
		text: this.title,
		hspacing: 1,
		vspacing: 0,
		halign: 'center',
		valign: 'center',
		scale: this.scale,
		snap: 1,
		render: 0
	} );
	this.width = this.lockedWidth;
	this.height = this.lockedHeight;
	
	this.sx = this.x - this.width / 2;
	this.sy = this.y - this.height / 2;
	this.cx = this.x;
	this.cy = this.y;
	this.ex = this.x + this.width / 2;
	this.ey = this.y + this.height / 2;
	this.hovering = 0;
	this.ohovering = 0;
};

/*==============================================================================
Update
==============================================================================*/
$.Button.prototype.update = function( i ) {
	/*==============================================================================
	Check Hover State
	==============================================================================*/
	if( $.util.pointInRect( $.mouse.sx, $.mouse.sy, this.sx, this.sy, this.width, this.height ) ){
		this.hovering = 1;
		if( !this.ohovering ) {
			$.audio.play( 'hover' );
		}
	} else {
		this.hovering = 0;
	}
	this.ohovering = this.hovering;

	/*==============================================================================
	Check Click
	==============================================================================*/
	if( this.hovering && $.mouse.down ) {
		$.audio.play( 'click' );
		this.action();
	}
};

/*==============================================================================
Render
==============================================================================*/
$.Button.prototype.render = function( i ) {	
	if( this.hovering ) {
		$.ctxmg.fillStyle = 'hsla(0, 0%, 10%, 1)';
		$.ctxmg.fillRect( Math.floor( this.sx ), Math.floor( this.sy ), this.width, this.height );
		$.ctxmg.strokeStyle = 'hsla(0, 0%, 0%, 1)';
		$.ctxmg.strokeRect( Math.floor( this.sx ) + 0.5, Math.floor( this.sy ) + 0.5, this.width - 1, this.height - 1, 1 );
		$.ctxmg.strokeStyle = 'hsla(0, 0%, 100%, 0.2)';
		$.ctxmg.strokeRect( Math.floor( this.sx ) + 1.5, Math.floor( this.sy ) + 1.5, this.width - 3, this.height - 3, 1 );
	} else {
		$.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 1)';
		$.ctxmg.fillRect( Math.floor( this.sx ), Math.floor( this.sy ), this.width, this.height );
		$.ctxmg.strokeStyle = 'hsla(0, 0%, 0%, 1)';
		$.ctxmg.strokeRect( Math.floor( this.sx ) + 0.5, Math.floor( this.sy ) + 0.5, this.width - 1, this.height - 1, 1 );
		$.ctxmg.strokeStyle = 'hsla(0, 0%, 100%, 0.15)';
		$.ctxmg.strokeRect( Math.floor( this.sx ) + 1.5, Math.floor( this.sy ) + 1.5, this.width - 3, this.height - 3, 1 );
	}

	$.ctxmg.beginPath();
	$.text( {
		ctx: $.ctxmg,
		x: this.cx,
		y: this.cy,
		text: this.title,
		hspacing: 1,
		vspacing: 0,
		halign: 'center',
		valign: 'center',
		scale: this.scale,
		snap: 1,
		render: true
	} );	

	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.7)';
	if( this.hovering ) {
		$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
	}
	$.ctxmg.fill();

	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.07)';
	$.ctxmg.fillRect( Math.floor( this.sx ) + 2, Math.floor( this.sy ) + 2, this.width - 4, Math.floor( ( this.height - 4 ) / 2 ) );
};