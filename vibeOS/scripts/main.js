var mCanvas = document.getElementById('mCanvas'),
	overlay = document.getElementById('overlay'),
	mctx = mCanvas.getContext('2d'),
	msize = {w: mCanvas.width, h: mCanvas.height},
	mfocus = false,
	renq = [],
	highRenq = [],
	above_high_renq = [],
	images = {},
	cursor = {img: 'pointer', grab: {} },
	background = {value : 'wallpapers/a.png'},
	wallpaperBusiness = ()=>{},
	interactables = {},
	emptyFunction = ()=>{},
	hiddenContainer=document.createElement('div'),
	globalProxy = 'https://ldm.sys32.dev/';

// hidden container for hidden elements!
document.body.appendChild(hiddenContainer);

hiddenContainer.style.display = 'none';
hiddenContainer.style.position = 'absolute';

mctx.imageSmoothingEnabled = true;

function wordWrap(str, maxWidth) {
	if(typeof str != 'string')return '';
    var newLineStr = "\n"; done = false; res = '';
    while (str.length > maxWidth) {
        found = false;
        // Inserts new line at first whitespace of the line
        for (i = maxWidth - 1; i >= 0; i--) {
            if ( new RegExp(/^\s$/).test(str.charAt(i).charAt(0)) ) {
                res = res + [str.slice(0, i), newLineStr].join('');
                str = str.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('');
            str = str.slice(maxWidth);
        }

    }

    return res + str;
}

CanvasRenderingContext2D.prototype.drawImageURL = function(src, sx , sy, swidth, sheight, width, height){
	if(images[src] == null){
		// add a new image to the array with the url as a key
		images[src] = new Image();
		images[src].src = src;

		images[src].addEventListener('load', ()=>{
			try{
				this.drawImage(images[src], sx, sy, swidth, sheight);
			}catch(err){
				console.error(err, images[src]);
				// this.fillStyle = '#000'
				// this.fillRect(sx, sy, swidth, sheight);
			}
		});

	} else {
		try{
			this.drawImage(images[src], sx, sy, swidth, sheight);
		}catch(err){
			console.error(err, images[src]);
			// this.fillStyle = '#000'
			// this.fillRect(sx, sy, swidth, sheight);
		}
	}

	// image should exist here
}

CanvasRenderingContext2D.prototype.roundRect = function (x,y,width,height,radius) {
    radius = Math.min(Math.max(width-1,1),Math.max(height-1,1),radius);
    var rectX = x;
    var rectY = y;
    var rectWidth = width;
    var rectHeight = height;
    var cornerRadius = radius;
 
    this.lineJoin = "round";
    this.lineWidth = cornerRadius;
    this.strokeRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);
    this.fillRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);
    this.stroke();
    this.fill();
}

CanvasRenderingContext2D.prototype.fillWrapText = function (text, x, y, maxWidth, lineHeight) {
	if(typeof text != 'string')return null;
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = this.measureText(testLine);
		var testWidth = metrics.width;
		if(testWidth > maxWidth && n > 0) {
			this.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		} else {
			line = testLine;
		}
	}
	this.fillText(line, x, y);
}

class interactable {
	constructor(id, width, height, hoverstart, hoverend, clickstart, clickend, rightclickstart, rightclickend){
		// hm

		this.width = Number(width);

		this.height = Number(height);

		// let the caller define the positions here

		this.x = 0;

		this.y = 0;

		this.index = 0;

		this.hover = false;

		this.pressed = false;

		this.delete = ()=>{
			delete interactables[id];
		}

		this.setValue = (key, value) => {
			this[key] = value;
		}

		this.id = id; // for reading it, dont change

		// functions and stuff

		if(typeof hoverstart != 'undefined')this.hoverstart = hoverstart
		else this.hoverstart = emptyFunction;

		if(typeof hoverend != 'undefined')this.hoverend = hoverend
		else this.hoverend = emptyFunction;

		if(typeof clickstart != 'undefined')this.clickstart = clickstart
		else this.clickstart = emptyFunction;

		if(typeof clickend != 'undefined')this.clickend = clickend
		else this.clickend = emptyFunction;

		if(typeof rightclickstart != 'undefined')this.rightclickstart = rightclickstart
		else this.rightclickstart = emptyFunction;

		if(typeof rightclickend != 'undefined')this.rightclickend = rightclickend
		else this.rightclickend = rightclickend;

		// near last

		interactables[id] = this;
	}
}

