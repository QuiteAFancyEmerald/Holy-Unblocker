var game = {

	room: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'room',
		
		grid_width: 13,
		grid_height: 19,
		collision_nodes: [
		
		//chair
		'7-9', 
		
		//shelf
		'0-14', '0-15', '1-15', '1-14',
		
		//bed
		'0-4', '0-5', '0-6', '0-7', '0-8', '0-9',
		'1-4', '1-5', '1-6', '1-7', '1-8', '1-9',
		'2-4', '2-5', '2-6', '2-7', '2-8', '2-9',
		
		//desk
		'11-7', '11-8', '11-9', '11-10',
		'12-7', '12-8', '12-9', '12-10',
		
		//plant
		'10-1'
		
		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
			
			//check if intro scene has been played
			if ( $.inArray("scene_intro", played) === -1 ) {

				//add information that scene has been played
				var get_played = $.jStorage.get('played');

				get_played.push('scene_intro');
				
				$.jStorage.set('played', get_played);

				//player is confused
				$('#player').text_cloud('Where am I?', 2000);
			}

			//item becomes transparent when certain tiles are hovered - ('target'), ('tile1, tile2, etc.')
			room.transparency( $('#chair'), $('#6-9, #6-8, #7-8, #5-8, #5-7, #4-6, #4-7') );
			room.transparency( $('#bed, #bed_mask'), $('#2-3, #1-3, #0-3, #1-2, #0-2') );
			room.transparency( $('#desk, #desk_mask'), $('#12-6, #11-5, #11-6, #10-10, #10-9, #10-8, #10-7, #10-6, #10-5, #9-9, #9-8, #9-7, #9-6, #9-5') );
			room.transparency( $('#shelf, #shelf_mask'), $('#1-13, #0-13, #0-12') );
			room.transparency( $('#plant'), $('#9-1, #9-0, #10-0') );
			
			//pulsing light
			room.pulse( $('#glow'), 5000 );

			//assign tooltips
			$('#window, #door_exit, #plant_check').tooltip('left');
			$('#the_game').find('#note').tooltip('right');
			$('#water, #picture').tooltip('right');
			
			//bubbles!
			$('#bubbles').sprite({
				fps: 8,
				no_of_frames: 8
			});

			/* ===ITEMS=== */

			//look through the window
			$('#window').click(function () {

				//on click goes to the specified target, then fires function (or not ;) )
				room.the_player.go_to.start({
				
					target: '5-0',
					
					action: function() { view.start([['aquarium_view', '3000', '10'], ['boiler_room_view', '5000', '4'], ['corridor_view', '4000', '8']], function() {
						if ( $.inArray("scene_furnace", played) !== -1 ) {
							$('#corridor_view').addClass('leaves');

								var boiler_room_view = $('#boiler_room_view'),
									one = $('<div class="smoke one" />').appendTo(boiler_room_view),
									two = $('<div class="smoke two" />').appendTo(boiler_room_view),
									tri = $('<div class="smoke tri" />').appendTo(boiler_room_view);

								var smoke = function(item) {
									item.css('opacity', '1').transition({x:-50, y:-100, scale:3, opacity:0}, 5000, 'in-out', function() {
										item.transition({x:0, y:0, scale: 1}, (Math.random() * 5 + 1)*100, function() {
											smoke(item);
										});
									});
								}

								smoke(one);
								setTimeout(function() {smoke(two)}, 1000);
								setTimeout(function() {smoke(tri)}, 2000);

						}
					}) }  
				
				});
				
			});
	
			//take note
			$('#the_game').find('#note').click(function () {

				room.the_player.go_to.start({
				
					target: '10-8',
					
					action: function() {

						items.take('#note');  

					}  
				
				});
				
			});

			if ( $.inArray("scene_furnace", played) !== -1 ) {
				$('#picture_winter').css('background', 'none');
				$('#plant')
				.removeClass('small');
			}
			
			//go to the corridor
					 
			$('#door_exit').click(function () {
				
				room.the_player.go_to.start({
					
						target: '6-18',
						
						action: function() {
						
							//check if player has got the key
							if ( $.inArray("key", collected) === -1) { 
	
								sound_door_locked.play();
								$('#player').text_cloud('Locked!', 1000); 
							
							} else if ( $.inArray("key", used) === -1) {
							
								items.use('#key');
	
								$('#option_0').click(function() {
	
									dialogue_box.destroy();
									sound_door.play();
									game.corridor(14,0);
									
								});
							
							} else {
								sound_door.play();
								game.corridor(14,0);
							
							}
	
						}  
					
				});
				
			});
			
			//go to the aquarium
			$('#water').click(function () {

				room.the_player.go_to.start({
				
					target: '2-15',
					
					action: function() {
					
						if ( $.inArray("key", collected) === -1) {
						
							//disables clicking
							scene.no_click(true);
						
							room.center(true,2000);
						
							$(room.player_body())
							.css('background-position','-310px 0')
							.animate({ opacity: 0 }, 2000);
	
							$('#player').text_cloud('This aquarium is... Strange', 1500);
	
							setTimeout(function() {
	
								//enables clicking
								scene.no_click(false);
								sound_teleport.play();
								game.aquarium(20,5);  
							
							}, 2000);
						
						} else {
								sound_teleport.play();
								game.aquarium(20,5); 
						
						}

					}  
				
				});
				
			});

			//go to the picture
			$('#picture').click(function () {

				room.the_player.go_to.start({
				
					target: '3-6',
					
					action: function() {
						sound_teleport.play();
						if ( $.inArray("scene_furnace", played) === -1 ) {
							game.picture_snow(7, 8); 
						} else {
							game.picture(7, 8); 
						}
					}  
				
				});
				
			});
		
		//execute - END  
		}
		
		});

	//room - END
	},
	
	aquarium: function(x,y) {
	
		//generates aquarium
		room.generate({
		
		inject:'aquarium',
		
		grid_width: 23,
		grid_height:11,
		
		collision_nodes: [
		
		//"dead" area
		'0-0', '0-1', '0-2', '0-3', '0-7', '0-8', '0-9', '0-10',
		'1-0', '1-1', '1-2', '1-9', '1-10',
		'2-0', '2-1', '2-2', '2-10',
		'3-0', '3-10',
		'7-0', '7-10',
		'8-0', '8-10',
		'9-0', '9-1', '9-9', '9-10',
		'10-0', '10-1', '10-2', '10-3', '10-7', '10-8', '10-9', '10-10',
		'11-0', '11-1', '11-2', '11-3', '11-4', '11-6', '11-7', '11-8', '11-9', '11-10',
		'12-0', '12-1', '12-2', '12-3', '12-4', '12-6', '12-7', '12-8', '12-9', '12-10',
		'13-0', '13-1', '13-2', '13-3', '13-4', '13-6', '13-7', '13-8', '13-9', '13-10',
		'14-0', '14-1', '14-2', '14-3', '14-4', '14-6', '14-7', '14-8', '14-9', '14-10',
		'15-0', '15-1', '15-2', '15-3', '15-4', '15-6', '15-7', '15-8', '15-9', '15-10',
		'16-0', '16-1', '16-2', '16-3', '16-4', '16-6', '16-7', '16-8', '16-9', '16-10',
		'17-0', '17-1', '17-2', '17-3', '17-4', '17-6', '17-7', '17-8', '17-9', '17-10',
		'18-0', '18-1', '18-2', '18-3', '18-7', '18-8', '18-9', '18-10',
		'19-0', '19-1', '19-2', '19-8', '19-9', '19-10',
		'20-0', '20-1', '20-2', '20-8', '20-9', '20-10',
		'21-0', '21-1', '21-2', '21-8', '21-9', '21-10',
		'22-0', '22-1', '22-2', '22-3', '22-7', '22-8', '22-9', '22-10',
		
		//rock 1
		'8-3',
		
		//rock 2
		'5-6', '5-7',
		'6-6', '6-7',
		'7-6', '7-7', '7-8', '7-9',
		
		//rock 3
		'4-2', '5-2',
		
		//rock 4
		'1-4', '1-5',
		'2-4', '2-5',
		
		//rock 5
		'3-8', '3-9'
		
		],
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:10,
		
		execute: function() {
			
			var gate = $('#gate_left, #gate_right');

			//item becomes transparent when certain tiles are hovered - ('target'), ('tile1, tile2, etc.')
			room.transparency( gate, $('#12-5, #11-5, #10-4, #10-5, #10-6, #9-2, #9-3, #9-4, #9-5, #9-6, #9-7, #8-1, #8-2, #8-4, #7-0, #7-1, #7-2, #6-0, #6-1') );
			room.transparency( $('#rock_1'), $('#6-1, #6-2, #7-2') );
			room.transparency( $('#rock_2'), $('#3-4, #4-5, #4-6, #5-5') );
			room.transparency( $('#rock_3'), $('#3-1, #4-1, #4-2') );
			room.transparency( $('#rock_4, #rock_4_mask'), $('#0-3, #0-4, #1-3') );
			room.transparency( $('#rock_5'), $('#1-6, #2-6, #2-7, #3-7') );
			 
			//assign tooltips
			$('#the_game').find('#key').tooltip('left');
			$('#exit').tooltip('left');

			/* ===ITEMS=== */
			
			//check if players has collected the key
			
			if ( $.inArray("key", collected) === -1) {
			
			$('#teleport, #exit').hide();
			
				setTimeout(function() {
	
					$('#player').text_cloud('Teleport!? ...', 2000);
					
				} , 5000);
			
			}
			
			$('#exit')
			.hover(function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '140px',
					'height': '140px',
					'opacity': '.3',
					'margin': '-71px 0 0 -71px'
				});
			}, function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '40px',
					'height': '40px',
					'opacity': '.6',
					'margin': '-21px 0 0 -21px'
				});
			})
			.click(function () {

				room.the_player.go_to.start({
	
					target: '20-5',
					
					action: function() {
						sound_teleport.play();
						game.room(2,15);  

					}  
				
				});
				
			});
		
			npc.fish.swim();

		//execute - END  
		}
		
		});

	//aquarium - END
	},
	
	picture: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'picture',
		
		grid_width: 11,
		grid_height: 12,
		
		collision_nodes: [
		
		//"dead" area
		'0-0', '0-1', '0-2', '0-3', '0-10', '0-11', '1-0', 
		'1-1', '1-2', '1-11', 
		'2-0', 
		'3-0', 
		'4-0', '4-1', 
		'5-0', '5-1', 
		'7-0', '7-11', 
		'8-0', '8-11', 
		'9-0', '9-1', '9-10', '9-11', 
		'10-0', '10-1', '10-2', '10-3', '10-8', '10-9', '10-10', '10-11'
		
		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
			
			$('body').css('background', '#fefeca');
		
			$('#gate, #exit').tooltip('right');

			//go to the room
			$('#the_game').find('#exit')
			.hover(function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '140px',
					'height': '140px',
					'opacity': '.3',
					'margin': '-71px 0 0 -71px'
				});
			}, function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '40px',
					'height': '40px',
					'opacity': '.6',
					'margin': '-21px 0 0 -21px'
				});
			})
			.click(function () {
				room.the_player.go_to.start({
					target: '7-8',
					action: function() {
						sound_teleport.play();
						game.room(3,7);  
					}  
				});
			});

			//go to the fridge
			$('#gate').click(function () {
				room.the_player.go_to.start({
					target: '0-6',
					action: function() {
						sound_teleport.play();
						game.fridge(5,2);  
					}  
				});
			});

		//execute - END  
		}
		
		});

	//picture - END
	},

	picture_snow: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'picture_snow',
		
		grid_width: 11,
		grid_height: 12,
		
		collision_nodes: [
		
		//"dead" area
		'0-0', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6', '0-7', '0-8', '0-10', '0-11', '1-0', 
		'1-1', '1-2', '1-6', '1-7', '1-11', 
		'2-0', '2-1', '2-2', 
		'3-0', '3-1', '3-2', 
		'4-0', '4-1', 
		'5-0', '5-1', 
		'7-0', '7-11', 
		'8-0', '8-11', 
		'9-0', '9-1', '9-10', '9-11', 
		'10-0', '10-1', '10-2', '10-3', '10-8', '10-9', '10-10', '10-11'

		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
			
			$('body').css('background', '#cff3f3');

			//take a twig
			var twig = $('#the_game').find('#twig');
			$('#3-3, #the_game #twig').hover(function() {
				twig.css('z-index', '1000');
			}, function() {
				twig.css('z-index', '1');
			});
			twig.click(function () {
				room.the_player.go_to.start({
					target: '3-3',
					action: function() {
						items.take('#twig');  
					}  
				});
			});

			//go to the room
			$('#the_game').find('#exit')
			.hover(function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '140px',
					'height': '140px',
					'opacity': '.3',
					'margin': '-71px 0 0 -71px'
				});
			}, function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '40px',
					'height': '40px',
					'opacity': '.6',
					'margin': '-21px 0 0 -21px'
				});
			})
			.click(function () {
				room.the_player.go_to.start({
					target: '7-8',
					action: function() {
						sound_teleport.play();
						game.room(3,7);  
					}  
				});
			});

		//assign tooltips
		$('#exit, #the_game #twig').tooltip('left');
		
		//execute - END  
		}
		
		});

	//picture - END
	},

	corridor: function(x,y) {
	
		//generates corridor
		room.generate({
		
		inject:'corridor',
		
		grid_width: 21,
		grid_height: 7,
		
		collision_nodes: [
		
		//phone
		'8-0', '8-1', '9-0', '9-1'
		
		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:100,
		
		execute: function() {
			 
			//play scene
			scene.corridor();
		
			//item becomes transparent when certain tiles are hovered - ('target'), ('tile1, tile2, etc.')
			room.transparency( $('#phone, #phone_mask'), $('#6-0, #7-0, #7-1') );
			room.transparency( $('#handrail'), $('#0-6, #1-6, #2-6, #3-6, #4-6, #0-5, #1-5, #2-5, #3-5, #0-4, #1-4, #2-4') );
			
			//pulsing light
			room.pulse( $('#glow'), 5000 );

			//assign tooltips
			$('#door_room, #door_kitchen, #door_toilet, #door_bathroom, #phone_use, #stairs').tooltip('left');
			$('#door_big_room, #window').tooltip('right');
			
			//go to the hidden corridor
			var go_hidden = function() {
				$('#door_hidden_corridor').click(function () {
					room.the_player.go_to.start({
						target: '9-0',
						action: function() {
							game.hidden_corridor(1,18);  
						}  
					});
				});
			}

			/* ===ITEMS=== */

			//reveal the secret door (using phone)
			//first check if it has been already done
			if ( $.inArray("scene_corridor_phone", played) !== -1 ) {
				$('#phone, #phone_mask, #phone_shadow').remove();
				//overwrite collision nodes
				room.settings.collision_nodes = [];
				$('#8-0, #8-1, #9-0, #9-1').removeClass('collision');
				$('#hidden_door').css('height', '246px');
				$('<div id="door_hidden_corridor" data-tooltip="Go to the corridor" />')
				.appendTo('#corridor')
				.tooltip('left');
			} else {
				$('#phone_use').click(function () {
					room.the_player.go_to.start({
						target: '8-2',
						action: function() {
							$('#phone_use').remove();
							scene.corridor_phone();
							//overwrite collision nodes
							room.settings.collision_nodes = [];
							$('#8-0, #8-1, #9-0, #9-1').removeClass('collision');
							$('<div id="door_hidden_corridor" data-tooltip="Go to the corridor" />')
							.appendTo('#corridor')
							.tooltip('left');

							go_hidden();
						}  
					});
				});
			}

			//window view
			$('#window').click(function() {
				room.the_player.go_to.start({
					target: '0-2',
					action: function() { view.start([['start_room_view', '3000', '10'], ['aquarium_view', '2700', '-8'], ['picture_snow', '3000', '-2']], function() {
						$('#window_middle').remove();
						if ( $.inArray("scene_furnace", played) !== -1 ) {
							$('#picture_snow').addClass('no_snow');
						}
					}) }
				});
			});

			//kitchen door are blocked
			var overwrite = function() {
				$('#door_kitchen').remove();
				$('#true_form, #true_form_2, #true_form_3').css('opacity', 1);
			}
			if ($.inArray("scene_furnace", played) !== -1 && $.inArray("scene_corridor_phone", played) === -1 ) {
				overwrite();
				//overwrite collision nodes
				room.settings.collision_nodes = ['5-0', '5-1', '8-0', '8-1', '9-0', '9-1'];
				$('#5-0, #5-1, #8-0, #8-1, #9-0, #9-1').addClass('collision');
			} else if ($.inArray("scene_furnace", played) !== -1) {
				overwrite();
				room.settings.collision_nodes = ['5-0', '5-1'];
				$('#5-0, #5-1').addClass('collision');
			}

			//go to the room
			$('#door_room').click(function () {

				room.the_player.go_to.start({
				
					target: '14-0',
					
					action: function() {
						sound_door.play();
						game.room(6,18);  

					}  
				
				});
				
			});
			
			//go to the hidden corridor
			go_hidden();

			//go to the kitchen
			$('#door_kitchen').click(function () {

				room.the_player.go_to.start({
				
					target: '4-0',
					
					action: function() {
						sound_door.play();
						game.kitchen(4,18);  

					}  
				
				});
				
			});

			//go to the toilet
			$('#door_toilet').click(function () {
				room.the_player.go_to.start({
					target: '11-6',
					action: function() {
						sound_door.play();
						game.toilet(2,0);  
					}  
				});
				
			});

			//go to the bathroom
			$('#door_bathroom').click(function () {
				room.the_player.go_to.start({
					target: '18-6',
					action: function() {
						sound_door.play();
						game.bathroom(5,0);  
					}  
				});
				
			});

			//go to the big room
			var lightbox = $('#lightbox'),
				keypad = $('#keypad');
			$('#door_big_room').click(function () {
				room.the_player.go_to.start({
					target: '20-3',
					action: function() {
						if ( $.inArray("scene_keypad", played) === -1 ) {
							lightbox
							.fadeIn()
							.load('keypad.html', function() {
								var code = [],
									close = function() {
										$('#keypad').remove();
										lightbox.fadeOut();
									};
								if (window.turned_on === 'on') {
									$('#keypad')
									.removeClass('off')
									.addClass('on');
									$('input').click(function() {
										code.push($(this).val());
										sound_button.play();
										if (code.length === 6 && code.join('') === '854269') {
											sound_beep.play();
											$('#keypad').find('.on').css('box-shadow', 'none');
											$('#keypad').find('.on').append('<div class="pass" />');
											setTimeout(function() {
												//add information that scene has been played
												var get_played = $.jStorage.get('played');
												get_played.push('scene_keypad');
												$.jStorage.set('played', get_played);
												close();
												sound_door.play();
												game.big_room(0,6);
											}, 500);
										} else if (code.length === 6) {
											code = [];
											sound_wrong.play();
											$('#keypad').find('.on')
											.animate({opacity: .5}, 200)
											.animate({opacity: 1}, 200)
											.animate({opacity: .5}, 200)
											.animate({opacity: 1}, 200);
										}
										return false;
									//click - END
									});
								// turned_on - END
								} else {
									$('input').click(function() {
										return false;
									});
								}

								lightbox.on('click', '.close', function() {
									close();
									if (window.turned_on !== 'on' && $.jStorage.get('is_in') === 'corridor') {
										$('#player').text_cloud('Looks like it\'s turned off.', 2000);
									}
								});
							// load - END	
							}); 
						//condition - END
						} else {
							sound_door.play();
							game.big_room(0,6);
						}
					//action - END	
					}  
				});
			});
		
			$('#stairs').on('click', function() {
				room.the_player.go_to.start({
					target: '6-6',
					action: function() {
						if ( $.inArray("scene_void_shower", played) === -1 ) {
							$('#sprite').css('background-position', '-620px 0');
							scene.no_click(true, 'rgba(0, 0, 0, .3)');
							$('#settings, #button, #switch_sound').addClass('dim');
							$('#player').text_cloud('I... I don\'t think it\'s a good idea to go there.', 2000);
							setTimeout(function() {
								dialogue_box.display({
									character:false,
									picture:false,
									text: 'Would you like to step into the darkness?',
									options: ['Ok', 'No!']
								}, 'small');
						
								$('#options').on('click', '#option_1', function() {
									$('#settings, #button, #switch_sound').removeClass('dim');
									dialogue_box.destroy();
								});
								
								$('#options').on('click', '#option_0', function() {
									setTimeout(function() {
										$('#settings, #button, #switch_sound').removeClass('dim');
										scene.no_click(false);
									}, 1000);
									game.void(11,11);
								});

							}, 2000);
						} else {
							$('#sprite').css('background-position', '-620px 0');
							$('#player').text_cloud('There\'s NO WAY I\'m going there!', 2000);
						}
					}
				});
			});

		//execute - END  
		}
		
		});

	//corridor - END
	},
	
	hidden_corridor: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'hidden_corridor',
		
		grid_width: 3,
		grid_height: 19,
		collision_nodes: ['1-0'],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {

		var switch_use = $('#switch_use'),
			door = $('#door_corridor'),
			peephole_use = $('#peephole_use');

		//assign tooltips
		door.tooltip('left');
		switch_use.tooltip('left');
		peephole_use.tooltip('right');

		//light spot reacts on player position
		var spot = $('#spot'),
			peephole = $('#peephole'),
			player = $('#player');
		clearInterval(window.timer_light);
		clearInterval(window.timer_discharge);
		window.timer_light = setInterval(function() {
			var zindex = $(player).css('z-index');
			if ( zindex === '10' || zindex === '12' || zindex === '14' || zindex === '29' || zindex === '33') {
				$(spot).css('opacity', .6);
				$(peephole).css('opacity', .8);
			} else if (zindex === '31') {
				$(spot).css('opacity', .4);
				$(peephole).css('opacity', .6);
			} else if(zindex === '50') {
				$(spot).css('opacity', .2);
				$(peephole).css('opacity', .4);
			} else {
				$(spot).css('opacity', 1);
				$(peephole).css('opacity', 1);
			}
		}, 100);

		//electrical discharge
		var discharge = $('#discharge');
		$(discharge).sprite({
			no_of_frames:3
		});
		function repeat_discharge() {
			window.timer_discharge = setTimeout(function(){
				$(discharge)
				.css('opacity', 1);
				sound_buzz.play();
				window.timer_discharge = setTimeout(function() {
					soundManager.stop('sound_buzz');
					$(discharge)
					.css('opacity', 0);
					repeat_discharge();
				}, (Math.random() * 5 + 1)*100);
			}, (Math.random() * 4 + 1)*1000);
		}
		repeat_discharge();

		//use switch
		var switcher = $('#switch'),
			time_limit = 23;
		window.turned_on = window.turned_on === 'on' ? 'on' : 'off';
		if (window.turned_on === 'on') switcher.css('background-position', '0 -71px');
		$(switch_use).click(function() {
			if (window.turned_on === 'off') {
				room.the_player.go_to.start({
					target: '1-1',
					action: function() {
						sound_switch.play();
						switcher.css('background-position', '0 -71px');
						window.turned_on = 'on';
						var counter = 1,
							indicator = $('<div id="indicator">22</div>').appendTo('body');
						window.timer_counter = setInterval(function() {
							console.log('counting...');
							counter++;
							switch_use.attr('data-tooltip', (time_limit - counter) + ' seconds remaining');
							indicator.text((time_limit - counter));
						}, 1000);
						window.timer_switch = setTimeout(function() {
							switch_use.attr('data-tooltip', 'Use the switch');
							window.turned_on = 'off';
							sound_switch.play();
							$('#switch').css('background-position', '0 0');
							indicator.remove();
							console.log('time out');
							clearInterval(window.timer_counter);
							//close the keypad :->
							$('#keypad').remove();
							$('#lightbox').fadeOut();
						}, time_limit * 1000);
					}  
				});	
			}
		});

		//go to the corridor
		door.click(function () {
			room.the_player.go_to.start({
				target: '1-18',
				action: function() {
					clearInterval(window.timer_light);
					clearInterval(window.timer_discharge);
					game.corridor(9,0);
					setTimeout(function() {
						scene.explosion();
						}, 2000);
				}  
			});
		});

		//outside view
		peephole_use.click(function() {
			room.the_player.go_to.start({
				target: '2-6',
				action: function() {
					player.find('#sprite').css('background-position', '-930px 0');

					$('<div/>', {
							id: 'white'
					})
					.appendTo('body')
					.css('opacity','0')
					.animate({opacity:1}, 1000, function() {
						clearInterval(window.timer_light);
						clearInterval(window.timer_discharge);
						setTimeout(function() {
							$('#white').animate({opacity:0}, 500, function() {
								$('#white').remove();
							});
							if ($.inArray("scene_outside", played) === -1) {
								scene.fish_unite(true);
							} else {
								scene.fish_unite();
							}
						}, 500);
					});
				}  
			});
		});

		//execute - END  
		}
		
		});

	//hidden_corridor - END
	
	},

	kitchen_true: function(x,y) {
	
		//generates corridor
		room.generate({
		
		inject:'kitchen_true',
		
		grid_width: 9,
		grid_height: 19,
		
		collision_nodes: [
		
		'0-1', '0-2', '0-3', '0-4', '0-5', '0-6', '0-7', '0-8', '0-9', '0-10', '0-11', '0-12', '0-13', '0-14', '0-15', '0-16', '0-17', 
		'1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10', '1-11', '1-12', '1-13', '1-14', '1-15', '1-16', '1-17', 
		'5-10', '5-11', 
		'6-7', '6-8', '6-9', '6-10', '6-11', '6-12', 
		'7-0', '7-1', '7-2', '7-5', '7-6', '7-7', '7-8', '7-9', '7-10', '7-11', '7-12', '7-13', '7-14', '7-15', '7-16', '7-17', '7-18', 
		'8-0', '8-1', '8-2', '8-5', '8-6', '8-7', '8-8', '8-9', '8-10', '8-11', '8-12', '8-13', '8-14', '8-15', '8-16', '8-17', '8-18'
		
		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
		
			//item becomes transparent when certain tiles are hovered - ('target'), ('tile1, tile2, etc.')
			room.transparency( $('#fridge'), $('#6-1, #5-0') );
			room.transparency( $('#table, #table_mask'), $('#4-3, #4-4, #4-5, #4-6, #4-7, #4-8, #5-4, #5-5, #5-6, #5-7, #5-8, #5-9, #6-4, #6-5, #6-6') );
			room.transparency( $('#branches'), $('#6-15, #6-14, #6-13, #5-14, #5-13, #5-12, #5-11, #4-12, #4-11, #4-10, #3-11, #3-10, #3-8, #3-7, #3-6, #3-5, #2-10, #2-9, #2-4, #2-5, #2-6, #1-4, #1-5'));
			
			//pulsing light
			room.pulse( $('#glow'), 5000 );

			var $the_green_guy = $('#the_green_guy');

			//assign tooltips
			$('#fridge_use').tooltip('left');
			$the_green_guy.tooltip('right');
			/* ===ITEMS=== */

			var creature = $('#table'),
				eye = $('#eye');

			if ($.inArray("scene_computer", played) !== -1) {
				window.eye = setInterval(function() {
					eye
					.sprite({no_of_frames:5, play_frames: 5});
				}, (Math.random() * 10 + 1)*1000);

				$the_green_guy.remove();

				setTimeout(function() {
					if ( $.inArray("scene_unite", played) === -1 ||  $.inArray("scene_outside", played) === -1 ) {
						creature.text_cloud('You\'re not ready yet', 2000);
						setTimeout(function() {
							creature.text_cloud('You have to be at least partially complete to travel...', 2000);
						}, 3500);
					} else {
						scene.no_click(true, 'rgba(0,0,0,.1)');
						creature.text_cloud('You\'re ready. You can go now...', 5000);
						
						setTimeout(function() {

							room.the_player.go_to.start({
							
								target: '3-4',
								
								action: function() {
									$('#sprite').css('background-position', '-620px 0');
									$('#player').text_cloud('But... Where?', 2000);
									setTimeout(function() {
										creature.text_cloud('To meet with yourself.', 4000);

										sound_woosh.play({volume: 120});
										$('#light').animate({'opacity': 1}, 500, function() {
											$('#player').css('opacity', 0);
											$('#faux-player')
												.css('opacity', 1)
												.sprite({no_of_frames:5, play_frames: 5})
												.animate({top: '-=50px'}, 500)
												.animate({
													top: -233,
													right: 65,
													opacity: 0
												}, 500, function() {
													var $el = $(this);
													$el
														.appendTo('body')
														.css({
															opacity: 0,
															left: '50%',
															top: '50%',
															margin: '-155px 0 0 -155px',
															backgroundPostion: '0 -310px'
														})
														.delay(2000)
														.animate({opacity: 1}, 500);
													$el.addClass('levitate');
														setTimeout(function() {
															soundManager.stopAll();
															sound_train.play();
															$el
																.spState(2)
																.spStop(true)
																.sprite({no_of_frames:5, play_frames: 5})
																.spStart()
																.animate({opacity: 0}, 2000, function() {
																	scene.cabin();
																});
														}, 5000);
													$('#kitchen_true').animate({opacity: 0}, 500);
												});
										});

									}, 2500);
								}  
							
							});

						}, 5000);
					}
				}, 1000);
			} else {
				eye.remove();
			}

			//go to the fridge
			$('#fridge_use').click(function () {
				room.the_player.go_to.start({
					target: '7-3',
					action: function() {
						clearInterval(window.eye);
						sound_teleport.play();
						game.fridge(0,2);  
					}  
				});
			});
		
		//execute - END  
		}
		
		});

	//kitchen_true - END
	},

	kitchen: function(x,y) {
	
		//generates corridor
		room.generate({
		
		inject:'kitchen',
		
		grid_width: 9,
		grid_height: 19,
		
		collision_nodes: [
		
		//cupboard
		'0-3', '0-4', '0-5', '0-6', '0-7', '0-8', '0-9', '0-10', '0-11', '0-12', '0-13', '0-14', '0-15', '0-16', 
		'1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10', '1-11', '1-12', '1-13', '1-14', '1-15', '1-16',
		
		//table + chair
		'6-7', '6-8', '6-9', '6-10',
		'7-5', '7-6', '7-7', '7-8', '7-9', '7-10',
		'8-7', '8-8', '8-9', '8-10',
		
		//fridge
		'7-0', '7-1', '7-2',
		'8-0', '8-1', '8-2'
		
		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
		
			//item becomes transparent when certain tiles are hovered - ('target'), ('tile1, tile2, etc.')
			room.transparency( $('#cupboard, #cupboard_mask'), $('#0-1, #0-2, #1-2') );
			room.transparency( $('#table, #table_mask, #chair'), $('#4-5, #4-6, #4-7, #4-8, #5-4, #5-5, #5-6, #5-7, #5-8, #5-9, #6-4, #6-5, #6-6') );
			room.transparency( $('#fridge'), $('#5-0, #6-0, #6-1') );
			
			//pulsing light
			room.pulse( $('#glow'), 5000 );

			//assign tooltips
			$('#door_kitchen').tooltip('left');
			$('#window').tooltip('left');
			
			/* ===ITEMS=== */

			//look through the window
			$('#window').click(function () {

				//on click goes to the specified target, then fires function (or not ;) )
				room.the_player.go_to.start({
					target: '2-0',
					action: function() { view.start([['big_room_view', '5000', '5'], ['start_room_view', 3000, -3], ['bathroom_view', 1589, -2]], function() {
						if ( $.inArray("scene_explosion", played) === -1 ) {
							$('#big_room_view')
							.append('<div id="building" />')
							.append('<div id="baloon" />');
							var baloon = function() {
								$('#baloon')
								.transition({rotate:-1, y: -5}, 2000)
								.transition({rotate:1.5, y: 5}, 2200, function() {
									baloon();
								})
							} 
							baloon();
						} else {
							$('#big_room_view').addClass('explosion');
						}

					}) }  
				});
				
			});

			$('#kitchen_use_1, #kitchen_use_2, #kitchen_use_3').click(function() {
				$('#kitchen_kitchen_true').css('opacity', '.3');

				var kitchen = $('#kitchen');

				kitchen.css('rotate','1');
				setTimeout(function() {
					kitchen.css('rotate','-1');
				}, 100);
				setTimeout(function() {
					kitchen.css('rotate','0');
				}, 100);

				setTimeout(function() {
					$('#kitchen_kitchen_true').css('opacity', '0');
				}, 100);
			});

			//go to the corridor
			$('#door_kitchen').click(function () {

				room.the_player.go_to.start({
				
					target: '4-18',
					
					action: function() {
						sound_door.play();
						game.corridor(4,0);  

					}  
				
				});
				
			});
		
		//execute - END  
		}
		
		});

	//kitchen - END
	},

	toilet: function(x,y) {

		//generates start room
		room.generate({
		
		inject:'toilet',
		
		grid_width: 5,
		grid_height: 5,
		collision_nodes: ['2-4', '2-3'],
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:150,
		
		execute: function() {

		var door = $('#door_corridor'),
			cord = $('#cord'),
			switch_use = $('#cord_use');

		room.transparency( $('#wc, #cord'), $('#0-3, #0-2, #1-4, #1-3, #1-2') );

		//assign tooltips
		switch_use.tooltip('left');
		door.tooltip('left');

		//teleport to the boiler room
		switch_use.click(function() {
			room.the_player.go_to.start({
				target: '1-3',
				action: function() { 
					sound_creak.play();
					cord.css('top', -108+20);
					$('#sprite').css('background-position', '-620px 0px');
					setTimeout(function() {cord.css('top', -108)}, 900); 
					setTimeout(function() {
						sound_teleport.play();
						game.boiler_room(8, 0);
					}, 2000); 
				} 
			});
		});

		//go to the corridor
		door.click(function () {
			room.the_player.go_to.start({
				target: '2-0',
				action: function() {
					sound_door.play();
					game.corridor(11,6);
				}  
			});
		});

		//execute - END  
		}
		
		});

	//toilet - END
	},

	bathroom_setup: function() {

		room.transparency( $('#bathtube'), $('#3-2, #3-3, #3-4, #3-5, #3-6, #3-7, #4-2, #4-3, #4-4, #4-5, #4-6, #4-7, #4-8, #5-2, #5-3, #6-2, #6-3, #7-3') );

		//go to the corridor
		$('#door_corridor').click(function () {
			room.the_player.go_to.start({
				target: '5-0',
				action: function() {
					sound_door.play();
					game.corridor(18, 6);
				}  
			});
		});

		$('#mirror').click(function() {
			room.the_player.go_to.start({
				target: '3-2',
				action: function() {
					$('#sprite').css('background-position', '-310px 0');
					setTimeout(scene.mirror, 200);
				}
			});
		});

		if ( $.inArray("scene_shower", played) !== -1) {
			$('#curtain').css('opacity', 0);
			$('#curtain_folded').css('opacity', 1);
			$('#curtain_use').css('cursor', 'move');
		} else {
			$('#curtain_use').click(function() {
				room.the_player.go_to.start({
					target: '0-7',
					action: function() {	
						scene.bathroom_shower();
					}
				});
			});
		}

		//look through the window
		$('#window_use').click(function () {
			//on click goes to the specified target, then fires function (or not ;) )
			room.the_player.go_to.start({
				target: '3-8',
				action: function() { view.start([['big_room_view', 5000, 7], ['start_room_view', 3000, -5], ['kitchen_view', 2365, -2]], function() {
						$('#window_middle').css('left','40%');

						if ( $.inArray("scene_explosion", played) === -1 ) {
							$('#big_room_view')
							.append('<div id="building" />')
							.append('<div id="baloon" />');
							var baloon = function() {
								$('#baloon')
								.transition({rotate:-1, y: -7}, 2000)
								.transition({rotate:1.5, y: 7}, 2200, function() {
									baloon();
								})
							} 
							baloon();
						} else {
							$('#big_room_view').addClass('explosion');
						}

						if ( $.inArray("scene_furnace", played) !== -1 ) {
							$('#kitchen_view').addClass('true');
						}

					}) 
				}  
			});
		});
	// bathroom_setup
	},

	bathroom: function(x,y) {

		//generates start room
		room.generate({
		
		inject:'bathroom',
		
		grid_width: 8,
		grid_height: 9,
		collision_nodes: [
			'0-0', '0-1', '0-2', '0-3', '0-4', '0-5', 
			'1-0', '1-1', '1-2', '1-3', '1-4', '1-5', 
			'2-1', '2-2', '2-3',
			'5-4', '5-5', '5-6', '5-7', '5-8', 
			'6-4', '6-5', '6-6', '6-7', '6-8', 
			'7-4', '7-5', '7-6', '7-7', '7-8'
		],
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {

			game.bathroom_setup();

		//execute - END  
		}
		
		});

	//bathroom - END
	},

	big_room: function(x,y) {

		//generates start room
		room.generate({
		
			inject:'big_room',
			
			grid_width: 8,
			grid_height: 19,
			collision_nodes: [
				'0-0', '0-1', '0-2', '0-3', '0-13', '0-14', '0-15', '0-16', '1-0', 
				'1-13', '1-14', '1-15', '1-16', 
				'2-0', '2-13', '2-14', '2-15',
				'3-0', 
				'4-0', '4-14', 
				'7-0', '7-3'
			],
			
			drag_room:true,
			
			player: 'player',
			player_speed: 100,
			player_position_x: x,
			player_position_y: y,
			
			volume:0,
			
			execute: function() {

			room.transparency( $('#pillar'), $('#4-1, #5-1, #5-2, #6-2, #6-3') );
			room.transparency( $('#computer, #computer_mask'), $('#0-11, #0-12, #1-12') );
			room.transparency( $('#chair'), $('#2-11, #2-12, #2-13, #3-12, #3-13, #3-14, #4-13') );

			$('#computer_use, #door_corridor, #window_use').tooltip('right');

			//go to the corridor
			$('#door_corridor').click(function () {
				room.the_player.go_to.start({
					target: '0-6',
					action: function() {
						sound_door.play();
						game.corridor(20, 3);
					}  
				});
			});

			//look through the window
			$('#window_use').click(function () {

				//on click goes to the specified target, then fires function (or not ;) )
				room.the_player.go_to.start({
					target: '7-9',
					action: function() { view.start([['kitchen_view', '3000', '2'], ['toilet_view', '6000', '2'], ['fridge_view', '6000', '1']], function() {
						if ( $.inArray("scene_furnace", played) !== -1 ) {
							$('#kitchen_view').addClass('true');
						}
					}) }  
				});
				
			});


			var $computer = $('#computer_mask').add('#computer');

			if ($.inArray("scene_computer", played) !== -1 ) {
				$computer.addClass('off');
				$('#computer_use')
					.attr('data-tooltip', 'It doesn\'t work anymore...')
					.css('cursor', 'help');
			}

			$('#computer_use').click(function () {
				//on click goes to the specified target, then fires function (or not ;) )

				if ($.inArray("scene_computer", played) === -1 ) {

					room.the_player.go_to.start({
						target: '3-14',
						action: function() {

							var lightbox = $('#lightbox'),
								computer_screen = $('<div id="computer_screen" />').appendTo(lightbox);

							if ($('div.close') === -1) {
								lightbox.append('<div class="close" />');
							}
							lightbox.fadeIn();

							var noise_1 = $('<div id="noise_1" />').appendTo(computer_screen),
								noise_2 = $('<div id="noise_2" />').appendTo(computer_screen);

							computer_screen.append('<span id="completion">completion: <span class="progress one"></span><span class="progress two"></span><span class="progress"></span></span>');
							computer_screen.append('<div class="eye" />');

							if ($.inArray("scene_furnace", played) === -1 ) {
								computer_screen.css('background', '#111 url(images/big_room_kitchen.jpg) 50% 50% no-repeat');
								computer_screen.append('<span id="status">status: hidden</span>');
							} else {
								computer_screen.css('background', '#111 url(images/big_room_kitchen_true.jpg) 50% 50% no-repeat');
								computer_screen.append('<span id="status">status: revealed<br /> <span class="question">activate?</span> <span class="cursor"></span></span>');
							}

							if ( $.inArray("scene_unite", played) !== -1 &&  $.inArray("scene_outside", played) !== -1 ) {
								computer_screen.find('span.one, span.two').css('background', '#6add04');
							} else if ( $.inArray("scene_unite", played) !== -1 ||  $.inArray("scene_outside", played) !== -1 ) {
								computer_screen.find('span.one').css('background', '#6add04');		
							}

							var noisemaker = function() {
								noise_1.css('opacity', 0);
								noise_2.css('opacity', 1);
								window.computer_distortions = setTimeout(function() {
									noise_1.css('opacity', 1);
									noise_2.css('opacity', 0);
									window.computer_distortions = setTimeout(function() {
										noisemaker();
									}, 100);
								}, 100);
							};
							var cursor = function() {
								computer_screen.find('.cursor').css('opacity', 0)
								window.computer_distortions = setTimeout(function() {
									computer_screen.find('.cursor').css('opacity', 1)
									window.computer_distortions = setTimeout(function() {
										cursor();
									}, 1000);
								}, 1000);
							};
							noisemaker();
							cursor();

							var activate = function() {
								//add information that scene has been played
								var get_played = $.jStorage.get('played');
								get_played.push('scene_computer');
								$.jStorage.set('played', get_played);	
								
								$computer.addClass('off');
								$('#computer_use')
									.attr('data-tooltip', 'It doesn\'t work anymore...')
									.css('cursor', 'help');

								$('#status').text(']awe[∑ĽfWńĶ•');

								setTimeout(function() {
									$('#status').text('√®ńę©wweras');
								}, 500);

								setTimeout(function() {
									$('#status').text('');
								}, 1500);

								computer_screen.find('div.eye').animate({
									height:5
								}, function() {
									computer_screen.text_cloud('I\'m waiting...', 2000);
									setTimeout(function() {
										clearInterval(window.computer_distortions);
										computer_screen.empty().css('background', '#000');
										lightbox.fadeOut();
									}, 2500);
								});
							}

							$('#status').find('span.question, span.cursor').click(function() {						
								$('#status').find('span.question, span.cursor').off();
								activate();
							});

							$('div.close').click(function() {
								computer_screen.remove();
								clearInterval(window.computer_distortions);
								lightbox.fadeOut();
							});
						}  
					});

				} else {
					return false;
				}

			});

			//execute - END  
			}
		
		});

	//big room - END
	},

	boiler_room: function(x,y) {

		//generates start room
		room.generate({
		
		inject:'boiler_room',
		
		grid_width: 12,
		grid_height: 12,
		collision_nodes: [
			'0-4', '0-5', '0-6', '0-7', 
			'1-4', '1-5', '1-6', '1-7', 
			'2-4', '2-5', '2-6', '2-7', '2-8', 
			'3-4', '3-5', '3-6', '3-7', 
			'7-9', '7-10', '7-11', 
			'8-8', '8-9', '8-10', '8-11', 
			'9-8', '9-9', '9-10', '9-11', 
			'10-8', '10-9', '10-10', '10-11', 
			'11-8', '11-9', '11-10', '11-11'
		],
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		zdetection: function() {
			if ($('#player').attr('data-y') > 7) {
				return 100;
			} else {
				return false;
			}
		},
		execute: function() {

			soundManager.pause('boiler_room');
			room.transparency( $('#furnace'), $('#0-0, #0-1, #0-2, #0-3, #1-1, #1-2, #1-3, #2-2, #2-3, #3-3') );

			var furnace_use = $('#furnace_use'),
				body = $('#body');
			furnace_use.tooltip('right');

			var coal = $('#the_game').find('#coal');
			coal.tooltip('left');
			coal.click(function () {
				room.the_player.go_to.start({
					target: '7-8',
					action: function() {
						items.take('#coal');  
					}  
				});
			});

			var door = $('#door');
			door.tooltip('left');
			//go to the toilet
			door.click(function () {
				room.the_player.go_to.start({
					target: '8-0',
					action: function() {
						clearInterval(window.timer);
						room.settings.zdetection = function() {};
						sound_teleport.play();
						game.toilet(1, 3); 
					}  
				});
			});

			//interaction with the furnace
			if ( $.inArray("scene_furnace", played) === -1 ) {
				furnace_use.on('click', function () {
					room.the_player.go_to.start({
						target: '6-5',
						action: function() {
							$('#sprite').css('background-position', '-310px 0');
							npc.furnace.is_weak();
						}  
					});
				});
			} else {
				npc.furnace.furnace_use().remove();
				npc.furnace.burn();
				body.css({
					rotate: '0deg',
					top: 0
				});
				npc.furnace.random_moves();
				soundManager.resume('boiler_room');
			}

			//execute - END  
			}
		});
	// boiler room - END
	},

	fridge: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'fridge',
		
		grid_width: 9,
		grid_height: 6,
		
		collision_nodes: [
		
		//"dead" area
		'0-1', '0-4', '0-5', 
		'3-0', 
		'4-5', 
		'5-5', 
		'6-0', '6-5', 
		'7-0', '7-2', '7-5', 
		'8-0', '8-1', '8-2', '8-3', '8-5'
		
		],
		
		drag_room:true,
		room_glow: true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
			
			$('body').css('background', '#cff3f3');
		
			$('#entrance_use, #exit').tooltip('right');

			//go to the room
			$('#the_game').find('#exit')
			.hover(function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '140px',
					'height': '140px',
					'opacity': '.3',
					'margin': '-71px 0 0 -71px'
				});
			}, function() {
				$('#the_game').find('#teleport').find('.core')
				.css({
					'width': '40px',
					'height': '40px',
					'opacity': '.6',
					'margin': '-21px 0 0 -21px'
				});
			})
			.click(function () {
				room.the_player.go_to.start({
					target: '5-2',
					action: function() {
						sound_teleport.play();
						game.picture(0,6);  
					}  
				});
			});

			if ( $.inArray("scene_unite", played) === -1 ) {
				console.log('reday');
				$('#entrance, #entrance_use').hide();
				scene.release();
			} else {
				$('#diamond').hide();
			}

			//go to the true kitchen
			$('#entrance_use').click(function () {
				room.the_player.go_to.start({
					target: '0-2',
					action: function() {
						sound_teleport.play();
						game.kitchen_true(7,3);  
					}  
				});
			});

		//execute - END  
		}
		
		});

	//fridge - END
	},

	train: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'train',
		
		grid_width: 15,
		grid_height: 5,
		
		collision_nodes: [
		
		//"dead" area
		'0-0', '0-1', '0-4', '4-0', '4-1', '5-0', '5-2', '5-4', '6-0', '7-0', '8-0', '9-0', '10-0', '11-0', '12-0', '13-0', '14-0', '14-1', '14-4', '3-0'

		
		],
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
			
			scene.no_click(false);
			var $ticket = $('#ticket_inspector');

			if ($.inArray("darkness_retract3", played) !== -1) {
				$('#exit_sky').remove();
				$('#use_train_door')
					.on('click', function() {
						room.the_player.go_to.start({
							target: '2-0',
							action: function() {
								scene.no_click(true, 'rgba(0, 0, 0, .3)');
								$('#player').hide();
								$('#faux_player').show();

								setTimeout(function() {
									sound_sliding_door.play();
									$('#train_door').animate({
										left: 153,
										top: -262
									}, 500, function() {
										sound_train_start.play();
										var $ring_2 = $('#ring_2');
										$ring_2.removeClass('rotate');
										setTimeout(function() {
											$ring_2.addClass('rotate_faster');
										}, 100);
										$('#train').animate({
											left: $(window).width()/2 - 540,
											top: $(window).height()/2 + 30
										}, 2000);
										setTimeout(function() {
											$('#train_glow').animate({opacity: 1}, 500, function() {
												soundManager.stop('train');
												$('#settings, #button, #switch_sound').fadeOut();
												$('#train_container').animate({
													left: '-=5964px',
													top: '-=2580px'
												}, 1000, function() {
													sound_ekg.play();
													$('#train_platform').fadeOut(2000, function() {
														setTimeout(function() {
															$('<div id="ekg" />')
																.appendTo('body')
																.animate({
																	width: $(window).width(),
																	backgroundColor: '#31c116'
																}, 8200, 'linear', function() {
																	soundManager.stopAll();
																	$('#ekg').fadeOut(4000, function() {
																		$.jStorage.flush();
																		window.location.reload();
																	});
																});
														}, 1000);
													});
												});
											});
										}, 5000);
									});
								}, 500);
							}
						});
					})
					.tooltip('left');
			} else {
				$('#use_train_door').remove();
			}

			if($.inArray("cabin_scene", played) === -1) {
				setTimeout(function() {
					$ticket.text_cloud('Good luck!', 1000);
				}, 1000);
				setTimeout(function() {
					sound_sliding_door.play();
					$('#train_door').animate({
						left: 153,
						top: -262
					}, 500);
					var get_played = $.jStorage.get('played');
					get_played.push('cabin_scene');
					$.jStorage.set('played', get_played);
				}, 2000);
			} else if ($.inArray("darkness_retract3", played) !== -1) {
				$ticket.hide();
			} else {
				$('#train_door').css({
					left: 153,
					top: -262
				});
			}

			if($.inArray("darkness_retract3", played) !== -1) {
				$('#door_dark_corridor').remove();
			}

			$('#door_dark_corridor').on('click', function() {
				room.the_player.go_to.start({
					target: '12-4',
					action: function() {
						game.last_corridor(0,4);
					}
				});
			});

		//execute - END  
		}
		
		});

	//train - END
	},

	last_corridor: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'last_corridor',
		
		grid_width: 5,
		grid_height: 46,

		collision_nodes: [],
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,

		volume:50,

		execute: function() {
			
			var $door_train = $('#door_train'),
				$playerS = $('#sprite'),
				$darkPlr = $('#dark_player'),
				$darkness = $('#darkness'),
				$lightbox = $('#lightbox_led').hide(),
				$close = $lightbox.find('.close');

			var $led1 = $('#use_led_1'),
				$led2 = $('#use_led_2'),
				$led3 = $('#use_led_3');

			var $light1 = $('#fluorescent_2'),
				$light2 = $('#fluorescent_3'),
				$light3 = $('#fluorescent_4');

			$door_train
				.add($led1)
				.add($led2)
				.add($led3)
				.tooltip('right');

			$darkness
				.children('div')
				.add($darkPlr)
				.tooltip('left');

			$door_train.on('click', function() {
				room.the_player.go_to.start({
					target: '0-4',
					action: function() {
						game.train(12,4);
					}
				});
			});

			setTimeout(function() {
				$playerS.css('background-position', '-620px 0');
				scene.darkness1();
			}, 100);

			// LEDs puzzle
			var ledsPuzzle = function(thePattern, upperLeft, upperRight, lowerRight, callback) {

				// clear boards
				$lightbox.find('.light').removeClass('light');

				var	$ledBody = $('#led_panel_body'),
					$cell = $ledBody.find('td.cell'),
					$lowerLeft = $('#led-r-l-l'),
					$reset = $('#led_clear');

				$reset.on('click', function() {
					sound_button.play();
					$(this)
						.stop()
						.animate({top: 240}, 100)
						.animate({top: 235}, 100);
					$cell
						.add($lowerLeft.find('td.cell'))
						.removeClass('light');

				});

				var $adjacents = function($el, $where) {
					var $td = $el,
						$tr = $el.closest('tr')
						thisX = parseInt($td.attr('class').split(' ')[1].split('-')[1], 10),
						thisY = parseInt($tr.attr('class').split('-')[1], 10);

					return $el
								.add($tr.children('td.col-' + (thisX-1)))
								.add($tr.children('td.col-' + (thisX+1)))
								.add($where.find('tr.row-' + (thisY-1)).children('td.col-' + thisX))
								.add($where.find('tr.row-' + (thisY+1)).children('td.col-' + thisX))
				};

				var $related = function($el, $where) {
					var $td = $el,
						$tr = $el.closest('tr')
						thisX = parseInt($td.attr('class').split(' ')[1].split('-')[1], 10),
						thisY = parseInt($tr.attr('class').split('-')[1], 10)
						$target = $where.find('tr.row-' + thisY).children('td.col-' + thisX);

					return $target.add($adjacents($target, $where));
				};

				var cellSelector = function (array, $where) {
					for (var i=0, j = array.length; i<j; i++) {
						$where
							.find('tr.row-' + array[i][0])
							.children('td.col-' + array[i][1])
							.addClass('light');
					}
				};

				var generateArr = function($where) {
					var $active = $where.find('.light'),
						thisArr = [];

					$active.each(function() {
						var $td = $(this),
							$tr = $(this).closest('tr')
							thisX = parseInt($td.attr('class').split(' ')[1].split('-')[1], 10),
							thisY = parseInt($tr.attr('class').split('-')[1], 10);
						thisArr.push([thisY, thisX]);
					});

					return thisArr;

				};

				var compareArr = function(arr1, arr2) {
					if (arr1.length != arr2.length) { return false; }
					var a = arr1.sort(),
						b = arr2.sort();

					for (var i = 0; arr2[i]; i++) {
						if (a[i][0] !== b[i][0] || a[i][1] !== b[i][1]) {
								return false;
						}
					}
					return true;
				};

				cellSelector(upperLeft, $('#led-r-u-l'));
				cellSelector(upperRight, $('#led-r-u-r'));
				cellSelector(lowerRight, $('#led-r-l-r'));

				$cell
					.off()
					.on('click', function() {
						sound_button.play();
						$adjacents($(this), $ledBody)
							.add($related($(this), $lowerLeft))
							.toggleClass('light');

						if (compareArr(generateArr($ledBody), thePattern)) {
							callback();
						}
					})
					.on('mouseenter', function() {
						$adjacents($(this), $ledBody).addClass('highlight');
					})
					.on('mouseleave', function() {
						$adjacents($(this), $ledBody).removeClass('highlight');
					});

			// ledsPuzzle - END
			};

			var activated1 = function() {
				$led1
					.off()
					.attr('data-tooltip', 'It works now!')
					.css('cursor', 'help')
					.tooltip('right');
				$('#led_1')
					.add($light1)
					.addClass('on');
				$darkness.addClass('retract_1');
			};

			if ( $.inArray("darkness_retract1", played) !== -1 ) {
				activated1();
			} else {
				$led1.on('click', function() {
					room.the_player.go_to.start({
						target: '0-9',
						action: function() {
							$lightbox.fadeIn();

							var	thePattern = [
									[1,1], [1,2], [1,3], [1,4], [1,5],
									[2,1], [2,3], [2,5],
									[3,1], [3,2], [3,3], [3,4], [3,5],
									[4,2], [4,4]
								],
								upperLeft = [
									[1,3], [1,4], [1,5],
									[2,2], [2,3], [2,5],
									[3,3], [3,4], [3,5],
									[4,2], [4,3], [4,5],
									[5,3], [5,4], [5,5]
								],
								upperRight = [
									[2,2], [2,4],
									[3,1], [3,2], [3,3], [3,4], [3,5],
									[4,1], [4,3], [4,5],
									[5,1], [5,2], [5,3], [5,4], [5,5]
								],
								lowerRight = [
									[1,1], [1,2], [1,3],
									[2,1], [2,3], [2,4],
									[3,1], [3,2], [3,3],
									[4,1], [4,3], [4,4],
									[5,1], [5,2], [5,3]
								]

							ledsPuzzle(thePattern, upperLeft, upperRight, lowerRight, function() {
								sound_beep.play();
								setTimeout(function() {
									var get_played = $.jStorage.get('played');
									get_played.push('darkness_retract1');
									$.jStorage.set('played', get_played);
									$lightbox.fadeOut(200);
									$darkness
										.add($light1)
										.addClass('crawl')
									sound_darkness_retract.play();
									activated1();
								}, 1000);
							});
						}
					});
				// led1.click - END
				});
			// if retract1 played - END
			}

			var activated2 = function() {
				$led2
					.off()
					.attr('data-tooltip', 'It works now!')
					.css('cursor', 'help')
					.tooltip('right');
				$('#led_2')
					.add($light2)
					.addClass('on');
				$darkness.addClass('retract_2');
			};

			if ( $.inArray("darkness_retract2", played) !== -1 ) {
				activated2();
			} else {
				$led2.on('click', function() {
					room.the_player.go_to.start({
						target: '0-21',
						action: function() {
							$lightbox.fadeIn();

							var	thePattern = [
									[2,2], [2,4],
									[4,2], [4,4]
								],
								upperLeft = [
									[2,2], [2,4],
									[4,2], [4,4]
								],
								upperRight = [
									[2,2], [2,4],
									[4,2], [4,4]
								],
								lowerRight = [
									[2,2], [2,4],
									[4,2], [4,4]
								]

							ledsPuzzle(thePattern, upperLeft, upperRight, lowerRight, function() {
								sound_beep.play();
								setTimeout(function() {
									var get_played = $.jStorage.get('played');
									get_played.push('darkness_retract2');
									$.jStorage.set('played', get_played);
									$lightbox.fadeOut(200);
									$darkness
										.add($light2)
										.addClass('crawl')
									sound_darkness_retract.play();
									activated2();
									scene.darkness2();
								}, 1000);
							});
						}
					});
				// led1.click - END
				});
			// if retract2 played - END
			}

			var activated3 = function() {
				$led3
					.off()
					.attr('data-tooltip', 'It works now!')
					.css('cursor', 'help')
					.tooltip('right');
				$('#led_3')
					.add($light3)
					.addClass('on');
				$darkness.addClass('gone');
				scene.darkness3();
				setTimeout(function() {
					$darkness.hide();
				}, 10000);
			};

			if ( $.inArray("darkness_retract3", played) !== -1 ) {
				activated3();
				var $darkPlr = $('#dark_player');
				$darkPlr.css('opacity', 1);

			} else {
				$led3.on('click', function() {
					room.the_player.go_to.start({
						target: '0-33',
						action: function() {
							$lightbox.fadeIn();

							var	thePattern = [
									[1,2], [2,4],
									[5,1], [4,5]
								],
								upperLeft = [
									[1,1], [2,5],
									[4,4], [5,2]
								],
								upperRight = [
									[1,5], [2,1],
									[4,2], [5,4]
								],
								lowerRight = [
									[1,4], [2,2],
									[4,1], [5,5]
								]

							ledsPuzzle(thePattern, upperLeft, upperRight, lowerRight, function() {
								sound_beep.play();
								setTimeout(function() {
									var get_played = $.jStorage.get('played');
									get_played.push('darkness_retract3');
									$.jStorage.set('played', get_played);
									$lightbox.fadeOut(200);
									$darkness
										.add($light3)
										.addClass('crawl')
									sound_darkness_retract.play();
									activated3();
								}, 1000);
							});
						}
					});
				// led1.click - END
				});
			// if retract3 played - END
			}

			$close.on('click', function() {
				$lightbox.fadeOut(200);
			});

		//execute - END  
		}
		
		});

	//last_corridor - END
	},


	void: function(x,y) {
	
		//generates start room
		room.generate({
		
		inject:'void',
		
		grid_width: 25,
		grid_height: 25,
		
		drag_room:true,
		
		player: 'player',
		player_speed: 100,
		player_position_x: x,
		player_position_y: y,
		
		volume:50,
		
		execute: function() {
			
			setTimeout(function() {
				var $player = $('#player'),
					x = $player.data('x'),
					y = $player.data('y'),
					$tile = $('#' + x + '-' + y);

				

				sound_woosh.play();
				$('#door')
					.add('#use_door')
					.css({
						left: parseFloat($tile.css('left'))-33,
						top: parseFloat($tile.css('top'))-241
					})
					.fadeIn()
					.end()
					.css('z-index', $tile.data('z') - 3);

				$('#use_door')
					.on('click', function() {
						console.log(x + '-' + y);
						room.the_player.go_to.start({
							target: x + '-' + y,
							action: function() {
								setTimeout(function() {
									$('#sprite').css('-310px 0');
								}, 100);
								sound_teleport.play();
								game.void_bathroom(0,7);
							}
						});
					})
					.tooltip('right');

			}, 10000);

		//execute - END  
		}
		
		});

	//void - END
	},

	void_bathroom: function(x,y) {

		//generates start room
		room.generate({
		
			inject:'void_bathroom',
			
			grid_width: 8,
			grid_height: 9,

			collision_nodes: [
				'0-0', '0-1', '0-2', '0-3', '0-4', '0-5', 
				'1-0', '1-1', '1-2', '1-3', '1-4', '1-5', 
				'2-1', '2-2', '2-3',
				'5-4', '5-5', '5-6', '5-7', '5-8', 
				'6-4', '6-5', '6-6', '6-7', '6-8', 
				'7-4', '7-5', '7-6', '7-7', '7-8'
			],
			
			drag_room:true,
			
			player: 'player',
			player_speed: 100,
			player_position_x: x,
			player_position_y: y,
			
			volume:0,
			
			execute: function() {

				if ( $.inArray("scene_void_shower", played) === -1 ) {
					scene.bathroom_void_shower();
				} else {
					$('#faux_player').remove();
					game.bathroom_setup();
				}

			//execute - END  
			}
		
		});

	//void bathroom - END
	},

	exit: function(x,y) {

		//generates start room
		room.generate({
		
			inject:'exit',
			
			grid_width: 6,
			grid_height: 6,

			collision_nodes: ['0-0', '0-1', '0-5', '1-0', '5-0'],
			
			drag_room:true,
			
			player: 'player',
			player_speed: 100,
			player_position_x: x,
			player_position_y: y,
			
			volume:0,

			fade_color: 'white',
			
			execute: function() {

				scene.no_click(false);

				setTimeout(function() {
					$('#sprite').css('background-position', '-620px 0');
				}, 100);

				$('body')
					.prepend('<div id="exit_sky" />')
					.css('background', '#fff');

				var $exit = $('#use_exit'),
					$back = $('#use_back');

				$exit
					.on('click', function() {
						room.the_player.go_to.start({
							target: '0-3',
							action: function() {	
								game.train(14,3);
							}
						});
					})
					.tooltip('right');
				$back

					.tooltip('left');

			//execute - END  
			}
		
		});

	//exit - END
	}

