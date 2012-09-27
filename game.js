var team = require('./team.js');
var discrete = require('./discrete.js');
var objects = require('./object.js');
var event = require('./event.js');
var field = require('./field.js');

var state = {
	READY: 0,
	INPROGRESS: 1,
	COMPLETED: 2,
}

var gameid = Math.floor(Math.random() * 1000);

var game = function(team1, team2, players) {
	this.id = (gameid += Math.floor(Math.random() * 40));
	this.state = state.READY;
	this.team1 = team1;
	this.team2 = team2;
	this.players = players;
	this.gamefield = new field();
	this.packetQueue = [];

	this.addPacket = function(packetName, packetData) {
		packetQueue.push( { name: packetName, data: packetData } ); 
	}

	this.sendPackets = function(client) {
		for (p in packetQueue) {
			client.emit(packetQueue[p].name, packetQueue[p].data);
		}
	}	
	
	this.clearPacketQueue = function() {
		packetQueue = [];
	}

	var fieldL = objects.dims.sidelineWidth;
	var fieldW = objects.dims.fieldLength;
	var fieldT = objects.dims.sidelineWidth;
	var fieldH = objects.dims.fieldWidth;

	var hPlayers = 4;
	var vPlayers = 2;

	for (r = 0; r < vPlayers; r++) {
		for (c = 0; c < hPlayers; c++) {
			var player = new objects.gameObject(new vec2(fieldL + (c + 1) * fieldW / (hPlayers + 2), fieldT + (r + 1) * fieldH / (vPlayers + 2)), new vec2(0, 0), objects.type.player, (c < hPlayers / 2) ? 'left' : 'right' );
			player.enableAuto();
			player.setAnchor(player.pos, objects.dims.fieldWidth / 4);

			this.players.push(player);
		}	
	}
	
	this.data = {	
		leftScore: 0,
		rightScore: 0,
		time: 0, 
	};

	team1.log();
	team2.log();

	this.ballHolder = null;
	this.ball = new objects.gameObject(new vec2(objects.dims.fieldLength / 2 - objects.type.ball.width / 2, objects.dims.fieldWidth / 2 - objects.type.ball.height / 2), new vec2(0, 0), objects.type.ball);

	this.react = function(e) {
		switch (e.type) {
		case event.type.GOAL:
			if (this.ballHolder != null) this.ballHolder.hasBall = false;
			this.ballHolder = null;
			console.log(e.side + ' scored');
			if (e.side == 'left') this.data.leftScore++;
			else if (e.side == 'right') this.data.rightScore++;
			break;
		case event.type.GOALKICK:
			if (this.ballHolder != null) this.ballHolder.hasBall = false;
			this.ballHolder = null;
			break;
		case event.type.THROWIN:
			if (this.ballHolder != null) this.ballHolder.hasBall = false;
			this.ballHolder = null;
			break;
		default:
			console.log("Field gave unknown event type");
		}
	}

	this.updateTime = function() {
		this.data.time++;
	}	

	this.updatePlayers = function() {
		var pf = 1.0;

		for (p in this.players) {
			var player = this.players[p];

			// AI player control
			if (player.isAuto) {
				var goalPos;
				var distToBall = (this.ball.pos.minus(player.pos)).length();
				var anchorPos = player.anchor.plus(this.ball.pos.minus(player.anchor).scale(0.20));

				switch (player.side) {
					case 'left': goalPos = this.gamefield.rightGoal.center; break;
					case 'right': goalPos = this.gamefield.leftGoal.center; break;
				}

				if (player.hasBall) {
					if ((this.ball.pos.minus(anchorPos)).length() < player.radius) {

					} else {
						player.attemptAction(objects.ACT.KICK);
					}	
				} else {
					if (!(this.ballHolder != null && this.ballHolder.side == player.side)) {
						if (distToBall < 50) {
							if (!(this.ballHolder != null && this.ballHolder.side == player.side)) player.attemptAction(objects.ACT.SLIDE);
						} else {

						}
					}
				}

				if (player.hasBall) {
					if ((this.ball.pos.minus(anchorPos)).length() < player.radius) {
						player.lookAt(goalPos);
						player.goToward(goalPos);
					} else {
						player.lookAt(goalPos);  
					}	
				} else {
						if (!(this.ballHolder != null && this.ballHolder.side == player.side) && (this.ball.pos.minus(anchorPos)).length() < player.radius) {
							player.lookAt(this.ball.pos);
							player.goToward(this.ball.pos);
						} else {
							player.lookAt(anchorPos);
							player.goToward(anchorPos);
						}					
				}				
			}

			// Player physics
			var friction = new vec2(0, 0);
			friction.set( player.vel );
			friction.normalize();
			friction.scale(-pf);
	
			var speed = player.vel.length();

			if (speed > pf && !player.strafing) player.updateAngle();

			if (speed < pf && player.action == objects.ACT.SLIDE) player.action = objects.ACT.STAND;

			if (speed > pf) player.vel.add( friction );
			else player.vel.zero();

			player.pos.add( player.vel );
			player.speed = player.vel.length();	

			player.update();
		}
	}

	this.removePlayer = function(player) {
		for (var p = this.players.length - 1; p >= 0; p--) {
			if (this.players[p].id == player.id) this.players.splice(p, 1);
		}

		if (this.ballHolder == player) this.ballHolder = null;
	}

	this.updateBall = function() {
		var bf = 0.6;

		var friction = new vec2(0, 0);
		friction.set(this.ball.vel);
		friction.normalize();
		friction.scale(-bf);
		
		if (this.ball.z == 0) this.ball.vel.add(friction);
	
		this.ball.pos.add(this.ball.vel);
		this.ball.speed = this.ball.vel.length();	
		if (this.ball.speed > bf) this.ball.angle = Math.atan2(this.ball.vel.y, this.ball.vel.x)
	
		this.ball.update();
	}

	this.updateBallHolder = function() {
		if (this.ballHolder != null) {
			if (this.ballHolder.action == objects.ACT.KICK) {
				this.ballHolder.action = objects.ACT.STAND;
				this.ballHolder.hasBall = false;
				this.ball.vel.set(this.ballHolder.facedir.times(25));
				//this.ball.velZ = 0;
				this.ballHolder = null;
			} else if (this.ballHolder.action == objects.ACT.PUNT) {
				this.ballHolder.action = objects.ACT.STAND;
				this.ballHolder.hasBall = false;
				this.ball.vel.set(this.ballHolder.facedir.times(10));
				//this.ball.velZ = -1;
				this.ballHolder = null;
			}
		}

		for (p in this.players) {
			var player = this.players[p];

			if (player.action == objects.ACT.SLIDE && player.overlaps(this.ball)) {
				if (this.ballHolder != null) this.ballHolder.hasBall = false;
				this.ballHolder = player;
				player.hasBall = true;
			}
		}

		if (this.ballHolder != null) {
			this.ball.pos.x = this.ballHolder.center.x + this.ballHolder.facedir.x * 30 - this.ball.width / 2;
			this.ball.pos.y = this.ballHolder.center.y + this.ballHolder.facedir.y * 30 - this.ball.height / 2;
		} else {
			for (p in players) {
				var player = this.players[p];
				if (this.ball.z == 0 && player.overlaps(this.ball) && (player.facedir.dot(this.ball.facedir) < 0.5 || player.speed > this.ball.speed)) {
					this.ballHolder = player;
					player.hasBall = true;
				}
			}
		}
	}
	this.getClientData = function() {
		return {id: this.id, team1Name: this.team1.name, team2Name: this.team2.name};
	}
};

module.exports.game = game;
module.exports.state = state;
