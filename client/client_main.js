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

var playerTree = null;

var leftTeam = null;
var rightTeam = null;

var leftScore = 0;
var rightScore = 0;
var time = 0;
var gameStopped = false;
var gameEvent = null;

// Can't stop thinking about her. Kind of debilitating

var bounds = null;

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
			players.push( new clientMan( new Vec2(0, 0), data.side, data.team ) );
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
		
		zones[zones.length - 1].updateSides();
		
		if ( data.type.name == type.bounds.name ) {
			bounds = zones[zones.length - 1];
		}
		
		console.log(data);
	});

	socket.on('team', function(data) {
		console.log( "Team " + data );

		switch (data.side) {
			case 'left':
				leftTeam = new Team(data.nation, data.side);
				break;
				
			case 'right':
				rightTeam = new Team(data.nation, data.side);
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
	
		sendClientPathPackets();	
	});

	document.onmousemove = mouseMoveHandler;
	document.onmousedown = mouseDownHandler;
	document.onmouseup = mouseUpHandler;
	document.onkeydown = keyDownHandler;
	document.onkeyup = keyUpHandler;
});	

mousePos = new Vec2(0, 0);
mousedown = false;

var mouseMoveHandler = function(event) {
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

var mouseDownHandler = function(event) {
	mousedown = true;
	
	menu.onMouseHit();
}

var mouseUpdater = function() {
	mousedown = false;
}

var mouseUpHandler = function(event) {
	mousedown = false;
}

// Update the packet containing the player's keystroke information
var prepareKeyPacket = function() {
	keys.left = keyboardState[KEY.LEFT];
	keys.right = keyboardState[KEY.RIGHT];
	keys.up = keyboardState[KEY.UP];
	keys.down = keyboardState[KEY.DOWN];
	keys.z = keyboardState[KEY.Z];
	keys.x = keyboardState[KEY.X];
	keys.c = keyboardState[KEY.C];
}

/* 
 * routeAround
 * 
 * find a path around some obstacle
 * the 'path' consists of the midpoints of the open areas left and right of the obstacle
 * 
 */
var routeAround = function( point, approach ) {
	if (clientPlayer == null) return;
	
	var box = clientPlayer.sightLine;

	context.fillStyle = 'orange';
	
	if ( playerTree.overlaps( box ) ) {
		context.fillStyle = 'red';
	}
	
	if ( box.containsPoint( clientPlayer.pos ) ) {
		context.fillStyle = 'purple';
	}	

	context.lineWidth = 1;
	context.strokeStyle = 'blue';
	
	var convert = function( point ) {
		var p = point.minus( box.pos );
		p.rotate( box.angle );
		p.add( box.pos );
		
		return p;		
	}
	
	context.save();
		context.beginPath();
		
		context.moveTo( box.left, box.top );
		context.lineTo( box.right, box.top );
		context.lineTo( box.right, box.bottom );
		context.lineTo( box.left, box.bottom );
		context.closePath();
		
		for ( p in players ) {
			var loc = convert( players[p].center );
			
			context.stroke();
			context.fillStyle = 'blue';
			context.fillRect( loc.x - 5, loc.y - 5, 10, 10 );
		}
	context.restore();

	context.fillStyle = 'orange';
	context.fillRect( clientPlayer.pos.x, clientPlayer.pos.y, 20, 20 );
}
	
var debugDraw = function( context ) {
	if ( keyHeld( KEY.G ) ) { 
		for (p in players) {
			var player = players[p];
			
			if ( player.obstructed ) context.fillStyle = 'black';
			else context.fillStyle = 'white';
			
			context.globalAlpha = 0.6;
			player.sightLine.drawRect( context );
			if ( player.leftOption != null ) {
				player.leftOption.drawRect( context );
			}
			
			if ( player.rightOption != null ) {
				player.rightOption.drawRect( context );
			}
			
			context.globalAlpha = 1.0;			
		}
		
		if ( clientPlayer != null && clientPlayer.obstructed && clientPlayer.occluder != null ) {
			context.fillStyle = 'purple';
			context.fillRect( clientPlayer.occluder.center.x, clientPlayer.occluder.center.y, 20, 20 );
			
			if ( clientPlayer.leftOccluder != null ) {
				context.fillRect( clientPlayer.leftOccluder.center.x, clientPlayer.leftOccluder.center.y, 20, 20 );	
			}
			if ( clientPlayer.rightOccluder != null ) {
				context.fillRect( clientPlayer.rightOccluder.center.x, clientPlayer.rightOccluderxz.center.y, 20, 20 );	
			}			
		}		
	}
	
	if ( playerTree != null ) playerTree.draw( context, function ( node ) { return node.tested || !(keyHeld(KEY.F) || keyHeld( KEY.G ) ); } );
}

// Friday I'll see her. Here's hoping...

var menu = new Menu();

var switchScreen = function(toScreen) {
	if (toScreen == screen.LIST) socket.emit('list', null);

	currentScreen = toScreen;

	menu.refresh( scrollBox );
}

var sendClientPathPackets = function() {
	for ( p in players ) {
		var player = players[p];
		
		socket.emit('playerpath', { id: player.id, pos: player.interDestPos });
	}
}

var attemptToJoinGame = function(id) {
	clearInterval(updateInterval);

	gameid = id;
	players = [];
	zones = [];

	socket.emit('join', gameid);
}

var attemptToAddGame = function(team1Nation, team2Nation) {
	clearInterval(updateInterval);
	setInterval(update, 60);	

	var data = {team1: team1Nation, team2: team2Nation};

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

var update = function() {
	frames++;
	
	if ( overlay != null ) socket.emit( 'waiting', null );

	menu.update( scrollBox );

	updateBall();

	if( clientPlayer != null ) clientPlayer.destPos = mousePos.plus( new Vec2( scrollBox.hScroll, scrollBox.vScroll ) );
	updatePlayers();
	updatePlayerTree( players );
	testPlayersAgainstTree( players, playerTree );

	render();
	
	mouseUpdater();
}

var getGameStatusString = function() {
	return leftTeam.nation.name + ' ' + leftScore + ' ' +
			text.pad0(Math.floor(time / 60).toString(), 2) + ":" + text.pad0((time % 60).toString(), 2) + ' ' + 
			rightTeam.nation.name + ' ' + rightScore;
}

var updateBall = function() {
	if ( ball != null ) ball.updateSides();	
}

var updatePlayers = function() {
	for ( p in players ) {
		var player = players[p];
		
		player.updateSides();
		player.updateSightLine();
	}
}

var updatePlayerTree = function ( players ) {
	var compX = function( playerA, playerB ) {
		return ( playerA.pos.x - playerB.pos.x );
	}
	
	var compY = function( playerA, playerB ) {
		return ( playerA.pos.y - playerB.pos.y );
	}
	
	playerTree = new KDTree( players, 2, [ compX, compY ] );	
}

var testPlayersAgainstTree = function( players, tree ) {
	for ( p in players ) {
		var player = players[p];		
		
		if ( tree != null ) player.testAgainstTree( tree, player == clientPlayer, bounds );
	}
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

var render = function() {
	scrollBox.clearCanvas();

	context = scrollBox.getContext();

	switch (currentScreen) {
	case screen.TITLE:
		
		break;
	case screen.LIST:
		menu.draw( context );
		break;
	case screen.NEWGAMETEAM1:
	case screen.NEWGAMETEAM2:	
		menu.draw( context );
		break;
	case screen.HOWTO:

		break;
	case screen.GAME:
		if ( inDebugMode ) socket.emit('debuginput', keyboardState);
		else socket.emit('input', keys);
		prepareKeyPacket();
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
			
			//routeAround();
			
			if ( keyHeld(KEY.D) ) debugDraw( context );
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

var drawField = function( context ) {
	for (z in zones) {
		zones[z].draw(context);
	}

	if ( clientPlayer != null ) {
		context.globalAlpha = 0.5;
		context.fillStyle = 'green';
		context.lineWidth = 20;
		context.beginPath();
		context.arc(clientPlayer.center.x, clientPlayer.center.y, 50, 0, Math.PI * 2, false);
		context.fill();
		context.globalAlpha = 1.0;
	}
	for (p in players) {
		players[p].draw(context);
	}
	if (ball != null) ball.draw(context);
	
	for (z in zones) {
		zones[z].drawOverlay(context);
	}
}

var fps = 0;
var frames = 0;

var timer = function() {
	fps = frames;
	frames = 0;
}

setInterval( timer, 1000 );

document.onkeydown = keyDownHandler;
document.onkeyup = keyUpHandler;