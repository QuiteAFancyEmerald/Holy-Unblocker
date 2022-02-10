var initSettings = ()=>{
		var navButtons = {
				general: new button('General', 100, 50),
				accounts: new button('Accounts', 100, 50),
				proxy: new button('Proxy', 100, 50),
				sysinfo: new button('Env. Info', 100, 50),
				about: new button('About', 100, 50),
			},
			screenResButtons = {
				'1280x720': new button('720p', 100, 50),
				'1920x1080': new button('1080p', 100, 50),
			},
			switches = {
				'pee': new cswitch(50, 25, false),
			},
			cradios = {
				'1280x720': new cradio('1280x720', 25, false),
				'1366x768': new cradio('1366x768', 25, false),
				'1920x1080': new cradio('1920x1080', 25, false),
			},
			programLinks = {
				'wallpaperpicker': new button('Wallpaper Picker', 125, 25),
			},

			// Things for the accounts tab
			accLoadProf = {
				'loadprofile': new button('Load', 75, 30),
			},
			accLoadInput = new inputbar( 0, 0, 'Profile URL', (key, str)=>{
				//something here, used for accounts page
			},
			submit_str =>{
				accLoadInput.value = '';
				// submit_str is equal to submitted value
			}),
			accChangeNameInput = new inputbar( 0, 0, 'New Name', (key, str)=>{
				//FUCK
			},
			submit_str =>{
				accChangeNameInput.value = '';
				// submit_str is equal to submitted value
			}),
			accChangeName = {
				'changename': new button('Change', 75, 30),
			},
			accExportProf = {
				'exportprof': new button('Export', 75, 30),
			},
			accClearData = {
				'cleardata': new button('Clear Data & Reload', 150, 30),
			},
			accResetAll = {
				'resetall': new button('Reset vibeOS', 150, 30),
			},
			
			activeTab = 'general',
			
			window = new cwindow('wallpaper-picker', 50, 50, (ele)=>{
				var remainingX = ele.x + 130,
					remainingWidth = ele.width - 130; // calculated remaining space from the sidebar
				
				switch(activeTab){
					case'general':
						// do rendering stuff for general tab

						mctx.fillStyle = '#000';						
						mctx.textAlign = 'start';
						mctx.font = '16px Open Sans';
						mctx.fillText(`Your Screen Resolution: ${screen.width}x${screen.height}`, remainingX + 16, ele.y + 60)
						mctx.fillText(`Current Environment Resolution: ${msize.w}x${msize.h}`, remainingX + 16, ele.y + 80);
						
						// todo: dropdown menu and radio buttons
						
						Object.entries(cradios).forEach((e,i)=>{ // Screen Res Selection
							if(e[1] == null)return;
							
							e[1].this().interactable.x = remainingX + 20
							
							e[1].this().interactable.y = ele.y + 100 + i * 30
					
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;
							
							e[1].this().render();
						});

						mctx.fillRect(remainingX + 15, ele.y + 200, remainingWidth - 25, 2); // seperator
						mctx.fillText(`Looking for something?`, ele.x + 150 , ele.y + 230);		

						Object.entries(programLinks).forEach((e,i)=>{ // program link buttons (wallpaper)
							if(e[1] == null)return;
							
							e[1].this().interactable.x = remainingX + 16
							
							e[1].this().interactable.y = ele.y + 250 + i * 30
					
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;
							
							e[1].this().render();
						});


						
						break
					case'accounts':
						mctx.fillStyle = '#000' // font color
						mctx.font = '16px Open Sans' // font and size
						mctx.fillText('Enter the URL to your profile to load settings', ele.x + 145, ele.y + 55);
						mctx.fillText('and apps. File upload currently unsupported.', ele.x + 145, ele.y + 75);
						accLoadInput.interactable.x = ele.x + 145;
						accLoadInput.interactable.y = ele.y + 90;
						accLoadInput.render();

						Object.entries(accLoadProf).forEach((e,i)=>{ 
							if(e[1] == null)return;
							e[1].this().interactable.x = remainingX + 275 //x
							e[1].this().interactable.y = ele.y + 90 + i * 30 //y
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;							
							e[1].this().render();
						});

						mctx.fillStyle = '#000' // font color
						mctx.font = '16px Open Sans' // font and size
						mctx.fillText('Current:', ele.x + 145, ele.y + 150);
						mctx.font = 'bold 16px Open Sans'
						mctx.fillText('NOT LOADED', ele.x + 220, ele.y + 150);

						//br
						mctx.fillRect(remainingX + 15, ele.y + 170, remainingWidth - 25, 2);
						//br

						mctx.fillStyle = '#000' // font color
						mctx.font = '16px Open Sans' // font and size
						mctx.fillText('Change Profile name:', ele.x + 145, ele.y + 200);
						accChangeNameInput.interactable.x = ele.x + 145;
						accChangeNameInput.interactable.y = ele.y + 213;
						accChangeNameInput.render();

						Object.entries(accChangeName).forEach((e,i)=>{ 
							if(e[1] == null)return;
							e[1].this().interactable.x = remainingX + 275 //x
							e[1].this().interactable.y = ele.y + 213 + i * 30 //y
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;							
							e[1].this().render();
						});

						mctx.fillStyle = '#000' // font color
						mctx.font = '16px Open Sans' // font and size
						mctx.fillText('Status:', ele.x + 145, ele.y + 270);
						mctx.font = 'bold 16px Open Sans'
						mctx.fillText('NOT MODIFIED', ele.x + 220, ele.y + 270);

						Object.entries(accExportProf).forEach((e,i)=>{ 
							if(e[1] == null)return;
							e[1].this().interactable.x = remainingX + 275 //x
							e[1].this().interactable.y = ele.y + 250 + i * 30 //y
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;							
							e[1].this().render();
						});

						mctx.fillStyle = '#000' // font color
						mctx.font = 'italic 16px Open Sans' // font and size
						mctx.textAlign = 'center';
						mctx.fillText('1c57cb5c-eb43-4ef1-8005-a516cea5085c', remainingX + remainingWidth / 2, ele.y + 310);

						//br
						mctx.fillRect(remainingX + 15, ele.y + 330, remainingWidth - 25, 2);
						//br

						Object.entries(accClearData).forEach((e,i)=>{ 
							if(e[1] == null)return;
							e[1].this().interactable.x = remainingX + 27 //x
							e[1].this().interactable.y = ele.y + 350 + i * 30 //y
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;							
							e[1].this().render();
						});

						Object.entries(accResetAll).forEach((e,i)=>{ 
							if(e[1] == null)return;
							e[1].this().interactable.x = remainingX + 195 //x
							e[1].this().interactable.y = ele.y + 350 + i * 30 //y
							e[1].this().interactable.index = ele.contentBox.index + 3 + i;							
							e[1].this().render();
						});



						break
					case'proxy':
						mctx.fillStyle = '#000' // font color
						mctx.font = '16px Open Sans' // font and size
						mctx.fillText('The proxy page is unavailable.', ele.x + 140, ele.y + 50);
						break
					case 'sysinfo':
						mctx.fillStyle = '#000'
						mctx.font = '15px Open Sans'

						lines = [],
						blines = [], // temp variable
						lineHeight = 16,
						textSize = 15;

						lines.push(`Version: PuB 2.0 (GitHub Release)`);
						lines.push(`Platform: ${navigator.platform}`); 
						lines.push(`Screen Resolution: ${screen.width}x${screen.height}`);
						lines.push(`Window Resolution: ${screen.availWidth}x${screen.availHeight}`);
						lines.push(`Environment Resolution: ${msize.w}x${msize.h}`);
						lines.push(`URL: ${unescape(location.href)}`);
						lines.push(`User Agent: ${navigator.userAgent}`);
						
						lines.forEach((e,i)=>{
							wordWrap(e, remainingWidth / 7.6).split('\n').forEach((ee,ii)=>{
								blines.push(ee);
							});
						});
						
						blines.forEach((e,i)=>{
							// if(clines.length >= window.height / textSize - 4 + (textSize - lineHeight) )clines.shift();
							mctx.fillStyle='#000';
							mctx.font = textSize+'px Open Sans';
							mctx.fillText(e, remainingX + 15 , window.y + 50 + i*1.5*lineHeight);
						});
						
						break
					case'about': // the tab is on about stuff
						
						// main title

						

						mctx.fillStyle = '#000' // font color
						mctx.font = 'bolder 30px Open Sans' // font and size
						mctx.textAlign = 'center'; // use these for near perfect centering
						mctx.fillText('vibeOS Public Beta', remainingX + remainingWidth / 2, ele.y + 75);
						mctx.textAlign = 'start';
						
						// black line seperating text
						
						mctx.fillRect(remainingX + 15, ele.y + 100, remainingWidth - 25, 2);
						
						mctx.fillStyle = '#000'
						mctx.font = '15px Open Sans'
						mctx.fillText('vibeOS was created by', remainingX + 15, ele.y + 125);
						mctx.font = 'bold 15px Open Sans';
						mctx.fillText('Divide (@vibedivde)', remainingX + 15, ele.y + 150);   // DIVIDE NAME HERE
						mctx.fillText('Nathan M. (@ctaetcsh)', remainingX + 15, ele.y + 175);     // CTAETCSH NAME HERE
						mctx.fillText('Ryan W. (@LinuxTerm)', remainingX + 15, ele.y + 200);    // LINUXTERM NAME HERE
						mctx.font = '15px Open Sans'
						mctx.fillText('with help from', remainingX + 15, ele.y + 225);
						mctx.font = 'bold 15px Open Sans';
						mctx.fillText('Eli', remainingX + 15, ele.y + 250);   
						mctx.fillText('SexyDuceDuce', remainingX + 15, ele.y + 275);     
						mctx.fillText('Cat Lady', remainingX + 15, ele.y + 300);    
						mctx.fillText('IStealYourMemes', remainingX + 15, ele.y + 325);
						mctx.font = '15px Open Sans'
						mctx.textAlign = 'center'; // use these for near perfect centering
						mctx.fillText('Copyright 2020 vibeOS Development Team', remainingX + remainingWidth / 2, ele.y + 405);
						mctx.fillText('vibeOS is Open Source Software', remainingX + remainingWidth / 2, ele.y + 425);
						mctx.textAlign = 'start';

						
						

						
						break
				}
				
				// do button rendering and sidebar last
				
				mctx.fillStyle='#212121';
				mctx.strokeStyle='#212121';
				
				mctx.roundRect(ele.x, ele.contentBox.y, 130, ele.height - 10, 15);
				
				mctx.fillRect(ele.x, ele.contentBox.y, 130 / 2, 15)
				
				Object.entries(navButtons).forEach((e,i)=>{
					if(e[1] == null)return;
					
					e[1].this().interactable.x = ele.x + 14
					
					e[1].this().interactable.y = ele.y + 45 + i * 65
			
					e[1].this().interactable.index = ele.contentBox.index + 1 + i;
					
					e[1].this().render();
				});
				
			});
		
		Object.entries(navButtons).forEach((e,i)=>{
			if(e[1] == null)return;
			
			e[1].this().interactable.clickend = ()=>{
				if(e[1].this().interactable.hover != true)return;
				activeTab = e[0];
			}
		});

		Object.entries(programLinks).forEach((e,i)=>{
			if(e[1] == null)return;
			
			e[1].this().interactable.clickend = ()=>{
				if(e[1].this().interactable.hover != true)return;
				initWallpaperPicker();
			}
		});
		
		Object.entries(cradios).forEach((e,i)=>{
			if(e[1] == null)return;
			
			var prevFunc = e[1].this().interactable.clickend; // have this somewhere since we overwrite it
			
			e[1].this().interactable.clickend = ()=>{
				// prevFunc();
				
				Object.entries(cradios).forEach((ee,ii)=>{
					ee[1].this().value = false;
				});
				
				e[1].this().value = true
				
				// if(e[1].this().value != true)return;
				
				var res = e[0].split('x'), // [1920, 1080]
					pre_msize = [msize.w, msize.h] // store previoous value
				
				msize.w = res[0]
				msize.h = res[1]
				
				var countdownStr = 4,
					confirmPrompt = {},
					
					countdownInterval = ()=>{
						if(countdownStr > 0){
							countdownStr-- // reduce countdown by 1 digit
						}else{ // countdown has timed out
							if(confirmPrompt.closed == true)return; // user has already selected a choice or somethin 
							
							clearInterval(interval);
							
							msize.w = pre_msize[0];
							msize.h = pre_msize[1];
							
							confirmPrompt.window.close();
							confirmPrompt.closed = true;
							
						}
					},
					interval = setInterval(countdownInterval, 1000);

				
				
				confirmPrompt = new cPrompt('Confirm screen resolution', 'ee',
					()=>{
						// on true
						
						msize.w = res[0];
						msize.h = res[1];
					},
					()=>{
						// on false
						
						msize.w = pre_msize[0];
						msize.h = pre_msize[1];
					},
					(cPrompt)=>{
						// on render
						
						cPrompt.value = `Keep selected resolution? Will revert in ${countdownStr}...`;
					},
					above_high_renq // define this since we want it to show above EVERYTHING
				)

			}
		});
		
		
		
		window.width = 500
		window.height = 418

		accLoadInput.interactable.width = 250;
		accLoadInput.interactable.height = 30;
		accChangeNameInput.interactable.width = 250;
		accChangeNameInput.interactable.height = 30;
		accLoadInput.interactable.index = window.contentBox.index + 1;

		
		
		window.icon = 'categories/24/package_settings.png'
		window.title = 'vibeOS Settings'
	}
