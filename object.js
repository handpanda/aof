/*

	object.js - physical game objects
	
*/

// Field reference dimensions
// Object reference dimensions
var dims = {
	fieldLength : 2000,
	fieldWidth : 1000,
	goalWidth : 300,
	goalDepth : 150,
	sidelineWidth : 150,
	backlineWidth: 300,
	goalieBoxWidth : 400,
	goalieBoxDepth : 200,
	postWidth: 10,
	borderWidth: 15,
	centerRadius: 200,

	manWidth : 40,
	manHeight : 40,
	manDepth : 30,
	legWidth : 10,
	strideLength : 30, 
	legLength : 30,
	headWidth : 25,
	headLength : 30,
}

// Specifications for objects
var type = {
	player    : { name: 'player', width: 40  , height: 40, color: 'white' },
	ball      : { name: 'ball', width: 25  , height: 25, color: 'white' },
	field     : { name: 'field', width: dims.fieldLength, height: dims.fieldWidth, color: 'green' },
	sideline  : { name: 'sideline', width: dims.fieldLength - dims.sidelineWidth / 2, height: dims.sidelineWidth, color: 'blue' },
	backline  : { name: 'backline', width: dims.backlineWidth, height: dims.fieldWidth, color: 'red' },
	goal      : { name: 'goal', width: dims.goalDepth , height: dims.goalWidth, color: 'yellow' },
	goalieBox : { name: 'goalieBox', width: dims.goalieBoxDepth , height: dims.goalieBoxWidth, color: 'purple' },
	goalSide  : { name: 'goalSide', width: dims.sidelineWidth, height: dims.postWidth },
	goalBack  : { name: 'goalBack', width: dims.postWidth, height: dims.goalWidth },
}

var direction = {
	none  : 0,//{ x:  0, y:  0 },
	left  : 1,//{ x: -1, y:  0 },
	right : 2,//{ x:  1, y:  0 }, 
	up    : 3,//{ x:  0, y: -1 },
	down  : 4,//{ x:  0, y:  1 },
}