//game - END  
};

soundManager.onready(function() {

	//intro screen
	$('#the_game').load('intro.html', function() {
		
		$('#lightbox, #items, #switch_sound, #settings').hide(); 
		
		var enter_pulse_interval = 500,
				house_float_interval = 2000;
		 
		function enter_pulse() {
		 
			$('#enter').animate({

				opacity:.5  

			}, enter_pulse_interval, function() {
			
				$(this).animate({
				 
					opacity:1  

				}, enter_pulse_interval, function() {
					
					enter_pulse();  

				});
			 
			});
		//pulse_interval - END
		}

		function house_float() {
		 
			$('#house').animate({

				top:'+=10px'  

			}, house_float_interval, function() {
			
				$(this).animate({
				 
					top:'-=10px' 

				}, house_float_interval, function() {
					
					house_float();  

				});
			 
			});
		//house_float - END
		}

		enter_pulse();
		house_float();

		var black = $('<div id="black" />').appendTo('body'),
			preloader = $('<div id="preloader" />').appendTo(black);
			black.css('opacity', 1);
		$.preloadCssImages({statusBarEl: '#preloader'});

		//Start the game!
		$('#logo, #head_hole, #enter').click(function() {

			$('#head_hole, #head_back, #logo').fadeOut('500');
			$('#house').fadeOut('1000');

			$('#switch_sound, #settings').fadeIn();
		 
			$('#lightbox').hide();

			//first room - beginning of the game 
			if (is_in === '') {

				scene.intro();
				
			} else if (is_in === 'room' || is_in === '') {
			
				game.room(5,6);
			
			} else if (is_in === 'corridor') {
			
				game.corridor(17,3);

			} else if (is_in === 'hidden_corridor') {
			
				game.hidden_corridor(1,18);

			} else if (is_in === 'aquarium') {
			
				game.aquarium(20,5);

			} else if (is_in === 'picture') {
			
				game.picture(5,5);

			} else if (is_in === 'picture_snow') {
			
				game.picture_snow(7, 8);

			} else if (is_in === 'kitchen') {
			
				game.kitchen(4,10);

			} else if (is_in === 'toilet') {
			
				game.toilet(2,2);

			} else if (is_in === 'bathroom') {
			
				game.bathroom(4,4);

			} else if (is_in === 'big_room') {
			
				game.big_room(4,4);

			} else if (is_in === 'boiler_room') {
			
				game.boiler_room(9,5);

			} else if (is_in === 'fridge') {
			
				game.fridge(5,2);

			} else if (is_in === 'kitchen_true') {
			
				game.kitchen_true(5,2);

			} else if (is_in === 'cabin') {
			
				scene.cabin();

			} else if (is_in === 'train') {
			
				game.train(2,2);

			} else if (is_in === 'last_corridor') {
				if($.inArray("darkness_retract3", played) !== -1) {
					game.last_corridor(2,36);
				} else {
					game.last_corridor(0,6);
				}

			} else if (is_in === 'void') {
			
				game.void(11,11);

			} else if (is_in === 'void_bathroom') {
			
				game.void_bathroom(0,7);

			} else if (is_in === 'exit') {
			
				game.exit(2,2);

			}

			items.holder();
			settings.init();

		});

	});

});

