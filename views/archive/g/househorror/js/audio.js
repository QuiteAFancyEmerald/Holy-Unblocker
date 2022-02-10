	if (!Modernizr) {
		Modernizr = false;
	}


	//Compatibility test
	var sound_ext =	Modernizr.audio.mp3 ? '.mp3' : '.ogg';

		soundManager.onready(function() {
		
			var dir = window.location.pathname;

			sound = {};

			sound_absorbing = soundManager.createSound({id: 'sound_absorbing', url: dir + 'sound/absorbing' + sound_ext, autoLoad: true});
			sound_beep = soundManager.createSound({id: 'sound_beep', url: dir + 'sound/beep' + sound_ext, autoLoad: true});
			sound_button = soundManager.createSound({id: 'sound_button', url: dir + 'sound/button' + sound_ext, autoLoad: true});
			sound_buzz = soundManager.createSound({id: 'sound_buzz', url: dir + 'sound/buzz' + sound_ext, autoLoad: true});
			sound_cling = soundManager.createSound({id: 'sound_cling', url: dir + 'sound/cling' + sound_ext, autoLoad: true});
			sound_clang = soundManager.createSound({id: 'sound_clang', url: dir + 'sound/clang' + sound_ext, autoLoad: true});
			sound_clong = soundManager.createSound({id: 'sound_clong', url: dir + 'sound/clong' + sound_ext, autoLoad: true});
			sound_creak = soundManager.createSound({id: 'sound_creak', url: dir + 'sound/creak' + sound_ext, autoLoad: true}); 
			sound_darkness = soundManager.createSound({id: 'darkness', url: dir + 'sound/darkness' + sound_ext, autoLoad: true}); 
			sound_darkness_retract = soundManager.createSound({id: 'darkness_retract', url: dir + 'sound/darkness_retract' + sound_ext, autoLoad: true}); 
			sound_door = soundManager.createSound({id: 'sound_door', url: dir + 'sound/door' + sound_ext, autoLoad: true}); 
			sound_door_locked = soundManager.createSound({id: 'sound_door_locked', url: dir + 'sound/door_locked' + sound_ext, autoLoad: true}); 
			sound_ekg = soundManager.createSound({id: 'sound_ekg', url: dir + 'sound/ekg' + sound_ext, autoLoad: true}); 
			sound_explosion = soundManager.createSound({id: 'sound_explosion', url: dir + 'sound/explosion' + sound_ext, autoLoad: true}); 
			sound_footstep = soundManager.createSound({id: 'footstep', url: dir + 'sound/footstep' + sound_ext, autoLoad: true});
			sound_sliding_door = soundManager.createSound({id: 'sliding_door', url: dir + 'sound/sliding_door' + sound_ext, autoLoad: true}); 
			sound_scary = soundManager.createSound({id: 'sound_scary', url: dir + 'sound/scary' + sound_ext, autoLoad: true});
			sound_scene_corridor = soundManager.createSound({id: 'sound_corridor', url: dir + 'sound/scene_corridor' + sound_ext, autoLoad: true});
			sound_scene_corridor_phone = soundManager.createSound({id: 'sound_corridor_phone', url: dir + 'sound/scene_corridor_phone' + sound_ext, autoLoad: true});
			sound_screech = soundManager.createSound({id: 'sound_screech', url: dir + 'sound/screech' + sound_ext, autoLoad: true});
			sound_screech2 = soundManager.createSound({id: 'sound_screech2', url: dir + 'sound/screech2' + sound_ext, autoLoad: true});
			sound_shower_curtain = soundManager.createSound({id: 'sound_shower_curtain', url: dir + 'sound/shower_curtain' + sound_ext, autoLoad: true});
			sound_switch = soundManager.createSound({id: 'sound_switch', url: dir + 'sound/switch' + sound_ext, autoLoad: true}); 
			sound_teleport = soundManager.createSound({id: 'sound_teleport', url: dir + 'sound/teleport' + sound_ext, autoLoad: true});
			sound_train = soundManager.createSound({id: 'train-ambient', url: dir + 'sound/train_ambient' + sound_ext, autoLoad: true});
			sound_train_start = soundManager.createSound({id: 'train_start', url: dir + 'sound/train_start' + sound_ext, autoLoad: true});
			sound_woosh = soundManager.createSound({id: 'sound_woosh', url: dir + 'sound/woosh' + sound_ext, autoLoad: true}); 
			sound_wrong = soundManager.createSound({id: 'sound_wrong', url: dir + 'sound/wrong' + sound_ext, autoLoad: true});

			//rooms backgrounds
			sound.room = soundManager.createSound({id: 'room', url: dir + 'sound/room' + sound_ext, autoLoad: true});
			sound.corridor = soundManager.createSound({id: 'corridor', url: dir + 'sound/corridor' + sound_ext, autoLoad: true}); 
			sound.hidden_corridor = soundManager.createSound({id: 'last_corridor', url: dir + 'sound/corridor' + sound_ext, autoLoad: true}); 
			sound.last_corridor = soundManager.createSound({id: 'last_corridor', url: dir + 'sound/corridor' + sound_ext, autoLoad: true}); 
			sound.aquarium = soundManager.createSound({id: 'aquarium', url: dir + 'sound/aquarium' + sound_ext, autoLoad: true}); 
			sound.picture = soundManager.createSound({id: 'picture', url: dir + 'sound/picture_snow' + sound_ext, autoLoad: true});
			sound.picture_snow = soundManager.createSound({id: 'picture_snow', url: dir + 'sound/picture_snow' + sound_ext, autoLoad: true});
			sound.kitchen = soundManager.createSound({id: 'kitchen', url: dir + 'sound/room' + sound_ext, autoLoad: true}); 
			sound.kitchen_true = soundManager.createSound({id: 'kitchen_true', url: dir + 'sound/room' + sound_ext, autoLoad: true}); 
			sound.toilet = soundManager.createSound({id: 'toilet', url: dir + 'sound/corridor' + sound_ext, autoLoad: true});
			sound.bathroom = soundManager.createSound({id: 'bathroom', url: dir + 'sound/room' + sound_ext, autoLoad: true});
			sound.void_bathroom = soundManager.createSound({id: 'void_bathroom', url: dir + 'sound/room' + sound_ext, autoLoad: true});
			sound.big_room = soundManager.createSound({id: 'big_room', url: dir + 'sound/room' + sound_ext, autoLoad: true});
			sound.boiler_room = soundManager.createSound({id: 'boiler_room', url: dir + 'sound/boiler_room' + sound_ext, autoLoad: true});
			sound.fridge = soundManager.createSound({id: 'fridge', url: dir + 'sound/picture_snow' + sound_ext, autoLoad: true});
			sound.train = soundManager.createSound({id: 'train', url: dir + 'sound/train' + sound_ext, autoLoad: true});
			sound.void = soundManager.createSound({id: 'void', url: dir + 'sound/void' + sound_ext, autoLoad: true});
			sound.exit = soundManager.createSound({id: 'exit', url: dir + 'sound/room' + sound_ext, autoLoad: true});

		}); 
		
//muting sound

soundManager.onready(function() {
	if ( $.jStorage.get('mute') ) {
		soundManager.mute();  
		$('#switch_sound').removeClass('on').addClass('off');
	}
	$(document).on('click', '#switch_sound.on', function () {
		$(this).removeClass('on').addClass('off');
		soundManager.mute();
		$.jStorage.set('mute', true);
	});
	$(document).on('click', '#switch_sound.off', function () {
		$(this).removeClass('off').addClass('on');
		soundManager.unmute();
		$.jStorage.set('mute', false);
	});  
});