//global settings for jquery 
jQuery.fx.interval = 10;

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

		fade_color: 'black',
		
		zdetection: function() {return false;},
		execute: function() {}
	
	},
	
	generate: function(settings) {

		$.extend(room.settings, settings);

		//view fades in
		$('<div/>', {
				id: room.settings.fade_color
		})
		.appendTo('body')
		.css({
			
			opacity:0
			
		})
		.animate({
		
			opacity:1
		
		}, 1000, function() {
		
			//reset room
			if (room.settings.fade_color === 'white') {
				$('body').css('background', '#fff');
			} else {
				$('body').css('background', '#000');
			}

			if (room.settings.inject) {

				$('#the_game').empty();

			}

			setTimeout(function() {
			
				$('#black').remove();
				$('#white').remove();
				room.inject();
			
			}, 500);
			
		});

	},
	
	inject: function() {
	
		if ( room.settings.inject ) {

			$('#the_game').load(room.settings.inject + '.html?' + (new Date()).getTime(), function() {

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
						id: room.settings.fade_color
				})
				.appendTo('body')
				.css({
					
					opacity:1
					
				})
				.animate({
				
					opacity:0
				
				}, 1000, function() {
				
					$('body').find('#' + room.settings.fade_color).remove();
				
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

				$.idleTimer('destroy');
				$('.the-resume-screen').remove();

				setTimeout(function() {
					if ($('#items').children().length > 1) {
						$('#items').fadeIn();
					}
				}, 100);

				// room.resumeScreen = function() {
				// 	$.idleTimer(45000);
				// 	$(document).on('idle.idleTimer', function(){
				// 		$.idleTimer('destroy');
				// 		$('#settings, #button, #switch_sound').addClass('dim');
				// 		scene.no_click(true, 'rgba(0, 0, 0, .8)');
				// 		var $noclick = $('#no_click');
				// 		$noclick.addClass('the-resume-screen');
				// 		var resumeScreen = '<div id="resume_screen"><p><span id="resume_screen_resume" class="icon"></span><span class="text">Wznów</span></p><p><span id="resume_screen_restart" class="icon"></span><span class="text">Od nowa</span></p></div>';
				// 		$noclick
				// 			.css('z-index', 9999)
				// 			.append(resumeScreen);

				// 		$('#resume_screen_resume')
				// 			.closest('p')
				// 			.on('click', function() {
				// 				$noclick.fadeOut(500, function() {
				// 					room.resumeScreen();
				// 					$('#settings, #button, #switch_sound').removeClass('dim');
				// 					$(this).remove();
				// 				});
				// 			});

				// 		$('#resume_screen_restart')
				// 			.closest('p')
				// 			.on('click', function() {
				// 				$.jStorage.flush();
				// 				window.location.reload();
				// 			});

				// 	});
				// };

				// room.resumeScreen();

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

	grid: function() {
		
		grid = function() {
			grid = new Array(room.settings.grid_height);
			for(var	j, i = 0; i < room.settings.grid_height; i++) {
				grid[i] = new Array(room.settings.grid_width);
				for(j = 0; j < room.settings.grid_width; j++)
					grid[i][j] = 0;
			};

			return grid;
		}

		add_collisions = function(collisions, grid) {
			for (i=0; i<collisions.length; i++) {
				var x = $('#' + collisions[i]).attr('data-x'),
					y = $('#' + collisions[i]).attr('data-y');

				if (x && y) {
					grid[y][x] = 1;
				}
			}

			return grid;
		}

		grid = add_collisions(room.settings.collision_nodes, grid());

		return grid;

	},
	
	//player starting position
	place_player: function() {
		var tile = $('#' + room.settings.player_position_x + '-' + room.settings.player_position_y),
			tile_position = tile.position();

		$(room.player())
			.css({
				top: tile_position.top,
				left: tile_position.left,
				'z-index': tile.attr('data-z') 
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

			$('#floor').find('div.tile').on('click', function() { 

				if (!$(this).hasClass('collision')) {

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
					room.the_player.find_path(this, false, false, room.grid());

				}
			
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
						room.the_player.find_path($('#' + room.the_player.go_to.settings.target), false, false, room.grid());
					
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

		AStar: (function () {

			/**
			 * A* (A-Star) algorithm for a path finder
			 * @author  Andrea Giammarchi
			 * @license Mit Style License
			 */

			function diagonalSuccessors($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
				if($N) {
					$E && !grid[N][E] && (result[i++] = {x:E, y:N});
					$W && !grid[N][W] && (result[i++] = {x:W, y:N});
				}
				if($S){
					$E && !grid[S][E] && (result[i++] = {x:E, y:S});
					$W && !grid[S][W] && (result[i++] = {x:W, y:S});
				}
				return result;
			}

			function diagonalSuccessorsFree($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
				$N = N > -1;
				$S = S < rows;
				$E = E < cols;
				$W = W > -1;
				if($E) {
					$N && !grid[N][E] && (result[i++] = {x:E, y:N});
					$S && !grid[S][E] && (result[i++] = {x:E, y:S});
				}
				if($W) {
					$N && !grid[N][W] && (result[i++] = {x:W, y:N});
					$S && !grid[S][W] && (result[i++] = {x:W, y:S});
				}
				return result;
			}

			function nothingToDo($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
				return result;
			}

			function successors(find, x, y, grid, rows, cols){
				var
					N = y - 1,
					S = y + 1,
					E = x + 1,
					W = x - 1,
					$N = N > -1 && !grid[N][x],
					$S = S < rows && !grid[S][x],
					$E = E < cols && !grid[y][E],
					$W = W > -1 && !grid[y][W],
					result = [],
					i = 0
				;
				$N && (result[i++] = {x:x, y:N, index: i, direction: 'up'});
				$E && (result[i++] = {x:E, y:y, index: i, direction: 'right'});
				$S && (result[i++] = {x:x, y:S, index: i, direction: 'down'});
				$W && (result[i++] = {x:W, y:y, index: i, direction: 'left'});
				return find($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i);
			}

			function diagonal(start, end, f1, f2) {
				return f2(f1(start.x - end.x), f1(start.y - end.y));
			}

			function euclidean(start, end, f1, f2) {
				var
					x = start.x - end.x,
					y = start.y - end.y
				;
				return f2(x * x + y * y);
			}

			function manhattan(start, end, f1, f2) {
				return f1(start.x - end.x) + f1(start.y - end.y);
			}

			function AStar(grid, start, end, f) {
				var
					cols = grid[0].length,
					rows = grid.length,
					limit = cols * rows,
					f1 = Math.abs,
					f2 = Math.max,
					list = {},
					result = [],
					open = [{x:start[0], y:start[1], f:0, g:0, v:start[0]+start[1]*cols}],
					length = 1,
					adj, distance, find, i, j, max, min, current, next
				;
				end = {x:end[0], y:end[1], v:end[0]+end[1]*cols};
				switch (f) {
					case "Diagonal":
						find = diagonalSuccessors;
					case "DiagonalFree":
						distance = diagonal;
						break;
					case "Euclidean":
						find = diagonalSuccessors;
					case "EuclideanFree":
						f2 = Math.sqrt;
						distance = euclidean;
						break;
					default:
						distance = manhattan;
						find = nothingToDo;
						break;
				}
				find || (find = diagonalSuccessorsFree);
				do {
					max = limit;
					min = 0;
					for(i = 0; i < length; ++i) {
						if((f = open[i].f) < max) {
							max = f;
							min = i;
						}
					};
					current = open.splice(min, 1)[0];
					if (current.v != end.v) {
						--length;
						next = successors(find, current.x, current.y, grid, rows, cols);
						for(i = 0, j = next.length; i < j; ++i){
							(adj = next[i]).p = current;
							adj.f = adj.g = 0;
							adj.v = adj.x + adj.y * cols;
							if(!(adj.v in list)){
								adj.f = (adj.g = current.g + distance(adj, current, f1, f2)) + distance(adj, end, f1, f2);
								open[length++] = adj;
								list[adj.v] = 1;
							}
						}
					} else {
						i = length = 0;
						do {
							result[i++] = [current.x, current.y, current.index, current.direction];
						} while (current = current.p);
						result.reverse();
					}
				} while (length);
				return result;
			}

			return AStar;

		}()),

		find_path: function(target_node, start_x, start_y, grid) {

			if ( !start_x && !start_y) {

			var 	start_x = parseInt( $(room.player()).attr('data-x') ),
					start_y = parseInt( $(room.player()).attr('data-y') );

			}

			var		target_x = parseInt( $(target_node).attr('data-x') ),
					target_y = parseInt( $(target_node).attr('data-y') );
			
			//animation
			go = function(simplified_path, i) {
				var i = i ? i : 1;

				if (simplified_path.length > i) {
					var position = $('#' + simplified_path[i][0] + '-' + simplified_path[i][1]).position(),
						dataZ = room.settings.zdetection() ? room.settings.zdetection() : $('#' + simplified_path[i][0] + '-' + simplified_path[i][1]).attr('data-z');
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

			go(room.the_player.AStar(grid, [start_x, start_y], [target_x, target_y]));

		//find_path() - END
		}

	//the_player() - END  
	}

//room - END
};