class cwindow {
	constructor(id, x, y, afterRender, whichRenq){

		// whichRenq should be renq by default unless set

		if(whichRenq == null)this.whichRenq = renq
		else this.whichRenq = whichRenq

		// let the caller define the title, width, and height?

		if(Object.entries(interactables).some((e,i)=> e[0].startsWith(id)))id = id + Date.now()

		this.renderFunc = emptyFunction // TEMPORARY VALUE

		this.title = 'New Window';

		this.width = 500;

		this.height = 500;

		this.x = x;

		this.y = y;

		this.closing = emptyFunction; // LET THE CALLER DEFINE THIS, IT IS CALLED WHEN WINDOW GETS CLOSED

		this.icon = 'status/24/image-missing.png'

		this.bgColor = '#ccc';

		this.moveToFront = ()=>{
			renq[this.renqID] = emptyFunction;

			this.renqID = renq.length;

			renq.push(this.renderFunc);

			this.contentBox.index = Object.entries(interactables).length;
			this.titleBar.index = Object.entries(interactables).length + 1;
			this.closeButton.index = Object.entries(interactables).length + 2;
		}

		this.titleBar = new interactable(id + '_titlebar', this.width, 30, ()=>{
			// hoverstart

		}, ()=>{
			// hoverend

		}, ()=>{
			// click start

			this.moveToFront();

		}, ()=>{
			// clickend

		});

		this.renqID = this.whichRenq.length;

		this.titleBar.index = this.whichRenq.length;

		this.contentBox = new interactable(id + '_contentbox', this.width, this.height,
		emptyFunction,
		emptyFunction,
		()=>{
			// click start

			// a bit buggy on the contentbox

			// this.moveToFront();

			/*

			if(this.renqID == renq.length-1)return;

			console.log(this.renqID,renq.length);

			var oldrenqID = this.renqID

			this.renqID = renq.length; // last value of array

			renq[this.renqID] = renq[oldrenqID];

			renq.splice(renq[oldrenqID], 1);

			console.log(this.renqID, renq.length);

			*/

		});

		this.closeButton = new interactable(id + '_close', 18, 18,
		()=>{ // hover start

		}, ()=>{ // hover end

		}, ()=>{ // click start

			// renq.splice(oldrenqID, 1);
		}, ()=>{ // click end
			if(this.closeButton.pressed && this.closeButton.hover){
				// todo: closing stuff

				this.close();
			}
		});

		this.close = ()=>{ // get rid of window nicely
			this.whichRenq.splice(this.renqID, 1);

			this.closing();
			this.contentBox.delete();
			this.closeButton.delete();
			this.titleBar.delete();
		}

		this.contentBox.index = this.whichRenq.length + 1;
		this.closeButton.index = this.whichRenq.length + 2;

		this.renderFunc = ()=>{

			// console.log('id:',this.titleBar.id, 'hover:', this.titleBar.hover, 'pressed:', this.titleBar.pressed)

			if(this.titleBar.pressed){
				var grabX = this.postX + cursor.x - cursor.grab.x,
					grabY = this.postY + cursor.y - cursor.grab.y;

				this.x = grabX;
				this.y = grabY;
			}else{
				this.postX = this.x;
				this.postY = this.y;
			}

			this.titleBar.x = this.x

			this.titleBar.y = this.y

			this.titleBar.width = this.width

			this.contentBox.x = this.x

			this.contentBox.y = this.y + this.titleBar.height

			this.contentBox.height = this.height

			this.contentBox.width = this.width

			// content box

			mctx.fillStyle = '#000';
			mctx.shadowColor = '#000';
			mctx.strokeStyle='#000';
			mctx.shadowBlur = 7;

			mctx.roundRect(this.x, this.y, this.width, this.height + this.titleBar.height / 1.5, 15);

			mctx.shadowBlur = 0;

			mctx.fillStyle=this.bgColor;
			mctx.strokeStyle=this.bgColor;
			mctx.roundRect(this.x, this.y + this.titleBar.height - 10, this.width, this.height, 15);

			// window bar

			mctx.fillStyle='#404040';
			mctx.strokeStyle='#404040';

			mctx.roundRect(this.x, this.y, this.width, this.titleBar.height, 15);
			mctx.fillRect(this.x, this.y + this.titleBar.height/2, this.titleBar.width, 15);

			// title

			mctx.fillStyle='#fff';
			mctx.font = "14px Open Sans";
			mctx.fillText(this.title, this.titleBar.x + 40 , this.titleBar.y +  20 );

			// icon

			mctx.drawImageURL('tango/' + this.icon, this.titleBar.x + 12, this.titleBar.y + 6, 20, 20);

			// close stuff :(

			this.closeButton.x = this.titleBar.x + this.titleBar.width - this.titleBar.height;

			this.closeButton.y = this.titleBar.y + 5;

			if(!this.closeButton.hover && !this.closeButton.pressed){
				mctx.drawImageURL('tango/window/close_idle.png', this.closeButton.x, this.closeButton.y, this.closeButton.width, this.closeButton.height)
			}else if(this.closeButton.hover && !this.closeButton.pressed){
				mctx.drawImageURL('tango/window/close_hover.png', this.closeButton.x, this.closeButton.y, this.closeButton.width, this.closeButton.height)
			}else if(this.closeButton.pressed){
				mctx.drawImageURL('tango/window/close_press.png', this.closeButton.x, this.closeButton.y, this.closeButton.width, this.closeButton.height)
			}

			/*
			if(this.contentBox.hover == true && this.cursor != null && this.cursor.hover != null){
				cursor.img = this.cursor.hover;
			}
			*/

			// do this after all stuff before

			afterRender(this);
		}

		this.whichRenq[this.renqID] = this.renderFunc;
	}
}

