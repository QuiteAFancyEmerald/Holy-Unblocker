var startEntries = [
		{
			value: 'Settings',
			icon: 'categories/16/configuration_section.png',
			type: 'folder',
			entries: [
				{
					value: 'vibeOS settings',
					icon: 'categories/16/package_settings.png',
					func: initSettings,
				},
				{
					value: 'Wallpaper Picker',
					icon: 'apps/24/preferences-desktop-wallpaper.png',
					func: initWallpaperPicker,
				},
				{
					value: 'Auto Resolution',
					icon: 'devices/16/monitor.png',
					func: ctAutoRes,
				},
			],
		},
		{
			value: 'Accessories',
			icon: 'categories/16/applications-accessories.png',
			type: 'folder',
			entries: [
				{
					value: 'Emulator',
					icon: 'apps/16/bash.png',
					func: initLinuxVM,
				},
			],
		},
		{
			value: 'Graphics',
			icon: 'categories/16/applications-graphics.png',
			type: 'folder',
			entries: [
				{
					value: 'Nsvg',
					icon: 'mimetypes/16/svg.png',
					func: ()=>{
						initWebView('Nsvg for vibeOS', 'mimetypes/16/svg.png', 'appfiles/nsvg/ctloader.html', 1000, 800, false)
					},
				}
			],
		},
		{
			value: 'Internet',
			icon: 'categories/16/applications-internet.png',
			type: 'folder',
			entries: [
				{
					value: 'vibeBrowser',
					icon: 'apps/16/internet-web-browser.png',
					func: initBrowser,
				},
				{
					value: 'CPAITC',
					icon: 'apps/16/pix.png',
					func: initcpaitc,
				}
			],
		},
		{
			value: 'Multimedia',
			icon: 'categories/16/applications-multimedia.png',
			type: 'folder',
			entries: [
				
			],
		},
		{
			value: 'Office',
			icon: 'categories/16/applications-office.png',
			type: 'folder',
			entries: [
				{
					value: 'Text Editor',
					icon: 'categories/16/applications-office.png',
					func: initTextEditor,
				},
			],
		},
		{
			value: 'System',
			icon: 'categories/16/applications-system.png',
			type: 'folder',
			entries: [
				{
					value: 'JS Terminal',
					icon: 'apps/16/bash.png',
					func: initJsTerm,
				},
			],
		},
		{
			value: 'Webviews',
			icon: 'mimetypes/16/html.png',
			type: 'folder',
			entries: [
				{
					value: 'DuckDuckGo',
					icon: 'mimetypes/16/html.png',
					func: ()=>{
						initWebView('[Proxied Webapp] DuckDuckGo', 'mimetypes/16/html.png', 'https://duckduckgo.com/', 800, 600)
					},
				},
				{
					value: 'Bing',
					icon: 'mimetypes/16/html.png',
					func: ()=>{
						initWebView('[Proxied Webapp] Bing', 'mimetypes/16/html.png', 'https://bing.com/', 800, 600, false)
					},
				},
			],
		},
		{
			value: 'Demos',
			icon: 'mimetypes/16/gnome-package.png',
			type: 'folder',
			entries: [
				{
					value: 'windowtest1',
					icon: 'categories/16/package_settings.png',
					func: ()=>{
						// first window to be made during testing

						var demoWindow = new cwindow('demo-window', 50, 50, (ele)=>{
								
						});

						demoWindow.title = 'spicy!';
						demoWindow.width = 500;
						demoWindow.height = 250;

						demoWindow.x = 600;
						demoWindow.y = 300;
					},
				},
				{
					value: 'Transcript',
					icon: 'mimetypes/16/text-x-generic.png',
					func: initTranscript,
				},
			],
		},
		{
			value: 'Games',
			icon: 'categories/16/applications-games.png',
			type: 'folder',
			entries: [
				{
					value: '2048',
					icon: 'categories/16/applications-games.png',
					func: ()=>{
						initWebView('2048', 'categories/16/applications-games.png', 'appfiles/2048/index.html', 550, 800, false)
					},
				},
				{
					value: 'Tetris',
					icon: 'categories/16/applications-games.png',
					func: ()=>{
						initWebView('Tetris', 'categories/16/applications-games.png', 'appfiles/tetris/index.html', 760, 740, false)
					},
				},
				{
					value: 'Breakout',
					icon: 'categories/16/applications-games.png',
					func: ()=>{
						initWebView('Tetris', 'categories/16/applications-games.png', 'appfiles/breakout/index.html', 700, 570, false)
					},
				},
			],
		},
		{
			value: 'System Docs',
			icon: 'mimetypes/16/text-x-generic.png',
			type: 'folder',
			entries: [
				{
					value: 'vibeOS Licence',
					icon: 'mimetypes/16/text-x-generic.png',
					func: initLicenceViewer,
				},
				{
					value: 'vibeOS Readme',
					icon: 'mimetypes/16/text-x-generic.png',
					func: initReadmeViewer,
				},
			],
		},
	],
	mainID = 'desktop',
	startOpen = false,
	taskBarButtonStyle = (index)=>{
		var entry = interactables[index];
		
		if(false == true /*cursor.focus == index*/){
			// border
			
			if(entry.hover)mctx.fillStyle = '#2B71BC'
			else mctx.fillStyle = '#828282';
			mctx.fillRect(entry.x, entry.y, entry.width + 1, entry.height + 1);
			
			// contents
			
			if(entry.hover)mctx.fillStyle = hoverGrad;
			else mctx.fillStyle = '#FCFCFC';
			mctx.fillRect(entry.x + 1, entry.y + 1, entry.width - 1, entry.height - 1);
			
			if(entry.hover)mctx.fillStyle = '#E9F3FD'
			else mctx.fillStyle = '#3F3F3F';
		}else if(entry.hover){
			mctx.fillStyle = '#2D557F';
			mctx.fillRect(entry.x, entry.y, entry.width, entry.height);
			
			mctx.fillStyle = '#4890DA';
			mctx.fillRect(entry.x + 1, entry.y + 1, entry.width - 1, entry.height - 2);
			
			mctx.fillStyle = '#287CD5';
			mctx.fillRect(entry.x + 2, entry.y + 2, entry.width - 3, entry.height - 4);
		
		}else{
			mctx.fillStyle = '#1C1C1C';
			mctx.fillRect(entry.x, entry.y, entry.width, entry.height);
		}
	
	},
	desktop = new interactable(mainID + 'desktop', msize.w, msize.h,
		emptyFunction,
		emptyFunction,
		(e)=>{
			// click start
			
			startOpen = false
			
			if(e.which == 3)desktop.contextOpen = !desktop.contextOpen
			else desktop.contextOpen = false
			
			desktop.contextX = e.layerX
			desktop.contextY = e.layerY
		}
	),
	taskBar = new interactable(mainID + '_contentbox', msize.w, 26,
		emptyFunction,
		emptyFunction,
		()=>{
			// click start
		}
	),
	applications = new interactable(mainID + '_contentbox', 102, 25,
		emptyFunction,
		emptyFunction,
		()=>{
			// click start
			
			startOpen = !startOpen
		}
	),
	hoverGrad = mctx.createLinearGradient(0, 0, 25 * 10, 0),
	contextMenuEntries=[
		{
			value: 'Change wallpaper',
			icon: 'apps/16/preferences-desktop-wallpaper.png',
			func: initWallpaperPicker,
		},
		{
			value: 'JS Terminal',
			icon: 'apps/16/bash.png',
			func: initJsTerm,
		},
	];

