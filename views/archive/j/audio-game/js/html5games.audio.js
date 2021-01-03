function MusicNote(time,line){
	this.time = time;
	this.line = line;
}

function Dot(distance, line) {
	this.distance = distance;
	this.line = line;
	this.missed = false;
}


// a global object variable to store all game scope variable.
var audiogame = {};

// toggle the game between play mode and record mode.
audiogame.isRecordMode = false;

// an array to store all music notes data.
audiogame.musicNotes = [];

audiogame.leveldata = "1.592,3;1.984,2;2.466,1;2.949,2;4.022,3;4.443,2;4.594,1;5.498,3;5.92,2;6.04,1;7.034,2;7.395,3;7.968,2;8.45,1;8.962,2;10.018,3;10.258,2;10.44,2;10.711,1;10.977,2;11.556,3;12.008,1;13.588,3;14.013,2;14.495,1;14.946,2;16.003,3;16.395,2;16.546,1;17.48,3;17.85,2;18.001,1;19.026,2;19.508,3;19.96,2;20.412,1;20.955,2;22.01,3;22.252,2;22.432,2;22.673,1;23.518,3;23.788,2;24.029,1;25.024,3;25.506,2;26.019,1;26.531,2;27.043,3;28.038,3;28.52,2;28.972,1;29.454,2;29.967,3;30.51,2;31.022,3;31.474,2;31.956,3;32.408,2;32.89,3;33.433,2;34.006,3;34.398,2;34.518,1;35.453,3;35.875,2;36.026,1;37.111,2;37.504,3;38.016,1;38.529,3;38.981,2;39.524,3;40.007,2;40.459,1;40.971,2;41.483,3;41.936,2;42.448,1;42.992,2;43.444,3;43.956,2;44.378,3;44.92,2;45.945,3;46.337,2;46.488,1;47.513,3;47.875,2;47.995,1;49.141,2;49.533,3;50.045,2;50.557,1;51.039,2;51.521,3;52.004,2;52.486,1;52.998,2;53.481,3;53.993,2;54.505,1;54.988,2;55.44,3;55.952,2;56.434,3;56.916,2;57.429,1;57.911,2;58.454,3;58.966,2;59.539,3;60.051,2;61.256,3;61.739,2;62.222,1;62.704,2;63.216,3;63.699,2;64.212,1;64.755,2;65.267,3;65.749,2;66.261,3;66.743,2;67.256,3;67.738,2;68.251,1;68.764,2;69.247,3;69.729,2;70.271,3;70.753,2;71.265,1;71.717,2;72.289,3;73.223,3;73.736,2;74.249,1;74.731,2;75.274,3;75.756,2;76.268,3;76.78,2;77.262,3;77.744,2;78.257,3;78.77,2;79.252,1;79.765,2;80.277,3;80.729,2;81.241,1;81.754,2;82.266,3;82.779,3;83.261,2;83.744,1;84.256,2;84.799,3;85.643,3;86.276,2;86.758,3;87.24,2;87.722,3;88.236,2;88.778,1;89.26,2;89.773,3;90.256,2;90.708,1;91.191,2;91.763,3;92.216,2;92.729,3;93.241,2;93.753,1;94.235,3;94.748,3;95.29,2;95.742,3;96.224,2;96.827,3;97.671,3;98.334,3;98.906,3;100.022,3;100.444,2;100.564,1;101.468,3;101.859,2;102.01,1;102.975,2;103.367,3;103.518,2;103.88,3;104.031,2;104.393,3;104.544,2;104.905,3;105.057,2;105.961,3;106.205,2;106.416,2;106.657,1;106.928,2;107.169,3;107.441,2;107.712,1;107.984,3;108.527,2;109.009,1;109.401,2;109.521,3;110.034,2;110.546,3;111.029,2;111.964,3;112.084,2;112.265,1;112.416,2;112.988,3;113.501,3;113.892,2;114.043,1;114.525,2;115.037,3;115.399,2;115.55,1;115.852,3;116.002,2;116.365,3;116.485,2;116.847,3;116.998,2;117.963,3;118.354,2;118.506,1;119.503,3;119.865,2;120.015,1;";


