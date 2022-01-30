(function($){ $.fn.tooltip = function(direction){

	return this.each(function() {
  
			$(this).hover(function(e){
	  
				var text =  $(this).attr('data-tooltip'),
					tipX = e.pageX + 24,
					tipY = e.pageY - 24;
			
				$("#the_game").append("<div id='tooltip'>" + text + "</div>");

				$('body').find("#tooltip")
				.addClass(direction)
				.css({
				
				  left: tipX,
				  top: tipY
				
				});
		
			}, function(){
	  
				$("#tooltip").remove();
		
			});
	  
			$(this).mousemove(function(e){
	  
				var tipX = e.pageX + 24,
					tipY = e.pageY - 24,
					tipWidth = $("#tooltip").outerWidth(true),
					tipHeight = $("#tooltip").outerHeight(true);
			
				$("#tooltip").css("left", tipX).css("top", tipY).fadeIn("medium");
		
			});
	
	});
}})(jQuery);