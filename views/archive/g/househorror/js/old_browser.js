$(document).ready( function() {
	
	$('#the_game').load('old_browser.html', function() {

		$('#items, #switch_sound, #lightbox, #settings').remove();
		
		$('#the_game').find('img').hover( function() {
			$(this)
			.stop()
			.animate({
				width:110
			});
		}, function() {
			$(this)
			.stop()
			.animate({
				width:100
			});
		});

	});

});