// the visual dots drawn on the canvas.
audiogame.dots = [];
audiogame.startingTime = 0;

// reference of the dot image
audiogame.dotImage = new Image();
audiogame.totalDotsCount = 0;
audiogame.totalSuccessCount = 0;

// storing the success count of last 5 results.
audiogame.successCount = 5;

function setupLevelData()
{
	var notes = audiogame.leveldata.split(";");
	
	// store the total number of dots
	audiogame.totalDotsCount = notes.length;
	
	for(var i in notes)
	{
		var note = notes[i].split(",");
		var time = parseFloat(note[0]);
		var line = parseInt(note[1]);
		var musicNote = new MusicNote(time,line);
		audiogame.musicNotes.push(musicNote);	
	}
}

// init function when the DOM is ready
$(function(){	
	// get the references of the audio element.
	audiogame.melody = document.getElementById("melody");
	$(audiogame.melody).bind('ended', onMelodyEnded);
	audiogame.base = document.getElementById("base");
	audiogame.buttonOverSound = document.getElementById("buttonover");
	audiogame.buttonOverSound.volume = .3;
	audiogame.buttonActiveSound = document.getElementById("buttonactive");
	audiogame.buttonActiveSound.volume = .3;
	
	// load the dot image
	audiogame.dotImage.src = "images/dot.png";
	
	// listen the button event that links to #game
	$("a[href='#game']")
	.hover(function(){
		audiogame.buttonOverSound.currentTime = 0;		
		audiogame.buttonOverSound.play();	
	},function(){
		audiogame.buttonOverSound.pause();	
	})
	.click(function(){
		audiogame.buttonActiveSound.currentTime = 0;
		audiogame.buttonActiveSound.play();
		
		$("#game-scene").addClass('show-scene');
		
		startGame();
		
		return false;
	});
	
	// keydown
	$(document).keydown(function(e){
		var line = e.which-73;
		$('#hit-line-'+line).removeClass('hide');				
		$('#hit-line-'+line).addClass('show');
		
		if (audiogame.isRecordMode)
		{
			// print the stored music notes data when press ";" (186)
			if (e.which == 186)
			{
				var musicNotesString = "";
				for(var i in audiogame.musicNotes)
				{
					musicNotesString += audiogame.musicNotes[i].time+","+audiogame.musicNotes[i].line+";";
				}
				console.log(musicNotesString);
			}
			
			var currentTime = audiogame.melody.currentTime.toFixed(3);
			var note = new MusicNote(currentTime, e.which-73);
			audiogame.musicNotes.push(note);
		}
		else
		{
		 	// our target is J(74), K(75), L(76)
			var hitLine = e.which-73;
			
			// check if hit a music note dot
			for(var i in audiogame.dots)
			{
				if (hitLine == audiogame.dots[i].line && Math.abs(audiogame.dots[i].distance) < 20)
				{
					// remove the hit dot from the dots array
					audiogame.dots.splice(i, 1);
					
					// increase the success count
					audiogame.successCount++;
				
					// keep only 5 success count max.
					audiogame.successCount = Math.min(5, audiogame.successCount);
					
					// increase the total success count
					audiogame.totalSuccessCount ++;
				}
			}
		}	
	});
	$(document).keyup(function(e){
		var line = e.which-73;
		$('#hit-line-'+line).removeClass('show');				
		$('#hit-line-'+line).addClass('hide');		
	});
	
	if (!audiogame.isRecordMode)
	{
		setupLevelData();
	}	
	
	drawBackground();
	
	if (!audiogame.isRecordMode)
	{
		setInterval(gameloop, 30);
	}
		
});

function playMusic()
{
	// play both the melody and base
	audiogame.melody.play();
	audiogame.base.play();
}

function startGame()
{
	// starting game		
	var date = new Date();
	audiogame.startingTime = date.getTime();
	setTimeout(playMusic, 3550);
}

