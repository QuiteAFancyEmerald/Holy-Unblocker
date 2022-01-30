if (!console) {
	var console = {
		log: function() {
			return false;
		}
	};
}

var dialogue_box = {

	settings: {
	
		character: false,
		picture: false,
		text: false,
		options: []
	
	},
	
	display: function(settings, size) {
	
		$.extend(dialogue_box.settings, settings);
		
		if (size === 'big') {
		
			dialogue_box.generate('big');
			
		} else {
		
			dialogue_box.generate('small');
		
		}
	
	},
	
	generate: function(class_name) {
	
			//clear
			$('#dialogue_box, #dialogue_box_image, #no_click').remove();
		
			scene.no_click(true, 'rgba(0,0,0,.8)');
	
			//generate main div
			$('<div/>', {
				id: 'dialogue_box',
				'class': class_name
			})
			.css('opacity',0)
			.appendTo('#the_game')
			.append('<ul id="options"></ul>')
			.animate({
				opacity:1
			}, 500, 'linear');
	
			
			dialogue_box.add_options(dialogue_box.settings.options);
	
			if ( dialogue_box.settings.character ) {
	
				$('<p id="dialogue_box_character">').insertBefore('#options');
				$('#dialogue_box_character').text(dialogue_box.settings.character + ': ');
				
			}
	
			if ( dialogue_box.settings.text ) {
				
				$('<p id="dialogue_box_text">').insertBefore('#options');
				$('#dialogue_box_text').text(dialogue_box.settings.text);
			
			}
	
			if ( dialogue_box.settings.picture ) {
			
				$('<img src="images/' + dialogue_box.settings.picture +'"style="opacity:0" alt="' + dialogue_box.settings.character +'" id="dialogue_box_image">')
				.insertBefore('#dialogue_box')
				.animate({
					opacity:1
				}, 500);
			
			}
	
	// generate - END
	},

	destroy: function() {
	
		$('#dialogue_box')
		.animate({
			opacity:0 
		}, 500, function() {
			$(this).remove();
			scene.no_click(false);
		});
		
		
		$('#dialogue_box_image').animate({
			opacity:0
		}, 500, function() {
			$(this).remove(); 
		});   

	},
	
	add_options: function(items) {
	
		var length = items.length;
				
		if ( length > 0 ) { 

			for (i=0; i<length;  i++) {
							 
				$('<li/>', {
					id: 'option_'+ i 
				}) 
				.appendTo('#options')
				.text(items[i]); 
										
			}
			
		} else {
							
			return false;
		
		}
	
	}

}