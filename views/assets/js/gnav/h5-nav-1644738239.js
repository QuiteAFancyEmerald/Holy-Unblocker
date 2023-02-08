/* -----------------------------------------------
/* Authors: QuiteAFancyEmerald and OlyB
/* MIT license: http://opensource.org/licenses/MIT
/* HTML5 gnav
/* ----------------------------------------------- */

var h5gms = [
    { name: "A Dark Room", path: "adarkroom/", img: "darkroom.png", description: "A player lights a fire in a dark room. Fun game :D" },
    { name: "Minecraft: Bedrock Edition", custom: "mcnow", img: "mcnow.jpg", description: "A trial version of the real Minecraft: Bedrock Edition. Pure credits to now.gg for this.", credits: "nowgg" },
    { name: "Fireboy and Watergirl", path: "firewater/", img: "firewater.png", description: "Fireboy and Watergirl is the first cooperative platformer game in the Fireboy and Watergirl series." },
    { name: "Duck Life", path: "ducklife/", img: "ducklife.png", description: "The future of the farm is in your hands! Train your duck to run, fly and swim its way to victory so you can save the farm with your riches." },
    { name: "Duck Life 2", path: "ducklife2/", img: "ducklife2.png", description: "Become a world champion in the successor to Duck Life!" },
    { name: "Duck Life 3", path: "ducklife3/", img: "ducklife3.png", description: "The third game in the Duck Life series!" },
    { name: "Duck Life 4", path: "ducklife4/", img: "ducklife4.png", description: "Super scary... yeah the fourth game. What even happened?" },
    { name: "osu!", custom: "osu", img: "os1.png", description: "Rhythm is just a *click* away! If you experience any input lag be sure to read over the osu! FAQ page." },
    { name: "Friendly Fire", path: "friendlyfire/", img: "friendlyfire.jpg", description: "What dark secrets does this twisted world hold?" },
    { name: "Slope", path: "slope/", img: "slope.jpg", description: "Slope game is a fantastic speed run game where you can drive a ball rolling on tons of slopes and obstacles. See how far you can go in this endless course." },
    { name: "vex 3", path: "vex3/", img: "vex3.png", description: "vex 3 is a fascinating game. Your task is to Take Vex through the levels by running, jumping, sliding and swimming while avoiding dangerous obstacles." },
    { name: "vex 4", path: "vex4/", img: "vex4.png", description: "VEX 4 takes Vex to the next level! This fast paced stickman game puts your skills to the test. Run, jump, slide, swim and avoid obstacles, VEX 4 has it all." },
    { name: "vex 5", path: "vex5/", img: "vex5.png", description: "Now, you can meet cute Stickman again in Vex 5. Vex 5 is the 5th platform game in the Vex series. Each level is a labyrinth of deadly devices and traps." },
    { name: "PUBG MOBILE: Arcane", custom: "pubg", img: "pubg.jpg", description: "Battle royale game thing.", credits: "nowgg" },
    { name: "Gacha Life", custom: "glife", img: "gachalife.png", description: "Handcraft your very own anime-inspired stories in Gacha Life by Lunime. Wholesome game? Oh no.", credits: "nowgg" },
    { name: "Roblox", custom: "roblox", img: "roblox.jpg", description: "Why... well its here now enjoy.", credits: "nowgg" },
    { name: "Among Us", custom: "amongus", img: "amongus.jpg", description: "Why must you do this.", credits: "nowgg" },
    { name: "Last Train Home", custom: "train", img: "train.png", description: "This is a short horror-adventure game about being stuck on a train. May take awhile to load.", credits: "itch" },
    { name: "Village Arsonist", custom: "village", img: "village.png", description: "Village Arsonist is a 2D physics-based puzzle game. May take awhile to load... a long while.", credits: "itch" },
    { name: "Minecraft JS", path: "mcjs/", img: "mc.png", description: "Minecraft but made in Javascript." },
    { name: "What the Road Brings", custom: "speed", img: "speed.png", description: "A pseudo, vaporwave 3d racer with an epic soundtrack and art style. May take awhile to load.", credits: "itch" },
    { name: "Snake", path: "snake/", img: "snake.png", description: "Eat the apples in this classic retro game. But don't hit the wall, or eat your own tail! How long can you survive?" },
    { name: "Super Mario 64", path: "sm64/", img: "sm64.png", description: "A classic. Super Mario 64 is a 1996 platform game for the Nintendo 64 and the first Super Mario game to feature 3D gameplay.", nolag: true },
    { name: "Zork Clone", path: "zork1/", img: "zork.png", description: "Zork is an interactive fiction computer game." },
    { name: "Pick Up Prison", custom: "prison", img: "prison.png", description: "At the beginning... There was nothing... There is a prisoner in a cell with nothing. May take awhile to load.", credits: "itch" },
    { name: "Helo Storm", custom: "heli", img: "helo.png", description: "Endless helicopter and Jeep shoot 'em up based on the 80's arcade classic 'Silkworm'.", credits: "itch" },
    { name: "Retrohaunt", path: "retrohaunt/", img: "retrohaunt.png", description: "A creepy retro horror game with interesting graphics and mood." },
    { name: "T-Rex Game (chrome://dino)", path: "dino/", img: "dino.jpg", description: "The T-Rex Runner game, an Easter Egg in Google Chrome." },
    { name: "Run 3", path: "run3/", img: "r3.png", description: "Use the arrow keys to run and jump. Land on a side wall to rotate the world. (Broken)" },
    { name: "Die in the Dungeon", custom: "rpg", img: "dd.png", description: "Die in the Dungeon is a deck-building, turn-based roguelite. May take awhile to load.", credits: "itch" },
    { name: "Trimps", path: "trimps/", img: "trimps.png", description: "Pure grind." },
    { name: "Gopher Cart", path: "gopher/", img: "gopher2.png", description: "Fun driving side scroller game with epic gophers." },
    { name: "Cookie Clicker", path: "cookieclicker/", img: "cookie.png", description: "You feel like making cookies but no one wants to eat them. Click on the cookie to bake and eat." },
    { name: "Particle Clicker", path: "particle-clicker/", img: "pclick.png", description: "An addictive incremental game that teaches players the history of high energy particle physics." },
    { name: "Evil Glitch", path: "evilglitch/", img: "glitch2.png", description: "Strange glitches appear in your dimension, can you stop them before they assimilate your world?" },
    { name: "Pac-man", path: "pacman/", img: "pcma.png", description: "The classic." },
    { name: "Flappy Bird", path: "flappybird/", img: "flappybird.png", description: "Click on the screen, or use your spacebar to get started. Fly as far as you can without hitting a pipe." },
    { name: "Bounce Back", path: "bounceback/", img: "bounceback.png", description: "A charming and addictive little Zelda inspired roguelike adventure game." },
    { name: "The Chroma Incident", path: "chromaincident/", img: "chroma.png", description: "The Achromats have taken the world's color offline!" },
    { name: "Sleeping Beauty", path: "sleepingbeauty/", img: "sleep.png", description: "Into a profound slumber she sank, surrounded only by dense brambles, thorns and roses." },
    { name: "Tetris", path: "tetris/", img: "tet.png", description: "Tetris ® is the addictive puzzle game that started it all, embracing our universal desire to create order out of chaos." },
    { name: "The House", path: "househorror/", img: "thehouse.png", description: "An interesting horror style game." },
    { name: "The Pond", path: "pond/", img: "thepond.png", description: "Use Mouse1 to move around. A game like Slither.io." },
    { name: "NS Shaft", path: "nsshaft/", img: "nsshaft.png", description: "A fun platformer." },
    { name: "Game Off", path: "house/", img: "gameoff.png", description: "A collection of really fun games, particularly anti-matter which is inspired by Portal." },
    { name: "2048", path: "2048/", img: "2048.png", description: "Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one. Try to beat your high score!" },
    { name: "Asteroids", path: "asteroids/", img: "asteroids.png", description: "Asteroids is a space-themed multidirectional shooter arcade game!" },
    { name: "Breaklock", path: "breaklock/", img: "breaklock.png", description: "Link the dots to find the lock pattern. After every attempt the game will tell you how many dots you got right." },
    { name: "Backcountry", path: "backcountry/", img: "backcountry.png", description: "Taking place in the wild west mine and do jobs to earn money! Use your mouse to navigate by clicking." },
    { name: "Breakout", path: "breakout/", img: "breakout.png", description: "Break all the bricks and volley the ball back and forth in this skill-based classic styled game!" },
    { name: "Chess", path: "chess/", img: "chess2.png", description: "Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8x8 square grid." },
    { name: "Connect 3", path: "connect3/", img: "connect.png", description: "Basically like bejeweled." },
    { name: "Towermaster", path: "towermaster/", img: "tower.png", description: "Build a tower! Stack objects on top of each other without the building falling. How high can you go?" },
    { name: "Geometry Dash", path: "geometrydash/", img: "geometrydash.png", description: "Jump and fly your way through danger in this rhythm-based action platformer!" },
    { name: "Hextris", path: "hextris/", img: "hextris.png", description: "An addictive puzzle game inspired by Tetris." },
    { name: "Astray", path: "astray/", img: "astray.png", description: "A WebGL maze game built with Three.js and Box2dWeb." },
    { name: "Konnekt", path: "konnekt/", img: "konnekt.png", description: "Fight against nodes and viruses! An interesting puzzle game developed by MONSTERKODI." },
    { name: "Push Back", path: "pushback/", img: "pushback.png", description: "A cool physics game!" },
    { name: "Underrun", path: "underrun/", img: "underrun.png", description: "Explore deep underground in this doom-like game. Kill enemies, explore and progress. Use WASD to move and Mouse1 to shoot." },
    { name: "JS Racer", path: "racer/", img: "racer.png", description: "Want to race online? Enjoy an old age like racing game!" },
    { name: "xx142-b2.exe", path: "xx142-b2exe/", img: "142.png", description: "It's the year 2413, and aliens have enslaved humanity." },
    { name: "Factory Balls Forever", path: "factoryballsforever/", img: "factory.png", description: "A puzzle game where you have to color the balls correctly! Use different tools to cover up the ball before start painting over it." }
];

var glist = document.getElementById("glist");

for (let item of h5gms) {
    let a = document.createElement("a");
    a.href = "#";
    var img = document.createElement("img");
    img.src = "/assets/img/h5g/" + item.img;
    a.appendChild(img);
    var title = document.createElement("h3");
    title.textContent = item.name;
    a.appendChild(title);
    var desc = document.createElement("p");
    desc.textContent = item.description;
    if (item.credits == "itch") desc.innerHTML += '<br>Credits: Game can be found <a target="_blank" href="https://itch.io">here</a>.';
    if (item.credits == "nowgg") desc.innerHTML += '<br>Credits: Game can be found <a target="_blank" href="https://now.gg">here</a>.';
    a.appendChild(desc);
    a.onclick = function(e) {
        if (e.target == a || e.target.tagName != "A") {
            e.preventDefault();
            item.custom ? goProx[item.custom](true) : goFrame("/archive/g/" + item.path, item.nolag);
        }
    }

    glist.appendChild(a);
}