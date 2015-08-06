define( [
		// External libs
		"jquery",
		"socket.io/socket.io",

		"juego/keyboard",
		"juego/mouse",

		// Shared with server
		"screens",
		"type",
		"Event",
		"Room",
		"Team",

		// Client only
		"client/AOFScrollBox",
		"client/ClientMan",
		"client/ClientBall",
		"client/ClientZone",
		"client/Menu",
		"client/anim1",
		"client/anim2",
		"client/sendEvent"], function(

		$,
		io,

		keyboard,
		mouse,

		screens,
		entityType,
		Event,
		Room,
		Team,

		AOFScrollBox,
		ClientMan,
		ClientBall,
		ClientZone,
		Menu,
		anim1,
		anim2,
		sendEvent) {

var Client = function() {

	this.keys = {
		left  : false,
		right : false,
		up    : false,
		down  : false,
		z     : false,
		x     : false,
		c     : false,
	}

	this.socket = null;

	this.ball = null;

	this.playerid = 0;
	this.clientPlayer = null;

	this.gameid = -1;
	this.players = [];
	this.zones = [];

	this.leftTeam = null;
	this.rightTeam = null;

	this.leftScore = 0;
	this.rightScore = 0;
	this.time = 0;
	this.gameStopped = false;
	this.gameEvent = null;

	this.bounds = null;

	this.scrollBox = null;

	this.overlay = null;

	this.inDebugMode = false;
	this.menu = new Menu();

	this.updateInterval = null;

	this.fps = 0;
	this.frames = 0;

	var _this = this;

	var timer = function() {
		_this.fps = _this.frames;
		_this.frames = 0;
	}

	setInterval( timer, 1000 );

}

var client = null;

$(document).ready(function() {
	client = new Client();

	console.log( client );

	client.registerHandlers();

	client.scrollBox = new AOFScrollBox();

	client.socket = new io.connect("http://localhost:4000");
	var entry_el = $('#entry');


	client.socket.on('message', function(data) {
		//var data = message;

		$('#log ul').append('<li>' + data + '</li>');

		window.scrollBy(0, 1000000000000000);
		entry_el.focus();
	});

	client.socket.on('debugMode', function(data) {
		client.inDebugMode = data;
	});

	client.socket.on('playerid', function(data) {
		client.playerid = data;
		console.log('player ' + client.playerid);
	});

	client.socket.on('clientid', function(data) {
		client.clientid = data;
		console.log('client ' + client.clientid);
	});

	client.socket.on('joinstatus', function(data) {
		if (data.succeed) {
			console.log("Attempt to join game " + data.gameId + " succeeded");

			client.gameid = data.gameId;

			sendEvent( "switch-screen", { toScreen: screens.GAME } );
		} else {
			console.log("Attempt to join game " + data.gameId + " failed");
			console.log("Reason: " + data.reason);
		}
	});

	client.socket.on('currentRoom', function(data) {
		if ( client.scrollBox != null ) {
			if ( client.scrollBox.getCurrentRoom() == null) client.scrollBox.setCurrentRoom( new Room(new Vec2(0, 0), 0, 0) );
			client.scrollBox.grabCurrentRoom( data );
		}
	});

	client.socket.on('player', function(data) {
		var found = false;
		
		for (p in client.players ) {
			if ( client.players[p].id == data.id ) {
				found = true;
				client.players[p].setValues(data);
			}
		}
		if ( !found ) {
			var len = client.players.length - 1;

			var newPlayer = new ClientMan( new Vec2(0, 0), data.side, data.team );

			newPlayer.clientid = data.clientid;
			newPlayer.id = data.id;
			newPlayer.setValues( data );

			client.players.push( newPlayer );
		}
		
		//console.log(data);
	});

	client.socket.on('kill', function(data) {
		for (p in client.players) {
			if ( client.players[p].id == data ) client.players.splice(p, 1);
		}
	});

	client.socket.on('zone', function(data) {
		var newZone = new ClientZone(new Vec2(0, 0), entityType.ball);

		newZone.grab(data);
		newZone.updateSides();
		
		if ( data.type.name == entityType.bounds.name ) {
			bounds = newZone;
		}

		client.zones.push( newZone );
		
		console.log(data);
	});

	client.socket.on('team', function(data) {
		console.log( "Team " + data );

		switch (data.side) {
			case 'left':
				client.leftTeam = new Team(data.nation, data.side);
				break;
				
			case 'right':
				client.rightTeam = new Team(data.nation, data.side);
				break;
		}	
	});

	client.socket.on('ball', function(data) {
		if (client.ball == null) client.ball = new ClientBall(new Vec2(0, 0));

		client.ball.grab(data);
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
	client.socket.on('gameData', function(data) {
		client.leftScore = data.leftScore;
		client.rightScore = data.rightScore;
		client.time = data.time;
		client.gameStopped = data.stopped;
		client.gameEvent = data.event;

		if ( client.overlay == null && client.gameEvent != null && client.gameEvent.type == Event.prototype.TYPE.GOAL ) {
			client.overlay = new anim1( "GOAL", 'red', client.scrollBox );
		}

		if ( client.overlay == null && client.gameEvent != null && client.gameEvent.type == Event.prototype.TYPE.GOALKICK ) {
			client.overlay = new anim2( "GOAL KICK", 'blue', client.scrollBox );
		}
		if ( client.overlay != null && !client.gameStopped ) {
			client.overlay.complete();
		}
		
		if ( client.overlay == null && client.gameEvent != null && client.gameEvent.type == Event.prototype.TYPE.ENDOFGAME ) {
			if ( client.leftScore == client.rightScore ) {
				client.overlay = new anim1( "DRAW", 'black', client.scrollBox );
			} else {
				var winner;
				
				if ( client.leftScore > client.rightScore ) winner = 'left';
				else winner = 'right';
					
				if ( client.clientPlayer.side == winner ) client.overlay = new anim1( "WIN", 'black', client.scrollBox );
				else client.overlay = new anim1( "LOSE", 'black', client.scrollBox );
			}
		}
	});
	
	client.socket.on('eventComplete', function(data) {
		console.log( '/eventComplete/ ' + data.type );
		
		if ( client.overlay != null ) client.overlay.complete();
		
		if ( data.type == Event.prototype.TYPE.ENDOFGAME ) sendEvent( "leave-game" );
	});

	client.socket.on('list', function(data) {
		var found;
		
		client.menu.clearGameList();

		for ( d in data ) {
			client.menu.addGame( data[d] );		
		}
			
		client.menu.refresh( client.scrollBox );
	});		

	client.socket.emit('ready', null);

	client.socket.emit('list', null);

	client.socket.on('ready', function(data) {
		client.updateInterval = setInterval(clientUpdate, 60);
	});

	client.socket.on('marco', function(data) {
		client.socket.emit('polo', null);
	});
});	

// Update the packet containing the player's keystroke information
Client.prototype.prepareKeyPacket = function() {
	this.keys.left = keyboard.keyState( keyboard.KEY.LEFT );
	this.keys.right = keyboard.keyState( keyboard.KEY.RIGHT );
	this.keys.up = keyboard.keyState( keyboard.KEY.UP );
	this.keys.down = keyboard.keyState( keyboard.KEY.DOWN );
	this.keys.z = keyboard.keyState( keyboard.KEY.Z );
	this.keys.x = keyboard.keyState( keyboard.KEY.X );
	this.keys.c = keyboard.keyState( keyboard.KEY.C );
}

// Reacts to switch screen event
Client.prototype.registerHandlers = function() {
	var _this = this;

	document.addEventListener( "switch-screen", function( e ) {
		if (e.detail.toScreen == screens.LIST) _this.socket.emit('list', null);
	}, true);

	document.addEventListener( "attempt-join-game", function( e ) {
		clearInterval( _this.updateInterval );

		_this.players = [];
		_this.zones = [];

		_this.socket.emit( "join", e.detail.id );
	}, true);

	document.addEventListener( "attempt-add-game", function( e ) {
		clearInterval( _this.updateInterval );
		_this.updateInterval = setInterval( clientUpdate, 60 );	

		var data = { team1: e.detail.team1Nation, team2: e.detail.team2Nation };
		_this.socket.emit( 'addgame', data );

		console.log( 'Add Game: ' + data.team1 + ' v ' + data.team2 );		

		sendEvent( "switch-screen", { toScreen: screens.LIST } );		
	}, true);

	document.addEventListener( "leave-game", function( e ) {
		clearInterval( _this.updateInterval );
		_this.updateInterval = setInterval( clientUpdate, 60 );	

		_this.socket.emit( 'leave', null );

		sendEvent( "switch-screen", { toScreen: screens.LIST } );
	}, true);
}

var clientUpdate = function() {
	client.update();
}

Client.prototype.update = function() {
	this.frames++;
	
	if ( this.overlay != null ) this.socket.emit( 'waiting', null );

	this.updateBall();

	//if( this.clientPlayer != null ) {
	//	this.clientPlayer.destPos = mousePos.plus( new Vec2( this.scrollBox.hScroll, this.scrollBox.vScroll ) );
	//}

	this.updatePlayers();

	this.render();
	
	mouse.updateState( this.scrollBox.canvas );
}

Client.prototype.getGameStatusString = function() {
	return 	this.leftTeam.nation.name + ' ' + this.leftScore + ' ' +
			text.pad0(Math.floor(this.time / 60).toString(), 2) + ":" + text.pad0((this.time % 60).toString(), 2) + ' ' + 
			this.rightTeam.nation.name + ' ' + this.rightScore;
}

Client.prototype.updateBall = function() {
	if ( this.ball != null ) this.ball.updateSides();	
}

Client.prototype.updatePlayers = function() {
	for ( p in this.players ) {
		var player = this.players[p];
		
		player.updateSides();
	}
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

Client.prototype.render = function() {
	this.scrollBox.clearCanvas();

	context = this.scrollBox.getContext();

	switch (this.menu.currentScreen) {
	case screens.TITLE:
		
		break;
	case screens.LIST:

		break;
	case screens.NEWGAMETEAM1:
	case screens.NEWGAMETEAM2:	

		break;
	case screens.HOWTO:

		break;
	case screens.GAME:
		if ( this.inDebugMode ) this.socket.emit('debuginput', keyboard.KEY);
		else this.socket.emit('input', this.keys);

		this.prepareKeyPacket();
		keyboard.updateState();

		for (p in this.players) {
			if ( this.players[p].id == this.playerid && this.playerid > 0 ) this.clientPlayer = this.players[p];
		}

		this.scrollBox.calcValues();

		var target;
	
		if ( this.clientPlayer != null ) target = this.clientPlayer.pos;
		else if ( this.ball != null ) target = this.ball.pos;
		else target = new Vec2(0, 0);
	
		this.scrollBox.centerOn( target.x, target.y );

		context.save();
			context.translate( -this.scrollBox.hScroll, -this.scrollBox.vScroll );
		
			this.drawField(context);
			
			//routeAround();
			
		context.restore();

		// HUD

		var border = 20;
		var staminaBarThickness = 20;
		var cornerRadius = 4;
		var staminaBarLength = this.scrollBox.viewportW - border * 2;
		var currentStamina = this.clientPlayer.stamina / 100 * staminaBarLength;

		// Stamina bar
		if ( this.clientPlayer != null ) {
			context.save();
				context.translate( border, this.scrollBox.viewportH - border * 4 - staminaBarThickness );
				
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
			context.translate( border, this.scrollBox.viewportH - border );
				
			var smallKeySize = 20;
			var largeKeySize = 40;	
			var font = '50pt bold';
			var interval = this.scrollBox.viewportW / 5;
			
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
			
		break;
	case screens.RESULT:

		break;
	}

	if ( this.overlay != null ) {
		this.overlay.loop();
		if ( this.overlay.removeThis ) this.overlay = null;
	}
}

Client.prototype.drawField = function( context ) {
	for (z in this.zones) {
		this.zones[z].draw(context);
	}

	if ( this.clientPlayer != null ) {
		context.globalAlpha = 0.5;
		context.fillStyle = 'green';
		context.lineWidth = 20;
		context.beginPath();
		context.arc( this.clientPlayer.center.x, this.clientPlayer.center.y, 50, 0, Math.PI * 2, false);
		context.fill();
		context.globalAlpha = 1.0;
	}
	for (p in this.players) {
		this.players[p].draw( context );
	}
	if (this.ball != null) this.ball.draw( context );
	
	for (z in this.zones) {
		this.zones[z].drawOverlay( context );
	}
}

return client;

});