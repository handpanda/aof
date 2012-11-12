var Entity = require("./Entity.js");
var ACT = require("./Act.js");
var type = require("./type.js");

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
	this.class = CLASS.MIDFIELDER;
	
	this.hasBall = 	false;
	this.action  = 	ACT.STAND;
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

Man.prototype.attemptAction = function(action) {
	if (!ACT.canTransfer(this.action, action)) return;

	switch (action) {
		case ACT.RUN:
			this.vel.set( this.faceDir );
			this.vel.scale( this.speed );
			this.enforceTopSpeed();
			break;
		case ACT.KICK:	
			// Kick		
			this.action = ACT.KICK;
			break;					
		case ACT.SLIDE:
			// Slide Tackle
			this.action = ACT.SLIDE;
			this.vel.add(this.faceDir.times(15));
			break;
		case ACT.PUNT:
			// Punt
			this.action = ACT.PUNT;
			break;
	}
}

Man.prototype.updateAngle = function() {
	this.angle = Math.atan2(this.vel.y, this.vel.x);
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

Man.prototype.inputDirs = function(left, right, up, down) {
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

Man.prototype.inputZ = function( hit ) {
	if ( hit ) {
		if (this.hasBall) {
			this.attemptAction(ACT.KICK);
		} else {
			this.attemptAction(ACT.SLIDE);
		}
	} else {

	}
}

Man.prototype.inputX = function( hit ) {
	if ( hit ) {
		if (this.hasBall) {
			this.attemptAction(ACT.PUNT);
		} else { 
			
		}
	} else {
		
	}
}

Man.prototype.inputC = function( hit ) {

}
// Set the "home" position for a player
Man.prototype.setAnchor = function(anchor, radius) {
	this.anchor.set(anchor);
	this.radius = radius;
}

// Turn towards a point on the field
Man.prototype.lookAt = function(pos) {
	this.angle = Math.atan2(pos.y - this.pos.y, pos.x - this.pos.x);
	this.angle = Math.floor((this.angle + Math.PI / 8) / (Math.PI / 4));
	this.angle *= Math.PI / 4;
}

// Attempt to move toward a point on the field
Man.prototype.goToward = function(pos) {
	if (ACT.canAccelerate(this.action)) {
		this.vel.set(new Vec2(0, 0));

		if (Math.abs(this.pos.x - pos.x) > this.runSpeed) {
			if (this.pos.x < pos.x) this.vel.x = this.runSpeed;	
			if (this.pos.x > pos.x) this.vel.x = -this.runSpeed;
		} else this.pos.x = pos.x;
		if (Math.abs(this.pos.y - pos.y) > this.runSpeed) {
			if (this.pos.y < pos.y) this.vel.y = this.runSpeed;
			if (this.pos.y > pos.y) this.vel.y = -this.runSpeed;
		} else this.pos.y = pos.y;

		var absSpeed = this.vel.length();

		if (absSpeed > this.runSpeed) this.vel.scale(this.runSpeed / absSpeed);
	}
}

module.exports = Man;