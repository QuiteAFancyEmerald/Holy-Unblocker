## When life gets you down, it's never too late to...
# B O U N C E B A C K
### A Boomerang Roguelite Game for JS13k by Frank Force

# [PLAY THE GAME!](https://js13kgames.com/entries/bounce-back)

## [Game Design Postmortem](http://frankforce.com/?p=6936)

![Bounceback Image](/screenshot.png)

### Controls
* WASD = Move
* Mouse = Aim
* Click = Throw
* Space = Dash

### Hints
* Boosting protects you from damage.
* Buy items to help you survive.
* You don't lose money when you die!
* There are only 10 levels.
* Lost boomerangs show up big on the map.
* Enemies are slowed by sand.
* Yellow boormang can grab pickups.
* Blue boomerang does double damage.
* Win to unlock speed run mode.
  
## Game Features
* Boomerang physics & boost ability
* Procedural level generation
* 3 Enemy types
* 7 types of pickups
* Giant and invisible enemy variants
* Final boss battle
* Saves gems earned and max level reached
* Shop system for buying items
* Minimap
* Footsteps, blood, and persistant effects system
* 16 Different sound effects with zzfx
* Procedurally generated music
* Speed run mode doesn't effect normal save
* Low health warning system
* Level transition effect
  
### Engine Features
* Engine is separated from game code
* Object oriented architecture
* 2D game object system with pseudo 3D
* Physics and level tile collision
* Tile rendering system
* Cached level rendering
* Particle system
* 3D shadows
* Input processing system
* Debug rendering system

### Engine Debug Features
* Debug console
* Debug rendering
* Debug controls
* Save snapshot

### Minification Notes
* The official release is under 13k for the game, engine, art and music!
* The tile.png file has 14 color palette exported from Gimp with all extra save data disabled
* First combine all javascript together
* Remove all debug code, godMode, soundEnable, and controls description
* Use Google Closure on Advanced https://closure-compiler.appspot.com/home
* Use terser with extra compression turned off https://xem.github.io/terser-online/
* Put eveything into the same html file and remove any whitespace
* Zip the index.html and tiles.png files
* Zip the zip with advzip using the settings "-z -4 -i 1000" https://github.com/amadvance/advancecomp
* Say a small prayer to the gods of JavaScript
* The final result should hopefully be under 13k!