var mouseMoveHandler = (e)=>{
	e.preventDefault();

	// set cursor positions

	cursor.x = e.layerX;
	cursor.y = e.layerY;

	var found = [];

	Object.entries(interactables).forEach((ee,ii)=>{
		var index = ee[0],
			entry = ee[1],
			xRangeMin=entry.x, xRangeMax=entry.x + entry.width, yRangeMin=entry.y, yRangeMax=entry.y + entry.height,
			inX=(cursor.x >= xRangeMin && cursor.x <= xRangeMax), inY=(cursor.y >= yRangeMin && cursor.y <= yRangeMax);

		if(inX && inY){ // cursor is inside an element
			found.push(index);
		}
	});

	var highestIndexEntry = null;

	found.forEach((ee,ii)=>{ // sort through all found, pick the highest index
		var entry = interactables[ee],
			highestEntry = interactables[highestIndexEntry];

		if(entry.disabled == true)return; // ignore disabled elements

		if(typeof highestEntry == 'undefined')highestIndexEntry = ee
		else if(entry.index >= highestEntry.index)highestIndexEntry = ee;
	});

	Object.entries(interactables).forEach((ee,ii)=>{
		var index = ee[0],
			entry = ee[1];
		if(entry != highestIndexEntry)interactables[index].setValue('hover', false);
	});

	if(highestIndexEntry != null){
		// set the thing to hover : true and callbacks blah

		var entry = interactables[highestIndexEntry];

		entry.setValue('hover', true);
		entry.hoverstart();

	}
}

