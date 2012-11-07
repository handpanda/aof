var http = require('http');
	io   = require('socket.io');
	fs   = require('fs');
	util = require('util');
	path = require('path');

var Vec2 = require('./Vec2.js');

var objects = require('./object.js');
var discrete = require('./discrete.js');
var team = require('./team.js');
var field = require('./field.js');
var event = require('./event.js');
var game = require('./game.js');
var lobby = require('./lobby.js');

var KEYSTATE = {
	UP : 0,
	HIT : 1,
	HELD : 2,
};

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

var menu = new lobby.lobby();

menu.addRandomGame();
menu.addRandomGame();
//menu.addRandomGame();
//menu.addRandomGame();
console.log(menu.games.length);

var MAX_LATENCY = 10000;

sio.sockets.on('connection', function(client) {

	var username;

	clients.push(client);

	client.send('Welcome!\n');

	clientnum++;
	client.ident = clientnum;
	client.ping = 0;
	client.lastping = 0;

	client.game = null;
	client.player = null;
	client.waiting = false;
	
	console.log('Client joined from ' + client.handshake.address.address + ":" + client.handshake.address.port + " (" + client.ident + ")");

	client.on('list', function(data) {
		for (g in menu.games) {
			client.emit('listentry', menu.games[g].getClientData());
		} 
	});

	client.on('addgame', function(data) {
		console.log('Add Game: ' + data.team1 + ' v ' + data.team2);
		menu.addGame(data.team1, data.team2);
	});

	client.on('join', function(data) {
		var msg = 'Client ' + client.ident + ' attempted to join game ' + data + '...';

		client.game = null;

		for (g in menu.games) {
			if (menu.games[g].id == data) {
				client.game = menu.games[g];
				break;
			} 
		}
		
		if (client.game == null) {
			console.log(msg + 'failed');
			client.emit('joinstatus', { succeed: false, gameId: data, reason: 'No game matched id' });
			return;
		}

		console.log(msg + 'succeeded');
		client.emit('joinstatus', { succeed: true, gameId: data, reason: '' });

		var player = new objects.gameObject(new Vec2(0, 0), new Vec2(0, 0), objects.type.player, clientnum % 2 ? 'left' : 'right');

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
		var msg = 'Client ' + client.ident + ' attempted to leave game ' + data + '...';
				
		if (client.game == null) {
			console.log(msg + 'no such game');
			return;
		}

		console.log(msg + 'succeeded');
		client.game.removePlayer(client.player);

		client.ping = 0;
		client.game = null;

		client.broadcast.emit('kill', client.playerid);
	});

	client.on('message', function(data) {
		console.log(data);

		if (!username) {
			username = data;
			client.send('message', 'Your name is ' + username + '\n');
			return;
		}	
	
		client.emit('message', username + ': ' + data);		
		client.broadcast.emit('message', username + ': ' + data);
	});

	client.on('ready', function(data) {
		client.emit('ready', null);
	});

	client.on('input', function(data) {
		if (client.player != null) {
			var doUpdate = false;		

			if (objects.ACT.canAccelerate(client.player.action)) {
				client.player.vel.zero();

				var playerSpeed = client.player.topSpeed * 1.25;
				if (client.player.strafing) playerSpeed *= 0.75;
			
				if (data.left) {
					client.player.vel.x -= playerSpeed;
					doUpdate = true;
				}

				if (data.up) {
					client.player.vel.y -= playerSpeed;
					doUpdate = true;
				}

				if (data.right) {
					client.player.vel.x += playerSpeed;
					doUpdate = true;
				}

				if (data.down) {
					client.player.vel.y += playerSpeed;
					doUpdate = true;
				}
				var speed = client.player.vel.length();
	
				if (speed > playerSpeed) client.player.vel.scale(playerSpeed / speed);
			}

			var speed = client.player.vel.length()

			if (data.z == KEYSTATE.HIT) {
				if (client.player.hasBall) {
					client.player.attemptAction(objects.ACT.KICK);
				} else {
					client.player.attemptAction(objects.ACT.SLIDE);
				}
			}

			if (data.x == KEYSTATE.HIT) {
				if (client.player.hasBall) {
					client.player.attemptAction(objects.ACT.PUNT);
				} else { 
					
				}
			}

			client.player.strafing = false;
			if (data.c) {
				client.player.strafing = true;
			}

			if (doUpdate) {
				if (!client.player.strafing) client.player.updateAngle();

				client.player.update();
			}
		}
	});

	client.on('polo', function(data) {
		client.lastping = client.ping;
		if (client.player != null) client.player.ping = client.ping;
		client.ping = 0;
	});

});

function update() {

//////////////////
// Update Games //
//////////////////

	for (g in menu.games) {
		var ga = menu.games[g];	

		if (ga != null) {
			ga.updatePacketQueue();

			ga.update();

			// See if the ball has caused any events on the field
			if (e = ga.gamefield.interact(ga.ball)) {
				ga.react(e);

				switch (e.type) {
				case event.type.GOAL:

					break;
				case event.type.GOALKICK:
				case event.type.THROWIN:
				case event.type.CORNERKICK:

					break;
				default:
					console.log('Field gave unknown event type');
				}
			}

			ga.updateBallHolder();	
		}
	}

///////////////////////////////
// Send Game Data to Clients //
///////////////////////////////

	for (c in clients) {
		client = clients[c];

		// If the client recently pinged back
		if (client.ping == 0) {

			// Send game data 
			if (client.game != null) {

				for (p in client.game.players) {
					client.emit('player', client.game.players[p]);
				}

				client.emit('gameData', client.game.data);
				client.emit('ball', client.game.ball);
				client.game.sendPackets( client );
			}

			// Ping the client again
			client.emit('marco', null);
		}

		// If the client is in a game, calculate their latency (resets to 0 when the player pings back)
		if (client.game != null) client.ping++;
	}


///////////////////////////////
// Drop Unresponsive Clients //
///////////////////////////////

	for (c in clients) {
		client = clients[c];
	
		// If the client's latency is too high, drop them from the server
		if (client.ping > MAX_LATENCY) {
		
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
	
// Update the official time of each game once per second
var updateTimes = function() {
	for (g in menu.games) {
		menu.games[g].updateTime();
	}
}
var updateTimeInterval = setInterval(updateTimes, 1000);

var updateInterval = setInterval(update, 40);
