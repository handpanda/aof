var SocketIOClient = require("./SocketIOClient.js");
var Man = require('./Man.js');
var ACT = require('./Act.js');

var clientnum = 0;

var AOFClient = function( ioClient ) {
	SocketIOClient.call( this, ioClient );
	
	clientnum++;
	this.ident = clientnum;
	
	this.lobby = null;
	this.game = null;
	this.player = null;	
	
	this.playerid = 0;
	
	var client = this;
	
	// Client wants the list of active games
	this.on('list', function(data) {
		console.log('/list/: ' + 'Client ' + client.ident + ' requested game list' );
		
		client.emit( 'list', client.lobby.getClientGameList() );
	});
	
	// Client wants to add a game
	this.on('addgame', function(data) {
		console.log('/addgame/: ' + 'Client ' + client.ident + ' requested to add game: ' + data.team1 + ' v ' + data.team2 );		
		
		var id = client.lobby.addGame( data.team1, data.team2 );
		
		client.broadcast( 'list', client.lobby.getClientGameList() );
	});
	
	// Client wants to join a game
	this.on('join', function(data) {
		var msg = '/join/: ' + 'Client ' + client.ident + ' attempted to join game ' + data + '..';

		client.game = null;

		// Try and find the game the client wants
		for (g in client.lobby.games) {
			if (client.lobby.games[g].id == data) {
				client.game = client.lobby.games[g];
				break;
			} 
		}
		
		if (client.game == null) {
			console.log(msg + 'failed (No game matched id)');
			client.emit('joinstatus', { succeed: false, gameId: data, reason: 'No game matched id' });
			return;
		}

		console.log(msg + 'succeeded');
		client.emit('joinstatus', { succeed: true, gameId: data, reason: '' });

		var player = new Man(new Vec2(0, 0), clientnum % 2 ? 'left' : 'right');

		player.runSpeed = 8;

		client.player = player;
		client.playerid = player.id;
		client.player.clientid = client.ident;

		var p = client.game.players;

		client.game.players.push(player);
		
		client.game.gamefield.newPlayerPosition(player);

		client.emit('debugMode', false);
		client.emit('playerid', client.playerid);
		client.emit('clientid', client.ident);
		client.emit('currentRoom', client.game.gamefield.room);	

		for (z in client.game.gamefield.zones) {
			client.emit('zone', client.game.gamefield.zones[z]);
		}
		
		client.emit('team', client.game.team1);
		client.emit('team', client.game.team2);

		client.emit('ready', null);
	});
		
	// Client wants to leave a game
	this.on('leave', function(data) {
		if (client.game == null) {
			console.log('/leave/: ' + ' Client ' + client.ident + ' is not in any game');
			return;
		}		
		
		var msg = '/leave/: ' + 'Client ' + client.ident + ' attempted to leave game ' + client.game.id + '..';

		if ( true ) {
			console.log(msg + 'succeeded');
			client.game.removePlayer(client.player);
	
			client.latency = 0;
			client.msecsSinceLastPing = 0;
			client.game = null;
	
			client.broadcast('kill', client.playerid);
		} else {
			console.log(msg + 'failed');
		}
	});

	// Client is ready to go
	this.on('ready', function(data) {
		console.log('/ready/: ' + 'Client ' + client.ident + ' has joined' );
		
		client.emit('ready', null);
	});

	// Regular mode input takes key presses from the player
	this.on('input', function(data) {
		if (client.player != null) {
			if (ACT.canAccelerate(client.player.action)) {
				client.player.inputDirs(data.left, data.right, data.up, data.down);	
			}

			client.player.inputZ( data.z );
			client.player.inputX( data.x );
			client.player.inputC( data.c );
			client.player.inputV( data.v );
		}
	});
	
	// Debug mode input takes all keys from the player
	this.on('debuginput', function(data) {
		if (client.player != null) {
			if (ACT.canAccelerate(client.player.action)) {
				client.player.inputDirs(data[KEY.LEFT], data[KEY.RIGHT], data[KEY.UP], data[KEY.DOWN]);	
			}

			client.player.inputZ( data[KEY.Z] );
			client.player.inputX( data[KEY.X] );
			client.player.inputC( data[KEY.C] );
			client.player.inputV( data[KEY.V] );
		}
		
		if (data[KEY.E] == KEYSTATE.HIT) {
			if ( client.game != null ) {
				client.game.stopGame( new Event( '', Event.prototype.TYPE.ENDOFGAME ) );	
			}
		}
	});	

	// Client responds to ping
	this.on('polo', function(data) {
		client.latency = client.msecsSinceLastPing;
		if (client.player != null) client.player.latency = client.latency;
		client.latency = 0;
		client.msecsSinceLastPing = 0;
	});
}

AOFClient.prototype = new SocketIOClient();
AOFClient.prototype.constructor = AOFClient;

AOFClient.prototype.setLobby = function( lobby ) {
	this.lobby = lobby;
	console.log( lobby );
}

module.exports = AOFClient;
