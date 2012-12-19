var Entity = require("./Entity.js");
var ACT = require("./Act.js");
var CALL = require("./Call.js");
var type = require("./type.js");
var EnvInfo = require( "./EnvInfo.js" );

var KEYSTATE = {
	UP : 0,
	HIT : 1,
	HELD : 2,
};

// Kinds of players, will be used for AI (UNIMPLEMENTED)
var CLASS = {
	GOALKEEPER: 0,
	DEFENCEMAN: 1,
	MIDFIELDER: 2,
	STRIKER:    3,
}

/*
	Stages of a kick (UNIMPLEMENTED)
*/
var kickState = {
	idle: 0,
	charging: 1,
	lofting: 2,
	lofted: 3,
	kicking: 4,
}

var Man = function(pos, side) {
	Entity.call( this, pos, type.player, side );
	
	this.speed = 0;
	this.runSpeed = 8;
	this.topSpeed = 0;
	this.sprintSpeed = 10;
	this.tackleSpeed = 10;
	
	this.class = CLASS.MIDFIELDER;
	
	this.hasBall = 	false;
	this.action  = 	ACT.STAND;
	this.calling =	CALL.none; 	
	
	this.sprinting = false;
	this.calling = false;
	this.maxStamina = 100;
	this.stamina = this.maxStamina;
	this.staminaUse = 2;
	this.staminaRecovery = 1; 
	
	this.destPos = new Vec2( 0, 0 );
	
	this.behaviors = [];
	
	this.path = []; // List of vectors to travel to
	
	this.envInfo = new EnvInfo();
}

Man.prototype = new Entity();
Man.prototype.constructor = Man;

// Player kick function (Unused)
Man.prototype.kick = {
	charge: 0.0,
	power: 0.0,
	loft: 0.0,	
	state: kickState.idle,
}

Man.prototype.attemptCall = function(call) {
	switch( call ) {
		case CALL.none:
			this.calling = CALL.none;
			break;
		case CALL.pass:
			this.calling = CALL.pass;
			break;
		case CALL.formation:
		
			break;	
	}
}

Man.prototype.attemptAction = function(action) {
	if (!ACT.canTransfer(this.action, action)) return;

	switch (action) {
		case ACT.STAND:
		
			break;		
		case ACT.RUN:
			this.action = ACT.RUN;
			this.vel.set( this.faceDir );
			if ( this.sprinting && this.stamina > 0 ) {
				this.vel.scale( this.sprintSpeed );	
			} else {
				this.vel.scale( this.runSpeed );	
			}
			
			break;
		case ACT.KICK:	
			// Kick		
			this.action = ACT.KICK;
			break;					
		case ACT.SLIDE:
			// Slide Tackle
			this.action = ACT.SLIDE;
			this.vel.add(this.faceDir.times(this.tackleSpeed));
			break;
		case ACT.PUNT:
			// Punt
			this.action = ACT.PUNT;
			break;
	}
}

Man.prototype.setEnvInfoValues = function( params ) {
	this.envInfo.setValues( params );
}

Man.prototype.generateBehaviors = function() {
	this.behaviors = [];
	
	this.envInfo.targets.sort( function( a, b ) {
		return (a.priority - b.priority);
	});
	
	var targetPos = this.envInfo.targets[0].pos;
	var distToBall = this.pos.distanceTo( this.envInfo.ballPos );
	var distBallToAnchor = this.envInfo.ballPos.distanceTo( this.envInfo.anchorPos );
	var distToTarget = this.pos.distanceTo( targetPos );
	var shouldAttack = !(!this.envInfo.isBallFree && this.envInfo.ballSide == this.side);
	
	// Movement
	if (this.hasBall) {
		if ( distBallToAnchor < this.radius) {
			// If the player has the ball but is out of range, move toward the goal
			this.destPos = targetPos;
		} else {
			// If the player has the ball and is in range, aim at the goal
			this.lookAt(targetPos);  
			this.destPos = this.pos;
		}	
	} else {
		if ( shouldAttack && distBallToAnchor < this.radius) {
			// If the player does not have the ball and none of his teammates do either and the ball is in range, move toward it
			this.destPos = this.envInfo.ballPos;
		} else {
			// Otherwise, return to position
			this.destPos = this.envInfo.anchorPos;
		}					
	}
	
	if ( this.path.length > 0 ) this.goToward( this.path[0] );
	else this.goToward( this.destPos );
	
// Actions
	if (this.hasBall) {
		if (distToTarget < this.radius ) {
			this.attemptAction(ACT.KICK);
		} else {
			if (distBallToAnchor < this.radius) {
	
			} else {
				// If the player has the ball and is near the goal, take a shot
				this.attemptAction(ACT.KICK);
			}	
		}
	} else {
		if ( shouldAttack ) {
			if ( distToBall < 100 ) {
				// If the player is near the ball and his side does not control it, slide tackle toward it
				this.attemptAction(ACT.SLIDE);
			} else {

			}
		}
	}			
}

Man.prototype.evaluateBehaviors = function() {
	
}

Man.prototype.rankBehaviors = function() {
	
}

Man.prototype.selectBehavior = function() {
	
}

Man.prototype.performBehavior = function() {
	
}

