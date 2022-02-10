

var items = {

	//room in which player is
	room_name: function() { 
	
		var room_name = $.jStorage.get('is_in', '');
		
		return room_name; 
	
	},

	//player takes item
	take: function(item) {
	
		var item_name = $(item).attr('id'),
				item_info = $(item).attr('data-info'); 
		
		//removes item
		$(item).remove(); 
		
		//fire itembox
		items.itembox(items.room_name(),item_name,item_info);
 
		//add item to used
		var get_collected = $.jStorage.get('collected');
		
		get_collected.push(item_name);
		
		$.jStorage.set('collected', get_collected);
		
		//assign room to the item
		$.jStorage.set(item_name + '_room', items.room_name() );
		
		//assign item info to the item
		$.jStorage.set(item_name + '_info', item_info );  
		
		//erase text from the "item holder"
		$('#items_text').remove();
		
		//erase item from game (and tooltip - just in case)
		$(item).remove();
		$("#tooltip").remove();
		
		//insert item into the "item holder" 
		items.add_to_holder('#button', item_name, items.room_name(), item_info);

		$('#items').fadeIn();

	},
	
	use: function(item) {
	
		var get_item = $(item);
		
		if ( get_item.length > 0 ) {
	
			var item_name = $(item).attr('id'); 
			
			//removes item
			$(item).remove(); 
	 
			//add item to used
			var get_used = $.jStorage.get('used');
			
			get_used.push(item_name);
			
			$.jStorage.set('used', get_used);
		 
			dialogue_box.display({
				character:false,
				picture:false,
				text: 'The item "' + item_name + '" has been used!',
				options: ['Ok']
			});

			if ($('#items').children().length < 2) {
				$('#items').fadeOut();
			}
		
		} else {
		
			return false;
		
		}

	},

	//"item holder"
	holder: function() {
	
			var holder  =  document.getElementById('items'),
					button  =  document.getElementById('button');
					
			//add collected items
			items.loop_and_add(collected);
	
			$(button).toggle(function() {
		
				$(button).addClass('up');
		
				$(holder).animate({
				
					top:0
				
				}, 500 );
			
			}, function() {
			
				$(button).removeClass('up');
			
				$(holder).animate({
				
					top:-100
				
				}, 500 );
			
			});
			
			$(holder).delegate('img', 'click', function() {
				
					var item_name = $(this).attr('id'), 
							room_name = $.jStorage.get(item_name + '_room'),
							item_info = $.jStorage.get(item_name + '_info'); 
				
					items.itembox(room_name,item_name,item_info);
				
				});
	
	//item holder - END
	},
	
	loop_and_add: function(things) {
		
		var length = things.length;
				
		if ( length > 0 ) { 

			for (i=0; i<length;  i++) {
			
				var room_name = $.jStorage.get(things[i] + '_room'),
						item_info = $.jStorage.get(things[i] + '_info');
						
				//insert item into the "item holder"        
				items.add_to_holder('#button', things[i], room_name, item_info);
										
			}
			
		}
	
	},
	
	//lightbox
	itembox: function(room_name,item_name,item_info) {
	
		//fires lightbox
		$('#lightbox')
		.fadeIn('1000')
		.text( item_info )
		.append("<div class='close'>")
		.append("<img src='images/" + room_name + '_' + item_name +"_big.png'>");
		
		$('div.close').click( function() {
		
			$('#lightbox').empty().fadeOut('1000');

		});
	
	},
	
	add_to_holder: function(before_what, item_name, room_name, item_info) {
	
		$(before_what)
		.before("<img src='images/" + room_name + '_' + item_name +"_min.png' id='" + item_name + "' data-info='" + item_info +"'>");
	
	}

// items - END
}