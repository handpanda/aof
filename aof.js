var http = require('http');
	io   = require('socket.io');
	fs   = require('fs');
	util = require('util');
	path = require('path');

// Command line options and defaults	
var argv = require('optimist').argv;
			
var hPlayers = 4,
	vPlayers = 2,
	inDebugMode = false,
	isLocal = false;

if ( argv.h ) hPlayers = argv.h;
if ( argv.v ) vPlayers = argv.v;
if ( argv.debug ) inDebugMode = true;
if ( argv.local ) isLocal = true;

var Vec2 = require('./Vec2.js');
var Entity = require('./Entity.js');
var discrete = require('./discrete.js');
var team = require('./Team.js');
var field = require('./Field.js');
var Event = require('./Event.js');
var Lobby = require('./Lobby.js');
var Game = require('./Game.js');
var Man = require('./Man.js');
var ACT = require('./Act.js');
var KEY = require('./keyboard.js');

var KEYSTATE = {
	UP : 0,
	HIT : 1,
	HELD : 2,
};

var MAX_LATENCY = 50; // milliseconds

var clients = [];

/*
	Server Class
*/
var server = http.createServer(function(request, response) {
	var contentType = 'text/html';
	var filePath = '.' + request.url;
	var extname = path.extname(filePath);

	switch (extname) {
		case 'js':
			contentType = 'text/javascript';
			break;
	}

	response.writeHead(200, {
		'Content-Type': contentType
	});

	var rs = fs.createReadStream(filePath);
	util.pump(rs, response);
}).listen(4000);

var sio = io.listen(server, {log: 'false'});

sio.set('log level', 1);
	
var clientnum = 0;

var lobby = new Lobby();

lobby.setDefaultPlayerCount( hPlayers, vPlayers );

