var decodeEntities = str=>{
		var element = document.createElement('div');
		if(!str || typeof str != 'string')return;
		
		// strip script/html tags

		str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		element.innerHTML = str;
		str = element.textContent;
		element.textContent = '';

		return str;
	},
	RGBToHex = (rgb)=>{
		// Choose correct separator
		var sep = rgb.indexOf(",") > -1 ? "," : " ",
			color = {};
		// Turn "rgb(r,g,b)" into [r,g,b]
		rgb = rgb.substr(4).split(")")[0].split(sep);

		color.r = (+rgb[0]).toString(16),
		color.g = (+rgb[1]).toString(16),
		color.b = (+rgb[2]).toString(16);

		if (color.r.length == 1)
		r = "0" + color.r;
		if (color.g.length == 1)
		g = "0" + color.g;
		if (color.b.length == 1)
		b = "0" + color.b;

		return "#" + color.r + color.g + color.b;
	}

var screenRoot = document.createElement('div'),
	screenText = document.createElement('div'),
	screenCanvas = document.createElement('canvas'),
	filePicker = document.createElement('input');

hiddenContainer.appendChild(filePicker);
filePicker.setAttribute('type', 'file');

var emulator = {},
	vmWindow = {},
	profileData = {
			memory_size: 256 * 1024 * 1024,
			vga_memory_size: 16 * 1024 * 1024,
			screen_container: screenRoot,
			
			bios: {
				url: 'https://sys32.dev/assets/v86/bios/seabios.bin',
			},
			
			vga_bios: {
				url: 'https://sys32.dev/assets/v86/bios/vgabios.bin',
			},
			
			network_relay_url: 'wss://relay.widgetry.org/',
			
			autostart: true,
		},
		profiles = {
			arch: {
                memory_size: 128 * 1024 * 1024,
                vga_memory_size: 8 * 1024 * 1024,
				initial_state: {
					url: 'https://sys32.dev/assets/v86/images/archState.bin',
					size: 142770436,
				},
				fda: null,
				hda: {
					url: 'https://sys32.dev/assets/v86/images/archBruh.img',
					async: true,
					size: 10 * 1024 * 1024 * 1024,
				},
				filesystem: {
					baseurl: 'https://ldm.sys32.dev/arch/',
					basefs: 'https://sys32.dev/assets/v86/images/fs.json',
				},
				cdrom: null,
			},
			linux4: {
				initial_state: null,
				hda: null,
				fda: null,
				filesystem: null,
				cdrom: {
					url: 'https://sys32.dev/assets/v86/images/linux4.iso',
				}	
			},
			linux3: {
				initial_state: null,
				hda: null,
				fda: null,
				filesystem: null,
				cdrom: {
					url: 'https://sys32.dev/assets/v86/images/linux3.iso',
				}	
			},
			ubuntu410: {
				initial_state: null,
				hda: { 
					buffer: new ArrayBuffer(16 * 1024 * 1024)
				},
				fda: null,
				filesystem: null,
				cdrom: {
					url: 'https://sys32.dev/assets/v86/images/warty-release-live-i386.iso',
				}	
			},
			kolibri: {
				initial_state: null,
				hda: { 
					buffer: new ArrayBuffer(16 * 1024 * 1024)
				},
				fda: null,
				filesystem: null,
				cdrom: {
					url: 'https://sys32.dev/assets/v86/images/kolibri.iso',
				}	
			},
			windows98: {
				memory_size: 64 * 1024 * 1024,
				initial_state: {
					url: 'https://sys32.dev/assets/v86/images/windows98_state.bin',
					size: 75705744,
				},
				hda: {
					url: 'https://sys32.dev/assets/v86/images/windows98.img',
					async: true,
					size: 300 * 1024 * 1024,
				},
				fda: null,
				filesystem: null,
				cdrom: null,
			},
			windows95: {
				memory_size: 32 * 1024 * 1024,
				initial_state: {
					url: 'https://sys32.dev/assets/v86/images/windows95_state.bin',
					size: 42151316,
				},
				hda: {
					url: 'https://sys32.dev/assets/v86/images/WIN95.img',
					async: true,
					size: 242049024,
				},
				fda: null,
				filesystem: null,
				cdrom: null,
			},
			msdos: {
				filesystem: null,
				initial_state: null,
				cdrom: null,
				hda: null,
				fda: {
					url: 'https://sys32.dev/assets/v86/images/msdos.img',
				}
			}
		},
		vmMsg = 'Testing',
		activeConfig = {},
		
		emuSizeListener = (e)=>{
			// console.log(e);
			if(e[0] > 700)vmWindow.width = e[0]
			if(e[1] > 460)vmWindow.height = e[1] + 35
			return e
		},
		loadProfile = (profileName)=>{
			vmMsg = `Your profile, ${profileName}, will load shortly..`;
			
			// is there an effective way to destory the previous emulator?
			
			if(typeof emulator.stop == 'function'){
				emulator.stop();
				emulator.destroy();
			}
			
			var tmp = profileData,
				profile = profiles[profileName];
			
			Object.entries(profile).forEach((e,i)=>{
				if(e[1] == null)return;
				tmp[e[0]] = e[1]; // move profile data to the full filled thing
			});
			
			tmp.autostart = true
			
			emulator = new V86Starter(tmp);
			
			vmWindow.width = 700
			vmWindow.height = 460
			
			activeConfig = tmp 
			
			emulator.add_listener('screen-set-size-graphical', emuSizeListener);
		},
		stateee,
		blob_state;

