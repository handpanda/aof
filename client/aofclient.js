var keys = {
	left  : false,
	right : false,
	up    : false,
	down  : false,
	z     : false,
	x     : false,
	c     : false,
}

/*
var imgRoman1 = new regularImage("./roman1.png");
var imgRoman2 = new regularImage("./roman2.png");
var imgMongol1 = new regularImage("./mongol1.png");
var imgCossack1 = new regularImage("./cossack1.png");
var imgAztec1 = new regularImage("./aztec1.png");
var imgAztec2 = new regularImage("./aztec2.png");
var imgViking1 = new regularImage("./viking1.png");
var imgViking2 = new regularImage("./viking2.png");
var imgChinese1 = new regularImage("./chinese1.png");
var imgChinese2 = new regularImage("./chinese2.png");

var imgTopRight = new regularImage("./mongol1.png");
var imgTopLeft = new regularImage("./mongol1.png");
var imgBottomRight = new regularImage("./mongol1.png");
var imgBottomLeft = new regularImage("./mongol1.png");
*/
var socket;

var ball = null;

var playerid = 0;
var clientPlayer = null;

var gameid = -1;
var players = [];
var zones = [];

var leftTeam = null;
var rightTeam = null;

var leftScore = 0;
var rightScore = 0;
var time = 0;
var gameStopped = false;
var gameEvent = null;

var scrollBox = null;

var currentScreen = screen.LIST;

var overlay = null;

var inDebugMode = false;

$(document).ready(function() {
	scrollBox = new AOFScrollBox();

	socket = new io.connect("http://134.84.147.167:4000");
	var entry_el = $('#entry');

	socket.on('message', function(data) {
		//var data = message;

		$('#log ul').append('<li>' + data + '</li>');

		window.scrollBy(0, 1000000000000000);
		entry_el.focus();
	});

	socket.on('debugMode', function(data) {
		inDebugMode = data;
	});

	socket.on('playerid', function(data) {
		playerid = data;
		console.log('player ' + playerid);
	});

	socket.on('clientid', function(data) {
		clientid = data;
		console.log('client ' + clientid);
	});

	socket.on('joinstatus', function(data) {
		var id = data.gameId;
	
		if (data.succeed) {
			console.log("Attempt to join game " + id + " succeeded");

			switchScreen(screen.GAME);
		} else {
			console.log("Attempt to join game " + id + " failed");
			console.log("Reason: " + data.reason);
		}
	});

	socket.on('currentRoom', function(data) {
		if ( scrollBox != null ) {
			if (scrollBox.getCurrentRoom() == null) scrollBox.setCurrentRoom( new Room(new Vec2(0, 0), 0, 0) );
			scrollBox.grabCurrentRoom(data);
		}
	});

	socket.on('player', function(data) {
		var found = false;
		
		for (p in players) {
			if (players[p].id == data.id) {
				found = true;
				players[p].grab(data);
			}
		}
		if (!found) {
			players.push(new clientMan(new Vec2(0, 0)));
			players[players.length - 1].clientid = data.clientid;
			players[players.length - 1].id = data.id;
			players[players.length - 1].grab(data);
		}
		
		//console.log(data);
	});

	socket.on('kill', function(data) {
		for (p in players) {
			if (players[p].id == data) players.splice(p, 1);
		}
	});

	socket.on('zone', function(data) {
		zones.push(new clientZone(new Vec2(0, 0), type.ball));
		zones[zones.length - 1].grab(data);
		console.log("zone");
	});

	socket.on('team', function(data) {
		switch (data.side) {
			case 'left':
				leftTeam = new Team(data.name, data.side);

/*				switch (leftTeam.name) {
					case "Mongols":
						imgTopLeft = imgMongol1;
						imgBottomLeft = imgMongol1;
						break;
					case "Zulu":
						imgTopLeft = imgCossack1;
						imgBottomLeft = imgCossack1;
						break;
					case "Chinese":
						imgTopLeft = imgChinese1;
						imgBottomLeft = imgChinese2;
						break;
					case "Vikings":
						imgTopLeft = imgViking1;
						imgBottomLeft = imgViking2;
						break;
					case "Romans":
						imgTopLeft = imgRoman1;
						imgBottomLeft = imgRoman2;
						break;
					case "Aztecs":
						imgTopLeft = imgAztec1;
						imgBottomLeft = imgAztec2;
						break;
				}
*/	
				break;
			case 'right':
				rightTeam = new Team(data.name, data.side);
/*
				switch (rightTeam.name) {
					case "Mongols":
						imgTopRight = imgMongol1;
						imgBottomRight = imgMongol1;
						break;
					case "Zulu":
						imgTopRight = imgCossack1;
						imgBottomRight = imgCossack1;
						break;
					case "Chinese":
						imgTopRight = imgChinese1;
						imgBottomRight = imgChinese2;
						break;
					case "Vikings":
						imgTopRight = imgViking1;
						imgBottomRight = imgViking2;
						break;
					case "Romans":
						imgTopRight = imgRoman1;
						imgBottomRight = imgRoman2;
						break;
					case "Aztecs":
						imgTopRight = imgAztec1;
						imgBottomRight = imgAztec2;
						break;
				}*/
				break;
		}	
	});

	socket.on('ball', function(data) {
		if (ball == null) ball = new clientBall(new Vec2(0, 0));
		ball.grab(data);
	});

	/*
	 * Packet /gameData/
	 * 
	 * Game state information
	 * 
	 * leftScore - left side score
	 * rightScore - right side score
	 * time - game clock, in seconds
	 * stopped - has the game been stopped for some event
	 * event - some event
	 * 
	 */
	socket.on('gameData', function(data) {
		leftScore = data.leftScore;
		rightScore = data.rightScore;
		time = data.time;
		gameStopped = data.stopped;
		gameEvent = data.event;

		if ( overlay == null && gameEvent != null && gameEvent.type == Event.prototype.TYPE.GOAL ) {
			overlay = new anim1( "GOAL", 'red', scrollBox );
		}

		if ( overlay == null && gameEvent != null && gameEvent.type == Event.prototype.TYPE.GOALKICK ) {
			overlay = new anim2( "GOAL KICK", 'blue', scrollBox );
		}
		if ( overlay != null && !gameStopped ) {
			overlay.complete();
		}
		
		if ( overlay == null && gameEvent != null && gameEvent.type == Event.prototype.TYPE.ENDOFGAME ) {
			if ( leftScore == rightScore ) {
				overlay = new anim1( "DRAW", 'black', scrollBox );
			} else {
				var winner;
				
				if ( leftScore > rightScore ) winner = 'left';
				else winner = 'right';
					
				if ( clientPlayer.side == winner ) overlay = new anim1( "WIN", 'black', scrollBox );
				else overlay = new anim1( "LOSE", 'black', scrollBox );
			}
		}
	});
	
	socket.on('eventComplete', function(data) {
		console.log( '/eventComplete/ ' + data.type );
		
		if ( overlay != null ) overlay.complete();
		
		if ( data.type == Event.prototype.TYPE.ENDOFGAME ) leaveGame();
	});

	socket.on('list', function(data) {
		var found;
		
		menu.clearGameList();

		for ( d in data ) {
			menu.addGame( data[d] );		
		}
			
		menu.refresh( scrollBox );
	});		

	socket.emit('ready', null);

	socket.emit('list', null);

	socket.on('ready', function(data) {
		updateInterval = setInterval(update, 20);
	});

	socket.on('marco', function(data) {
		socket.emit('polo', null);
	});

	document.onmousemove = mouseMoveHandler;
	document.onmousedown = mouseDownHandler;
	document.onmouseup = mouseUpHandler;
	document.onkeydown = keyDownHandler;
	document.onkeyup = keyUpHandler;
});	

