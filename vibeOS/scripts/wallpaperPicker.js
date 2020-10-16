/*
	The Wallpaper Picker app has been mostly completed as of July 25.
	The plan is to incorperate a link to it in the settings app and move
	onto other peojects until such time to revisit this to add additional
	functionality. 

	- ctaetcsh
*/

var wallpapers={
		solids : [
			{
				value: '#FF8C00'
			},
			{
				
				value: '#E81123'
			},
			{
				value: '#9A0089'
			},
			{
				value: '#10893E'
			},
			{
				value: '#018574'
			},
			{
				value: '#2D7D9A'
			},
			{
				value: '#0063B1'
			},
			{
				value: '#4A5459'
			}
		],
		images : [
			{
				value: 'wallpapers/a.png',
				interactable: null,
				name: 'Default'
			},
			{
				value: 'wallpapers/b.png',
				interactable: null,
				name: 'Wave'
			},
			{
				value: 'wallpapers/c.png',
				interactable: null,
				name: 'Test Background'
			},
			{
				value: 'wallpapers/GardenTilesCT.png',
				interactable: null,
				name: 'Garden Tiles (CT)'
			},
			{
				value: 'wallpapers/SysYABranded.png',
				interactable: null,
				name: 'SysYA_Branded'
			},
			{
				value: 'wallpapers/SysYA.png',
				interactable: null,
				name: 'SysYA'
			},
			{
				value: 'wallpapers/SysYADark.png',
				interactable: null,
				name: 'SysYA_Dark'
			},
		],
	},
	initWallpaperPicker = ()=>{
		wallpapers.images.forEach(async(e,i)=>{
			e.interactable =  new interactable('desktop_contextBox_' + e.value.toLowerCase().trim() + Date.now(), 1920 / 15, 1080 / 15,
				emptyFunction,
				emptyFunction,
				()=>{
					// click start
					
					background.value = e.value;
				},
					
				()=>{
					// click end
					
				},
			);
			
			e.interactable.index = Object.entries(interactables).length
			e.image = new Image();
			e.image.src = 'tango/' + e.value
			
			e.imageDownscale = await downscale(e.image, 1920 / 15, 1080 / 15);
		});
		
		wallpapers.solids.forEach(async(e,i)=>{
			e.interactable =  new interactable('desktop_contextBox_' + e.value.trim() + Date.now(), 1920 / 15, 1080 / 15,
				emptyFunction,
				emptyFunction,
				()=>{
					// click start
					
					background.value = e.value;
				},
					
				()=>{
					// click end
					
				},
			);
			
			e.interactable.index = Object.entries(interactables).length
		});
		
		var window = new cwindow('wallpaper-picker' + Date.now(), 50, 50, (ele)=>{
				// on render
				
				mctx.font = '13px Open Sans';
				mctx.fillStyle = '#000'
				
				mctx.fillText('Wallpapers', ele.x + 20, ele.y + 55) // wallpapers label
				mctx.fillText('Solid Colors', ele.x + 20, ele.y + 160) // solid colors label
				
				var loop_thing_img = (e,i,a)=>{
						e.interactable.index = ele.contentBox.index + 1
						
						e.interactable.x = ele.x + 20 + i * (1920 / 15 + 20) // wallpaper previews on x axis
						
						e.interactable.width = 1920 / 15
						e.interactable.height = 1080 / 15
						
						e.interactable.y = ele.y + 65 // wallpaper previews on y axis
						
						mctx.drawImageURL('tango/' + e.value, e.interactable.x, e.interactable.y, e.interactable.width, e.interactable.height)
						
						mctx.lineJoin = 'miter';
						mctx.lineWidth = '2';
						
						if(e.interactable.hover){
							mctx.strokeStyle = '#fff'
							mctx.strokeRect(e.interactable.x - 2, e.interactable.y - 2, e.interactable.width + 4, e.interactable.height + 4)
						}
						
						if(e.value == background.value){
							mctx.strokeStyle = '#000'
							mctx.strokeRect(e.interactable.x - 2, e.interactable.y - 2, e.interactable.width + 4, e.interactable.height + 4)
						}
					},
					loop_thing_solids = (e,i,a)=>{
						e.interactable.index = ele.contentBox.index + 1
						
						e.interactable.x = ele.x + 20 + i * 46 // s.colors previews on x axis
						
						e.interactable.width = 44
						e.interactable.height = 44
						
						e.interactable.y = ele.y + 70 + (100) // s.colors previews on y axis

						mctx.fillStyle = e.value
						mctx.fillRect(e.interactable.x, e.interactable.y, e.interactable.width, e.interactable.height)
						
						mctx.lineJoin = 'miter';
						mctx.lineWidth = '2';
						
						if(e.interactable.hover){
							mctx.strokeStyle = '#fff'
							mctx.strokeRect(e.interactable.x - 2, e.interactable.y - 2, e.interactable.width + 4, e.interactable.height + 4)
						}
						
						if(e.value == background.value){
							mctx.strokeStyle = '#000'
							mctx.strokeRect(e.interactable.x - 2, e.interactable.y - 2, e.interactable.width + 4, e.interactable.height + 4)
						}
					}
				
				wallpapers.images.forEach(loop_thing_img);
				wallpapers.solids.forEach(loop_thing_solids);
			}); 
		
		window.closing = ()=>{
			wallpapers.images.forEach((e,i)=>{
				e.interactable.delete();
			});
		}
		
		window.title = 'Wallpaper Picker'
		window.icon = 'apps/24/preferences-desktop-wallpaper.png'
		window.width = 1060
		window.height = 220
	}