var npc = {

	fish: {
	
		select: function() {
		
			var fish = $('#fish, #fish_click_area');
			return fish;
			
		},
		
		click_area: function() {
		
			$('<div/>', {
				id: 'fish_click_area'
			})
			.appendTo('#floor');
		
		},
	
		swim: function() {

			if ($.inArray("disappear", fish) === -1) {

				//intiate spritely 
				$(npc.fish.select())
				.sprite({
					fps: 8,
					no_of_frames: 5
				});
	
				npc.fish.click_area();
				npc.fish.move();
				npc.fish.react();

				// hide key
				$('#key').hide();
			
			} else {
			
				$(npc.fish.select()).remove();
				
				npc.fish.key();
			
			}

		},
		
		move: function(repeat) {     

			var fish = $('#fish');

			if (!repeat) {
				fish.spState(2);
			} else {
				fish.spToggle().fps(8).spState(2);
			}  
							
			//movement     
			var repeat = function(item) {
				item    
				.animate({     
					left:242,     
					top:-236     
				}     
				, 5000, 'linear', function() {     
					item.spState(3);     
				})     
				.animate({     
					left:-129,     
					top:-84     
				}     
				, 5000, 'linear', function() {  
					if(!window.test) {
						item.spState(2); 
						repeat(item);
					}
				})   
			}
			repeat(fish);
			repeat($('#fish_click_area'));
				 
		},     
		
		move_to_player: function(item, spritely) {
			if (spritely) item.spToggle();
			item
			.stop(true)
			.animate({
				left:98, 
				top:-190
			}, 200)
			.css('background-position','0 0'); 
		
		},
		
		react: function() {
		
			$(npc.fish.select()).click(function() {
				room.the_player.go_to.start({
				
					target: '1-3',
					
					action: function() {

						$(room.player_body()).css('background-position', '-310px 0px');
						npc.fish.move_to_player($('#fish'), true);
						npc.fish.move_to_player($('#fish_click_area'));
						room.center(true,100);
						
						/*dialogue
						*/
						
						//dialogue LEVEL 1
						
						dialogue_box.display({
							character:'Fish',
							picture:'aquarium_fish_big.png',
							text: 'Hello!',
							options: ['Hi.', 'I don\'t have time to talk with you.']
						}); 
					
						$('#options').on('click', '#option_1', function() {
							dialogue_box.destroy();
							npc.fish.move(true);
							$('#fish').text_cloud('Oh really? I have A LOT.', 8000);
						});
						
						//dialogue LEVEL 2
						$('#options').on('click', '#option_0', function() {
							dialogue_box.display({
								character:'Fish',
								picture:'aquarium_fish_big.png',
								text: 'Tell me... Did you look through the window?',
								options: ['Yes I did.', 'No.']
							}); 

							$('#options').on('click', '#option_1', function() {
								dialogue_box.destroy();
									npc.fish.move(true);
								$('#fish').text_cloud('So please take a look and tell me what did you see.', 10000); 
								$('#teleport, #exit').show('slow');
							});
							
							//dialogue LEVEL 3
							
							if ($.inArray("window", fish) === -1) {
							
								$('#options').on('click', '#option_0', function() {
									dialogue_box.display({
										character:'Fish',
										picture:'aquarium_fish_big.png',
										text: 'So what did you see then?',
										options: ['...']
									});
									
									$('#options').on('click', '#option_0', function() {
										dialogue_box.destroy();
										npc.fish.move(true);
										$('#fish').text_cloud('Yeah. C\'mon! Check that window.', 8000); 
										$('#teleport, #exit').show('slow');
									});
									
								}); 
							
							} else {
							
								$('#options').on('click', '#option_0', function() {
									dialogue_box.display({
										character:'Fish',
										picture:'aquarium_fish_big.png',
										text: 'So what did you see than?',
										options: ['Many flying... Objects?']
									});
									
									$('#options').on('click', '#option_0', function() {
										dialogue_box.destroy();
										$('#fish_click_area').remove();
										$('#fish').text_cloud('Wow. I have to check it out!', 3000); 
										$('#fish')
										.stop(true,true)
										.delay(2000)
										.animate({
											opacity:0
										}, 3000, function() {
											$(this).remove();
										});
										
										npc.fish.key();
										
										var get_fish = $.jStorage.get('fish');
						
										get_fish.push('disappear');
										
										$.jStorage.set('fish', get_fish);

									});
									
								});
							
							} 
							
						});

					}
				 }); 
			});
		
		},
		
		key: function() {
			
			//take the key
			$('#aquarium').find('#key').click(function () {

				room.the_player.go_to.start({
				
					target: '18-5',
					
					action: function() {

						items.take('#key');
						$('#teleport, #exit').show('slow'); 

					}  
				
				});
				
			})
			
			$('#key').fadeIn();
		
		}
	// fish - END
	},

	furnace: {
		furnace_use: function() {var select = $('#furnace_use'); return select},
		furnace: function() {var select = $('#furnace'); return select},
		body: function() {var select = $('#body'); return select},
		eyes: function() {var select = $('#left_eye, #right_eye'); return select},
		mouth: function() {var select = $('#mouth'); return select},
		fire: function() {var select = $('.fire'); return select},
		burn: function () {
			var fire = npc.furnace.fire();
			function burn() {
				fire
				.animate({opacity:.8}, 200)
				.animate({opacity:.6}, 250)
				.animate({opacity:.85}, 200)
				.animate({opacity:.65}, 100)
				.animate({opacity:.9}, 150)
				.animate({opacity:.65}, 200, function() {
					burn();
				})
			}
			burn();
		},
		has_food: function() {
			if ( $.inArray("twig", collected) !== -1 && $.inArray("twig", used) === -1) {
				dialogue_box.display({
					character:false,
					picture:false,
					text: 'The furnace wants to eat a twig',
					options: ['Ok', 'No!']
				}, 'big');

				$('#options').on('click', '#option_0', function() {
					setTimeout(function() {
						items.use('#twig');
						$('#option_0').click(function() {
							dialogue_box.destroy();
							scene.no_click(true);
							setTimeout(function() {
								npc.furnace.furnace().text_cloud('Nom, nom, nom.', 750);
								npc.furnace.is_eating();
							}, 500);
						});
					}, 500);
				});
			} else if ( $.inArray("note", collected) !== -1 && $.inArray("note", used) === -1 && $.inArray("scene_keypad", played) === -1) {
				dialogue_box.display({
					character:false,
					picture:false,
					text: 'The furnace wants to eat your note. You may need it later – maybe you should write it down?',
					options: ['Give a note.', 'Keep a note to yourself.']
				}, 'big');

				$('#options').on('click', '#option_0', function() {
					setTimeout(function() {
						items.use('#note');
						$('#option_0').click(function() {
							dialogue_box.destroy();
							scene.no_click(true);
							setTimeout(function() {
								npc.furnace.furnace().text_cloud('Nom, nom, nom.', 750);
								npc.furnace.is_eating();
							}, 500);
						});
					}, 500);
				});
			} else if ($.inArray("note", collected) !== -1 && $.inArray("note", used) === -1) {
				dialogue_box.display({
					character:false,
					picture:false,
					text: 'The furnace want\'s to eat your note.',
					options: ['Ok', 'No!']
				}, 'big');

				$('#options').on('click', '#option_0', function() {
					setTimeout(function() {
						items.use('#note');
						$('#option_0').click(function() {
							dialogue_box.destroy();
							scene.no_click(true);
							setTimeout(function() {
								npc.furnace.furnace().text_cloud('Nom, nom, nom.', 750);
								npc.furnace.is_eating();
							}, 500);
						});
					}, 500);
				});
			} else if ( $.inArray("coal", collected) !== -1 && $.inArray("coal", used) === -1) {
				dialogue_box.display({
					character:false,
					picture:false,
					text: 'The furnace want\'s to eat a coal.',
					options: ['Ok', 'No!']
				}, 'big');

				$('#options').on('click', '#option_0', function() {
					setTimeout(function() {
						items.use('#coal');
						$('#option_0').click(function() {
							dialogue_box.destroy();
							scene.no_click(true);
							setTimeout(function() {
								npc.furnace.furnace().text_cloud('Nom, nom, nom.', 750);
								npc.furnace.is_eating();
							}, 500);
						});
					}, 500);
				});
			}
			$('#options').on('click', '#option_1', function() {
				dialogue_box.destroy();
			});
		},
		is_eating: function() {
			var mouth = npc.furnace.mouth(),
				eyes = npc.furnace.eyes(),
				is_fed = function() {
					setTimeout(function() {
							if ($.inArray("coal", used) === -1 || $.inArray("twig", used) === -1 || $.inArray("note", used) === -1) {
								if (!Modernizr.csstransitions) {
									mouth
									.animate({top:'-=80'}, 250)
									.animate({top:'+=80'}, 100, function() {
										sound_clong.play();
									})
								} else {
									mouth
									.transition({top:'-=80'}, 250)
									.transition({top:'+=80'}, 100, function() {
										sound_clong.play();
									})
								}
								npc.furnace.furnace().text_cloud('I want more!', 1000);
								scene.no_click(false);
							} else {
								npc.furnace.is_strong();
							}
						}, 500);
					};
			eyes
			.animate({opacity:.5}, 375)
			.animate({opacity:0}, 375);
			if (!Modernizr.csstransitions) {
				mouth
				.animate({top:'-=80'}, 250)
				.animate({top:'+=80'}, 100, function() {
					sound_clang.play();
				})
				.animate({top:'-=80'}, 100)
				.animate({top:'+=80'}, 100, function() {
					sound_clang.play();
				})
				.animate({top:'-=80'}, 100)
				.animate({top:'+=80'}, 100, function() {
					sound_clang.play();
					is_fed();
				});
			} else {
				mouth
				.transition({top:'-=80'}, 250)
				.transition({top:'+=80'}, 100, function() {
					sound_clang.play();
				})
				.transition({top:'-=80'}, 100)
				.transition({top:'+=80'}, 100, function() {
					sound_clang.play();
				})
				.transition({top:'-=80'}, 100)
				.transition({top:'+=80'}, 100, function() {
					sound_clang.play();
					is_fed();
				});
			}
		},
		is_strong: function() {
			var furnace = npc.furnace.furnace(),
				body 	= npc.furnace.body(),
				eyes 	= npc.furnace.eyes(),
				mouth 	= npc.furnace.mouth(),
				fire 	= npc.furnace.fire();
			
			furnace.text_cloud('YEAH!', 2000);
			mouth.attr('style', '');

			if (!Modernizr.csstransitions) {
				body.css({rotate: 'rotate(0deg)'});
				body
				.animate({top:15}, 500, function() {
					sound_screech.play();
				})
				.animate({top:-3}, 100)
				.delay(300)
				.animate({top:15}, 100)
				.animate({top:0}, 500);
			} else {
				body
				.transition({top:15, rotate:0}, 500, function() {
					sound_screech.play();
				})
				.transition({top:-3}, 100)
				.transition({top:15, delay:300}, 100)
				.transition({top:0}, 500);
			}

			furnace
			.delay(600)
			.animate({top:'-=20'}, 200)
			.animate({top:'+=20'}, 100, function() {
				sound_clang.play();
			});
			mouth
			.animate({top:515-80}, 700)
			.animate({top:515}, 200)
			.animate({top:515-20}, 100)
			.animate({top:515}, 100, function() {
				scene.no_click(false);
				sound_clong.play();
				soundManager.resume('boiler_room');
				furnace.text_cloud('Thank you man!', 2000);
				setTimeout(function() {
					furnace.text_cloud('Check your room! Things have changed!', 2000);
				}, 3000)
				npc.furnace.burn();
				npc.furnace.random_moves();
				//add information that scene has been played
				var get_played = $.jStorage.get('played');
				get_played.push('scene_furnace');
				$.jStorage.set('played', get_played);
				npc.furnace.furnace_use().remove();
			});

		//is_strong - END
		},
		is_weak: function() {
			var furnace = npc.furnace.furnace(),
				body 	= npc.furnace.body(),
				eyes 	= npc.furnace.eyes(),
				mouth 	= npc.furnace.mouth(),
				fire 	= npc.furnace.fire();
			
			scene.no_click(true);
			if ($.inArray("twig", used) === -1) {
				furnace.text_cloud('I\'m weak...', 2000);
			} else if ($.inArray("note", used) === -1) {
				furnace.text_cloud('Help me please...', 2000);
			} else if ($.inArray("coal", used) === -1) {
				furnace.text_cloud('Still hungry...', 2000);
			}

			fire
			.animate({opacity:.5}, 1700)
			.animate({opacity:0}, 300, function() {
				scene.no_click(false);
				npc.furnace.has_food();
			});

			sound_screech.play();

			if (!Modernizr.csstransitions) {
				body
				.animate({top:5,rotate: 1}, 1700)
				.animate({top:10, rotate: -.5}, 100)
				.animate({top:7}, 50)
				.animate({top:10}, 50)
				.animate({top:8}, 50)
				.animate({top:10}, 50);
				mouth
				.animate({top:'-=10'}, 1700)
				.animate({top:'+=10'}, 100, function() {
					sound_clong.play();
				})
				.animate({top:'-=7'}, 50)
				.animate({top:'+=7'}, 50)
				.animate({top:'-=5'}, 50)
				.animate({top:'+=5'}, 50, function() {
					sound_clang.play();
				});
			} else {
				body
				.transition({top:5, rotate: 1}, 1700)
				.transition({top:10, rotate: -.5}, 100)
				.transition({top:7}, 50)
				.transition({top:10}, 50)
				.transition({top:8}, 50)
				.transition({top:10}, 50);
				mouth
				.transition({top:'-=10'}, 1700)
				.transition({top:'+=10'}, 100, function() {
					sound_clong.play();
				})
				.transition({top:'-=7'}, 50)
				.transition({top:'+=7'}, 50)
				.transition({top:'-=5'}, 50)
				.transition({top:'+=5'}, 50, function() {
					sound_clang.play();
				});
			}
		//is_weak - END
		},
		random_moves: function() {
			var body = npc.furnace.body();
			window.timer = setInterval(function() {
				var random = Math.random() * 1;
				if (random > .5) {
					body
					.transition({rotate: .5}, 500)
					.transition({rotate: 1}, 200)
					.transition({rotate: -.5}, 500)
					.transition({rotate: -2}, 200)
						.transition({rotate: .5}, 500)
						.transition({rotate: 1}, 200)
						.transition({rotate: -.5}, 500)
						.transition({rotate: -2}, 200)
					.transition({rotate: 0}, 300);
				} else {
					body
					.transition({top: '-=5', rotate: 1}, 500)
					.transition({top: '+=20'}, 200)
					.transition({top: '-=15', rotate: -2}, 500)
					.transition({top: '+=5'}, 500)
					.transition({top: '-=5', rotate: 0}, 500);
				}
			}, (Math.random() * 8 + 6)*1000);
		}
	// furnace - END
	}

// npc - END
}