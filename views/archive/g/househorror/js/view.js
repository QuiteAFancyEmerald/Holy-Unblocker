
//views for specified rooms
var view = {

	//floating(item, time, tolerance);

	start: function(items, execute) {

		//where player is standing
		var x = $('#player').attr('data-x'),
			y = $('#player').attr('data-y'),
			room = $.jStorage.get('is_in'),
			how_many = items.length;

		function start() { 
			$('#the_game').load('room_view.html', function() {

				$('.close').on('click', function() {
					$('.close').off();
					game[room](x,y);
					if (room === 'bathroom') {
						setTimeout(function() {
							scene.explosion();
						}, 2576);
					}
				});

				// $('#clouds_1').pan({fps: 10, speed: 1, dir: 'left'});
				// $('#clouds_2').pan({fps: 10, speed: .5, dir: 'left'});
				// $('#clouds_3').pan({fps: 10, speed: .25, dir: 'left'});

				for (i=0; i<how_many; i++) {
					$('#room_view')
					.addClass(room)
					.children('div')
					.append('<div id="' + items[i][0] + '" class="object" />');
					view.floating(items[i][0], items[i][1], items[i][2]);
				}

				//let the fish know you looked through the window ;)
				if ( $.inArray("window", fish) === -1) {
					var get_fish = $.jStorage.get('fish');
					get_fish.push('window');
					$.jStorage.set('fish', get_fish);
				}

				if (execute) {
					execute();
				}

			});
		};

		$('<div/>', {
				id: 'white'
		})
		.appendTo('body')
		.css('opacity','0')
		.animate({opacity:1}, 1000, function() {
			setTimeout(function() {
				$('#white').animate({opacity:0}, 500, function() {
					$('#white').remove();
				});
				start();
			}, 500);
		});
	},

	floating: function(item, time, tolerance) {
		function repeat() {
				$('#' + item)
				.transition({y: tolerance}, time)
				.transition({y: -tolerance}, time, function() {
					repeat();			
				});
		}
		repeat();
	
	// floating_houses() - END
	}

// view - END
}