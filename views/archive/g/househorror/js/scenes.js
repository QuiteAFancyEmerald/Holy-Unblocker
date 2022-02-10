
var scene = {

	intro: function() {

			$('#settings, #button, #switch_sound').addClass('dim');
		
			//clear screen
			$('#intro').empty();

			//screen fills with white
			$('<div/>', {
							id: 'white'
					})
					.appendTo('#intro')
					.animate({
					
						opacity:1
					
					}, 1000, function() {
				 
						//message 1
						$('<span/>',{
							id:'message_1',
							'class': 'message'
						})
						.appendTo('#intro')
						.text('Hey!')
						.hide()
						.fadeIn(1000, function() {
							$(this).fadeOut(2000);
							
							//message 2
								$('<span/>',{
									id:'message_2',
									'class': 'message'
								})
								.appendTo('#intro')
								.text('Hello!')
								.hide()
								.fadeIn(2000, function() {
									$(this).fadeOut(2000); 
									 
									//message 3
									$('<span/>',{
										id:'message_3',
										'class': 'message'
									})
									.appendTo('#intro')
									.text('I hope he\'s alive...')
									.hide()
									.fadeIn(5000)
									.fadeOut(5000);

									//message 4
									$('<span/>',{
										id:'message_4',
										'class': 'message player'
									})
									.appendTo('#intro')
									.text('What?!')
									.hide()
									.fadeIn(500)
									.fadeOut(5000, function() {  

										//message 5
											$('<span/>',{
												id:'message_5',
												'class': 'message player'
											})
											.appendTo('#intro')
											.text('What\'s going on?!')
											.hide()
											.fadeIn(500)
											.fadeOut(4000, function() {

											$('#settings, #button, #switch_sound').removeClass('dim');

											//start game!
											game.room(5,6);

											});

									});


								});
							

						});

					});

	},

	corridor: function() {
	
		//check if scene has been played
		if ( $.inArray("scene_corridor", played) === -1 ) {
		
			$('#settings, #button, #switch_sound').addClass('dim');

			//disable clicking ;)
			scene.no_click(true);
			 
			setTimeout( function() {
				scene_corridor();
			}, 2000);
			
		}

		function scene_corridor() {

			var window_x    = $(window).width(),
				window_y    = $(window).height();
			
			//play scary sound
			sound_scene_corridor.play();
			
			setTimeout(function() {
					
				//center scene on the staircase
				$('#corridor').animate({
				
					left: window_x/2 - 150,
					top:  window_y/2 -744
				
				}, 5000);
				
				$(room.player_body()).css('background-position', '-620px 0');
		 
			}, 1000);
			
			
			setTimeout(function() {
					
				//messages
				
				//message 1
				$('<span/>',{
					id:'message_1',
					'class': 'message'
				})
				.appendTo('#corridor')
				.text('Come downstairs...')
				.hide()
				.fadeIn(1000, function() {
					$(this).fadeOut(2000);
				
					//message 2
					$('<span/>',{
						id:'message_2',
						'class': 'message'
					})
					.appendTo('#corridor')
					.text('NOW!')
					.hide()
					.fadeIn(1000, function() {
						 $(this).fadeOut(2000);
						
							//message 3
							$('<span/>',{
								id:'message_3',
								'class': 'message'
							})
							.appendTo('#corridor')
							.text('Merge with me.')
							.hide()
							.fadeIn(1000)
							.fadeOut(2000, function() {
							
								//center scene on the player
								room.center(true,5000);
								
								//add information that scene has been played
								var get_played = $.jStorage.get('played');
			
								get_played.push('scene_corridor');
								
								$.jStorage.set('played', get_played);
								
								setTimeout(function() {
									$('#settings, #button, #switch_sound').removeClass('dim');
									//the game can be controlled again
									scene.no_click(false); 
								},5000)
							
							});
							
					});
				
				});
		 
			}, 6500);
		
	//scene_corridor - END
	}
	
	},

	corridor_phone: function() {

		//disable clicking ;)
		scene.no_click(true);

		//fire audio
		sound_scene_corridor_phone.play();

		var time_1 = 2000,
				delay = 3500,
				time_2 = 10000;

		//hide the phone
		$('#phone, #phone_mask, #phone_shadow').fadeOut(time_1);

		//show the hidden door
		setTimeout(function() {
			$('#hidden_door').animate({
				'height': 246
			}, time_2);
		}, time_1 + delay);

		//finish
		setTimeout(function() {

			//add information that scene has been played
			var get_played = $.jStorage.get('played');
			get_played.push('scene_corridor_phone');
			$.jStorage.set('played', get_played);

			scene.no_click(false);

		}, time_1 + delay + time_2);

	},

	bathroom_shower: function() {
		sound_shower_curtain.play();
		sound_scary.play();
		room.the_player.go_to.start({
			target: '3-7'
		});
		setTimeout(function() {
			$('#player').text_cloud('WHAT the...!?', 2000);
			$('#sprite').css('background-position', '-310px 0');
		}, 400);
		$('#curtain').css('opacity', 0);
		$('#curtain_folded').css('opacity', 1);
		$('<div id="dark_character" />')
		.appendTo('#floor')
		.sprite({
			no_of_frames:7
		})
		.delay(2000)
		.animate({opacity: 0}, 500);
		$('<div id="bathroom_overlay" />')
		.appendTo('#bathroom')
		.animate({opacity: 0}, 2500, 'linear');
		setTimeout(function(){
			$('#curtain_use').remove();
			$('#dark_character, #bathroom_overlay').remove();
			soundManager.stop('sound_scary');
			//add information that scene has been played
			var get_played = $.jStorage.get('played');
			get_played.push('scene_shower');
			$.jStorage.set('played', get_played);
		}, 2500);
	},

	mirror: function() {
		var lightbox = $('#lightbox');

		lightbox
		.fadeIn()
		.load('bathroom_reflection.html', function() {

			var	reflection = $('#reflection'),
				reflection_flicker = $('#reflection_flicker'),
				glow = $('#reflection_glow')
				face = $('#face');

			var highlight = function(target, x, y) {
				reflection.find('.first').hover(function() {
					$(this).children('div')
					.css({'opacity': '1'});
					var that = $(this);
					setTimeout(function() {
						that.next().children().css({'opacity': '1'});
					}, 200);
				}, function() {
					var that = $(this);
					setTimeout(function() {
						that.children().css({'opacity': '0'});
					}, 2000);
					setTimeout(function() {
						that.next().children().css({'opacity': '0'});
					}, 3000);
				});
			};

			var create_grid = function(target, x, y) {
				width = target.width(),
				height = target.height(),
				tile_width = width/x,
				tile_height = height/y;

				for (i=0; i<width/tile_width; i++) {
					for (j=0; j<width/tile_width; j++) {
						$('<div id="' + i +'-' + j + '" class="ref_tile" />')
						.attr('data-x', i)
						.attr('data-y', j)
						.appendTo(target)
						.css({
							width: tile_width,
							height: tile_height,
							left: tile_width * i,
							top: tile_height * j
						})
						.append('<div class="first"><div>')
						.append('<div class="second"><div>')
						.children('div').children('div')
						.css({
							'background-position': -i*tile_width +'px ' + -j*tile_height + 'px'
						});
						if (i === width/tile_width-1 && j === width/tile_height-1) highlight();
					// for j - END
					}
				// for i - END
				}
			//create grid - END
			};

			create_grid(face, 10, 10);

			var bkg_flickr = function() {
				window.timer = setTimeout(function() {
					reflection_flicker.css('opacity', '1');
					window.timer = setTimeout(function() {
						reflection_flicker.css('opacity', '0');
						bkg_flickr();
					}, (Math.random() * 1 + 1)*100);
				}, (Math.random() * 1 + 1)*100);
			}

			var face_rotate = function() {
				window.timer = setTimeout(function() {
					face.css('-webkit-transform', 'rotate(.1deg)');
					window.timer = setTimeout(function() {
						face.css('-webkit-transform', 'rotate(-.1deg)');
						face_rotate();
					}, (Math.random() * 5 + 5)*100);
				}, (Math.random() * 5 + 5)*100);
			}

			face_rotate();
			bkg_flickr();

			lightbox.on('click', '.close', function() {
				reflection.remove();
				clearInterval(window.timer);
				lightbox.fadeOut();
			});
		//load - END
		});
	//mirror - END
	},

	bathroom_void_shower: function() {
		scene.no_click(true, 'rgba(0, 0, 0, .3)');
		$('#settings, #button, #switch_sound').addClass('dim');

		game.bathroom_setup();

		var	$player = $('#player'),
			$sprite = $('#sprite'),
			$thisRoom = $('#bathroom'),
			$fauxPlayer = $('#faux_player'),
			$mergedPlayer = $('<div id="dark_character" />').appendTo('#floor').hide();

		setTimeout(function() {
			$sprite.css('background-position', '-310px 0');
			$thisRoom.css({
				left: $(window).width()/2 - 100,
				top: $(window).height()/2 - 260
			});

			var $overlay = $('<div id="bathroom_overlay" />').appendTo('#bathroom').css('z-index', 1000);

			$fauxPlayer.text_cloud('!!!', 1000);

			setTimeout(function() {
				sound_screech2.play();

				$fauxPlayer
					.css('background-image', 'url(images/void_merge.png)')
					.sprite({
						fps: 12,
						no_of_frames: 12,
						play_frames: 12
					})
					.delay(1000)
					.fadeOut(500);

				setTimeout(function() {
					$overlay.animate({opacity: 0}, 2500, 'linear', function() {
						$(this).remove();
					});
				}, 1000);

				setTimeout(function() {
					sound_shower_curtain.play();
					$('#curtain').css('opacity', 0);
					$('#curtain_folded').css('opacity', 1);
					room.the_player.go_to.start({
						target: '3-7',
						action: function() {
							$player.text_cloud('WHAT the...!?', 2000);
							$sprite.css('background-position', '-310px 0');
						}
					});
				}, 500);

				$mergedPlayer
					.sprite({
						no_of_frames:7
					})
					.delay(1000)
					.fadeIn(500)
					.delay(1000)
					.fadeOut(500);

				setTimeout(function() {
					$overlay.fadeOut(500);
					scene.no_click(false);
					$('#settings, #button, #switch_sound').removeClass('dim');
					var get_played = $.jStorage.get('played');
					get_played.push('scene_void_shower');
					get_played.push('scene_shower');
					$.jStorage.set('played', get_played);
				}, 1000);

			}, 1500);

		}, 100);

		if ($.inArray("scene_computer", played) !== -1 ) {
			$computer.addClass('off');
			$('#computer_use')
				.attr('data-tooltip', 'It doesn\'t work anymore...')
				.css('cursor', 'help');
		}
	// bathroom_void_shower - END
	},

	release: function() {
		//release
		var release = function(fly, player) {

			fly.animate({
				left: $(window).width()/2,
				top: 300
			}, 2000);
			$('#opened').remove();
			player.find('#sprite')
			.css('opacity', 0)
			.after('<div id="opened" />');
			$('.tile, #exit').css('display', 'none');
			window.repeat_wobble = true;
			var wobble = function(item, tolerance, time, lock) {
				if (!tolerance) var tolerance = 4;
				if (!time) var time = 500;
				item
				.transition({
					x:Math.random() * tolerance + 1,
					y:Math.random() * tolerance + 1
				}, time)
				.transition({
					x:3,
					y:-2
				}, time, function() {
					if (!lock) {
						if (window.repeat_wobble) wobble(item, tolerance, time, lock);
					} else {
						wobble(item, tolerance, time, lock);
					}
				})
			};

			fly.sprite({no_of_frames: 4}).fps(8).spStop().spStart();
			wobble(fly, 100, 1000);
			wobble($('#opened'), 4, 500, true);

			var diamond = $('#diamond'),
				blink = function() {
				diamond
				.animate({opacity:0}, 500)
				.animate({opacity:1}, 500, function() {
					blink();
				})
			}
			blink();
			diamond.text_cloud('It\'s coming!', 1500);
			setTimeout(function() {
				fly.text_cloud('Show me the way to him.', 3000);
			}, 4000);

		};
		var unite = function(fly, player) {
			window.repeat_wobble = false;
			scene.no_click(true);
			room.center(true,2000);	
			fly.animate({left:$(window).width()/2 - 50, top:$(window).height()/2 - 150}, 2000, function() {
				sound_woosh.play();
				$('<div id="flash" />')
				.appendTo("#opened")
				.transition({
					scale:40,
					opacity:.7
				}, 2000)
				.transition({
					scale:1000,
					opacity:1
				}, 500, function() {
					fly.remove();
					$('#opened').animate({
						opacity:0
					}, 1000, function() {
						$(this).remove();
					});
					player.find('#sprite').animate({opacity:1}, function() {
						scene.no_click(false);
						$('#entrance, #entrance_use').fadeIn('slow');
						$('#diamond').hide();
						//add information that scene has been played
						var get_played = $.jStorage.get('played');
						get_played.push('scene_unite');
						$.jStorage.set('played', get_played);
						player.text_cloud('I feel... Kind of... Better now.', '2000');
					});
					$('div.tile, #exit').css('display', 'block');
				});
			});
		};
		setTimeout(function() {
			var player = $('#player'),
				fridge = $('#fridge'),
				offset = fridge.offset(),
				base = offset.top,
				fired = false,
				fly = $('<div id="fly" />').appendTo('body');
			fridge
			.on( "drag", function(event, ui) {
				var offset = fridge.offset(),
					level = base - offset.top;
				if (level < -700 && !fired) {
					fired = true;
					window.is_ready = true;
					release(fly, player);
				}
			})
			.on ("dragstop", function(event, ui) {
				var offset = fridge.offset(),
				level = base - offset.top,
					poffset = player.offset();
				if (window.is_ready && level > -300) {
					window.is_ready = false;
					unite(fly, player);
				}
			});
		}, 1000);
	},
		
	fish_unite: function(first) {
		var thegame = $('#the_game');
		$('body').css('background', '#c2deeb');
		thegame.empty().load('outside_view.html', function() {
			if ($.inArray("scene_furnace", played) === -1) {
				$('#tree').removeClass('leaves');
			}

			if (first) {
				var corridor = $('<div id="outside_corridor" />').appendTo('#outside_view');
					corridor
					.append('<div id="switch" />')
					.append('<div id="player_sprite" />')
					.append('<div id="player_shadow" />');
					corridor.hide();

					var wobble = function(item, tolerance, time, lock) {
						if (!tolerance) var tolerance = 4;
						if (!time) var time = 500;
						item
						.transition({
							x:Math.random() * tolerance + 1,
							y:Math.random() * tolerance + 1
						}, time)
						.transition({
							x:3,
							y:-2
						}, time, function() {
								wobble(item, tolerance, time, lock);
						})
					};

				var fish = $('#fish');
				fish.sprite({
					no_of_frames: 5
				})
				.spState(2)
				.fps(8)
				.spStop()
				.spStart();
				//movement
				var repeat = function(item) {
					item
					.animate({
						left:536,
						top:275
					}
					, 5000, 'linear', function() {
						item.spState(3);
					})
					.animate({
						left:328,
						top:395
					}
					, 5000, 'linear', function() {
						if(!window.test) {
							item.spState(2);
							repeat(item);
						}
					})
				};
				repeat(fish);
				setTimeout(function() {
					fish.text_cloud('It\'s so nice outside!', 2000);
				}, 1000);
				setTimeout(function() {
					fish.stop(true).animate({left: 550, top: 320}, 1000, function() {
						fish.spState(1).text_cloud('Thank you man!', 2000);
						corridor.fadeIn(1000);
						$('#tree').fadeOut(1000);
						$('body').animate({backgroundColor: '#000000'}, 1000);
						wobble($('#player_sprite'), 4, 500);
						setTimeout(function() {
							fish
							.animate({left:'+=100', top: '+=80'}, 700)
							.animate({left:440, top:230}, 300);
							setTimeout(function() {
								sound_woosh.play();
								$('<div id="flash" />')
								.appendTo(fish)
								.transition({
									scale:40,
									opacity:.7
								}, 2000)
								.transition({
									scale:100,
									opacity:1
								}, 500, function() {
									//add information that scene has been played
									var get_played = $.jStorage.get('played');
									get_played.push('scene_outside');
									$.jStorage.set('played', get_played);	
									setTimeout(function() {
										$('#player').text_cloud('What was that?!', 2000);
									}, 3000);
									setTimeout(function() {
										$('#player').text_cloud('Was it real?', 2000);
									}, 8000);
									game.hidden_corridor(2, 6);
								});
							}, 850);
						}, 1500);
					});
				}, 5200);
			} else {
				$('#fish').remove();
				$('<div class="close" />')
				.appendTo('body')
				.click(function() {
					$(this).animate({opacity: 0}, 500, function() {
						$(this).remove();
					})
					game.hidden_corridor(2, 6);
				});
			}

		// load outside view - END
		});	
	// fish_unite - END
	},

	explosion: function() {
		if ( $.inArray("scene_explosion", played) === -1 ) {
			scene.no_click(true);
			sound_explosion.play();
			room.the_player.go_to.start({
				target: '5-1' 
			});
			$('#the_game').children('div')
			.animate({left:'-=5'}, 50)
			.animate({left:'+=5', top:'-=10'}, 50)
			.animate({left:'-=3', top:'+=4'}, 50)
			.animate({left:'+=2', top:'-=6'}, 50)
			.animate({left:'-=10', top:'-=6'}, 50)
			.animate({left:'-=5'}, 50)
			.animate({left:'+=5', top:'-=10'}, 50)
			.animate({left:'-=3', top:'+=4'}, 50)
			.animate({left:'+=2', top:'-=6'}, 50)
			.animate({left:'-=10', top:'-=6'}, 50)
			.animate({left:'-=5'}, 50)
			.animate({left:'-=5', top:'+=10'}, 50)
			.animate({left:'+=3', top:'-=4'}, 50)
			.animate({left:'-=2', top:'+=6'}, 50)
			.animate({left:'+=10', top:'+=6'}, 50)
			.animate({left:'+=5'}, 50)
			.animate({left:'-=5', top:'+=10'}, 50)
			.animate({left:'+=3', top:'-=4'}, 50)
			.animate({left:'-=2', top:'+=6'}, 50)
			.animate({left:'+=10', top:'+=6'}, 50)
			.animate({left:'-=4', top:'+=2'}, 50);
			setTimeout(function() {
				scene.no_click(false);
				//add information that scene has been played
				var get_played = $.jStorage.get('played');
				get_played.push('scene_explosion');
				$.jStorage.set('played', get_played);
			}, 1100);
		}
	},

	cabin: function() {

		$.jStorage.set('is_in', 'cabin');

		//view fades in
		$('<div/>', {id: 'black'})
			.appendTo('body')
		.css('opacity', 1)
		.animate({opacity:0}, 2000, function() {
			$('body').find('#black').remove();
		});

		$('#the_game')
			.empty()
			.load('cabin.html', function() {

				$('#cabin').pan({fps: 30, speed: 0.2, dir: 'right'});

				var $player = $('#faux_player');

				setTimeout(function() {
					$player
						.sprite({
							fps: 4,
							no_of_frames: 12,
							play_frames: 4
						})
						.text_cloud('Huh?', 500);
				}, 2000);

				setTimeout(function() {
					var $ticket = $('#ticket_inspector');
					
					 $ticket
						.sprite({
							fps: 8,
							no_of_frames: 8
						})
						.animate({opacity: 1}, 200);

					 $ticket
						.animate({
							left: 138,
							top: 70
						}, 1000, 'linear', function() {
							$(this)
								.spStop(true)
								.spState(2)
							setTimeout(function() {
								sound_sliding_door.play();
								$('#door')
									.animate({
										left: -67,
										top: -40
									}, 500, function() {
										$ticket.text_cloud('Your stop is next.', 2000);
										setTimeout(function() {
											$ticket.text_cloud('You have to leave the train.', 2000);
										}, 2000);
										//$player.text_cloud('Huh..?', 1000);
										setTimeout(function() {
											$player.text_cloud('...', 1000);
										}, 1000);
										setTimeout(function() {
											$player
												.addClass('stand-up')
												.sprite({
													fps: 8,
													no_of_frames: 12,
													play_frames: 8
												});
											setTimeout(function() {
												$ticket
													.spState(1)
													.spStart()
													.animate({
														left: -42,
														top: -30
													}, 1000);

												setTimeout(function() {
													$player.text_cloud('OK...', 99999);
													$ticket.animate({opacity: 0}, 200);
													$('#cabin').animate({opacity: 0}, 3000, function() {
														game.train(2,2);
													});
												}, 800);
											}, 2500);
										}, 2000);
									});
							}, 500);
						});
				}, 4000);

			});

	},

	darkness1: function() {

		var play = function() {

			var $canvas = $('#last_corridor'),
				$text = $('#darkness').find('.text'),
				$menu = $('#settings, #button, #switch_sound'),
				window_x = $(window).width(),
				window_y = $(window).height();

			$menu.addClass('dim');
			scene.no_click(true, 'rgba(0, 0, 0, .3)');

			setTimeout(function() {

				$canvas.animate({
					left: window_x/2 - 1000,
					top:  window_y/2 - 500		
				}, 5000, function() {
					sound_darkness.play();
					$text
						.text('Fssssssss')
						.animate({opacity: 1}, 500);
					setTimeout(function() {
						$text.animate({opacity: 0}, 1000);
						room.center(true,5000);
						setTimeout(function() {
							scene.no_click(false);
							$menu.removeClass('dim');

							var get_played = $.jStorage.get('played');
							get_played.push('darkness1');
							$.jStorage.set('played', get_played);
						}, 5000);
					}, 1000);
				});

			}, 500);

		};

		if ( $.inArray("darkness1", played) === -1 ) {
				play();
		}

	},

	darkness2: function() {

		var play = function() {

			var $playerS = $('#sprite'),
				$canvas = $('#last_corridor'),
				$text = $('#darkness').find('.text'),
				$menu = $('#settings, #button, #switch_sound'),
				window_x = $(window).width(),
				window_y = $(window).height();

			$menu.addClass('dim');
			scene.no_click(true, 'rgba(0, 0, 0, .3)');

			setTimeout(function() {

				$playerS
					.css('background-position', '-620px 0');

				setTimeout(function() {

					$canvas.animate({
						left: window_x/2 - 800,
						top:  window_y/2 - 1000		
					}, 5000, function() {
						sound_darkness.play();
						$text
							.text('Leave me alone!')
							.animate({opacity: 1}, 500);
						setTimeout(function() {
							$text.animate({opacity: 0}, 1000);
							room.center(true,5000);
							setTimeout(function() {
								scene.no_click(false);
								$menu.removeClass('dim');
							}, 5000);
						}, 1000);
					});

				}, 1000);

			}, 500);

		};

		play();

	},

	darkness3: function() {

		var $darkPlr = $('#dark_player');

		scene.no_click(true, 'rgba(0, 0, 0, .3)');

		sound_absorbing.play();

		setTimeout(function() {
			$darkPlr.sprite({
				fps: 4,
				no_of_frames: 5,
				play_frames: 5
			});
		}, 4000);

		$darkPlr.animate({opacity: 1}, 5000, function() {
			room.the_player.go_to.start({
				target: '2-40', 
				action: function() {
					var $floor = $('#floor'),
						$player = $('#player'),
						$dark = $('#dark_player'),
						$lights = $('#fluorescent_1, #fluorescent_2, #fluorescent_3, #fluorescent_4');

					var $darkness_fill = $('<div id="darkness_fill" />').appendTo($floor).hide(),
						$darkness_bg = $('<div id="darkness_bg" />').appendTo($floor).hide(),
						$darkness_bgL = $('<div id="darkness_bg_light" />').appendTo($floor).hide(),
						$darkness_floor = $('<div id="darkness_floor" />').appendTo($floor).hide(),
						$darkness_floorL = $('<div id="darkness_floor_light" />').appendTo($floor).hide(),
						$darkness_wires = $('<div id="darkness_wires" />').appendTo($floor).hide(),
						$darkEls = $darkness_bg.add($darkness_floor).add($darkness_wires);

					$lights.fadeOut();
					setTimeout(function() {
						$darkEls.add($darkness_fill)
							.delay(1000)
							.fadeIn(500, function() {
								$darkness_bg.transition({x: -10}, 10000, 'linear');
								$darkness_wires.transition({rotate: '10deg'}, 10000, 'linear');

								$player.text_cloud('I guess I have no choice. I need to accept you.', 4000);
								$dark.text_cloud('I guess I have no choice. I need to accept you.', 4000);

								setTimeout(function() {
									$player.text_cloud('But this time...', 3000);
									$dark.text_cloud('But this time...', 3000);
								}, 4000);

								setTimeout(function() {
									$player.text_cloud('I\'ll absorb you.', 3000);
								}, 8000);

								$darkEls
									.delay(8000)
									.stop()
									.transition({opacity: 0}, 1000);
								$darkness_bgL
									.add($darkness_floorL)
									.delay(8000)
									.fadeIn(1000);

								setTimeout(function() {
									$('#no_click').css('background', 'transparent');
									$dark.fadeOut(1000);
									sound_woosh.play();
									$('<div id="flash" />')
									.appendTo($player)
									.transition({
										scale:40,
										opacity:.7
									}, 2000)
									.transition({
										scale:100,
										opacity:1
									}, 500, function() {
										$('body').css('background', '#fff');
										game.exit(3,3);
									});
								}, 13000);
							});
					}, 1000);
				}
			});
		});

	},

	no_click: function(create, color_value) {
		
		if (create === true) {
			$('<div/>',{ 
				id:'no_click'
			})
			.appendTo('body')
			.css('background', color_value); 
		
		} else if (create === false) {
		
			$('#no_click').remove()
		
		}
	} 

}