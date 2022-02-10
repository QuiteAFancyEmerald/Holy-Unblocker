The House - simple adventure game
=================================

Introduction
------------

I've wanted to create a game since a long time. You know - one of those cool things you'd like try. :) When I started working on this project I had only basic knowledge about JS. Very basic. I didn't even know how to define an array and JS objects and methods were some kind of mystery. Thanks to this game my skills have developed tremendously. I'm still far from calling myself "pro JS dev" but I've got siginficantly closer.

**You can play it [right here](http://the-house.arturkot.pl).** Please mind that:

* it's very, very short,
* it's my first game ever. :)

How does it work?
-----------------

The game is made using **HTML, CSS (Less) and JS (depends strongly on jQuery)**. Every room, roughly speaking, has simple markup in HTML which defines items (such as table, window, etc.) and click areas. CSS is responsible for graphic and JS for all the rest (DOM animations, interactions, saving game state). Since I had some experience with developing and designing websites I decided that HTML would be the right technology to start with.

### A little bit more about scripts:

* `js/audio.js` - all sounds are defined here,
* `js/data.js` - responsible for saving game state,
* `js/dialogue_box.js` - responsible for various popups,
* `js/game.js` - sits on the top of all scripts and uses them to genrate game,
* `js/items.js` - manages items found by a player,
* `js/npcs.js` - non playable charcters,
* `old_browser.js` - fires when not supported browser is detected,
* `js/room.js` - generates rooms, responsible for interaction of the main character wit the game world **the A* (A-Star) algorithm here is by Andrea Giammarchi**,
* `js/scenes.js` - cutscenes are stored here,
* `js/settings.js` - game settings, at the time this file is responsible for reseting the game only :P,
* `js/text_cloud.js` - speech balloons for the main character,
* `js/tooltip.js` - tooltips :),
* `js/utility.js` - super simple tool: I use it to define hit-areas for tha game grid,
* `js/view.js` - generates outside views (when you look throught a window).

Credits
-------

It's about time to mention resources (and people behind them) that helped me (A LOT) to create my game.

### Sound

All sounds come from [Freesound.org](http://www.freesound.org). Full list below:

* ["Distant Shot"](http://www.freesound.org/people/ERH/sounds/32799/) by [ERH](http://www.freesound.org/people/ERH/)
* ["Electric Wooshes"](http://www.freesound.org/people/Glaneur%20de%20sons/sounds/34172/) by [Glaneur de sons](http://www.freesound.org/people/Glaneur%20de%20sons/)
* ["Sad Pattern Drone"](http://www.freesound.org/people/patchen/sounds/24701/) by [patchen](http://www.freesound.org/people/patchen/)
* ["Sad Pattern Drone"](http://www.freesound.org/people/suonho/sounds/17724/) by [suonho](http://www.freesound.org/people/suonho/)
* ["Swell Pad"](http://www.freesound.org/people/ERH/sounds/34141/) by [ERH](http://www.freesound.org/people/ERH/)
* ["Horror Drone 001"](http://www.freesound.org/people/DJ%20Chronos/sounds/52134/) by [DJ Chronos](http://www.freesound.org/people/DJ%20Chronos/)
* ["Creepy Phone"](http://www.freesound.org/people/FreqMan/sounds/25079/) by [FreqMan](http://www.freesound.org/people/FreqMan/)
* ["Adrift On A Glassy Sea loop"](http://www.freesound.org/people/troutstrangler/sounds/25878/) by [troutstrangler](http://www.freesound.org/people/troutstrangler/)
* ["Buzz 001"](http://www.freesound.org/people/futureprobe/sounds/18824/) by [futureprobe](http://www.freesound.org/people/futureprobe/)
* ["Light 1"](http://www.freesound.org/people/TicTacShutUp/sounds/408/) by [TicTacShutUp](http://www.freesound.org/people/TicTacShutUp/)
* ["Creak 9"](http://www.freesound.org/people/HerbertBoland/sounds/29696/) by [HerbertBoland](http://www.freesound.org/people/HerbertBoland/)
* ["18 Close Door"](http://www.freesound.org/people/adegenerate/sounds/71212/) by [adegenerate](http://www.freesound.org/people/adegenerate/)
* ["Open and Close Wooden Door"](http://www.freesound.org/people/fresco/sounds/35617/) by [fresco](http://www.freesound.org/people/fresco/)
* ["Buzzer Variants#3"](http://www.freesound.org/people/Timbre/sounds/101355/) by [Timbre](http://www.freesound.org/people/Timbre/)
* ["btn402"](http://www.freesound.org/people/junggle/sounds/26777/) by [junggle](http://www.freesound.org/people/junggle/)
* ["Shower Curtain"](http://www.freesound.org/people/samplecat/sounds/11561/) by [samplecat](http://www.freesound.org/people/samplecat/)
* ["SFX(12)"](http://www.freesound.org/people/Nimbyc/sounds/83944/) by [Nimbyc](http://www.freesound.org/people/Nimbyc/)
* ["Crash"](http://www.freesound.org/people/sagetyrtle/sounds/40158/) by [Sagetyrtle](http://www.freesound.org/people/sagetyrtle/)
* ["Button Click"](http://www.freesound.org/people/KorgMS2000B/sounds/54405/) by [KorgMS2000B](http://www.freesound.org/people/KorgMS2000B/)
* ["Fire Forest Inferno"](http://www.freesound.org/people/Dynamicell/sounds/17548/) by [Dynamicell](http://www.freesound.org/people/Dynamicell/sounds/17548/)
* ["BC Speaky Compactor"](http://www.freesound.org/people/cmusounddesign/sounds/119897/) by [cmusounddesign](http://www.freesound.org/people/cmusounddesign/)

### Graphic

* ["Bust Basemesh"](http://chrrambow.deviantart.com/art/Bust-Basemesh-128960722) by [Christian Rambow](http://www.christianrambow.de/)
* Textures from [CG Textures](http://cgtextures.com/)

### JavaScript

* [Modernizr](http://www.modernizr.com/)
* [SoundManager 2](http://www.schillmania.com/projects/soundmanager2/)
* [jQuery](http://jquery.com/)
* [jQuery Colors](http://www.bitstorm.org/jquery/color-animation/) by [Edwin Martin](http://www.bitstorm.org/edwin/en/)
* [jQuery Preload CSS Images](http://www.filamentgroup.com/lab/update_automatically_preload_images_from_css_with_jquery/) by [filament group](http://www.filamentgroup.com/about)
* [jStorage](http://www.jstorage.info/) by [Andris Reinman](http://www.andrisreinman.com/)
* [Spritely](http://spritely.net/) by [Artlogic](http://www.artlogic.net/)
* [jQuerty UI](http://jqueryui.com/)
* [jQuerty Transit](http://ricostacruz.com/jquery.transit/) by [Rico Sta. Cruz](http://ricostacruz.com/)
* [A* (A-Star) algorithm function](http://devpro.it/examples/astar/) by [Andrea Giammarchi](http://www.blogger.com/profile/16277820774810688474)

Licenses
--------

### The House code:

MIT License

Copyright (c) 2019 Artur Kot

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


### The House artwork:

[Creative Commons Attribution 3.0 License](http://creativecommons.org/licenses/by/3.0/)

















