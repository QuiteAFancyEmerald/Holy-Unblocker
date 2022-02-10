var camera, scene, renderer, spotlight;
var triangle, triEdges; // the object the user controls("spaceship"), there is only one 'triangle' in CUBEfield!
var plane; // ground landscape floor w/e
var xSpeed; // x (side to side) speed of the triangle
var zSpeed; // z speed of the triangle
var zOffset; // position of triangle
var camOffset; // camera offset is a little softer than xOffset
var stars;
var starSpeed;
var numCubes = 120;
var leftArrow, rightArrow, upArrow;
var timeElapse;
var cubeAdd; // need a way to add cubes at a steady rate
var score;
var phase; // -1 = pre-game screen, 0 = pause, 1 = in-game, (post-game = pre-game)
var composer;
var level; // level of difficulty (increases as game goes on)
var levelBreak; // timer for time break between levels
var width, height;
var rotStart = 0;
var mCubes;     // array of Cube objects
// settings
var stnDiff = 0;    // difficulty   { rookie,   skilled,    master }
var stnBounce = 0;  // bounce       { none,     some,       too much }
var stnCam = 0;     // camera       { hawk,     chase,      1st person }
var stnBlock = 0;   // blocks       { normal,   falling,    pop up }
// UI
var uiNewGame   = document.getElementById( "newGame" );
var uiScore     = document.getElementById( "score" );
var uiHScore    = document.getElementById( "highScore" );
var uiInfo      = document.getElementById( "info" );
var uiSettings  = document.getElementById( "settings" );
var uiPause     = document.getElementById( "pause" );

init();
animate();

// --- INITIALIZATION ---------------------------------------------------------

