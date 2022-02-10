// local storage helpers - source: http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage/3146971#3146971
Storage.prototype.setObject = function( key, value ) {
	this.setItem( key, JSON.stringify( value ) );
}

Storage.prototype.getObject = function( key ) {
	var value = this.getItem( key );
	return value && JSON.parse( value );
}

Storage.prototype.removeObject = function( key ) {
	this.removeItem( key );
}

$.setupStorage = function() {
	$.storage = localStorage.getObject( 'radiusraid' ) || {
		'mute': 0,
		'autofire': 0,
		'score': 0,
		'level': 0,		
		'rounds': 0,
		'kills': 0,
		'bullets': 0,
		'powerups': 0,		
		'time': 0
	};
};

$.updateStorage = function() {
	localStorage.setObject( 'radiusraid', $.storage );
};

$.clearStorage = function() {
	localStorage.removeObject( 'radiusraid' );
	$.setupStorage();
};