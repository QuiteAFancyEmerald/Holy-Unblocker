var KEY = {
	UP: 38,
	DOWN: 40,
	W: 87,
	S: 83
}

// a global object to store all global variable we use for the game
var pingpong = {
	scoreA : 0,  // score for player A
	scoreB : 0   // score for player B
}

// an array to remember which key is pressed and which is not.
pingpong.pressedKeys = [];

pingpong.ball = {
	speed: 5,
	directionX: 1,
	directionY: 1
}

$(function(){
	// set interval to call gameloop every 30 milliseconds
	pingpong.timer = setInterval(gameloop,30);
	
	// mark down what key is down and up into an array called "pressedKeys"
	$(document).keydown(function(e){
		pingpong.pressedKeys[e.keyCode] = true;
    });
    $(document).keyup(function(e){
    	pingpong.pressedKeys[e.keyCode] = false;
	});
});

// this function is called every 30 milliseconds 
function gameloop()
{
	moveBall();
	movePaddless();
}

function moveBall()
{
	// move the ball in every 30 milliseconds
	// reference useful varaibles
	var ballTop = parseInt($("#ball").css("top"));
	var ballLeft = parseInt($("#ball").css("left"));
	var playgroundHeight = parseInt($("#playground").height());
	var playgroundWidth = parseInt($("#playground").width());	
	var ball = pingpong.ball;
	
	// check playground boundary
	// check bottom
	if (ballTop+ball.speed*ball.directionY > playgroundHeight)
	{
		ball.directionY = -1;
	}
	// check top
	if (ballTop+ball.speed*ball.directionY < 0)
	{
		ball.directionY = 1;
	}
	// check right
	if (ballLeft+ball.speed*ball.directionX > playgroundWidth)
	{
		// player B lost.		
		pingpong.scoreA++;
		$("#scoreA").html(pingpong.scoreA);
		
		// reset the ball;
		$("#ball").css({
			"left":"250px",
			"top" :"100px"
		});
		
		// update the ball location variables;
		ballTop = parseInt($("#ball").css("top"));
		ballLeft = parseInt($("#ball").css("left"));
		ball.directionX = -1;
	}
	// check left
	if (ballLeft + ball.speed*ball.directionX < 0)
	{
		// player A lost.		
		pingpong.scoreB++;
		$("#scoreB").html(pingpong.scoreB);
		
		// reset the ball;
		$("#ball").css({
			"left":"150px",
			"top" :"100px"
		});
		
		// update the ball location variables;
		ballTop = parseInt($("#ball").css("top"));
		ballLeft = parseInt($("#ball").css("left"));
		ball.directionX = 1;
	}
	
	// check moving paddle here, later.
	// check left paddle
	var paddleAX = parseInt($("#paddleA").css("left"))+parseInt($("#paddleA").css("width"));
	var paddleAYBottom = parseInt($("#paddleA").css("top"))+parseInt($("#paddleA").css("height"));
	var paddleAYTop = parseInt($("#paddleA").css("top"));
	if (ballLeft + ball.speed*ball.directionX < paddleAX)
	{
		if (ballTop + ball.speed*ball.directionY <= paddleAYBottom && 
			ballTop + ball.speed*ball.directionY >= paddleAYTop)
		{
			ball.directionX = 1;
		}
	}
	
	// check right paddle
	var paddleBX = parseInt($("#paddleB").css("left"));
	var paddleBYBottom = parseInt($("#paddleB").css("top"))+parseInt($("#paddleB").css("height"));
	var paddleBYTop = parseInt($("#paddleB").css("top"));
	if (ballLeft + ball.speed*ball.directionX >= paddleBX)
	{
		if (ballTop + ball.speed*ball.directionY <= paddleBYBottom && 
			ballTop + ball.speed*ball.directionY >= paddleBYTop)
		{
			ball.directionX = -1;
		}
	}
	
	
	// actually move the ball with speed and direction
	$("#ball").css({
		"left" : ballLeft + ball.speed * ball.directionX,
		"top" : ballTop + ball.speed * ball.directionY
	});
}

function movePaddless()
{
	// use our custom timer to continuously check if a key is pressed. 
	if (pingpong.pressedKeys[KEY.UP]) // arrow up
	{
		// move the paddle B up 5 pixels
		var top = parseInt($("#paddleB").css("top"));
		$("#paddleB").css("top",top-5);	
	}
	if (pingpong.pressedKeys[KEY.DOWN]) // arrow down
	{
		// move the paddle B down 5 pixels
		var top = parseInt($("#paddleB").css("top"));
		$("#paddleB").css("top",top+5);
	}
	if (pingpong.pressedKeys[KEY.W]) // w
	{
		// move the paddle A up 5 pixels
		var top = parseInt($("#paddleA").css("top"));
		$("#paddleA").css("top",top-5);
	}
	if (pingpong.pressedKeys[KEY.S]) // s
	{
		// move the paddle A down 5 pixels
		var top = parseInt($("#paddleA").css("top"));
		$("#paddleA").css("top",top+5);			
	}
}