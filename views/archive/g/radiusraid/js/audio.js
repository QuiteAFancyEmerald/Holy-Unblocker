$.audio = {
	sounds: {},
	references: [],
	play: function( sound ) {
		if( !$.mute ){
			var audio = $.audio.sounds[ sound ];
			if( audio.length > 1 ){
				audio = $.audio.sounds[ sound ][ Math.floor( $.util.rand( 0, audio.length ) ) ];
			} else {
				audio = $.audio.sounds[ sound ][ 0 ];
			}
			audio.pool[ audio.tick ].play();		
			if( audio.tick < audio.count - 1 ) {
				audio.tick++;
			} else {
				audio.tick = 0;
			}
		}
	}
};

for( var k in $.definitions.audio ) {
	$.audio.sounds[ k ] = [];

	$.definitions.audio[ k ].params.forEach( function( elem, index, array ) {
		$.audio.sounds[ k ].push( {
			tick: 0,
			count: $.definitions.audio[ k ].count,
			pool: []
		} );

		for( var i = 0; i < $.definitions.audio[ k ].count; i++ ) {
			var audio = new Audio();
			audio.src = jsfxr( elem );			
			$.audio.references.push( audio );
			$.audio.sounds[ k ][ index ].pool.push( audio );
		}

	} );
}