hiddenContainer.appendChild(screenRoot);
screenRoot.appendChild(screenText);
screenRoot.appendChild(screenCanvas);

filePicker.addEventListener('change', e=>{
	if(state == null || filePicker.files[0] == null)return;
	
	var file = e.target.files[0],
		filereader = new FileReader();
	
	emulator.stop();

	filereader.addEventListener('load', e=>{
		emulator.restore_state(e.target.result);
		emulator.run();
	});

	filereader.readAsArrayBuffer(file); // load file into filereader
	
});

var initLinuxVM = (()=>{
		// emulator.run();
		
		loadProfile('windows95');
		
		var wino = new windowOptions([
			{
				value: 'VM',
				contents: [
					{
						value: 'Run',
						func: ()=>{
							emulator.run();
						},
					},
					{
						value: 'Reboot',
						func: ()=>{
							emulator.stop();
							emulator.restart();
							vmWindow.width = 700;
							vmWindow.height = 460;
						},
					},
					{
						value: 'Stop',
						func: ()=>{
							emulator.stop();
							vmWindow.width = 700;
							vmWindow.height = 460;
						},
					},
					{
						value: 'Lock cursor',
						func: ()=>{
							emulator.lock_mouse();
						},
					},
					
				]
			},
			{
				value: 'State',
				contents: [
					{
						value: 'Load File',
						func: ()=>{
							filePicker.click();
						},
					},
					{
						value: 'Save File',
						func: ()=>{
							emulator.save_state((error, new_state)=>{
								if(error){
									vmMsg = error.message
									
									return
								}
								
								var a = document.createElement("a");
								a.download = 'v86state.bin';
								a.href = window.URL.createObjectURL(new Blob([new_state]));
								a.dataset.downloadurl = 'application/octet-stream:' + a.download + ':' + a.href;
								a.click();
								
								stateee = new_state;
								
								vmMsg = 'Saved state of ' + new_state.byteLength + ' bytes';
							});

						this.blur();
						},
					},
					{
						value: 'Load',
						func: ()=>{
							if(stateee != null){
								var filereader = new FileReader();
								emulator.stop();

								filereader.addEventListener('load', e=>{
									emulator.restore_state(e.target.result);
									emulator.run();
								});

								filereader.readAsArrayBuffer(stateee);
							}
						},
					},
					{
						value: 'Save',
						func: ()=>{
							emulator.save_state(function(error, new_state){
								if(error){
									throw error;
								}

								vmMsg = 'Saved state of ' + new_state.byteLength + ' bytes';
								
								state = new_state;
								blob_state = new Blob([state.buffer]);
							});
						},
					},
					
				]
			},
			{
				value: 'Profiles',
				contents: [
					{
						value: 'Arch Linux',
						func: ()=>{
							loadProfile('arch');
						},
					},
					{
						value: 'Linux 4',
						func: ()=>{
							loadProfile('linux4');
						},
					},
					{
						value: 'Linux 3',
						func: ()=>{
							loadProfile('linux3');
						},
					},
					{
						value: 'Ubuntu 4.10',
						func: ()=>{
							loadProfile('ubuntu410');
						}
					},
					{
						value: 'Kolibri 0.7.7.0',
						func: ()=>{
							loadProfile('kolibri');
						},
					},
					{
						value: 'MS-DOS',
						func: ()=>{
							loadProfile('msdos');
						},
					},
					{
						value: 'Windows 95',
						func: ()=>{
							loadProfile('windows95');
						},
					},
					{
						value: 'Windows 98',
						func: ()=>{
							loadProfile('windows98');
						},
					},
				]
			},
		]),
			textSize = 14,
			lineHeight = 16;

		vmWindow = new cwindow('vm-linux', 50, 50, (window)=>{
			var statusIcon = {x: window.titleBar.x + window.titleBar.width - 60, y: window.titleBar.y + 2}
			
			if(!emulator.is_running()){
				mctx.drawImageURL('./tango/actions/24/player_play.png', statusIcon.x, statusIcon.y, 24, 24);
			}else if(emulator.is_running()){
				mctx.drawImageURL('./tango/actions/24/player_pause.png', statusIcon.x, statusIcon.y, 24, 24);
				
				if(vmWindow.contentBox.hover){
					emulator.keyboard_set_status(true);
					// emulator.mouse_set_status(true);
				}else{
					emulator.keyboard_set_status(false);
					
					// emulator.mouse_set_status(false);
				}
				
			}
			if(screenText.style.display != 'none'){ // text display
				var lines = Array.from(screenText.getElementsByTagName('div')),
					display = [];
				
				lines.forEach((e,i)=>{
					var line = [],
						pixels = Array.from(e.getElementsByTagName('span'));
					
					pixels.forEach((ee,ii)=>{
						if(ee.style['background-color'].length < 6 && ee.style['background-color'].includes('#') ){
							ee.style['background-color'] = '#000000'
						}
						line.push({
							value: decodeEntities(ee.innerHTML), // this will return a group of pixels with a seperate color
							color: ee.style.color,
							bg: ee.style['background-color'] 
						});
					});
					
					if(typeof line != 'undefined' && line != null)display.push(line);
				});
				
				
				
				display.forEach((line,line_index)=>{
					mctx.textBaseline = 'middle'; 
					
					var line_data = '',
						charWidth = textSize / 2,
						charHeight = lineHeight;
					
					line.forEach((str, index)=>{
						mctx.fillStyle='#fff';
						mctx.font = textSize+'px Inconsolata';
						
						str.x = vmWindow.x + 15 + (line_data.length * charWidth);
						str.y = vmWindow.y + 70 + line_index * charHeight
						str.bg = RGBToHex(str.bg);
						str.index = index
						
						line_data += str.value
						
						if(str.bg.length >= 6){
							mctx.fillStyle = str.bg;
							mctx.fillRect(str.x, str.y - (textSize + 2)/2, 8 * str.value.length, textSize + 2);
						}
						
						mctx.fillStyle = str.color
						
						str.value.split('').forEach((chr, chr_index)=>{
							mctx.fillText(chr, str.x + chr_index * charWidth, str.y);
						});
						
					});
					
					mctx.textBaseline = 'alphabetic'; 
				});
			}else{
				mctx.drawImage(screenCanvas, vmWindow.contentBox.x, vmWindow.y + 55, screenCanvas.width, screenCanvas.height);
			}
			
			wino.render(window);
			wino.interactable.index = 30
			
			// draw status message after wino
			
			mctx.textAlign = 'end'
			
			mctx.fillText(vmMsg, window.titleBar.x + window.titleBar.width - 12, window.titleBar.y + 45);
			
			mctx.textAlign = 'start'
		});
		
		vmWindow.title = 'Emulator';
		vmWindow.width = 700;
		vmWindow.height = 460;
		vmWindow.bgColor = 'black'
		vmWindow.icon = 'apps/24/bash.png';
		vmWindow.cursor = {}
		vmWindow.cursor.hover = 'text'
		
		vmWindow.onclose = ()=>{
			emulator.stop();
		}
		
		mCanvas.addEventListener('click', ()=>{
			if(vmWindow.contentBox.hover)mCanvas.requestPointerLock();
		});
	});