Man.prototype.updateState = function() {
	if ( this.sprinting ) {
		this.stamina -= this.staminaUse;
	} else {
		this.stamina += this.staminaRecovery;	
	}
	
	if ( this.stamina < 0 ) {
		this.stamina = 0;
	} 
	
	if ( this.stamina > this.maxStamina ) {
		this.stamina = this.maxStamina;
	}
}

Man.prototype.updateAngle = function() {
	this.angle = Math.atan2(this.faceDir.y, this.faceDir.x);
}

// Enable / disable AI control for a player
Man.prototype.enableAuto = function() {
	this.isAuto = true;
}
Man.prototype.disableAuto = function() {
	this.isAuto = false;
}

Man.prototype.calcSpeed = function() {
	this.topSpeed = this.runSpeed;
	this.speed = this.topSpeed;
}

Man.prototype.inputDirs = function(left, right, up, down, ground, air, sprint, pass) {
	this.vel.zero();
	
	if (! ( left || right || up || down ) ) return;
	
	this.faceDir.zero();
	
	var xDir = 0.0,
		yDir = 0.0;
		
	if ( left ) xDir += -1.0;
	if ( right ) xDir += 1.0;
	if ( up ) yDir += -1.0;
	if ( down ) yDir += 1.0;
	
	this.faceDir.setValues( xDir, yDir );
	this.faceDir.normalize();
	
	this.attemptAction( ACT.RUN );		
}

Man.prototype.enforceTopSpeed = function() {
	var speed = this.vel.length();

	if ( speed > this.topSpeed ) this.vel.scale(this.topSpeed / speed);
}

Man.prototype.inputZ = function( status ) {
	if ( status == KEYSTATE.HIT ) { // If the Z key was pressed
		if (this.hasBall) { // If the player has the ball
			this.attemptAction(ACT.KICK); // Kick the ball
		} else { // Otherwise
			this.attemptAction(ACT.SLIDE); // Slide tackle
		}
	} else {

	}
}

Man.prototype.inputX = function( status ) {
	if ( status == KEYSTATE.HIT ) { // If the X key was pressed
		if (this.hasBall) { // If the player has the ball
			this.attemptAction(ACT.PUNT); // Punt the ball
		} else { // Otherwise
			
		}
	} else {
		
	}
}

Man.prototype.inputC = function( status ) {
	if ( status == KEYSTATE.HIT || status == KEYSTATE.HELD ) { // If the button is being pressed
		this.sprinting = true;
	} else { 
		this.sprinting = false;
	}
}

Man.prototype.inputV = function( status ) {
	if ( status == KEYSTATE.HIT || status == KEYSTATE.HELD ) { // If the button is being pressed
		this.calling = true;
	} else { 
		this.calling = false;
	}
}

// Set the "home" position for a player
Man.prototype.setAnchor = function(anchor, radius) {
	this.anchor.set(anchor);
	this.radius = radius;
}

// Turn towards a point on the field
Man.prototype.lookAt = function(pos) {
	if ( ACT.canAccelerate( this.action )) {
		this.angle = Math.atan2(pos.y - this.pos.y, pos.x - this.pos.x);
		this.angle = Math.floor((this.angle + Math.PI / 8) / (Math.PI / 4));
		this.angle *= Math.PI / 4;
		this.faceDir.setValues( Math.cos( this.angle ), Math.sin( this.angle ) );
	}
}

// Attempt to move toward a point on the field
Man.prototype.goToward = function(pos) {
	if (ACT.canAccelerate(this.action)) {
		if ( this.pos.distanceTo( pos ) < this.runSpeed ) {
			this.pos.set( pos );
		} else {
			this.lookAt( pos );
				
			this.attemptAction( ACT.RUN );
		}
	}
}

Man.prototype.frictionCoefficient = 1.0; // Coefficient of static friction

Man.prototype.applyPhysics = function() {
	
	// Apply static friction
	var frictionForce = new Vec2(0, 0);
	frictionForce.set( this.vel ); 
	frictionForce.normalize();
	frictionForce.scale( -this.frictionCoefficient ); // Static friction works against velocity

	var currentSpeed = this.vel.length();

	if ( currentSpeed > this.frictionCoefficient ) this.vel.add( frictionForce );
	else {
		if ( this.action == ACT.SLIDE ) this.action = ACT.STAND;
		this.vel.zero();
	}

	this.pos.add( this.vel );
	this.speed = this.vel.length();	

	// Recalculate drawing values
	this.updateAngle();
	this.updateCenter();	
}

// Prepare data to send to a client
Man.prototype.makePacket = function() {
	this.packet = {
		id : 	this.id,
		clientid : this.clientid,
		type : 	this.type,
		pos : 	 	this.pos.clip(),
		destPos :	this.destPos.clip(),
		vel :  		this.vel,
		z : 	 	this.z,
		velZ :	 	this.velZ,
		width : 	this.width,
		height : 	this.height,	
		angle : 	this.angle,
		side : 	this.side,
		action : 	this.action,
		latency : 	this.latency,
		stamina :	this.stamina,
		msecsSinceLastPing : this.msecsSinceLastPing,
	}	
}

Man.prototype.getPacket = function() {
	return this.packet;
}

module.exports = Man;
