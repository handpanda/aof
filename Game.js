var team = require('./Team.js');
var discrete = require('./discrete.js');
var dims = require('./dims.js');
var type = require('./type.js');
var Entity = require('./Entity.js');
var event = require('./Event.js');
var Field = require('./Field.js');
var Ball = require('./Ball.js');
var Man = require('./Man.js');
var ACT = require('./Act.js');

// Initial game id
var gameid = Math.floor(Math.random() * 1000);

/*
	Game

	Match between two teams
*/ 

var Game = function(team1, team2, players) {
	this.id = (gameid += Math.floor(Math.random() * 40));
	this.team1 = team1;
	this.team2 = team2;
	this.players = players;
	this.gamefield = new Field();

	// Queue of packets to be sent
	this.packetQueue = [];
	
	// Upper left corner of the field
	var fieldL = dims.sidelineWidth;
	var fieldT = dims.sidelineWidth;

	// Dimensions of the field
	var fieldW = dims.fieldLength;
	var fieldH = dims.fieldWidth;

	// Create AI players for each team
	var hPlayers = 1;
	var vPlayers = 1;

	for (r = 0; r < vPlayers; r++) {
		for (c = 0; c < hPlayers; c++) {
			var player = new Man(new Vec2(fieldL + (c + 1) * fieldW / (hPlayers + 2), fieldT + (r + 1) * fieldH / (vPlayers + 2)), (c < hPlayers / 2) ? 'left' : 'right' );
			player.enableAuto();
			player.setAnchor(player.pos, dims.fieldWidth / 4);

			this.players.push(player);
		}	
	}

	this.stopTimer = 0;
	
	this.data = {	
		leftScore: 0,
		rightScore: 0,
		time: 0, 
		stopped: false,
		event: null,
	};

	// Pointer to the player currently holding the ball
	this.ballHolder = null;

	// The ball
	this.ball = new Ball(new Vec2(dims.fieldLength / 2 - type.ball.width / 2, dims.fieldWidth / 2 - type.ball.height / 2));

}

/*
	Game state
		READY - Has not yet started
		INPROGRESS - Game is being played, can be joined
		COMPLETED - Game has finished
*/

Game.prototype.STATE = {
	READY: 0,
	INPROGRESS: 1,
	COMPLETED: 2,	
}

// Update and clear the packet queue
Game.prototype.updatePacketQueue = function() {
	for (p in this.packetQueue) {
		this.packetQueue[p].delay--;
		if ( this.packetQueue[p].delay < 0 ) this.packetQueue.splice( p, 1 );
	}
}

// Add a packet to the packet queue
Game.prototype.addPacket = function(packetName, packetData, timeDelay) {
	this.packetQueue.push( { name: packetName, data: packetData, delay: timeDelay} ); 
}

// Send the entire packet queue to a client
Game.prototype.sendPackets = function(client) {
	for ( p in this.packetQueue ) {
		if ( this.packetQueue[p].delay == 0 ) client.emit( this.packetQueue[p].name, this.packetQueue[p].data );
	}
}

Game.prototype.stopGame = function(e) {
	this.data.stopped = true;
	this.data.event = e;
	this.stopTimer = 60;
}	

Game.prototype.startGame = function() {
	this.data.stopped = false;
	this.data.event = null;
	this.stopTimer = 0;
}

/*
	React to some game event
*/
Game.prototype.react = function(e) {
	switch (e.type) {
	case event.type.GOAL:
		if (this.ballHolder != null) this.ballHolder.hasBall = false;
		this.ballHolder = null;
		if (e.side == 'left') this.data.leftScore++;
		else if (e.side == 'right') this.data.rightScore++;
		this.stopGame( e.type );
		break;
	case event.type.GOALKICK:
		if (this.ballHolder != null) this.ballHolder.hasBall = false;
		this.ballHolder = null;
		this.stopGame( e.type );
		break;
	case event.type.THROWIN:
		if (this.ballHolder != null) this.ballHolder.hasBall = false;
		this.ballHolder = null;
		break;
	default:
		console.log("Field gave unknown event type");
	}
}

/* 
	Update the official game clock
*/
Game.prototype.updateTime = function() {
	this.data.time++;
}	

/* 
	update game state
*/
Game.prototype.update = function() {
	if ( this.stopTimer > 0 ) {
		this.stopTimer--;
	}
	if ( this.data.stopped && this.stopTimer <= 0 ) this.startGame();

	this.updatePlayers();
	
	this.updateBall();
}

