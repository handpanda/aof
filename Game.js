var team = require('./Team.js');
var discrete = require('./discrete.js');
var dims = require('./dims.js');
var type = require('./type.js');
var Entity = require('./Entity.js');
var Event = require('./Event.js');
var Field = require('./Field.js');
var Ball = require('./Ball.js');
var Man = require('./Man.js');
var ACT = require('./Act.js');
var CALL = require('./Call.js');

// Initial game id
var gameid = Math.floor(Math.random() * 1000);

// Length of game (Five minutes)
var GAME_LENGTH_SECS = 300;

/*
	Game

	Match between two teams
*/ 

var Game = function(team1, team2) {
	this.id = (gameid += Math.floor(Math.random() * 40));
	this.team1 = team1;
	this.team2 = team2;
	this.players = [];
	this.gamefield = new Field();

	// Queue of packets to be sent
	this.packetQueue = [];

	this.stopTimer = 0;
	
	this.state = Game.prototype.STATE.INPROGRESS;
	
	// "Kill me" flag
	this.removeThis = false;
	
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
	this.ball = new Ball(new Vec2(dims.fieldLength / 2 - type.ball.width / 2, dims.fieldWidth / 2 - type.ball.height / 2), 'none');
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

Game.prototype.addAIPlayers = function( hPlayers, vPlayers ) {
	// Upper left corner of the field
	var fieldL = dims.sidelineWidth;
	var fieldT = dims.sidelineWidth;

	// Dimensions of the field
	var fieldW = dims.fieldLength;
	var fieldH = dims.fieldWidth;

	// Create AI players for each team
	for (r = 0; r < vPlayers; r++) {
		for (c = 0; c < hPlayers; c++) {
			var player = new Man(new Vec2(fieldL + (c + 1) * fieldW / (hPlayers + 2), fieldT + (r + 1) * fieldH / (vPlayers + 2)), (c < hPlayers / 2) ? 'left' : 'right' );
			player.enableAuto();
			player.setAnchor(player.pos, dims.fieldWidth / 3);

			this.players.push(player);
		}	
	}	
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
	this.complete(this.data.event);
	this.data.event = null;
	this.stopTimer = 0;
}

/*
	React to some game event
*/
Game.prototype.react = function(e) {
	switch (e.type) {
	case Event.prototype.TYPE.GOAL:
		if (this.ballHolder != null) this.ballHolder.hasBall = false;
		this.ballHolder = null;
		if (e.side == 'left') this.data.leftScore++;
		else if (e.side == 'right') this.data.rightScore++;
		this.stopGame( e );
		break;
	case Event.prototype.TYPE.GOALKICK:
		if (this.ballHolder != null) this.ballHolder.hasBall = false;
		this.ballHolder = null;
		this.stopGame( e );
		break;
	case Event.prototype.TYPE.THROWIN:
		if (this.ballHolder != null) this.ballHolder.hasBall = false;
		this.ballHolder = null;
		this.stopGame(e);
		this.startGame();
		break;
	case Event.prototype.TYPE.ENDOFGAME:
		this.stopGame( e );
		this.state = Game.prototype.STATE.COMPLETED;
		break;
	default:
		console.log("/Game.react/ unknown event type");
	}
}

/*
	Complete some game event
*/
Game.prototype.complete = function(e) {
	this.addPacket( 'eventComplete', e, 0 ); 
	
	this.ball.vel.zero();
	this.ball.pos.set( this.ball.inboundPos );
	
	switch (e.type) {
	case Event.prototype.TYPE.GOAL:

		break;
	case Event.prototype.TYPE.GOALKICK:

		break;
	case Event.prototype.TYPE.THROWIN:

		break;
	case Event.prototype.TYPE.ENDOFGAME:
		this.removeThis = true;
		break;
	default:
		console.log("/Game.complete/ unknown event type");
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
	this.updatePacketQueue();
	
	if ( this.stopTimer > 0 ) {
		this.stopTimer--;
	}
	if ( this.data.stopped && this.stopTimer <= 0 ) this.startGame();

	if ( this.state == Game.prototype.STATE.INPROGRESS && this.data.time > GAME_LENGTH_SECS ) this.react( new Event( '', Event.prototype.TYPE.ENDOFGAME ) );

	// See if the ball has caused any events on the field		
	if ( !this.data.stopped ) {
		if ( e = this.gamefield.interact( this.ball ) ) this.react( e );
	}
	
	if ( !this.data.stopped ) this.updatePlayers();
	
	this.updateBall();

	if ( !this.data.stopped ) this.updateBallHolder();
}

/* 
	Update each player 
*/
Game.prototype.updatePlayers = function() {
	var callingPlayers = [];
	
	for (p in this.players) {
		var player = this.players[p];
		
		if ( player.calling ) {
			callingPlayers.push( player );
		}
	}
	
	for (p in this.players) {
		var player = this.players[p];

		// AI player control
		if (player.isAuto) {

			// Determine what the player "sees"
			var anchorOffset = this.ball.pos.minus(player.anchor);
			var newAnchorPos = player.anchor.plus(new Vec2( anchorOffset.x * 0.50, 0 )); // "Home" position
			var newGoalPos;			

			switch (player.side) { 
				case 'left': newGoalPos = this.gamefield.rightGoal.center; break; // Goal Location
				case 'right': newGoalPos = this.gamefield.leftGoal.center; break;
			}
			
			var newBallPos = this.ball.pos // Ball position
			var newBallSide = this.ball.side; // Who has possession of the ball
			var newIsBallFree = ( this.ballHolder == null );
			var newTargets = [];
			
			newTargets.push( { pos: newGoalPos, priority: player.pos.distanceTo( newGoalPos ) } );

			for ( c in callingPlayers ) {
				var callingPlayer = callingPlayers[c]; 
				
				if ( callingPlayer.side == player.side ) {
					newTargets.push( { pos: callingPlayer.pos, priority: callingPlayer.pos.distanceTo( newGoalPos ) } );
				}
			}

			var envInfoValues = {	anchorPos: 	newAnchorPos,
									ballPos:	newBallPos,
									isBallFree: newIsBallFree,
									ballSide: 	newBallSide,
									targets:	newTargets,						
								};
		
			player.setEnvInfoValues( envInfoValues );

			player.generateBehaviors();
			player.evaluateBehaviors();	
			player.rankBehaviors();
			player.selectBehavior();
			player.performBehavior();
		}

		player.updateState();

		player.applyPhysics();
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
	
	// Set which side has possession
	if ( this.ballHolder != null ) this.ball.side = this.ballHolder.side;
	
	var bf = 0.6;
	if ( this.data.stopped ) bf = 1.5;

	// Static friction
	var friction = new Vec2(0, 0);
	friction.set(this.ball.vel);
	friction.normalize();
	friction.scale(-bf);

	// Enforce top speed
	var speed = this.ball.vel.length();

	if ( this.ball.z == 0 ) {
		if (speed > bf) this.ball.vel.add( friction );
		else this.ball.vel.zero();
	}
	
	this.ball.pos.add(this.ball.vel);
	this.ball.speed = this.ball.vel.length();	
	if (this.ball.speed > bf) this.ball.angle = Math.atan2(this.ball.vel.y, this.ball.vel.x)

	this.ball.z += this.ball.velZ;		
	if (this.ball.z >= 0) {
		this.ball.z = 0; 
		this.ball.velZ = 0;
	} else {
		this.ball.velZ += 0.002;
	}

	this.ball.updateCenter();
}

/*
	Update the ball and ball holder based on what they are doing
*/

Game.prototype.updateBallHolder = function() {

	// Steal the ball with a slide tackle
	for (p in this.players) {
		var player = this.players[p];

		if (this.ball.z == 0 && player.action == ACT.SLIDE && player.overlaps(this.ball) && !(this.ballholder != null && player.speed < this.ballholder.speed && this.ballholder.side == player.side)) {
			if (this.ballHolder != null) this.ballHolder.hasBall = false;
			this.ballHolder = player;
			player.hasBall = true;
		}
	}

	// Pick the ball up
	if (this.ballHolder != null) {
		this.ball.pos.x = this.ballHolder.pos.x + this.ballHolder.faceDir.x * 30;
		this.ball.pos.y = this.ballHolder.pos.y + this.ballHolder.faceDir.y * 30;
	} else {
		for (p in this.players) {
			var player = this.players[p];
			if (this.ball.z == 0 && player.overlaps(this.ball) && (player.faceDir.dot(this.ball.faceDir) < 0.5 || player.speed > this.ball.speed) && !(this.ballholder != null && player.speed < this.ballholder.speed)) {
				this.ballHolder = player;
				player.hasBall = true;
			}
		}
	}
	
	if (this.ballHolder != null) {
	
		// Kick the ball
		if (this.ballHolder.action == ACT.KICK) {
			this.ballHolder.action = ACT.STAND;
			this.ballHolder.hasBall = false;
			this.ball.vel.set(this.ballHolder.faceDir.times(25));
			//this.ball.velZ = 0;
			this.ballHolder = null;

		// Punt the ball
		} else if (this.ballHolder.action == ACT.PUNT) {
			this.ballHolder.action = ACT.STAND;
			this.ballHolder.hasBall = false;
			this.ball.vel.set(this.ballHolder.faceDir.times(10));
			this.ball.velZ = -0.06;
			this.ballHolder = null;
		}
	}	
}

Game.prototype.getClientData = function() {
	return {id: this.id, team1Name: this.team1.name, team2Name: this.team2.name};
}

module.exports = Game;
