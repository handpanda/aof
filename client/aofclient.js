var keys = {
	left  : false,
	right : false,
	up    : false,
	down  : false,
	z     : false,
	x     : false,
	c     : false,
}

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

	socket = new io.connect("http://localhost:4000");
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
				players[p].setValues(data);
			}
		}
		if (!found) {
			players.push( new clientMan( new Vec2(0, 0), data.side) );
			players[players.length - 1].clientid = data.clientid;
			players[players.length - 1].id = data.id;
			players[players.length - 1].setValues(data);
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
				break;
				
			case 'right':
				rightTeam = new Team(data.name, data.side);
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

function drawField( context ) {
	for (z in zones) {
		zones[z].draw(context);
	}

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

var kdDraw = function ( context, players ) {
	var compX = function( playerA, playerB ) {
		return ( playerA.pos.x - playerB.pos.x );
	}
	
	var compY = function( playerA, playerB ) {
		return ( playerA.pos.y - playerB.pos.y );
	}
	
	var drawTree = function( tree ) {
		context.lineWidth = 10;	
			
		if ( tree.root != null ) {
			drawNode( tree.root );
			context.lineWidth = 20;
			context.beginPath();
			context.arc(tree.root.object.pos.x, tree.root.object.pos.y, 50, 0, Math.PI * 2, false);
			context.stroke();				
		}
	}
	
	var drawNode = function( node ) {
		if ( node != null ) {
			drawLinesToChildren( node );
			drawNode( node.left );
			drawNode( node.right );
		}
	}
	
	var drawLinesToChildren = function( node ) {
		context.strokeStyle = 'black';
		if ( node.depth % 2 ) context.strokeStyle = 'yellow';
		
		if ( node.object != null ) {
			if ( node.left != null && node.left.object != null ) {
				context.beginPath();
				context.moveTo( node.object.pos.x, node.object.pos.y );
				context.lineTo( node.left.object.pos.x, node.left.object.pos.y );
				context.stroke();
			}
			
			if ( node.right != null && node.right.object != null ) {
				context.beginPath();
				context.moveTo( node.object.pos.x, node.object.pos.y );
				context.lineTo( node.right.object.pos.x, node.right.object.pos.y );
				context.stroke();				
			} 
		}
	}
	
	var tree = new kdTree( players, 2, [ compX, compY ] );	
	
	drawTree( tree );
}

var drawKey = function(name, posX, posY, width, height) {
	var radius = 3;
	
	context.fillStyle = 'purple';
	context.strokeStyle = 'black';
	context.lineWidth = width / 7;
	
	context.beginPath();
	strokeRectangle( posX, posY, width, height, radius );
	context.fill();
	context.stroke();
	
	context.textAlign = 'center';
	context.fillStyle = 'black';
	context.font = height - radius * 4 + "pt bold";
	
	context.fillText( name, posX + width / 2, posY + height - radius * 2, width - radius * 4 );
}

var strokeRectangle = function( posX, posY, width, height, radius ) {
	context.save();
		context.translate( posX, posY );
		context.moveTo( 0, 0 );
		context.lineTo( width - radius, 0 );
		context.arcTo( width, 0, width, radius, radius );
		context.lineTo( width, height - radius );
		context.arcTo( width, height, width - radius, height, radius );
		context.lineTo( radius, height );
		context.arcTo( 0, height, 0, height - radius, radius );
		context.lineTo( 0, radius );
		context.arcTo( 0, 0, radius, 0, radius );
	context.restore();
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

		var target;
	
		if (clientPlayer != null) target = clientPlayer.pos;
		else if ( ball != null) target = ball.pos;
		else target = new Vec2(0, 0);
	
		scrollBox.centerOn( target.x, target.y );

		context.save();
			context.translate( -scrollBox.hScroll, -scrollBox.vScroll );
		
			drawField(context);
		context.restore();

		// HUD

		var border = 20;
		var staminaBarThickness = 20;
		var cornerRadius = 4;
		var staminaBarLength = scrollBox.viewportW - border * 2;
		var currentStamina = clientPlayer.stamina / 100 * staminaBarLength;

		// Stamina bar
		if ( clientPlayer != null ) {
			context.save();
				context.translate( border, scrollBox.viewportH - border * 4 - staminaBarThickness );
				
				// Stamina bar outline, with rounded corners (this is what changes shape with the player's stamina)
				context.beginPath();
					strokeRectangle( 0, 0, currentStamina, staminaBarThickness, cornerRadius );
				context.clip();
				
				// Stamina bar
				context.fillStyle = 'purple';
				context.fillRect( 0, 0, staminaBarLength, staminaBarThickness );
				
				// Stamina bar text
				context.textAlign = 'center';
				context.fillStyle = 'black';
				context.font = 'italic ' + staminaBarThickness + 'pt bold';
				context.fillText( "T        U        R        B        O", staminaBarLength / 2, border);
			context.restore();			
		}

		// Instructions
		// Arrows - move Z - kick X - punt C - run V - call for pass
		
		context.save();
			context.translate( border, scrollBox.viewportH - border );
				
			var smallKeySize = 20;
			var largeKeySize = 40;	
			var font = '50pt bold';
			var interval = scrollBox.viewportW / 5;
			
			var illustrateKey = function( name, text, posX, posY ) {
				context.save();
					context.translate( posX, 0 );	
					drawKey( name, 0, -largeKeySize, largeKeySize, largeKeySize );
					
					context.textAlign = 'left';
					context.fillStyle = 'black';
					context.font = font;
					context.fillText( text, largeKeySize, 0, interval / 2);
				context.restore();
			}
			
			context.translate( 0, 0 );	
			drawKey( "", 0, -smallKeySize, smallKeySize, smallKeySize );
			drawKey( "", smallKeySize, -smallKeySize * 2, smallKeySize, smallKeySize );
			drawKey( "", smallKeySize, -smallKeySize, smallKeySize, smallKeySize );
			drawKey( "", smallKeySize * 2, -smallKeySize, smallKeySize, smallKeySize );
			
			context.textAlign = 'left';
			context.fillStyle = 'black';
			context.font = font;
			context.fillText(" Move", smallKeySize * 3, 0, interval / 2);			
			
			illustrateKey( "Z", " Kick", interval, 0 );
			illustrateKey( "X", " Punt", interval * 2, 0 );
			illustrateKey( "C", " Run", interval * 3, 0 );
			illustrateKey( "V", " Call", interval * 4, 0 );
			
		context.restore();
			
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