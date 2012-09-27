var http = require('http');
	io   = require('socket.io');
	fs   = require('fs');
	util = require('util');
	path = require('path');

var vec2 = require('./vec2.js');

var objects = require('./object.js');
var dungeon = require('./dungeon.js');
var discrete = require('./discrete.js');
var team = require('./team.js');
var key = require('./keyboard.js');
var field = require('./field.js');
var event = require('./event.js');
var game = require('./game.js');
var lobby = require('./lobby.js');

var clients = [];

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

var MAX_PING = 10000;

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
		
		client.game = null;

		for (g in menu.games) {
			if (menu.games[g].id == data) {
				client.game = menu.games[g];
				break;
			} 
		}
		
		if (client.game == null) {
			client.emit('joinstatus', { succeed: false, gameId: data, reason: 'No game matched id' });
			return;
		}

		client.emit('joinstatus', { succeed: true, gameId: data, reason: '' });

		var player = new objects.gameObject(new vec2(0, 0), new vec2(0, 0), objects.type.player, clientnum % 2 ? 'left' : 'right');

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
		if (client.game == null) {
			console.log('Client ' + client.ident + ' attempted to nonexistent game');
			return;
		}

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

		if (data.z == key.state.hit) {
			if (client.player.hasBall) {
				client.player.attemptAction(objects.ACT.KICK);
			} else {
				client.player.attemptAction(objects.ACT.SLIDE);
			}
		}

		client.player.strafing = false;
		if (data.x) {
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
	for (g in menu.games) {
		var ga = menu.games[g];	

		if (ga != null) {
			ga.updatePlayers();

			ga.updateBall();

			/* See if the ball has caused any events on the field */
			if (e = ga.gamefield.interact(ga.ball)) {
				ga.react(e);

				switch (e.type) {
				case event.type.GOAL:
					//sio.sockets.send('Goal! ' + ga.team1.name + ' ' + ga.data.leftScore + ', ' + ga.team2.name + ' ' + ga.data.rightScore);
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
	for (c in clients) {
		client = clients[c];

		if (client.game != null) {

			for (p in client.game.players) {
				client.emit('player', client.game.players[p]);
			}
			client.emit('gameData', client.game.data);
			client.emit('ball', client.game.ball);
		}

		// Timeout
		if (client.ping == 0) {
			client.emit('marco', null);
		}

		if (client.game != null) client.ping++;
	}

	for (c in clients) {
		client = clients[c];
	
		if (client.ping > MAX_PING) {
		
			if (client.game != null && client.player != null) {
				client.game.removePlayer(client.player);

				client.broadcast.emit('kill', client.playerid);
			}

			clients.splice(c, 1);
		}		
	}
}
	
var updateTimes = function() {
	for (g in menu.games) {
		menu.games[g].updateTime();
	}
}

var updateTimeInterval = setInterval(updateTimes, 1000);

var updateInterval = setInterval(update, 40);
