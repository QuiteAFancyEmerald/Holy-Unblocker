var initJsTerm=(async()=>{
		var lines = ['vibeOS JavaScript Terminal | Run vsu_help() for commands.'],
			inputBar = new inputbar(0, 0, 'poggers code', (key, str)=>{
				// onChange(e.key, this.value);
				
			},
			async (str)=>{
				// onSubmit(this.value);
				
				lines.push( '> ' + str );
				
				try{
					// this isnt safe but havent researched into alternatives
					var evaluated = eval(str);
					
					lines.push(evaluated);
					
				}catch(err){
					lines.push( err.toString() );
				}
				
				inputBar.value = '';
			}),
			window=new cwindow('jsTerm', 600 , 250, (window)=>{
				// after render
				
				inputBar.interactable.x = window.x + 10;
				inputBar.interactable.y = window.y + window.height - 15;
				
				inputBar.interactable.width = window.width - 20
				
				var blines=[]; // temp
				
				lines.forEach((e,i)=>{
					wordWrap(e, window.width / 7.2).split('\n').forEach((ee,ii)=>{
						blines.push(ee);
					});
				});
				
				lines=blines;
				
				lines.forEach((e,i)=>{
					if(lines.length >= window.height / textSize - 4 + (textSize - lineHeight) )lines.shift();
					mctx.fillStyle='#fff';
					mctx.font = textSize+'px Inconsolata';
					mctx.fillText(e, window.x + 15 , window.y + 50 + i*lineHeight);
				});
				
				inputBar.render();
			}),
			textSize = 14,
			lineHeight = 16;
		
		window.width = 700;
		window.height = 300;
		
		window.x = msize.w / 2 - window.width / 2; // center of screen
		window.y = msize.h / 2 - window.height / 2; // middle of screen
		
		window.icon = 'apps/24/bash.png';
		window.title = 'JS Terminal';
		
		window.bgColor = 'black'
		
		inputBar.interactable.width = 300;
		inputBar.interactable.height = 25;
		
		inputBar.interactable.index = window.contentBox.index + 1;
	});