function init() {
  // viewport
	width = window.innerWidth;
	height = window.innerHeight;
  // init members
	levelBreak = 0;
	level = 0;
	phase = -1;
	score = 0;
	camOffset = 0;
	timeElapse = new Date().getTime();
  totalElapse = 0;
	zOffset = 0;
	xSpeed = 0;
  zSpeed = 0;
  leftArrow = rightArrow = upArrow = false;
	mCubes = [];
	starSpeed = [];
	stars = [];

  // scene
	scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xa3a3a3, 5, 25);

  // Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0xffffff, 0);
  renderer.setSize( width, height );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild(renderer.domElement);

  var ambient = new THREE.AmbientLight(0xffffff);
  scene.add(ambient);

  // Camera
	camera = new THREE.PerspectiveCamera( 15, width / height, 0.1, 1000 );
  camera.position.set(0, 0.25, 2.0);

	// Ground plane
	var planeGeo = new THREE.PlaneBufferGeometry(300, 75, 20);
	plane = new THREE.Mesh(planeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
  plane.receiveShadow = true;
	plane.rotation.x += -0.5 * Math.PI;
	plane.position.y = -0.001;
	scene.add(plane);

	// Cubes
	for (var c = 0; c < numCubes; c++) {
    mCubes[ c ] = new Cube(scene);
  }

	// Player triangle
	var triGeo = new THREE.Geometry();

  // player triangle - vectors
	triGeo.vertices.push(
		new THREE.Vector3(  0.000, 0.000, -0.150 ),
		new THREE.Vector3( -0.017, 0.000,  0.040 ),
		new THREE.Vector3(  0.017, 0.000,  0.040 ),
		new THREE.Vector3(  0.000, 0.013,  0.020 )
	);
    // player triangle - push faces
	triGeo.faces.push( new THREE.Face3( 3, 0, 1 ) );
	triGeo.faces.push( new THREE.Face3( 1, 2, 3 ) );
	triGeo.faces.push( new THREE.Face3( 2, 0, 3 ) );
	triangle = new THREE.Mesh(triGeo, new THREE.MeshBasicMaterial({ color: 0x646464 }));
  triangle.castShadow = true;
	triangle.position.y = -2.0;
	scene.add(triangle);

  // player triangle - edges
  var edgeGeo = new THREE.EdgesGeometry(triGeo);
	triEdges = new THREE.LineSegments(edgeGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
	scene.add(triEdges);

  spotlight = new THREE.SpotLight( 0xffffff);
  spotlight.position.set(0, 100, 0);
  spotlight.target = triangle;
  spotlight.castShadow = true;
  spotlight.shadow.camera.near = 0.1;
  spotlight.shadow.camera.far = 20;
  spotlight.shadow.mapSize.width = window.innerWidth;
  spotlight.shadow.mapSize.height = window.innerHeight;
  scene.add(spotlight);

	// stars (level 2 background)
	initStars();

  // init ui
	uiScore.style.visibility = "hidden";
  document.getElementById("highScore").innerHTML = (Math.floor(getCookie() / 100) / 10).toString();

  setPreGame();
}

// Init stars
function initStars() {
  stars = [];

  // Texture/material
  var texture = new THREE.TextureLoader().load('assets/images/star.png');
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var geo = new THREE.BoxBufferGeometry(.5, .5, .1);

  // Build stars
  for (var i = 0; i < 10; i++) {
    starSpeed[i] = [];

    // Build mesh
    stars[i] = new THREE.Mesh(geo, material);

    // Set position/rotation
    stars[i].position.z = 5;
    stars[i].position.x = Math.random() * 20 - 10;
    stars[i].position.y = Math.random() * 10;
    stars[i].rotation.z = Math.random() * 2 * Math.PI;

    // Set velocity
    starSpeed[i][0] = Math.random() * 0.003 - 0.0015;
    starSpeed[i][1] = Math.random() * 0.003 - 0.0015;

    // Add to scene
    scene.add(stars[i]);
  }
}

// Set params/globals for new game
function gameReset() {
  // UI
  uiNewGame.style.visibility = "hidden";
  uiInfo.style.visibility = "hidden";
  uiScore.style.color = "#808080";
  uiScore.style.visibility = "visible";
	document.body.style.backgroundColor = "#A3A3A3";
  uiSettings.classList.remove( "settingsVis" );
  // Blur render
  document.querySelector('canvas').style.filter = 'blur(0px)';
  document.querySelector('canvas').style.cursor = 'none';
    
	score = 0;
	// camOffset = 0;
	timeElapse = new Date().getTime();
	zOffset = 0;
	xSpeed = 0;
  zSpeed = 0;
  camera.position.z = 0;

  // cubes
	for( var c of mCubes ) {
    c.reset(stnBlock, true, stnDiff);
  }

  // hide stars
  for ( var s of stars ) {
    s.position.z = 5;
  }

  var k = Math.PI - ( this.camera.rotation.z % ( 2*Math.PI ));
  rotStart = ( Math.PI - Math.abs( k )) * Math.sign( k );
  totalElapse = 0;
	phase = 1; 
}

// Reset game upon finish
function setPreGame() {
  // UI
  uiScore.style.color = "black";
  document.body.style.backgroundColor = "#A3A3A3";
  // Show UI
  uiNewGame.style.visibility = "visible";
  uiInfo.style.visibility = "visible";
  uiSettings.classList.add( "settingsVis" );
  // Blur render
  document.querySelector('canvas').style.filter = 'blur(5px)';
  document.querySelector('canvas').style.cursor = 'pointer';
  // Triangle
  triangle.material.color.setHex(0x646464);
  triEdges.material.color.setHex(0x000000);
  
  // cubes
  for (var c of mCubes) {
    c.updateDesign(0);
  }
  
  level = 0;
  plane.material.color.setHex( 0xC8C8C8 );
  scene.fog.color.setHex(0xA3A3A3);

  // hide stars
  for (var s of stars) {
    s.position.z = 5;
  }
}

// level effects/shaders
function newLevel() {
  // Update level vars
	levelBreak = new Date().getTime();
	level++;

  // Update design of cubes
  for (var c of mCubes) {
    c.updateDesign(level % 5);
  }

  // Update design of plane (ground)
	switch (level % 5) {

		case 0:
			plane.material.color.setHex(0xC8C8C8);
      scene.fog.color.setHex(0xA3A3A3);
      triangle.material.color.setHex(0x646464);
      triEdges.material.color.setHex(0x000000);
			document.body.style.backgroundColor = "#A3A3A3";
      break;

		case 1:
			plane.material.color.setHex(0x000000);
      scene.fog.color.setHex(0x000000);
      triangle.material.color.setHex(0x000000);
      triEdges.material.color.setHex(0x00FF00);
			document.body.style.backgroundColor = "#000000";

      // show stars
      for (var s of stars) {
        s.position.z = -50;
      }
			break;

		case 2:
			plane.material.color.setHex(0x969696);
      scene.fog.color.setHex(0x969696);
      triangle.material.color.setHex(0x000000);
      triEdges.material.color.setHex(0x000000);
			document.body.style.backgroundColor = "#969696";

      // hide stars
      for( var s of stars ) {
        s.position.z = 5;
      }
			break;

		case 3:
			plane.material.color.setHex(0xffffff);
      scene.fog.color.setHex(0xffffff);
      triangle.material.color.setHex(0x646464);
      triEdges.material.color.setHex(0x000000);
      document.body.style.backgroundColor = "#FFFFFF";
			break;

		case 4:
			plane.material.color.setHex(0x969696);
      scene.fog.color.setHex(0x969696);
      triangle.material.color.setHex(0xFF326C);
      triEdges.material.color.setHex(0xFFFFFF);
      document.body.style.backgroundColor = "#969696";
	}
}

// --- GAME LOOP --------------------------------------------------------------
function animate() {
	requestAnimationFrame(animate);

  // Time elapsed
  var now = (new Date()).getTime();
	var elapse = now - timeElapse;
	timeElapse = now;
  var rate = elapse / 100;

  // Game state
	switch (phase) {

    // Pre-game
		case -1:
			// Demo mode in background
      xSpeed *= 0.95;
      zSpeed *= 0.95;
      camOffset *= 0.95;

      // Level speed
      var levelSpeed = (level + 1) * rate * 0.5 + zSpeed;

      // --- Camera -----------------------------------------------------------
      // Camera rotation
      camera.rotation.z = (camera.rotation.z + xSpeed * 1.5) * 0.7;
      camera.rotation.z = Math.min(0.1, Math.max(-0.1, camera.rotation.z));

      // Camera position
      camera.position.x += xSpeed * rate * -10;
      camera.position.z -= levelSpeed;

      // Update player triangle and plane to match camera position
      triangle.position.z = triEdges.position.z = plane.position.z = camera.position.z - 2.2;
      triangle.position.x = triEdges.position.x = plane.position.x = camera.position.x;

      // Update player triangle rotation to match camera rotation
      triangle.rotation.y = camera.rotation.z;
      triEdges.rotation.y = camera.rotation.z;

      // Update spotlight
      spotlight.position.set(triangle.position.x, triangle.position.y + 10, triangle.position.z);


			updateCubes(rate * 0.2, levelSpeed);
			break;

    // Pause
		case 0:
			break;

    // In-game
		case 1:  
      // --- User Input -------------------------------------------------------
      if (!rightArrow && !leftArrow) {
        // No arrow key input
        xSpeed *= 0.8;
      } else {
        // Arrow key input
        if (leftArrow) {
          xSpeed += 0.02 * rate;
        }
        if (rightArrow) {
          xSpeed -= 0.02 * rate;
        }
      }
      // Horizontal speed limits
      xSpeed = Math.max(-0.5, Math.min(0.5, xSpeed));
      // Forward speed
      zSpeed = upArrow ? zSpeed + 0.025 * rate : zSpeed * 0.95;
      zSpeed = Math.min(0.4, zSpeed);

      // Level speed
      var levelSpeed = (1 + level * 0.5) * rate * 0.5 * (1 + stnDiff * 1.5) + zSpeed + 0.05;

      // --- Camera -----------------------------------------------------------
      // Camera rotation
      camera.rotation.z = (camera.rotation.z + xSpeed * 1.5) * 0.7;
      camera.rotation.z = Math.min(0.1, Math.max(-0.1, camera.rotation.z));

      // Camera position
      camera.position.x += xSpeed * rate * -10;
      camera.position.z -= levelSpeed;

      // Update player triangle and plane to match camera position
      triangle.position.z = triEdges.position.z = plane.position.z = camera.position.z + (stnCam == 0 ? -2.2 : (stnCam == 1 ? -1.2 : 0.2));
      triangle.position.x = triEdges.position.x = plane.position.x = camera.position.x;

      // Update player triangle rotation to match camera rotation
      triangle.rotation.y = camera.rotation.z;
      triEdges.rotation.y = camera.rotation.z;
      triangle.rotation.z = camera.rotation.z * 2;
      triEdges.rotation.z = camera.rotation.z * 2;
      triangle.position.y = 0.01 - Math.abs(camera.rotation.z * 0.05);
      triEdges.position.y = 0.01 - Math.abs(camera.rotation.z * 0.05);

      // Update spotlight
      spotlight.position.set(triangle.position.x, triangle.position.y + 10, triangle.position.z);

      // --- Scoring ----------------------------------------------------------
      // score = zOffset * ( 10 + level * 5 );
      totalElapse += elapse;
      uiScore.innerHTML = (Math.round(totalElapse / 100) / 10).toString();


      // New level
			if ((level + 1) * 30000 < totalElapse) {
        newLevel();
      }

      // Break between levels (no cubes)
			if (levelBreak != -1 && now - levelBreak > 5000) {
				levelBreak = -1;
			}

			// Update position of cubes + add cubes or remove cubes
			updateCubes(rate, levelSpeed);
	}

  // Update stars (if on right level)
  if (level % 5 == 1) {
	  updateStars();
  }

  // Render
  if (phase == 1) {
    renderer.setClearColor(0xffffff, 0);
  } else {
    renderer.setClearColor(0xa3a3a3, 1);
  }
  renderer.render(scene, camera);
}

// --- UPDATE -----------------------------------------------------------------

// UPDATE stars
function updateStars() {
  for (var s = 0; s < stars.length; s++) {
    // Reset position of stars that go out of bounds
    if (stars[ s ].position.x < -10 ||
        stars[ s ].position.x > 10 ||
        stars[ s ].position.y < 0 ||
        stars[ s ].position.y > 10 )
    {
      stars[ s ].position.x = Math.random() * 20 - 10;
      stars[ s ].position.y = Math.random() * 10;
    }
    // Update star position
    stars[ s ].position.x += starSpeed[ s ][ 0 ];
    stars[ s ].position.y += starSpeed[ s ][ 1 ];
    stars[ s ].rotation.z += 0.003;
  }
}

// UPDATE cubes
function updateCubes(rate, levelSpeed) {
	for (var c of mCubes) {
    var collision = c.update(rate, levelSpeed, triangle, levelBreak, level, stnBounce, stnBlock, stnDiff );
    if (phase == 1 && collision) {
      logHighscore();
      phase = -1;
      setPreGame();
      return;
    }
  }
}

// UPDATE camera position
function setCam() {
    switch( stnCam ) {
        case 0:
            camera.position.x = 0;
            camera.position.y = 0.25;
            camera.position.z = 2.0;
            break;
        case 1:
            camera.position.x = 0;
            camera.position.y = 0.05;
            camera.position.z = 0.40;
            break;
        case 2:
            camera.position.x = 0;
            camera.position.y = 0.025;
            camera.position.z = 0.0;
    }
}
// --- EVENT HANDLING ---------------------------------------------------------

// Window Resize
document.addEventListener('resize', (e) => {
    width = window.innerWidth;
	height = window.innerHeight;
    // renderer
    renderer.setSize( width, height );
    // camera
	camera = new THREE.PerspectiveCamera( 15, width / height, 0.1, 1000 );
    setCam();
});

// Key Down
document.addEventListener('keydown', (e) => {
  if (e.keyCode == null) {
    // touch input event
    if( e.pageX > width * 0.5 ) {
      rightArrow = true;
    }else {
      leftArrow = true;
    }
  } else {
    // key input event
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 37 ) {
      leftArrow = true;
    } else if ( key == 39 ) {
       rightArrow = true;
    } else if ( key == 80 ) { // (p)ause
       pauseGameScreen();
    } else if (key == 38) {
      upArrow = true;
    }
  }
});

