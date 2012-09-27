var keys = {
	left  : false,
	right : false,
	up    : false,
	down  : false,
	z     : false,
	x     : false,
	c     : false,
}

var regularImage = function(filename) {
		this.image = new Image();
		this.image.src = filename;

		this.draw = function(context, posX, posY, width) {
			context.drawImage(this.image, posX, posY, width, this.image.height * width / this.image.width);
		};
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

var ballHolder = null;
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

var currentRoom = null;

var currentScreen = screen.LIST;

var gamelist = [];
var elementList = [];

var canvas, context;

$(document).ready(function() {
	canvas = document.getElementById("main");
	context = canvas.getContext("2d");

	socket = new io.connect('http://localhost:4000');
	var entry_el = $('#entry');

	socket.on('message', function(data) {
		//var data = message;

		$('#log ul').append('<li>' + data + '</li>');

		window.scrollBy(0, 1000000000000000);
		entry_el.focus();
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
		if (currentRoom == null) currentRoom = new room(new vec2(0, 0), 0, 0);
		currentRoom.grab(data);
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
			players.push(new gameObject(new vec2(0, 0), new vec2(0, 0), type.ball));
			players[players.length - 1].clientid = data.clientid;
			players[players.length - 1].id = data.id;
			players[players.length - 1].grab(data);
		}
	});

	socket.on('kill', function(data) {
		for (p in players) {
			if (players[p].id == data) players.splice(p, 1);
		}
	});

	socket.on('zone', function(data) {
		zones.push(new gameObject(new vec2(0, 0), new vec2(0, 0), type.ball));
		zones[zones.length - 1].grab(data);
		console.log("zone");
	});

	socket.on('team', function(data) {
		switch (data.side) {
			case 'left':
				leftTeam = new team(data.name, data.side);

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
				rightTeam = new team(data.name, data.side);
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
		if (ball == null) ball = new gameObject(new vec2(0, 0), new vec2(0, 0), type.ball);
		ball.grab(data);
	});

	socket.on('gameData', function(data) {
		leftScore = data.leftScore;
		rightScore = data.rightScore;
		time = data.time;
	});	

	socket.on('listentry', function(data) {
		var found = false;
		for (g in gamelist) {
			if (data.id == gamelist[g].id) {
				found = true;
				break;
			}
		}

		if (!found) {
			console.log("Game: " + data);
			gamelist.push(data);
		}		
		refreshMenu();
	});		
/*
	entry_el.keypress(function(event) {
		if (event.keyCode != 13) return;
		var msg = entry_el.attr('value');
		if (msg) {
			socket.send(msg);
			entry_el.attr('value', '');
		}
	});
*/
	socket.emit('ready', null);

	socket.emit('list', null);

	socket.on('ready', function(data) {
		updateInterval = setInterval(update, 20);
	});

	socket.on('marco', function(data) {
		console.log('polo');
		socket.emit('polo', null);
	});

	document.onmousemove = mouseMoveHandler;
	document.onmousedown = mouseDownHandler;
	document.onmouseup = mouseUpHandler;
	document.onkeydown = keyDownHandler;
	document.onkeyup = keyUpHandler;
});	

mousePos = new vec2(0, 0);
mousedown = false;

function mouseMoveHandler(event) {
	if (event.pageX || event.pageY) { 
		mousePos.x = event.pageX;
		mousePos.y = event.pageY;
	} else { // Not all browsers use pageX/Y
		mousePos.x = event.clientX + document.body.scrollLeft; 
		mousePos.y = event.clientY + document.body.scrollTop; 
	} 

	mousePos.x -= canvas.offsetLeft;
	mousePos.y -= canvas.offsetTop;
}

function mouseDownHandler(event) {
	mousedown = true;
}

function mouseUpHandler(event) {
	mousedown = false;
}


function keyDownHandler(event) {
	switch (event.keyCode) {
		case 37:
			if (!keys.left) keys.left = state.hit; 
			break;				
		case 38: 
			if (!keys.up) keys.up = state.hit; 
			break;
		case 39:
			if (!keys.right) keys.right = state.hit;
			break;
		case 40:
			if (!keys.down) keys.down = state.hit;
			break;
		case 88:
			if (!keys.x) keys.x = state.hit;
			break;
		case 90:
			if (!keys.z) keys.z = state.hit;
			break;
	}	
}	

function keyUpHandler(event) {
	switch (event.keyCode) {				
		case 37: 
			keys.left = state.up; 
			break;				
		case 38: 
			keys.up = state.up; 
			break;
		case 39:
			keys.right = state.up;
			break;
		case 40:
			keys.down = state.up;
			break;
		case 88:
			keys.x = state.up;
			break;
		case 90:
			keys.z = state.up;
			break;
	}	
}	

function updateKeys() {
	if (keys.left == state.hit) keys.left = state.held;
	if (keys.up == state.hit) keys.up = state.held;
	if (keys.right == state.hit) keys.right = state.held;
	if (keys.down == state.hit) keys.down = state.held;
	if (keys.z == state.hit) keys.z = state.held;
	if (keys.x == state.hit) keys.x = state.held;
}

function drawDungeon(context) {
	// If room is smaller than screen area, center the view on the room
	// Otherwise, center the view on the player, unless the edge of the room has been reached

	var offset = new vec2(0, 0);

	var target;

	if (clientPlayer != null) target = clientPlayer.pos;
	else target = new vec2(canvas.width / 2, canvas.height / 2);

	if (currentRoom != null) {
		if (currentRoom.width < canvas.width) {
			offset.x = canvas.width / 2 - currentRoom.width / 2;
		} else {
			offset.x = currentRoom.pos.x - target.x + canvas.width / 2;

			if (offset.x > 0) offset.x = 0;
			if (offset.x < -currentRoom.width + canvas.width) offset.x = -currentRoom.width + canvas.width;
		}

		if (currentRoom.height < canvas.height) {
			offset.y = canvas.height / 2 - currentRoom.height / 2;
		} else {
			offset.y = currentRoom.pos.y - target.y + canvas.height / 2;

			if (offset.y > 0) offset.y = 0;
			if (offset.y < -currentRoom.height + canvas.height) offset.y = -currentRoom.height + canvas.height;			
		}

		context.save();
			context.translate(offset.x, offset.y);

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
		context.restore();
	}
}

var menudims = {
	list: { name: 'list', xPos: 0, yPos: 100, width: 500},
	exitbutton: { name: 'exitbutton', xPos: 5, yPos: 5, width: 300},
	score: { name: 'score', xPos: 305, yPos: 5, width: 500},
}

var color1 = 'blue';
var color2 = 'white';
var color3 = 'black';
var color4 = 'green';
var vScroll = 0;
var interButtonSpacing = 6;
var buttonHeight = 24;
var team1Name = '';
var team2Name = '';

var clearChosenEntries = function(name) {
	for (l in elementList) {
		if (elementList[l].name == name) elementList[l].chosen = false;
	}
}

var refreshMenu = function() {
	elementList = [];
	console.log('refresh');
	console.log(gamelist.length);
	switch (currentScreen) {
		case screen.TITLE:
			console.log('title');
			break;
		case screen.LIST:
			console.log('list');
			var y = menudims.list.yPos + vScroll;

			// List of games in progress
			for (g in gamelist) {
				console.log(gamelist[g]);
				elementList.push(new menuElement('button', 'game', gamelist[g].team1Name + ' vs ' + gamelist[g].team2Name, new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, 
							{ id: gamelist[g].id },
							function() {
								attemptToJoinGame( this.data.id );
							})
						);
				y += buttonHeight + interButtonSpacing;
			}

			// Button to make a new game
			elementList.push(new menuElement('button', 'new game', 'New Game', new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight,
						{ },
						function() {
							switchScreen(screen.NEWGAME);
						})
					);
			break;
		case screen.NEWGAME:
			console.log('new game');
			var y = menudims.list.yPos + vScroll;
			
			elementList.push(new menuElement('textbox', 'team1', 'Team 1:', new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, { }, null));
			y += buttonHeight + interButtonSpacing;	

			for (n in names) {
				console.log(names[n]);
				elementList.push(new menuElement('button', 'team1', names[n], new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight,
							{ },
							function() {
								team1Name = this.title;
								clearChosenEntries('team1');
								this.chosen = true;
							})
						);
				y += buttonHeight + interButtonSpacing;	
			}

			y += buttonHeight + interButtonSpacing;	

			elementList.push(new menuElement('textbox', 'team2', 'Team 2:', new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, { }, null));
			y += buttonHeight + interButtonSpacing;				

			for (n in names) {
				console.log(names[n]);
				elementList.push(new menuElement('button', 'team2', names[n], new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, 
							{ },
							function() {
								team2Name = this.title;
								clearChosenEntries('team2');
								this.chosen = true;
							})
						);
				y += buttonHeight + interButtonSpacing;	
			}

			y += buttonHeight + interButtonSpacing;	

			elementList.push(new menuElement('button', 'start', 'Start!', new vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight,
						{ },
						function() {
							attemptToAddGame(team1Name, team2Name);	
						})
					);
			y += buttonHeight + interButtonSpacing;		

			break;	
		case screen.GAME:
			console.log('game');
			elementList.push(new menuElement('button', 'exit', 'Back to Lobby', new vec2(menudims.exitbutton.xPos, menudims.exitbutton.yPos),
						menudims.exitbutton.width, 24, 
						{ },
						function() {
							leaveGame();
						})
					); 
			break;
	}
}

var updateMenu = function() {
	for (l in elementList) {
		var elem = elementList[l];

		var hovered = false;
		var selected = false;

		if (mousePos.x >= elem.pos.x && mousePos.x <= elem.pos.x + elem.width &&
			mousePos.y >= elem.pos.y && mousePos.y <= elem.pos.y + elem.height) {
			hovered = true;
			if (mousedown) {
				selected = true;
			}
		}

		switch (elem.type) {
			case 'button':
				if (selected == true && elem.selected == false) elem.doAction();
				break;
			case 'textbox':

				break;
		}
		
		elem.hovered = hovered;
		elem.selected = selected;
	}
}

var switchScreen = function(toScreen) {
	if (toScreen == screen.LIST) socket.emit('list', null);

	currentScreen = toScreen;

	refreshMenu();
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

	switchScreen(screen.LIST);
}	

var menuElement = function(type, name, title, pos, width, height, data, action) {
	this.type = type;
	this.name = name;
	this.title = title;
	this.pos = pos;
	this.width = width;
	this.height = height;
	this.data = data;
	this.action = action;

	this.hovered = false;
	this.selected = false;
	this.chosen = false;

	this.draw = function(context) {
		switch (this.type) {
			case 'button':
				if (this.chosen) context.fillStyle = color2;
				else if (this.selected) context.fillStyle = color2;
				else context.fillStyle = color1;

				context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		
				context.textAlign = 'center';
				context.font = '24pt bold';
				if (this.chosen) context.fillStyle = color4;
				else if (this.selected) context.fillStyle = color1;
				else if (this.hovered) context.fillStyle = color3;
				else context.fillStyle = color2;
	
				context.fillText(this.title, pos.x + this.width / 2, pos.y + this.height);
				break;
			case 'textbox':
				context.fillStyle = color3;

				context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		
				context.textAlign = 'center';
				context.font = '24pt bold';
				context.fillStyle = color2;
	
				context.fillText(this.title, pos.x + this.width / 2, pos.y + this.height);
				break;
		}
	}

	this.doAction = function() {
		if (this.action != null) this.action();
	}
}

var updateInterval;
function update() {

	updateMenu();

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();

	switch (currentScreen) {
	case screen.TITLE:
		
		break;
	case screen.LIST:
		context.font = "24px bold";
		
		context.textAlign = 'left';
		context.fillStyle = 'blue';
		context.fillText("List of currently active games", 0, 50);		
		
		for (l in elementList) {
			elementList[l].draw(context);
		}
		break;
	case screen.NEWGAME:
		context.font = "24px bold";
		
		context.textAlign = 'left';
		context.fillStyle = 'blue';
		context.fillText("List of currently active games", 0, 50);		
		
		for (l in elementList) {
			elementList[l].draw(context);
		}

		break;
	case screen.HOWTO:

		break;
	case screen.GAME:
		socket.emit('input', keys);
		updateKeys();

		for (p in players) {
			if (players[p].id == playerid && playerid > 0) clientPlayer = players[p];
		}

		drawDungeon(context);

		for (l in elementList) {
			elementList[l].draw(context);
		}
		context.fillStyle = color1;

		context.fillRect(355, 5, 440, 24);
		
		context.textAlign = 'center';
		context.font = '24pt bold';
		context.fillStyle = color2;
	
		context.fillText(leftTeam.name + ' ' + leftScore + ' ' +
					text.pad0(Math.floor(time / 60).toString(), 2) + ":" + text.pad0((time % 60).toString(), 2) + ' ' + 
				 rightTeam.name + ' ' + rightScore, 355 + 440 / 2, 5 + 24);
	

		context.fillStyle = 'red';
		context.fillText('Player Count: ' + players.length, 0, 100);
		break;
	case screen.RESULT:

		break;
	}

	context.fillStyle = 'white';
	context.fillRect(mousePos.x, mousePos.y, 20, 20);
}

