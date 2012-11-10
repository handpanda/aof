objects = require("./object.js");

// Kinds of players, will be used for AI (UNIMPLEMENTED)
var CLASS = {
	GOALKEEPER: 0,
	DEFENCEMAN: 1,
	MIDFIELDER: 2,
	STRIKER:    3,
}

var Man = function(pos, offset, objtype, side) {
	objects.Entity.call( this, pos, offset, objtype, side );
	
	this.topSpeed = 8;
	this.class = CLASS.MIDFIELDER;
}

Man.prototype = new objects.Entity();
Man.prototype.constructor = Man;

// Player kick function (Unused)
Man.prototype.kick = {
	charge: 0.0,
	power: 0.0,
	loft: 0.0,	
	state: objects.kickState.idle,
}

Man.prototype.attemptAction = function(action) {
	if (!objects.ACT.canTransfer(this.action, action)) return;

	switch (action) {
		case objects.ACT.KICK:	
			// Kick		
			this.action = objects.ACT.KICK;
			break;					
		case objects.ACT.SLIDE:
			// Slide Tackle
			this.action = objects.ACT.SLIDE;
			this.vel.add(this.facedir.times(15));
			break;
		case objects.ACT.PUNT:
			// Punt
			this.action = objects.ACT.PUNT;
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
	if (objects.ACT.canAccelerate(this.action)) {
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