var contact = function(dir) {
	this.dir = dir;
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

/*
	Player actions and how they are related
*/	
var ACT = {
	STAND: 0,
	RUN: 1,
	KICK: 2,
	SLIDE: 3,
	PUNT: 4,

	ACTIONS: 5, // Total number of actions

	
	// Can a player doing action A switch to action B?
	// from:	STAND	RUN	KICK	SLIDE	PUNT
	transfer: [	true, 	true, 	true, 	true,	true,  // to:	STAND
		   	true, 	true, 	true, 	false,  true,  // 	RUN
		   	true, 	true, 	false, 	false,	false, //	KICK
		   	true, 	true, 	false, 	false,	false, // 	SLIDE
			true,	true,	false,  false,  false, //	PUNT
								],

	canTransfer: function(fromaction, toaction) {
		return ACT.transfer[fromaction + toaction * ACT.ACTIONS];
	},

	// Can a player doing some action move freely (i.e with the arrow keys) ?
	canAccelerate: function(action) {
		switch (action) {
		case ACT.STAND:
		case ACT.RUN:
		case ACT.KICK:
			return true;
		case ACT.SLIDE:
		case ACT.PUNT:
			return false;
		}
	}
}

// Kinds of players, will be used for AI (UNIMPLEMENTED)
var CLASS = {
	GOALKEEPER: 0,
	DEFENCEMAN: 1,
	MIDFIELDER: 2,
	STRIKER:    3,
}

var idstat = 0;

/*
	One of the objects in the game - ball, player, field region
*/
var gameObject = function(pos, offset, objtype, side) {
	this.type = 	objtype;
	this.pos = 	pos;
	this.vel = 	new Vec2(0, 0);
	this.offset = 	offset;
	this.width =	this.type.width;
	this.height = 	this.type.height;
	this.id = 	idstat++;
	this.clientid = 0;
	this.ping = 0;
	this.angle = 	0.0;
	this.center =   new Vec2(this.pos.x + this.width / 2, this.pos.y + this.width / 2);
	this.centerToPos = this.center.minus(this.pos);
	this.facedir = 	new Vec2(Math.cos(this.angle), Math.sin(this.angle));
	this.action  = 	ACT.STAND;
	this.strafing = false;
	this.speed = 	0;
	this.topSpeed = 0;
	this.class = 	0;
	this.hasBall = 	false;
	this.side = 	side;
	this.z = 0;
	this.velZ = 0;

	this.isAuto = false;
	this.anchor = this.pos.copy();
	this.radius = 0;

	// Player kick function (Unused)
	this.kick = {
		charge: 0.0,
		power: 0.0,
		loft: 0.0,	
		state: kickState.idle,
	}

	this.updateAngle = function() {
		this.angle = Math.atan2(this.vel.y, this.vel.x);
	}

	// Enable / disable AI control for a player
	this.enableAuto = function() {
		this.isAuto = true;
	}
	this.disableAuto = function() {
		this.isAuto = false;
	}
	
	// Set the "home" position for a player
	this.setAnchor = function(anchor, radius) {
		this.anchor.set(anchor);
		this.radius = radius;
	}

	// Turn towards a point on the field
	this.lookAt = function(pos) {
		this.angle = Math.atan2(pos.y - this.pos.y, pos.x - this.pos.x);
		this.angle = Math.floor((this.angle + Math.PI / 8) / (Math.PI / 4));
		this.angle *= Math.PI / 4;
	}

	// Attempt to move toward a point on the field
	this.goToward = function(pos) {
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
	
	// Draw the object
	this.draw = function(context) {
		context.save();
			context.translate(this.pos.x, this.pos.y);
			context.save();
				context.fillStyle = this.type.color;
				if (this.side == 'left') context.fillStyle = 'blue';
				if (this.side == 'right') context.fillStyle = 'red';				

				switch (this.type.name) {
					case type.ball.name:
						context.save();
							context.scale(1 - this.z, 1 - this.z);
							context.translate(-this.width / 2, -this.height / 2);
							context.fillRect(0, 0, this.width, this.height);
						context.restore();
						context.font = '24px serif';
						context.fillStyle = 'black';
						context.fillText(this.z, 0, 0);
						break;
					case type.field.name:
						context.fillRect(0, 0, this.width, this.height);

						context.strokeStyle = "white";
						context.lineWidth = dims.borderWidth;

						context.beginPath();
						context.moveTo(dims.backlineWidth, dims.sidelineWidth);
						context.lineTo(dims.fieldLength - dims.backlineWidth, dims.sidelineWidth);
						context.lineTo(dims.fieldLength - dims.backlineWidth, dims.fieldWidth - dims.sidelineWidth);
						context.lineTo(dims.backlineWidth, dims.fieldWidth - dims.sidelineWidth);
						context.closePath();
						context.stroke();
						
						context.lineWidth = dims.postWidth;
						context.beginPath();
						context.moveTo(dims.fieldLength / 2, dims.sidelineWidth);
						context.lineTo(dims.fieldLength / 2, dims.fieldWidth - dims.sidelineWidth);
						context.stroke();
	
						context.beginPath();
						context.arc(dims.fieldLength / 2, dims.fieldWidth / 2, dims.centerRadius, 0, 2 * Math.PI, false);
						context.stroke();						
						break;
					case type.player.name:
						context.save();
							context.translate(this.width / 2, this.height / 2);
							context.save();
							context.rotate(this.angle);

							switch (this.action) {
							case ACT.STAND:
							case ACT.KICK:
							case ACT.RUN:
								context.fillRect(-dims.manDepth / 2, -dims.manWidth / 2, dims.manDepth, dims.manWidth);
								context.fillStyle = 'black';
								context.fillRect(-dims.headLength / 2, -dims.headWidth / 2, dims.headLength, dims.headWidth);
			
								break;
							case ACT.SLIDE:							
								context.strokeStyle = 'white';
								context.lineWidth = 20;
								context.beginPath();
								context.moveTo(0, -15);
								context.lineTo(30, -15);
								context.moveTo(0, 15);
								context.lineTo(50, 15);
								context.stroke();										

								context.fillRect(-dims.manDepth / 2, -dims.manWidth / 2, dims.manDepth, dims.manWidth);
								context.fillStyle = 'black';
								context.fillRect(-dims.headLength / 2, -dims.headWidth / 2, dims.headLength, dims.headWidth);
								break;
							}
							context.restore();

							context.font = '24px serif';
							context.fillStyle = 'white';
							context.fillText(this.clientid, 0, 0);
							context.fillStyle = 'orange';
							context.fillText(this.ping, 0, 24);
						context.restore();		
						break;
					case type.goalieBox.name:
						context.strokeStyle = 'white';
						context.lineWidth = dims.postWidth;
						switch (this.side) {
							case 'left':
								context.beginPath();
								context.moveTo(0, 0);
								context.lineTo(this.width, 0);
								context.lineTo(this.width, this.height);
								context.lineTo(0, this.height);
								context.stroke();
								break;
							case 'right':
								context.beginPath();
								context.moveTo(this.width, 0);
								context.lineTo(0, 0);
								context.lineTo(0, this.height);
								context.lineTo(this.width, this.height);
								context.stroke();
								break;
						}

						break;
					case type.goal.name:
						context.fillRect(0, 0, this.width, this.height);

						context.strokeStyle = "white";
						context.lineWidth = dims.postWidth;

						switch (this.side) {		
							case 'left':
								context.beginPath();
								context.moveTo(this.width, 0);
								context.lineTo(0, 0);
								context.lineTo(0, this.height);
								context.lineTo(this.width, this.height);
								context.stroke();
								break;
							case 'right':
								context.beginPath();
								context.moveTo(0, 0);
								context.lineTo(this.width, 0);
								context.lineTo(this.width, this.height);
								context.lineTo(0, this.height);
								context.stroke();
								break;
						}	
						break;
				}
			context.restore();
		context.restore();
	}

	// Get updated values from the server
	this.grab = function(data) {
		this.type = 	 data.type;
		this.pos = 	 data.pos;	
		this.vel = 	 data.vel;
		this.z = 	 data.z;
		this.velZ =	 data.velZ;
		this.width = 	 data.width;
		this.height = 	 data.height;	
		this.angle = 	 data.angle;
		this.kick = 	 data.kick;
		this.side = 	 data.side;
		this.action = 	 data.action;
		this.class = 	 data.class;
		this.ping = 	 data.ping;
	
		this.update();
	}	

	// Update reference values for the object
	this.update = function() {
		this.center.x =  this.pos.x + this.width / 2;
		this.center.y =  this.pos.y + this.height / 2;
		this.facedir.x = Math.cos(this.angle);
		this.facedir.y = Math.sin(this.angle);	
	}

	// Check for overlap with another object (both are modeled as rectangles with (x, y) in the top left corner)
	this.overlaps = function(otherObject) {
		if (	this.pos.x + this.width  + this.vel.x > otherObject.pos.x 		       + otherObject.vel.x &&
			this.pos.x		 + this.vel.x < otherObject.pos.x + otherObject.width  + otherObject.vel.x &&
			this.pos.y + this.height + this.vel.y > otherObject.pos.y 		       + otherObject.vel.y &&
			this.pos.y 		 + this.vel.y < otherObject.pos.y + otherObject.height + otherObject.vel.y ) {
			return true;
		}	

		return false;			
	}

	// Bounce off some other object (used by the ball only)
	this.bounce = function(otherObject) {
		if (this.overlaps(otherObject)) {
			if (this.pos.x > otherObject.pos.x + otherObject.width) {
				if (this.vel.x < 0) this.vel.x *= -1;
			}
			if (this.pos.x + this.width < otherObject.pos.x) {
				if (this.vel.x > 0) this.vel.x *= -1;
			}
			if (this.pos.y > otherObject.pos.y + otherObject.height) {
				if (this.vel.y < 0) this.vel.y *= -1;
			}
			if (this.pos.y + this.height < otherObject.pos.y) {
				if (this.vel.y > 0) this.vel.y *= -1;
			}
		}	
	}
};

module.exports.kickState = kickState;
module.exports.dims = dims;
module.exports.ACT = ACT;
module.exports.type = type;
module.exports.gameObject = gameObject;
