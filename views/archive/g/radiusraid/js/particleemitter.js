/*==============================================================================
Init
==============================================================================*/
$.ParticleEmitter = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.particles = [];
	for( var i = 0; i < this.count; i++ ) {
		var radius = Math.sqrt( Math.random() ) * this.spawnRange,
            angle = Math.random() * $.twopi,
            x = this.x + Math.cos( angle ) * radius,
            y = this.y + Math.sin( angle ) * radius;
		this.particles.push( new $.Particle( {
			parent: this.particles,
			x: x,
			y: y,
			speed: $.util.rand( this.minSpeed, this.maxSpeed ),
			friction: this.friction,
			direction: $.util.rand( this.minDirection, this.maxDirection ),
			lineWidth: $.util.rand( 0.5, 1.5 ),
			hue: this.hue,
			saturation: this.saturation
		} ) );
	}
};

/*==============================================================================
Update
==============================================================================*/
$.ParticleEmitter.prototype.update = function( i ) {
	var i2 = this.particles.length; while( i2-- ){ this.particles[ i2 ].update( i2 ) }
	if( this.particles.length <= 0 ) {
		$.particleEmitters.splice( i, 1 );
	}
};

/*==============================================================================
Render
==============================================================================*/
$.ParticleEmitter.prototype.render = function( i ) {
	var i2 = this.particles.length; while( i2-- ){ this.particles[ i2 ].render( i2 ) }
};