hoverGrad.addColorStop(0, '#5DA9F9');
hoverGrad.addColorStop(1, '#3B90E8');

applications.x = 0;
applications.y = 0;
applications.index = 10;

desktop.index = -1;

contextMenuEntries.forEach((e,i)=>{
	e.interactable = new interactable('desktop_contextBox_' + e.value.toLowerCase().trim(), 160, 25,
			emptyFunction,
			emptyFunction,
			()=>{
				// click start
				e.func();
				desktop.contextOpen = false;
			},
			()=>{
				// click end
			},
		);
	
	e.interactable.disabled = true; // reenable when contextmenu is open
	
	e.interactable.index = 100;
});

highRenq.push(()=>{
	desktop.width = msize.w
	desktop.height = msize.h
	
	taskBar.width = msize.w
	
	if(desktop.contextOpen){
		// mctx.fillStyle = '#FCFCFC';
		// mctx.fillRect(desktop.contextX, desktop.contextY, 160, 25 * 5);
		
		if(cursor.down && desktop.contextX != cursor.x && desktop.contextY != cursor.y && contextMenuEntries.some((e,i)=> !e.interactable.hover ) )desktop.contextOpen = false;
		
		contextMenuEntries.forEach((e,i)=>{
			e.interactable.disabled = false;
			
			e.interactable.x = desktop.contextX;
			e.interactable.y = desktop.contextY + i * 25;

			// border
			
			if(e.interactable.hover)mctx.fillStyle = '#2B71BC'
			else mctx.fillStyle = '#828282';
			mctx.fillRect(e.interactable.x, e.interactable.y, e.interactable.width + 1, e.interactable.height + 1);
			
			// contents
			
			if(e.interactable.hover)mctx.fillStyle = hoverGrad;
			else mctx.fillStyle = '#FCFCFC';
			mctx.fillRect(e.interactable.x + 1, e.interactable.y + 1, e.interactable.width - 1, e.interactable.height - 1);
			
			if(e.interactable.hover)mctx.fillStyle = '#E9F3FD'
			else mctx.fillStyle = '#3F3F3F';
			
			mctx.font = '13px Open Sans';
			mctx.fillText(e.value, e.interactable.x + 27, e.interactable.y + 17);
			
			// icon
			
			mctx.drawImageURL('./tango/' + e.icon, e.interactable.x + 6, e.interactable.y + 5, 16, 16);
			
		});
	}else{
		contextMenuEntries.forEach((e,i)=>{
			e.interactable.disabled = true;
		});
	}
});

