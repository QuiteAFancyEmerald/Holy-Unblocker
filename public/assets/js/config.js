 // configuration
 var opts = {
     romReaders: [
         new GameboyJS.RomFileReader(),
         new GameboyJS.RomDropFileReader(document.getElementById('dropzone'))
     ]
 };
 var g = new GameboyJS.Gameboy(document.getElementById('canvas'), opts);
 g.setSoundEnabled(document.getElementById('sound-enable').checked);
 g.setScreenZoom(document.getElementById('screen-zoom').value);