var utility = {

	picker: {

		init: function() {

			$('#grid_data').find('input').focus(function() {
				$(this).val('');
			});

			utility.picker.grab_data();

			$('#close').live('click', function() {
				$('body').find('#results').fadeOut('fast');
			});

		},
		
		grab_data: function() {

			$('#submit').click( function() {

				var x = parseInt( $('#x').val() ),
					y = parseInt( $('#y').val() );

				utility.picker.build_grid(x, y);
				utility.picker.pick($('.tile'));
				utility.picker.generate();

				return false;

			});

		},
		
		build_grid: function(x, y) {

			$('#the_game').append('<div id="floor" />');	

			$('<div />', {
				id:'generate'
			})
			.appendTo('#the_game')
			.text('Generate!');

			$('#grid_data').remove();

			room.generate({
			
			grid_width: x,
			grid_height:y,
			
			drag_room:true
			
			});
		},

		pick: function(el) {
			$(el).live('click', function() {
				if ( $(this).hasClass('selected') ) {
					$(this).removeClass('selected');	
				} else {
					$(this).addClass('selected');
				}
			});
		},

		generate: function() {

			$('#generate').click(function() {

				$('body').find('#results').remove();

				var selected = $('#floor').find('.selected'),
					length = $(selected).length;

					$('<div />', {
						id:'results'
					})
					.appendTo('#the_game')
					.append('<h1>Array:</h1>')
					.append('<pre id="array" />')
					.append('<h1>Selectors:</h1>')
					.append('<pre id="selectors" />')
					.append('<div id="close"><div></div><div></div></div>');

					var array = $('body').find('#array'),
						selectors = $('body').find('#selectors');

					for (i = 0 , j = length; i < j; i++) {
						var xy = $(selected).get(i),
							id = $(xy).attr('id');

							if ( i+1 === j ) {
								$(array).append('\'' + id + '\'');
								$(selectors).append('#' + id);
							} else {
								$(array).append('\'' + id + '\', ');
								$(selectors).append('#' + id + ', ');
							}
					
					}
			});
		}

	}	

// utility END
};

$(document).ready( function() {
utility.picker.init();
});