//global framerate for jquery animation
jQuery.fx.interval = 20;

//check if data.js is present
if ( typeof( window[ 'collected' ] && window[ 'used' ] ) === 'undefined' ) {

	var collected = false,
			used = false;
	
}

//manages room, basic player interaction with room
var room = {
	
	//default settings  
	settings: {
	
		inject: false,
	
		grid_width: null,
		grid_height: null,
		tile_width: 69.282,
		tile_height: 40,
		
		drag_room: false,
		
		room_glow: false,
		
		player: false, 
		player_speed: null,
		player_position_x: null,
		player_position_y: null,
		
		collision_nodes: [],
		collected_items: collected,
		used_items: used,
		
		transparency_power: '.7',
		
		volume: 50,
		
		preload: [],
		
		execute: function() {}
	
	},
	
	generate: function(settings) {

		//view fades in
		$('<div/>', {
				id: 'white'
		})
		.appendTo('body')
		.css({
			
			opacity:0
			
		})
		.animate({
		
			opacity:1
		
		}, 1000, function() {
		
			//reset room
			$('body').css('background', '#fff');

			if (room.settings.inject) {

				$('#the_game').empty();

			}

			setTimeout(function() {
			
				$.extend(room.settings, settings);

				$('#white').remove();
				room.inject();
			
			}, 500);
			
		});

	},
	
	inject: function() {
	
		if ( room.settings.inject ) {

			$('#the_game').load(room.settings.inject + '.html', function() {

				//start audio loop
				soundManager.stopAll();

				var sound_background = window.room.settings.inject,
					sound_loop = function() {
						sound[sound_background].play({
							volume:room.settings.volume,
							onfinish: function() {
								sound_loop(sound_background);
							}
						});
					};

				sound_loop(sound_background);
			
				$('body').css('background', '#000');
			
				//view fades in
				$('<div/>', {
						id: 'white'
				})
				.appendTo('body')
				.css({
					
					opacity:1
					
				})
				.animate({
				
					opacity:0
				
				}, 1000, function() {
				
					$('body').find('#white').remove();
				
				});
			
				//write in which room player is
				$.jStorage.set('is_in', room.settings.inject); 
			
				room.draw_grid();
				room.place_player();
				room.set_collisions();
				room.set_collected_items();
				room.set_used_items();
				room.draggable();
				room.stroke();
				room.settings.execute();
				room.the_player.start();
				room.center(); 
				
				//intiate spritely 
				$(  room.player_body()  )
				.sprite({
		
					no_of_frames: 8
				
				})
				.spStop(true);  
			
			});
		
		} else {

			 room.draw_grid();
			 room.draggable();
		
		}
	
	},

	player: function() {
	
		var player = $('#' + room.settings.player);
		
		return player;
	
	},
	
	player_body: function() {
	
		var player_body = $('#sprite');
		
		return player_body;
	
	},
	
	center: function(animate,time) {
	
		var object      = $('#the_game').children('div').first(),
				window_x    = $(window).width(),
				window_y    = $(window).height(),
				player_x    = $(room.player()).width(),
				player_y    = $(room.player()).height(),
				player_body = $(room.player_body()).height(), 
				player_pos  = $(room.player()).position(),
				floor 		= $('body').find('#floor'),
				floor_x		= $(floor).width(),
				floor_y		= $(floor).height(),
				floor_pos   = $(floor).position();   
	
		if (!animate) {
		
			$(object).css({
			
				'left':  window_x/2 - player_x/2 - player_pos.left - floor_pos.left,
				'top':  window_y/2 - player_y/2 - player_pos.top - floor_pos.top + player_body/3 
			
			}); 
			
		} else if (time) {

			//prevent tooltip from "flying away"
			$("#tooltip").remove();
		
			$(object).stop(true, false).animate({
			
				'left':  window_x/2 - player_x/2 - player_pos.left - floor_pos.left,
				'top':  window_y/2 - player_y/2 - player_pos.top - floor_pos.top + player_body/3 
			
			}, time);  
		
		} else {
		
			return false;
		
		}
	
	},
	
	draggable: function() {
	
		if ( room.settings.drag_room ) {
	
			$('#the_game').children('div:first-child').draggable({
				
				start: function() {
					$('#the_game').children('div').stop();
				}

			});
		
		} else {
		
			return false;
		
		}
	
	},
	
	stroke: function() {
	
		if ( room.settings.room_glow ) {
		
			$('div.tile, div.active').hover(function() {
			
				$('#stroke').css({ opacity:1 });
			
			}, function() {
			
				$('#stroke').css({ opacity:.5 });
			
			});    
		
		} else {
		
			return false;
		
		}
	
	},    
	
	//draws grid, sets x, y and z coordinates for each tile
	draw_grid: function() {
	
		var i = 0, 
			j = 0;

			for (i=0; i<room.settings.grid_width;  i++) {
				for (j=0; j<room.settings.grid_height;  j++) {
					
					var div = $('<div/>', {
							id: i+'-'+j,
							css: {
									width:    room.settings.tile_width,
									height:   room.settings.tile_height,
									position: 'absolute',
									left: i * room.settings.tile_width/2 + (room.settings.grid_height * room.settings.tile_width/2 - room.settings.tile_width/2) - room.settings.tile_width/2 * j,
									top: j * room.settings.tile_height/2 + i * room.settings.tile_height/2
							}
					}).appendTo('#floor')
						.attr( 'class', 'tile' )
						.attr( 'data-x', i)
						.attr( 'data-y', j)
						.attr( 'data-z', j + ( j + room.settings.grid_height * i ) );  
				}
			} 
	
	}, 
	
	//player starting position
	place_player: function() {
		
		var tile = '#' + room.settings.player_position_x + '-' + room.settings.player_position_y,
				tile_position = $(tile).position();
	
		$(room.player())
			.css({
			
				top:tile_position.top,
				left:tile_position.left

			})
			.attr( 'data-x', room.settings.player_position_x)
			.attr( 'data-y', room.settings.player_position_y);  
	
	},
	
	//set "unwalkable" nodes"
	set_collisions: function() {
	
		room.loop_and_add_class(room.settings.collision_nodes, 'collision');
		
	},
	
	set_collected_items: function() {
			
		room.loop_and_remove(room.settings.collected_items);
		
	},
	
	set_used_items: function() {
			
		room.loop_and_remove(room.settings.used_items,true);
		
	},
	
	loop_and_remove: function(items,all) {
		
		var length = items.length;
		
		if ( all ) {
		
			if ( length > 0 ) { 
	
				for (i=0; i<length;  i++) {
								 
					$('#'+ items[i]).remove();  
											
				}
				
			} else {
								
				return false;
			
			}
		
		} else {
				
			if ( length > 0 ) { 
	
				for (i=0; i<length;  i++) {
								 
					$('#the_game').find('#'+ items[i]).remove();  
											
				}
				
			} else {
								
				return false;
			
			}
			
		}
	
	}, 
	
	loop_and_add_class: function(items, css_class) {
		
		var length = items.length;
				
		if ( length > 0 ) { 

			for (i=0; i<length;  i++) {
							 
				$('#'+ items[i]).addClass(css_class);  
										
			}
			
		} else {
							
			return false;
		
		}
	
	},
	
	//when node element is hovered, item becomes transparent - transition is regulated by css 3 :]
	transparency: function( item, nodes) {

		$(nodes).addClass('transparency');

		$(nodes).hover( function() {
		
			$(item).stop().css({
			
				opacity: room.settings.transparency_power 
			
			});
		
		}, function() {
		
			$(item).stop().css({
			
				opacity:1 
			
			});
		
		});   
	
	},
	
	pulse: function(item, time) {
	
		$(item).css({
		
			'-moz-transition': 'opacity ' + time/1000 + 's linear',
			'-webkit-transition': 'opacity ' + time/1000 + 's linear',
			'-o-transition': 'opacity ' + time/1000 + 's linear',
			'-moz-transition': 'opacity ' + time/1000 + 's linear',
			'transition': 'opacity ' + time/1000 + 's linear'
		
		});
	
		function start() {
		
			setTimeout( function() {
			
				$(item).css({ opacity:0 });
	
				setTimeout( function() {
				
					$(item).css({ opacity:1 });
					
					start();  
				
				}, time*2); 
	
			}, time);
	 
		}
		
		start();

	},
	
	the_player: { 
	
		//go on click
		start: function() {
		
			$('div.tile').not('.collision').bind('click', function() { 

				//clear local storage
				var this_path = $.jStorage.get('temp_path');
				this_path = [];
				$.jStorage.set('this_path', path);

				$( room.player_body() ).spStart();

				//reset animation
				$(room.player()).stop();

				//reset go_to settings
				room.the_player.go_to.start({
				
					target: false,
					
					action: function() { false }
				
				});   

				room.the_player.footsteps();
				//footsteps loop
				room.the_player.footsteps(12,4, true);

				//clears path
				room.the_player.clear_path();
				
				//find path and go to the target
				room.the_player.find_path(this);
			
			});

		},
		
		//go on given parameters
		go_to: {
		
				settings: {
				
					target: false,
					
					action: function() { return false; }
				
				},
				
				start: function(settings) {
				
				 $.extend(room.the_player.go_to.settings, settings);
					 
					if ( room.the_player.go_to.settings.target ) {
						
						$( room.player_body() ).spStart();
		
						//reset animation
						$(room.player()).stop();

						room.the_player.footsteps();
						//footsteps loop
						room.the_player.footsteps(12,4, true);
		
						//clears path
						room.the_player.clear_path();
						
						//find path and go to the target, run action
						room.the_player.find_path($('#' + room.the_player.go_to.settings.target));
					
					} 
				
				}
		
		},
		
		//footsteps loop
		footsteps: function(fps, interval, loop) {
		
			//var stop_steps = null;
		
			if ( fps && interval && loop ) {
		
				stop_steps = setInterval (function() {
				
					sound_footstep.play();
				
				}, 1000/fps * interval);
			
			} else {
			
				if ( typeof( window[ 'stop_steps' ] )  != 'undefined' ) {
				
					clearInterval(stop_steps);
					
				}

				sound_footstep.play();
			
			}
		
		},
		
		//clears path
		clear_path: function() {
		
			$('div.tile').removeClass('marked');
		
		},
		
		//find nodes adjacent to player
		adjacent: function(sx, sy, tx, ty) { 
	
		var nodes = {
				up: {
	
					x: sx,
					y: sy - 1,
					weight: function() {
					
						var weight = 0;
					
						if ( $( nodes.up.select() ).hasClass('collision') || $( nodes.up.select() ).length == 0 ) {
						
							weight = 9999;
						
						} else if ( $( nodes.up.select() ).hasClass('marked') ) {
							
							weight = 100;

						} else {
					
							weight = Math.sqrt( Math.pow((tx - nodes.up.x), 2) + Math.pow((ty - nodes.up.y), 2));
						
						}
						
						return weight;
						
					}, 
					select: function() { 
						var selector = '#'+ nodes.up.x + '-' + nodes.up.y;
						return selector; 
					} 
				
				},
				
				right: {
				
					x: sx + 1,
					y: sy,
					weight: function() {
					
						var weight = 0;
					
						if ( $( nodes.right.select() ).hasClass('collision') || $( nodes.right.select() ).length == 0 ) {
						
							weight = 9999;
						
						} else if ( $( nodes.right.select() ).hasClass('marked') ) {
							
							weight = 100;

						} else {
					
							 weight = Math.sqrt( Math.pow((tx - nodes.right.x), 2) + Math.pow((ty - nodes.right.y), 2));
						
						}
						
						return weight;
						
					}, 
					select: function() { 
						var selector = '#'+ nodes.right.x + '-' + nodes.right.y;
						return selector; 
					}
	
				},
				
				down: {
	
					x: sx,
					y: sy + 1,
					weight: function() {
					
						var weight = 0;
					
						if ( $( nodes.down.select() ).hasClass('collision') || $( nodes.down.select() ).length == 0 ) {
						
							weight = 9999;
						
						} else if ( $( nodes.down.select() ).hasClass('marked') ) {
							
							weight = 100;

						} else {
					
							 weight = Math.sqrt( Math.pow((tx - nodes.down.x), 2) + Math.pow((ty - nodes.down.y), 2));
						
						}
						
						return weight;
					 
					}, 
					select: function() { 
						var selector = '#'+ nodes.down.x + '-' + nodes.down.y;
						return selector; 
					}
				
				},
	
				left: {
	
					x: sx - 1,
					y: sy,
					weight: function() {
					
						var weight = 0;
					
						if ( $( nodes.left.select() ).hasClass('collision') || $( nodes.left.select() ).length == 0 ) {
						
							weight = 9999;
						
						} else if ( $( nodes.left.select() ).hasClass('marked') ) {
							
							weight = 100;

						} else {
					
							 weight = Math.sqrt( Math.pow((tx - nodes.left.x), 2) + Math.pow((ty - nodes.left.y), 2));
						
						}
						
						return weight;
					 
					}, 
					select: function() { 
						var selector = '#'+ nodes.left.x + '-' + nodes.left.y;
						return selector; 
					}
				
				}
			}

			var returnAdjacent = [];
			returnAdjacent.push([nodes.up.weight(), nodes.up.select(), nodes.up.x, nodes.up.y, 'up']);
			returnAdjacent.push([nodes.down.weight(), nodes.down.select(), nodes.down.x, nodes.down.y, 'down']);
			returnAdjacent.push([nodes.left.weight(), nodes.left.select(), nodes.left.x, nodes.left.y, 'left']);
			returnAdjacent.push([nodes.right.weight(), nodes.right.select(), nodes.right.x, nodes.right.y, 'right']);

			return returnAdjacent;

		//adjacent - END
		},

		find_path: function(target_node, start_x, start_y) {

			if ( !start_x && !start_y) {

			var 	start_x = parseInt( $(room.player()).attr('data-x') ),
					start_y = parseInt( $(room.player()).attr('data-y') );

			}

			var		target_x = parseInt( $(target_node).attr('data-x') ),
					target_y = parseInt( $(target_node).attr('data-y') );
			
			//find the best node to go to
			var closest = function() {

				var closest_node = room.the_player.adjacent(start_x, start_y, target_x, target_y),
					go_to = null;

				closest_node.sort(function(a,b) {
					return a[0] - b[0];
				});

				//additional testes
				function additional_test(test_1, test_2) {

					test_1.sort(function(a,b) {
						return a[0] - b[0];
					});

					test_2.sort(function(a,b) {
						return a[0] - b[0];
					});

					if (test_1[0][0] > test_2[0][0]) {
						go_to = [closest_node[1][1], closest_node[1][4], closest_node[1][2], closest_node[1][3]];
					} else {
						go_to = [closest_node[0][1], closest_node[0][4], closest_node[0][2], closest_node[0][3]];
					}

					return go_to;
				}

				go_to = additional_test(	room.the_player.adjacent(closest_node[0][2], closest_node[0][3], target_x, target_y),
											room.the_player.adjacent(closest_node[1][2], closest_node[1][3], target_x, target_y) );

				return go_to; 
		
			//closest - END  
			};
			
			//animation
			go = function(simplified_path, i) {
				var i = i ? i : 1;

				if (simplified_path.length > i) {
					var position = $('#' + simplified_path[i][0] + '-' + simplified_path[i][1]).position(),
						dataZ = $('#' + simplified_path[i][0] + '-' + simplified_path[i][1]).attr('data-z');
					if (simplified_path[i][3] === 'up') {
						$(room.player_body() ).spState(2);
					} else if ( simplified_path[i][3] === 'down') {
						$(room.player_body() ).spState(3);
					} else if ( simplified_path[i][3] === 'right') {
						$(room.player_body() ).spState(4);
					} else if ( simplified_path[i][3] === 'left') {
						$(room.player_body() ).spState(5);
					} 
					$(room.player())
					.attr('data-x', simplified_path[i][0])
					.attr('data-y', simplified_path[i][1])
					.css('z-index', dataZ)
					.animate({
						left: position.left,
						top: position.top
					}, room.settings.player_speed, 'linear', function() {
						i++;
						go(simplified_path, i);
					});
				} else {
					$(room.player_body()).spStop(true);
					get_direction = $( room.player_body() ).css('background-position'),
					direction = get_direction.substr(-6, 4);
					room.center(true,1000);
					//check sprite position, then choose appropriate standing direction
					if ( direction == '-310' ) {
						room.player_body().css('background-position', '0 0');  
					} else if ( direction == '-620' ) {
						room.player_body().css('background-position', '-620px 0');  
					} else if ( direction == '-930' ) {
						room.player_body().css('background-position', '-930px 0');  
					} else if ( direction == '1240' ) {
						room.player_body().css('background-position', '-310px 0');  
					}
					//run additional function (if exists)
					if ( room.the_player.go_to.settings.action() ) {
						//setTimeout( function() {
						room.the_player.go_to.settings.action();
						//}, 500);
					} 
					//reset go_to settings
					room.the_player.go_to.start({
						target: false,
						action: function() { false }
					});  
					//stops footsteps      
					room.the_player.footsteps();
				}
			
			//go() - END
			};

			var simplify_path = function(this_path) {
				
				var edges = [];

				var flip_tile = function(i, pass_edges, this_path) {
					var old_node = $('#' + pass_edges[i][0] + '-' + pass_edges[i][1]);
					if (pass_edges[i][0] === pass_edges[i-1][0] && pass_edges[i][1] === pass_edges[i+1][1]) {
						var new_node = $('#' + pass_edges[i+1][0] + '-' + pass_edges[i-1][1]),
							new_contiguous = 0;

						if ( $('#' + pass_edges[i+1][0] + '-' + (pass_edges[i-1][1]+1)).hasClass('marked') ) {
							new_contiguous++
						}

						if ( $('#' + (pass_edges[i+1][0] + 1) + '-' + pass_edges[i-1][1]).hasClass('marked') ) {
							new_contiguous++
						}

						if ( $('#' + pass_edges[i+1][0] + '-' + (pass_edges[i-1][1]-1)).hasClass('marked') ) {
							new_contiguous++
						}

						if ( $('#' + (pass_edges[i+1][0] - 1) + '-' + pass_edges[i-1][1]).hasClass('marked') ) {
							new_contiguous++
						}

						if ($(new_node).hasClass('collision') || new_contiguous < 2) {console.log('kolizja albo coś ;)')} else {
							$(old_node).removeClass('marked');
							$(new_node).addClass('marked');
							this_path[pass_edges[i][2]] = [pass_edges[i+1][0], pass_edges[i-1][1], pass_edges[i][2], pass_edges[i+1][3]];
						}
					} else if (pass_edges[i][1] === pass_edges[i-1][1] && pass_edges[i][0] === pass_edges[i+1][0]) {
						var new_node = $('#' + pass_edges[i-1][0] + '-' + pass_edges[i+1][1]),
							new_contiguous = 0;

						if ( $('#' + pass_edges[i-1][0] + '-' + (pass_edges[i+1][1]+1)).hasClass('marked') ) {
							new_contiguous++
						}

						if ( $('#' + (pass_edges[i-1][0] + 1) + '-' + pass_edges[i+1][1]).hasClass('marked') ) {
							new_contiguous++
						}

						if ( $('#' + pass_edges[i-1][0] + '-' + (pass_edges[i+1][1]-1)).hasClass('marked') ) {
							new_contiguous++
						}

						if ( $('#' + (pass_edges[i-1][0] - 1) + '-' + pass_edges[i+1][1]).hasClass('marked') ) {
							new_contiguous++
						}

						if ($(new_node).hasClass('collision') || new_contiguous < 2) {console.log('kolizja albo coś ;)')} else {
							$(old_node).removeClass('marked');
							$(new_node).addClass('marked');
							this_path[pass_edges[i][2]] = [pass_edges[i-1][0], pass_edges[i+1][1], pass_edges[i][2], pass_edges[i+1][3]];
						}
					}
					return this_path;
				}

				if (this_path.length >= 3 ) {

					//perform tests...
					for (i=2; i<(this_path.length); i++) {

						var this_x = this_path[i][0],
							this_y = this_path[i][1],
							test = [];
							test.push([(this_x - 1), (this_y - 1)]);
							test.push([(this_x + 1), (this_y + 1)]);
							test.push([(this_x - 1), (this_y + 1)]);
							test.push([(this_x + 1), (this_y - 1)]);

							for (j=0; j<4; j++) {
								var positive = 0;
								if (this_path[i-2][0] === test[j][0] && this_path[i-2][1] == test[j][1] &&
									$('#' + this_path[i-1][0] + '-' + this_path[i-1][1]).length !== -1
								) {
									edges.push(this_path[i]);
								}

							}

					//for loop - END
					}

					if (edges.length >= 2) {

						for (i=1; i<edges.length - 1; i++) {
							if (i % 4 === 0 || i === 1) {
								this_path = flip_tile(i, edges, this_path);
							}
						}

					}

				}

				return this_path;

			//simplify_path - END
			};

			var generate_path = function() {

				var dataX = closest()[2],
					dataY = closest()[3],
					dataDir = closest()[1];

				if ( $(closest() ).length > 0) {

					var the_end = function() {
						//add it to array
						var this_node = $.jStorage.get('temp_path');
						this_node.push([dataX, dataY, this_node.length, dataDir]);
						$.jStorage.set('temp_path', this_node);

						var this_path = $.jStorage.get('temp_path');
						var simplified_path = simplify_path(this_path);
						$.jStorage.set('temp_path', []);
						go(simplified_path);
					}

					//add first step
					if ($.jStorage.get('temp_path').length === 0) {
						path = [];
						path.push([start_x, start_y]);
						$.jStorage.set('temp_path', path);
					}

					//check if player has reached target
					if ( target_x === dataX && target_y === dataY ) {
					
						the_end();
						
					} else {

					// setTimeout(function() {
						
						//mark the closest node
						$(closest()[0]).addClass('marked');
						
						//add it to array
						var this_node = $.jStorage.get('temp_path');
						this_node.push([dataX, dataY, this_node.length, dataDir]);
						$.jStorage.set('temp_path', this_node);

						//check if we have endless loop...
 						if (this_node.length > 1) {
							try {
								if (this_node[this_node.length - 1][0] === this_node[this_node.length - 3][0] &&
								this_node[this_node.length - 1][1] === this_node[this_node.length - 3][1]) {
									the_end();
								} else {
								room.the_player.find_path(target_node, dataX, dataY);
								}
							} catch(error) {
								room.the_player.find_path(target_node, dataX, dataY);
							}
						} else {
							room.the_player.find_path(target_node, dataX, dataY);
						}
					//timeout - END
					// }, 100); 
					
					}
					
				}
			//generate_path - END
			};

			generate_path();

		//find_path() - END
		}

	//the_player() - END  
	}

//room - END
};