function drawBackground()
{
	// get the reference of the canvas and the context.
	var game = document.getElementById("game-background-canvas");
	var ctx = game.getContext('2d');
		
	// set the line style of the three vertical lines.
	ctx.lineWidth = 10;
	ctx.strokeStyle = "#000";
	
	var center = game.width/2;
	
	// draw the three lines
	// the left line is placed 100 pixels on the left of center.
	ctx.beginPath();
	ctx.moveTo(center-100, 50);
	ctx.lineTo(center-100, ctx.canvas.height - 50);		
	ctx.stroke();
	
	// the middle line is placed at the center
	ctx.beginPath();
	ctx.moveTo(center, 50);
	ctx.lineTo(center, ctx.canvas.height - 50);
	ctx.stroke();
	
	// the right line is placed 100 pixels on the right of center.
	ctx.beginPath();
	ctx.moveTo(center+100, 50);
	ctx.lineTo(center+100, ctx.canvas.height - 50);
	ctx.stroke();
	
	// draw the horizontal line
	ctx.beginPath();
	ctx.moveTo(center-150, ctx.canvas.height - 80);
	ctx.lineTo(center+150, ctx.canvas.height - 80);
	// reset the line style to 1px width and grey before actually drawing the horizontal line. 
	ctx.lineWidth = 1;
	ctx.strokeStyle = "rgba(50,50,50,.8)";
	ctx.stroke();
}

// logic that run every 30ms.
function gameloop()
{
	var game = document.getElementById("game-canvas");
	var ctx = game.getContext('2d');
	
	// show new dots
	// if the game is started
	if (audiogame.startingTime != 0)
	{
		for(var i in audiogame.musicNotes)
		{
			var date = new Date();
			var elapsedTime = (date.getTime() - audiogame.startingTime)/1000;
			var note = audiogame.musicNotes[i];

			var timeDiff = note.time - elapsedTime;
			if (timeDiff >= 0 && timeDiff <= .03)
			{
				var dot = new Dot(ctx.canvas.height-150, note.line);
				audiogame.dots.push(dot);
			}
		}
	}
	
	// check missed dots
	for(var i in audiogame.dots)
	{
		if (!audiogame.dots[i].missed && audiogame.dots[i].distance < -10)
		{
			audiogame.dots[i].missed = true;
			
			// reduce the success count
			audiogame.successCount--;
			
			// reset the success count to 0 if it is lower than 0.
			audiogame.successCount = Math.max(0, audiogame.successCount);
									
		}
		
		// remove missed dots after moved to the bottom
		if (audiogame.dots[i].distance < -100)
		{
			audiogame.dots.splice(i, 1);
		}
	}
	
	// calculate the percentage of the success in last 5 music dots
	var successPercent = audiogame.successCount / 5;
	
	// prevent the successPercent to exceed range(fail safe)
	successPercent = Math.max(0, Math.min(1, successPercent));	
	
	// change the volume of the melody according to the success percentange
	audiogame.melody.volume = successPercent;
		
	
	// move the dots
	for(var i in audiogame.dots)
	{
		audiogame.dots[i].distance -= 2.5;
	}
	
	// only clear the dirty area, that is the middle area
	ctx.clearRect(ctx.canvas.width/2-200, 0, 400, ctx.canvas.height);
				
	
	// draw the music note dots
	for(var i in audiogame.dots)
	{
		
		// prepare the radial gradients fill style		
		var circle_gradient = ctx.createRadialGradient(-3,-3,1,0,0,20);
		circle_gradient.addColorStop(0, "#fff");
		circle_gradient.addColorStop(1, "#cc0");
		ctx.fillStyle = circle_gradient;
		
		// draw the path
		//console.log(ctx.canvas.height-80-audiogame.dots[i].distance);
		ctx.save();	
		var center = game.width/2;
		var dot = audiogame.dots[i];
		var x = center-100
		if (dot.line == 2)
		{
			x = center;
		}
		else if (dot.line == 3)
		{
			x = center+100;
		}
		ctx.translate(x, ctx.canvas.height-80-audiogame.dots[i].distance);
		ctx.drawImage(audiogame.dotImage, -audiogame.dotImage.width/2, -audiogame.dotImage.height/2);		
		ctx.restore();
	}
	
}

// show game over scene on melody ended.
function onMelodyEnded()
{
	console.log('song ended');
	console.log('success percent: ',audiogame.totalSuccessCount / audiogame.totalDotsCount * 100 + '%');
}