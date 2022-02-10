var v = 9;

if ( v > Number( $.jStorage.get('v') ) ) {

  $.jStorage.flush();

}

if ( !$.jStorage.get('collected') && !$.jStorage.get('used') && !$.jStorage.get('played') && !$.jStorage.get('is_in') && !$.jStorage.get('fish') && !$.jStorage.get('v') && !$.jStorage.get('temp_path') ) {

  $.jStorage.set('v', v);

  $.jStorage.set('collected', []);
  $.jStorage.set('used', []);
  $.jStorage.set('played', []);  
  $.jStorage.set('is_in', '');
  $.jStorage.set('fish', []);   

  $.jStorage.set('temp_path', []);

}

var collected = $.jStorage.get('collected', []),
    used      = $.jStorage.get('used', []),
    
    played    = $.jStorage.get('played', []), 
    
    is_in     = $.jStorage.get('is_in'),
    
    fish      = $.jStorage.get('fish', []),

    path      = $.jStorage.get('temp_path');