overlay.addEventListener('mousemove', mouseMoveHandler);

overlay.addEventListener('mousedown', e=>{
	e.preventDefault();

	mouseMoveHandler(e); // incase some business happened

	cursor.down = true;

	cursor.grab.x = e.layerX
	cursor.grab.y = e.layerY

	Object.entries(interactables).forEach((ee,ii)=>{ // check if element is hovered, if so its the top index and mouse is on it
		var index = ee[0],
			entry = ee[1];

		if(entry.hover){
			interactables[index].setValue('pressed', true);

			if(e.which == 3){ // right click
				// do right click business here
				// return
			}

			entry.clickstart(e);

			cursor.focus = index;
		}
	});

});

overlay.addEventListener('mouseup', e=>{
	e.preventDefault();
	// cursor.hovering = key of element hovering not the actual element to be simple

	cursor.down = false;

	Object.entries(interactables).forEach((ee,ii)=>{ // check if element is hovered, if so its the top index and mouse is on it
		var index = ee[0],
			entry = ee[1];

		if(entry.pressed)entry.clickend();

		// if(typeof interactables[index] == 'undefined')return; // after clickend, if this was a close button it could have just been deleted

		entry.setValue('pressed', false);
	});
});

overlay.addEventListener('contextmenu', e=>{
	e.preventDefault();

});

overlay.addEventListener('wheel', e=>{
	e.preventDefault();

});

window.addEventListener('focus', e=>{
	mfocus = true;
});

window.addEventListener('blur', e=>{
	mfocus = false;
});

if(localStorage.getItem('background') != null){
	background = JSON.parse(localStorage.getItem('background'));
}else{
	localStorage.setItem('background', JSON.stringify(background, null, '\t') )
}

setInterval(()=>{
	if(JSON.parse(localStorage.getItem('background'))!= background){
		localStorage.setItem('background', JSON.stringify(background));
	}

	if(mCanvas.getAttribute('width') != msize.w){
		mCanvas.setAttribute('width', msize.w);
		mCanvas.style.width = msize.w + 'px';
		mCanvas.style.height = msize.h + 'px';

		overlay.setAttribute('width', msize.w);
		overlay.style.width = msize.w + 'px';
		overlay.style.height = msize.h + 'px';
	}

	if(mCanvas.getAttribute('height') != msize.h){
		mCanvas.setAttribute('height', msize.h);
	}
	
	try{
		wallpaperBusiness();
	}catch(err){
		mctx.drawImageURL('tango/wallpapers/a.png', 0, 0, msize.w, msize.h);
	}
	
	if(window.innerWidth < msize.w || window.innerHeight < msize.h){ // window is smaller than the current resolution
		mctx.fillStyle = '#fff';
		mctx.fillRect(0, 0, msize.w, msize.h);

		// center text

		mctx.textAlign = 'center';

		mctx.fillStyle = '#000';
		mctx.font = '14px Open Sans';

		mctx.fillText(`Your browser window is smaller than the minimum size of ${msize.w}x${msize.h}! (the window is ${window.innerWidth}x${window.innerHeight})`, window.innerWidth / 2, window.innerHeight / 2 - 14);

		mctx.textAlign = 'start';
	}else{
		renq.forEach((e,i)=>{
			e(); // run all render operations in order
		});

		highRenq.forEach((e,i)=>{ // desktop and stuff
			e();
		});
	}

	above_high_renq.forEach((e,i)=>{ // super high stuff like above display level
		e();
	});

	// RENDER CURSOR OR SET IT AFTER GOING THROUGH THE RENQ

	if(!mfocus){
		mctx.drawImageURL('tango/cursor/'+cursor.img+'.cur', cursor.x - 3, cursor.y - 4, 32, 32);
		overlay.style.cursor = 'none';
	}else{
		overlay.style.cursor = 'url("tango/cursor/'+cursor.img+'.cur"), none';
	}

},1000/60);