startEntries.forEach((e,i) => {
	e.interactable = new interactable('startEntry_contentbox' + e.value.toLowerCase().trim(), 160, 25,
			emptyFunction,
			emptyFunction,
			()=>{
				// click start
				
				startEntries.forEach((ee,ii)=>{
					if(ii == i)return; // dont close this folder, do the others only!
					ee.open = false;
				});
				
				e.open = !e.open;
			},
			()=>{
				// click end
			},
		);
	e.interactable.x = 0;
	e.interactable.y = 26 + i * 25;
	
	e.interactable.disabled = true; // reenable when startmenu is open
	
	e.interactable.index = 100;
	
	e.entries.forEach((entry,index)=>{
		entry.interactable = new interactable('startEntry_entry_' + entry.value.toLowerCase().trim(), 160, 25,
				emptyFunction,
				emptyFunction,
				()=>{
					// click start
					entry.func();
				},
				()=>{
					// click end
				},
			);
		
		entry.interactable.disabled = true; // reenable when startmenu is open
		
		entry.interactable.x = 160;
		entry.interactable.y = 26 + i * 25 + index * 25;
		
		entry.interactable.index = 100;
	});
});

highRenq.push(()=>{
	// taskbar
	
	mctx.fillStyle = '#1C1C1C';
	mctx.fillRect(0, 0, taskBar.width, taskBar.height);
	
	if(cursor.down && !startEntries.some(e=> e.interactable.hover ) && !applications.hover)startOpen = false;;
	
	// applications button
	
	if(startOpen){
		mctx.fillStyle = '#3E3E3E';
		mctx.fillRect(applications.x, applications.y, applications.width, applications.height);
		
		mctx.fillStyle = '#494949';
		mctx.fillRect(applications.x + 1, applications.y + 1, applications.width - 1, applications.height - 1);
		
		// element.disabled = true/false
		
		startEntries.forEach((e,i) => {
			
			e.interactable.disabled = false; // make element clickable again
			
			// border
			
			if(e.interactable.hover)mctx.fillStyle = '#2B71BC'
			else mctx.fillStyle = '#828282';
			mctx.fillRect(e.interactable.x, e.interactable.y, e.interactable.width + 1, e.interactable.height + 1);
			
			// contents
			
			if(e.interactable.hover)mctx.fillStyle = hoverGrad;
			else mctx.fillStyle = '#FCFCFC';
			mctx.fillRect(e.interactable.x + 1, e.interactable.y + 1, e.interactable.width - 1, e.interactable.height - 1);
			
			if(e.interactable.hover)mctx.fillStyle = '#E9F3FD'
			else mctx.fillStyle = '#3F3F3F';
			
			mctx.font = '13px Open Sans';
			mctx.fillText(e.value, e.interactable.x + 27, e.interactable.y + 17);
			
			// icon
			
			mctx.drawImageURL('./tango/' + e.icon, e.interactable.x + 6, e.interactable.y + 5, 16, 16);
			
			// arrow on folder + other biz
			
			if(e.entries != null && e.entries.length >= 1){
				mctx.font = '12px Roboto';
				mctx.fillText('⯈', e.interactable.x + e.interactable.width - 20, e.interactable.y + 18);
				
				if(e.open){ // folder has been expanded and opened
					e.entries.forEach((entry,index)=>{
						
						entry.interactable.disabled = false;
						
						// border
						
						if(entry.interactable.hover)mctx.fillStyle = '#2B71BC'
						else mctx.fillStyle = '#828282';
						mctx.fillRect(entry.interactable.x, entry.interactable.y, entry.interactable.width + 1, entry.interactable.height + 1);
						
						// contents
						
						if(entry.interactable.hover)mctx.fillStyle = hoverGrad;
						else mctx.fillStyle = '#FCFCFC';
						mctx.fillRect(entry.interactable.x + 1, entry.interactable.y + 1, entry.interactable.width - 1, entry.interactable.height - 1);
						
						if(entry.interactable.hover)mctx.fillStyle = '#E9F3FD'
						else mctx.fillStyle = '#3F3F3F';
						
						mctx.font = '13px Open Sans';
						mctx.fillText(entry.value, entry.interactable.x + 27, entry.interactable.y + 17);

						// icon
						
						mctx.drawImageURL('./tango/' + entry.icon, entry.interactable.x + 6, entry.interactable.y + 5, 16, 16);
					});
				}else{
					e.entries.forEach((entry,index)=>{
						entry.interactable.disabled = true;
					});
				}
			}
			
		});
	
	}else if(applications.hover){
		mctx.fillStyle = '#2D557F';
		mctx.fillRect(applications.x, applications.y, applications.width, applications.height);
		
		mctx.fillStyle = '#4890DA';
		mctx.fillRect(applications.x + 1, applications.y + 1, applications.width - 1, applications.height - 2);
		
		mctx.fillStyle = '#287CD5';
		mctx.fillRect(applications.x + 2, applications.y + 2, applications.width - 3, applications.height - 4);
		
	}else{
		mctx.fillStyle = '#1C1C1C';
		mctx.fillRect(applications.x, applications.y, applications.width, applications.height);
	}
	
	if(!startOpen || startOpen == false){
		startEntries.forEach((e,i)=>{
			e.open = false;
			e.interactable.disabled = true;
			e.entries.forEach(entry => {
				entry.interactable.disabled = true; // disable these so when closed they wont be able to suddenly be clicked or hovered on
			});
		});
	}
	// applications-button
	
	mctx.fillStyle='#F2F2F2';
	mctx.font = '13px Open Sans';
	mctx.fillText('Applications', applications.x + 23, applications.y + 17);
	mctx.drawImageURL('tango/applications-button.png', applications.x + 3, applications.y + 5, 15, 15);
});

var timeBox = new interactable(mainID + 'timeBox', 75, 24,
		emptyFunction,
		emptyFunction,
		()=>{
			// click start
		}
	),
	dateStr='',
	timeStr='';
		
setInterval(()=>{
	timeStr=new Date().toLocaleString(undefined,{localeMatcher:'lookup',hour: 'numeric',minute: 'numeric'});
	dateStr=new Intl.DateTimeFormat('en-US',{day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date());
}, 100);

highRenq.push(()=>{

	timeBox.width = 145;
	timeBox.x = msize.w - timeBox.width;
	timeBox.height = taskBar.height;

	taskBarButtonStyle(timeBox.id);
	
	mctx.fillStyle='#F2F2F2';
	mctx.font = '13px Open Sans';
	mctx.fillText(dateStr + ', ' + timeStr, timeBox.x + 10, timeBox.y + 17);
});