sio.sockets.on('connection', function(client) {

	var username;

	clients.push(client);

	clientnum++;
	client.ident = clientnum;
	client.msecsSinceLastPing = 0;
	client.latency = 0;

	client.game = null;
	client.player = null;
	client.waiting = false;
	
	console.log('Client joined from ' + client.handshake.address.address + ":" + client.handshake.address.port + " (" + client.ident + ")");

	client.on('list', function(data) {
		console.log('/list/: ' + 'Client ' + client.ident + ' requested game list' );
		
		var gameList = [];
		
		for (g in lobby.games) {
			gameList.push( lobby.games[g].getClientData() );
		} 
		
		client.emit( 'list', gameList );
	});

	client.on('addgame', function(data) {
		console.log('/addgame/: ' + 'Client ' + client.ident + ' requested to add game: ' + data.team1 + ' v ' + data.team2 );		
		
		var id = lobby.addGame( data.team1, data.team2 );
	});

	client.on('join', function(data) {
		var msg = '/join/: ' + 'Client ' + client.ident + ' attempted to join game ' + data + '..';

		client.game = null;

		for (g in lobby.games) {
			if (lobby.games[g].id == data) {
				client.game = lobby.games[g];
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

		//player.id = clientnum;

		client.player = player;
		client.playerid = player.id;
		client.player.clientid = client.ident;

		var p = client.game.players;

		client.game.players.push(player);

		client.send('You are player ' + client.ident);

		client.game.gamefield.newPlayerPosition(player);

		switch (player.side) {
			case 'left':
				client.send('You are on the ' + client.game.team1.name + ' (' + player.side + ' side)');
				break;	
			case 'right':
				client.send('You are on the ' + client.game.team2.name + ' (' + player.side + ' side)');
				break;
		}

		client.emit('debugMode', inDebugMode);
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

	client.on('leave', function(data) {
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
	
			client.broadcast.emit('kill', client.playerid);
		} else {
			console.log(msg + 'failed');
		}
	});

	client.on('message', function(data) {
		console.log('/message/: ' + data);

		if (!username) {
			username = data;
			client.send('message', 'Your name is ' + username + '\n');
			return;
		}	
	
		client.emit('message', username + ': ' + data);		
		client.broadcast.emit('message', username + ': ' + data);
	});

	client.on('ready', function(data) {
		console.log('/ready/: ' + 'Client ' + client.ident + ' has joined' );
		
		client.emit('ready', null);
	});

	client.on('input', function(data) {
		if (client.player != null) {
			if (ACT.canAccelerate(client.player.action)) {
				client.player.calcSpeed();
				
				client.player.inputDirs(data.left, data.right, data.up, data.down);	
			}

			client.player.inputZ( data.z == KEYSTATE.HIT );
			client.player.inputX( data.x == KEYSTATE.HIT );
			client.player.inputC( data.c == KEYSTATE.HELD );
		}
	});
	
	client.on('debuginput', function(data) {
		if (client.player != null) {
			if (ACT.canAccelerate(client.player.action)) {
				client.player.calcSpeed();
				
				client.player.inputDirs(data[KEY.LEFT], data[KEY.RIGHT], data[KEY.UP], data[KEY.DOWN]);	
			}

			client.player.inputZ( data[KEY.Z] == KEYSTATE.HIT );
			client.player.inputX( data[KEY.X] == KEYSTATE.HIT );
			client.player.inputC( data[KEY.C] == KEYSTATE.HELD );
		}
		
		if (data[KEY.E] == KEYSTATE.HIT) {
			if ( client.game != null ) {
				client.game.stopGame( new Event( '', Event.prototype.TYPE.ENDOFGAME ) );	
			}
		}
	});	

	client.on('polo', function(data) {
		client.latency = client.msecsSinceLastPing;
		if (client.player != null) client.player.latency = client.latency;
		client.latency = 0;
		client.msecsSinceLastPing = 0;
	});

});

function update() {

	// Add new games
	if ( lobby.games.length == 0 ) {
		lobby.addRandomGame();
		
	}

	// Update games in progress
	for (g in lobby.games) {
		var ga = lobby.games[g];	

		if (ga != null) {
			ga.updatePacketQueue();

			ga.update();

			// See if the ball has caused any events on the field
			if (e = ga.gamefield.interact(ga.ball)) {
				ga.react(e);

				switch (e.type) {
				case Event.prototype.TYPE.GOAL:

					break;
				case Event.prototype.TYPE.GOALKICK:
				case Event.prototype.TYPE.THROWIN:
				case Event.prototype.TYPE.CORNERKICK:

					break;
				default:
					console.log('Field gave unknown event type');
				}
			}

			ga.updateBallHolder();	
		}
	}

	// Send game data to clients
	for (c in clients) {
		client = clients[c];

		// If the client recently pinged back
		if (client.latency == 0) {

			// Send game data 
			if (client.game != null) {

				for (p in client.game.players) {
					client.emit('player', client.game.players[p]);
				}

				client.emit('gameData', client.game.data);
				client.emit('ball', client.game.ball);
				client.game.sendPackets( client );
			
				if ( client.game.removeThis ) client.game = null;
			}

			// Ping the client again
			client.emit('marco', null);
		}

		// If the client is in a game, calculate their latency (resets to 0 when the player pings back)
		if (client.game != null) client.msecsSinceLastPing += 1;
		if (client.player != null) client.player.msecsSinceLastPing = client.msecsSinceLastPing;
	}

	// Remove completed games
	for (g in lobby.games) {
		if ( lobby.games[g].removeThis ) {
			// Remove game from list
			lobby.games.splice(g, 1);
			// Boot clients
		}
	}

	// Drop unresponsive clients
	for (c in clients) {
		client = clients[c];
	
		// If the client's latency is too high, drop them from the server
		if (client.msecsSinceLastPing > MAX_LATENCY) {
		
			if (client.game != null && client.player != null) {

				// Remove the client's player from whatever game they are in
				client.game.removePlayer(client.player);

				// Order all other clients to kill that player
				client.broadcast.emit('kill', client.playerid);
			}

			// Drop the client
			clients.splice(c, 1);
		}		
	}
}
var updateInterval = setInterval(update, 40);

// Update the official time of each game once per second
var updateTimes = function() {
	for (g in lobby.games) {
		lobby.games[g].updateTime();
	}
}
var updateTimeInterval = setInterval(updateTimes, 1000);