/* 
	Update each player 
*/
Game.prototype.updatePlayers = function() {
	var pf = 1.0;

	if ( !this.data.stopped ) {
		for (p in this.players) {
			var player = this.players[p];

			// AI player control
			if (player.isAuto) {

				var distToBall = (this.ball.pos.minus(player.pos)).length(); // Distance to ball
				var anchorPos = player.anchor.plus(this.ball.pos.minus(player.anchor).scale(0.20)); // "Home" position

				// Location of the goal
				var goalPos;
				switch (player.side) {
					case 'left': goalPos = this.gamefield.rightGoal.center; break;
					case 'right': goalPos = this.gamefield.leftGoal.center; break;
				}

				// Actions
				if (player.hasBall) {
					if ((this.ball.pos.minus(anchorPos)).length() < player.radius) {

					} else {
						// If the player has the ball and is near the goal, take a shot
						player.attemptAction(ACT.KICK);
					}	
				} else {
					if (!(this.ballHolder != null && this.ballHolder.side == player.side)) {
						if (distToBall < 50) {
							// If the player is near the ball and his side does not control it, slide tackle toward it
							if (!(this.ballHolder != null && this.ballHolder.side == player.side)) player.attemptAction(ACT.SLIDE);
						} else {

						}
					}
				}

				// Movement
				if (player.hasBall) {
					if ((this.ball.pos.minus(anchorPos)).length() < player.radius) {
						// If the player has the ball but is out of range, move toward the goal
						player.lookAt(goalPos);
						player.goToward(goalPos);
					} else {
						// If the player has the ball and is in range, aim at the goal
						player.lookAt(goalPos);  
					}	
				} else {
						if (!(this.ballHolder != null && this.ballHolder.side == player.side) && (this.ball.pos.minus(anchorPos)).length() < player.radius) {
							// If the player does not have the ball and none of his teammates do either and the ball is in range, move toward it
							player.lookAt(this.ball.pos);
							player.goToward(this.ball.pos);
						} else {
							// Otherwise, return to position
							player.lookAt(anchorPos);
							player.goToward(anchorPos);
						}					
				}				
			}

			// Physics

			// Static friction
			var friction = new Vec2(0, 0);
			friction.set( player.vel );
			friction.normalize();
			friction.scale(-pf);

			// Enforce top speed
			var speed = player.vel.length();

			if (speed > pf && !player.strafing) player.updateAngle();

			if (speed < pf && player.action == ACT.SLIDE) player.action = ACT.STAND;

			if (speed > pf) player.vel.add( friction );
			else player.vel.zero();

			player.pos.add( player.vel );
			player.speed = player.vel.length();	

			// Recalculate angles
			player.update();
		}
	}	
}

/*
	Removes a player from the game
*/	
Game.prototype.removePlayer = function(player) {

	// Find player by id
	for (var p = this.players.length - 1; p >= 0; p--) {
		if (this.players[p].id == player.id) this.players.splice(p, 1);
	}

	// Clear the ball holder if that was the player
	if (this.ballHolder == player) this.ballHolder = null;
}

/*
	Move the ball
*/
Game.prototype.updateBall = function() {
	var bf = 0.6;

	// Static friction
	var friction = new Vec2(0, 0);
	friction.set(this.ball.vel);
	friction.normalize();
	friction.scale(-bf);
	
	if (this.ball.z == 0) this.ball.vel.add(friction);

	this.ball.pos.add(this.ball.vel);
	this.ball.speed = this.ball.vel.length();	
	if (this.ball.speed > bf) this.ball.angle = Math.atan2(this.ball.vel.y, this.ball.vel.x)

	this.ball.z += this.ball.velZ;		
	if (this.ball.z >= 0) {
		this.ball.z = 0; 
		this.ball.velZ = 0;
	} else {
		this.ball.velZ += 0.005;
	}

	this.ball.update();
}

/*
	Update the ball and ball holder based on what they are doing
*/

Game.prototype.updateBallHolder = function() {

	if (this.ballHolder != null) {
	
		// Kick the ball
		if (this.ballHolder.action == ACT.KICK) {
			this.ballHolder.action = ACT.STAND;
			this.ballHolder.hasBall = false;
			this.ball.vel.set(this.ballHolder.facedir.times(25));
			//this.ball.velZ = 0;
			this.ballHolder = null;

		// Punt the ball
		} else if (this.ballHolder.action == ACT.PUNT) {
			this.ballHolder.action = ACT.STAND;
			this.ballHolder.hasBall = false;
			this.ball.vel.set(this.ballHolder.facedir.times(20));
			this.ball.velZ = -0.1;
			this.ballHolder = null;
		}
	}

	// Steal the ball with a slide tackle
	for (p in this.players) {
		var player = this.players[p];

		if (player.action == ACT.SLIDE && player.overlaps(this.ball)) {
			if (this.ballHolder != null) this.ballHolder.hasBall = false;
			this.ballHolder = player;
			player.hasBall = true;
		}
	}

	// Pick the ball up
	if (this.ballHolder != null) {
		this.ball.pos.x = this.ballHolder.center.x + this.ballHolder.facedir.x * 30;
		this.ball.pos.y = this.ballHolder.center.y + this.ballHolder.facedir.y * 30;
	} else {
		for (p in this.players) {
			var player = this.players[p];
			if (this.ball.z == 0 && player.overlaps(this.ball) && (player.facedir.dot(this.ball.facedir) < 0.5 || player.speed > this.ball.speed)) {
				this.ballHolder = player;
				player.hasBall = true;
			}
		}
	}
}

Game.prototype.getClientData = function() {
	return {id: this.id, team1Name: this.team1.name, team2Name: this.team2.name};
}

module.exports = Game;
