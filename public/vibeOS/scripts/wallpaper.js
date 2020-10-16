wallpaperBusiness = ()=>{
	if(background.value.match(/^#.{3,}$/gi) ){ // is color
		mctx.fillStyle = background.value;
		mctx.fillRect(0, 0, msize.w, msize.h);
	}else{ // is image
		mctx.drawImageURL('tango/' + background.value, 0, 0, msize.w, msize.h);
	}	
}