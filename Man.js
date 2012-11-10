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
	
	this.topSpeed = 8;
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
		case ACT.KICK:	
			// Kick		
			this.action = ACT.KICK;
			break;					
		case ACT.SLIDE:
			// Slide Tackle
			this.action = ACT.SLIDE;
			this.vel.add(this.facedir.times(15));
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

		if (Math.abs(this.pos.x - pos.x) > this.topSpeed) {
			if (this.pos.x < pos.x) this.vel.x = this.topSpeed;	
			if (this.pos.x > pos.x) this.vel.x = -this.topSpeed;
		} else this.pos.x = pos.x;
		if (Math.abs(this.pos.y - pos.y) > this.topSpeed) {
			if (this.pos.y < pos.y) this.vel.y = this.topSpeed;
			if (this.pos.y > pos.y) this.vel.y = -this.topSpeed;
		} else this.pos.y = pos.y;

		var absSpeed = this.vel.length();

		if (absSpeed > this.topSpeed) this.vel.scale(this.topSpeed / absSpeed);
	}
}

module.exports = Man;