mousePos = new Vec2(0, 0);
mousedown = false;

function mouseMoveHandler(event) {
	if (event.pageX || event.pageY) { 
		mousePos.x = event.pageX;
		mousePos.y = event.pageY;
	} else { // Not all browsers use pageX/Y
		mousePos.x = event.clientX + document.body.scrollLeft; 
		mousePos.y = event.clientY + document.body.scrollTop; 
	} 

	mousePos.x -= scrollBox.canvas.offsetLeft;
	mousePos.y -= scrollBox.canvas.offsetTop;
}

function mouseDownHandler(event) {
	mousedown = true;
	
	menu.onMouseHit();
}

function mouseUpdater() {
	mousedown = false;
}

function mouseUpHandler(event) {
	mousedown = false;
}

function updateKeys() {
	keys.left = keyboardState[KEY.LEFT];
	keys.right = keyboardState[KEY.RIGHT];
	keys.up = keyboardState[KEY.UP];
	keys.down = keyboardState[KEY.DOWN];
	keys.z = keyboardState[KEY.Z];
	keys.x = keyboardState[KEY.X];
	keys.c = keyboardState[KEY.C];
}

function drawField(context) {
	// If room is smaller than screen area, center the view on the room
	// Otherwise, center the view on the player, unless the edge of the room has been reached

	if ( scrollBox == null ) return;

	var offset = new Vec2(0, 0);

	var target;
	var border = 20;
	var staminaBarWidth = 20;

	if (clientPlayer != null) target = clientPlayer.pos;
	else if ( ball != null) target = ball.pos;
	else target = new Vec2(0, 0);

	scrollBox.centerOn( target.x, target.y );

	context.save();
		context.translate( -scrollBox.hScroll, -scrollBox.vScroll );

		for (z in zones) {
			zones[z].draw(context);
		}
/*
			imgTopLeft.draw(context, 0, dims.fieldWidth / 2 - dims.goalWidth / 2 - imgTopLeft.image.height * dims.backlineWidth / imgTopLeft.image.width, dims.backlineWidth);
			imgBottomLeft.draw(context, 0, dims.fieldWidth / 2 + dims.goalWidth / 2, dims.backlineWidth);
			imgTopRight.draw(context, dims.fieldLength - dims.backlineWidth, dims.fieldWidth / 2 - dims.goalWidth / 2 - imgTopRight.image.height * dims.backlineWidth / imgTopRight.image.width, dims.backlineWidth);
			imgBottomRight.draw(context, dims.fieldLength - dims.backlineWidth, dims.fieldWidth / 2 + dims.goalWidth / 2, dims.backlineWidth);
*/
		for (p in players) {
			players[p].draw(context);
		}
		if (ball != null) ball.draw(context);
		
		for (z in zones) {
			zones[z].drawOverlay(context);
		}
		
		if ( clientPlayer != null ) {
			context.globalAlpha = 0.5;
			context.strokeStyle = 'orange';
			context.lineWidth = 20;
			context.beginPath();
			context.arc(clientPlayer.pos.x, clientPlayer.pos.y, 50, 0, Math.PI * 2, false);
			context.stroke();
			context.globalAlpha = 1.0;
		}
	context.restore();
	
	// Stamina bar
	if ( clientPlayer != null ) {
		context.fillStyle = 'red';
		context.fillRect( border, scrollBox.viewportH - border - staminaBarWidth, scrollBox.viewportW - border * 2, staminaBarWidth );
		context.fillStyle = 'blue';
		context.fillRect( border, scrollBox.viewportH - border - staminaBarWidth, clientPlayer.stamina / 100 * ( scrollBox.viewportW - border * 2 ), staminaBarWidth );
	}
}

