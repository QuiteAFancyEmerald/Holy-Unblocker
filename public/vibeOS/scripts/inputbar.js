class inputbar {
	constructor(width, height, placeholder, onChange, onSubmit){ // caller needs to set interactable index to get anything working as intended
		this.index = 12;
		
		this.interactable = new interactable('inputbar' + Date.now(), width, height,
		()=>{
			// hoverstart
		},
		()=>{
			// hoverend
		}
		);
		
		this.value = '';
		this.preValue = '';
		this.blinkStr = '';
		
		setInterval(()=>{
			if(cursor.focus == this.interactable.id){
				if(this.blinkStr=='')this.blinkStr='|'
				else this.blinkStr='';
			}else{
				this.blinkStr='';
			}
			
		}, 1000);
		
		if(placeholder != null)this.placeholder = placeholder
		else this.placeholder = 'Input field'
		
		window.addEventListener('paste', e=>{
			if(cursor.focus != this.interactable.id)return;
			var paste = (event.clipboardData || window.clipboardData).getData('text');
			this.value += paste;
		});
		
		window.addEventListener('keydown', e=>{
			
			if(cursor.focus != this.interactable.id)return;
			
			switch(e.keyCode){
				case 8: // backspace
					this.value = this.value.substr(0,this.value.length-1);
					break
				case 38: // up arrow
					this.value=this.preValue;
					break
				case 16: case 20:case 36:case 144:case 93:case 17:case 27:case 9:case 91:case 18:case 46:case 35:case 34:case 45:case 33:case 40:case 39:case 37:
					break
				case 13: // enter key
					
					onSubmit(this.value); // run callback stuff before clearing
					
					this.preValue=this.value; // set previous value for uparrow presses
					
					// this.value='';
					
					break
				default:
					this.value=this.value+e.key;
					
					onChange(e.key, this.value);
					
					break
			}
		});
		
		this.render = ()=>{ // let the caller do this part because we absolutely should not push to the renderq on our own
			
			if(cursor.focus == this.interactable.id){
				mctx.fillStyle='#fff';
			}else if(this.interactable.hover){
				mctx.fillStyle='#bdbdbd';
			}else{
				mctx.fillStyle='#8a8a8a';
			}
			
			mctx.fillRect(this.interactable.x, this.interactable.y, this.interactable.width, this.interactable.height);
			
			mctx.fillStyle='#000';
			mctx.fillRect(this.interactable.x+2, this.interactable.y+2, this.interactable.width-4, this.interactable.height-4);
			
			/*
			mctx.fillStyle='#000';
			mctx.font = "16px Roboto";
			mctx.fillText(this.placeholder, this.interactable.x + 3 , this.interactable.y - 20 );
			*/
			
			
			mctx.font = '14px Open Sans';
			
			if(cursor.focus == this.interactable.id){ // focused and has value
				
				mctx.fillStyle='#fff';
				mctx.fillText(this.value + this.blinkStr, this.interactable.x + 10 , this.interactable.y +  this.interactable.height/2 + 5 );
				
			}else if(this.value.length >= 1 ){ // not focused
				mctx.fillStyle='#8c8c8c';
				
				mctx.fillText(this.value, this.interactable.x + 10 , this.interactable.y +  this.interactable.height/2 + 5 );
				
				mctx.fillText(this.blinkStr, this.interactable.x + 10 , this.interactable.y +  this.interactable.height/2 + 5 );
			}
		}
	}
}