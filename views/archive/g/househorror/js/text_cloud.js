(function($){ $.fn.text_cloud = function(text, timeout){

	var $thisCloud = $('<div class="text_cloud" />')
		.appendTo(this)
		.append('<div/>')
		.append('<span/>');
	
	$thisCloud
		.find('span')
		.text(text);
	
	setTimeout(function() {
	
	 $thisCloud.fadeOut(200, function() {
	  
		$thisCloud.remove();
	  
	  });
	
	}, timeout);

}})(jQuery);