// Key Up
document.addEventListener('keyup', (e) => {
  if (e.keyCode == null) {
    // touch input event
    rightArrow = false;
    leftArrow = false;
    upArrow = false;
  } else {
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 37) {
      leftArrow = false;
    } else if (key == 39) {
      rightArrow = false;
    } else if (key == 38) {
      upArrow = false;
    }
  }
});
// pause screen
function pauseGameScreen() {
	if( phase == 0 ) {
		phase = 1;
        uiPause.style.visibility = "hidden";
        uiPause.style.opacity = 0.0;
	}else if( phase == 1 ) {
		phase = 0;
        uiPause.style.visibility = "visible";
        uiPause.style.opacity = 1.0;
	}
}
// return to menu mouse click at pause screen
function returnToMenu() {
    uiPause.style.opacity = 0.0;
    uiPause.style.visibility = "hidden";
    logHighscore();
    rotOffset = (new Date()).getTime() % 50000;
    phase = -1;
    setPreGame();
}

// --- SETTINGS ---------------------------------------------------------------

// Difficulty settings click event
function updateDiff (target) {
    stnDiff = target;
    var opt = document.getElementById( "difficulty" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
}

// Bounce settings click event
function updateBounce( target ) {
    stnBounce = target;
    var opt = document.getElementById( "bounce" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
    
}
// camera settings click event
function updateCam( target ) {
    stnCam = target;
    var opt = document.getElementById( "camera" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
    setCam();
}
// blocks settings click event
function updateBlock( target ) {
    stnBlock = target;
    var opt = document.getElementById( "block" ).getElementsByClassName( "select" );
    for( var k = 0; k < 3; k++ )
        opt[ k ].classList.remove( "focus" );
    opt[ target ].classList.add( "focus" );
    for( var c of mCubes ) c.reset( stnBlock, false, stnDiff );
    document.getElementById( "bounce" ).style.opacity = target > 0 ? "1.0" : "0.0";
}

// --- COOKIE highscore logging -----------------------------------------------

// Log highscore
function logHighscore() {
	if( totalElapse > parseInt(getCookie()) || getCookie() == "" ) {
		setCookie( totalElapse );
		uiHScore.innerHTML = (Math.floor(totalElapse / 100) / 10).toString();
	}else {
		uiHScore.innerHTML = (Math.floor(getCookie() / 100) / 10).toString();
	}
}

// Set highscore cookie
function setCookie(score) {
    document.cookie = "highscore=" + score.toString() + "; ";
}

// Get highscore cookie
function getCookie() {
  var name = "highscore=";
  var ca = document.cookie.split(';');
  for (var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') {
      c = c.substring( 1 );
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
