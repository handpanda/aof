var Man = function() {
	Entity.call( this );
}

Man.prototype = new Entity();
Man.prototype.constructor = Man;

// Player kick function (Unused)
Entity.prototype.kick = {
	charge: 0.0,
	power: 0.0,
	loft: 0.0,	
	state: kickState.idle,
}

Entity.prototype.updateAngle = function() {
	this.angle = Math.atan2(this.vel.y, this.vel.x);
}

// Enable / disable AI control for a player
Entity.prototype.enableAuto = function() {
	this.isAuto = true;
}
Entity.prototype.disableAuto = function() {
	this.isAuto = false;
}

// Set the "home" position for a player
Entity.prototype.setAnchor = function(anchor, radius) {
	this.anchor.set(anchor);
	this.radius = radius;
}

// Turn towards a point on the field
Entity.prototype.lookAt = function(pos) {
	this.angle = Math.atan2(pos.y - this.pos.y, pos.x - this.pos.x);
	this.angle = Math.floor((this.angle + Math.PI / 8) / (Math.PI / 4));
	this.angle *= Math.PI / 4;
}

// Attempt to move toward a point on the field
Entity.prototype.goToward = function(pos) {
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

// Initialize the player
switch (this.type) {
	case type.player:
		this.topSpeed = 8;
		this.class = CLASS.MIDFIELDER;

		this.attemptAction = function(action) {
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
		break;
}

