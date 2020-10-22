var initTranscript=()=>{
		var lines = [
			'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
			 'i believe the windows height will change automatically to fit this long ass piece of text',
			  'el pogger?',
			   'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
				'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
				 'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
				  'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
				   'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
					'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
					 'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
					  'this is a longggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg string',
					   'i believe the windows height will change automatically to fit this long ass piece of text',
						'el pogger?', 'i believe the windows height will change automatically to fit this long ass piece of text',
						 'el pogger?', 'okay as of finishing this demo it looks like it works so this can be used as a base for other apps'],
			window=new cwindow('transcript', 600 , 250, (window)=>{
				// after render
				
				var blines = [], // temp
					clines = [];
				
				clines = lines;
				
				clines.forEach((e,i)=>{
					wordWrap(e, window.width / 7.2).split('\n').forEach((ee,ii)=>{
						blines.push(ee);
					});
				});
				
				blines.forEach((e,i)=>{
					// if(clines.length >= window.height / textSize - 4 + (textSize - lineHeight) )clines.shift();
					mctx.fillStyle='#000';
					mctx.font = textSize+'px Open Sans';
					mctx.fillText(e, window.x + 15 , window.y + 50 + i*lineHeight);
				});
				
				var newHeight = textSize + 12 + blines.length * lineHeight;
				if(window.minHeight <= newHeight)window.height = newHeight
				else window.height = window.minHeight
			}),
			textSize = 14,
			lineHeight = 16;
		
		window.width = 700;
		window.minHeight = 400;
		
		window.x = msize.w / 2 - window.width / 2; // center of screen
		window.y = msize.h / 2 - window.height / 2; // middle of screen
		
		window.icon = 'mimetypes/24/text-x-generic.png';
		
		window.title = 'Demo transcript';
		
		window.bgColor = 'white'
	}