var team1Name = '';
var team2Name = '';

var menu = new Menu();

var switchScreen = function(toScreen) {
	if (toScreen == screen.LIST) socket.emit('list', null);

	currentScreen = toScreen;

	menu.refresh( scrollBox );
}

var attemptToJoinGame = function(id) {
	clearInterval(updateInterval);

	gameid = id;
	players = [];
	zones = [];

	socket.emit('join', gameid);
}

var attemptToAddGame = function(team1Name, team2Name) {
	clearInterval(updateInterval);
	setInterval(update, 60);	

	var data = {team1: team1Name, team2: team2Name};

	console.log('Add Game: ' + data.team1 + ' v ' + data.team2);
	socket.emit('addgame', data);

	switchScreen(screen.LIST);
}

var leaveGame = function() {
	clearInterval(updateInterval);
	setInterval(update, 60);

	socket.emit('leave', null);

	switchScreen( screen.LIST );
}	

var updateInterval;

function update() {
	if ( overlay != null ) socket.emit( 'waiting', null );

	menu.update( scrollBox );

	render();
	
	mouseUpdater();
}

function getGameStatusString() {
	return leftTeam.name + ' ' + leftScore + ' ' +
			text.pad0(Math.floor(time / 60).toString(), 2) + ":" + text.pad0((time % 60).toString(), 2) + ' ' + 
			rightTeam.name + ' ' + rightScore;
}

function render() {
	scrollBox.clearCanvas();

	context = scrollBox.getContext();

	switch (currentScreen) {
	case screen.TITLE:
		
		break;
	case screen.LIST:
		context.font = "24px bold";
		
		context.textAlign = 'left';
		context.fillStyle = 'blue';
		context.fillText("List of currently active games", 0, 50);		
		
		menu.draw( context );
		break;
	case screen.NEWGAMETEAM1:
	case screen.NEWGAMETEAM2:
		context.font = "24px bold";
		
		context.textAlign = 'left';
		context.fillStyle = 'blue';
		context.fillText("List of currently active games", 0, 50);		
		
		menu.draw( context );
		break;
	case screen.HOWTO:

		break;
	case screen.GAME:
		if ( inDebugMode ) socket.emit('debuginput', keyboardState);
		else socket.emit('input', keys);
		updateKeys();
		keyboardStateUpdater();

		for (p in players) {
			if (players[p].id == playerid && playerid > 0) clientPlayer = players[p];
		}

		scrollBox.calcValues();

		drawField(context);

		menu.draw( context );
		break;
	case screen.RESULT:

		break;
	}

	if ( overlay != null ) {
		overlay.loop();
		if ( overlay.removeThis ) overlay = null;
	}
}

document.onkeydown = keyDownHandler;
document.onkeyup = keyUpHandler;