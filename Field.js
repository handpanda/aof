var Entity = require('./Entity.js');
var Zone = require('./Zone.js');
var dims = require("./dims.js");
var Event = require('./Event.js');
var Room = require('./Room.js');
var type = require("./type.js");

/*
	Game field
*/

var Field = function() {
	this.room = new Room(new Vec2(0, 0), dims.fieldLength, dims.fieldWidth);
	
	// Set up field zones
	var A = dims.fieldLength;
	var B = dims.fieldWidth;
	var C = dims.backlineWidth;
	var D = dims.sidelineWidth;

	this.grass = 		new Zone(new Vec2(0, 0), type.field, 'none');
	this.topSideline = 	new Zone(new Vec2(C, 0), type.sideline, 'top');
	this.leftBackline = 	new Zone(new Vec2(0, 0), type.backline, 'left');
	this.leftGoal = 	new Zone(new Vec2(C - dims.goalDepth, B / 2 - dims.goalWidth / 2), type.goal, 'left');
	this.leftGoalieBox = 	new Zone(new Vec2(C, B / 2 - dims.goalieBoxWidth / 2), type.goalieBox, 'left');
	this.rightBackline = 	new Zone(new Vec2(A - C, 0), type.backline, 'right');
	this.rightGoal = 	new Zone(new Vec2(A - C, B / 2 - dims.goalWidth / 2), type.goal, 'right');
	this.rightGoalieBox = 	new Zone(new Vec2(A - C - dims.goalieBoxDepth, B / 2 - dims.goalieBoxWidth / 2), type.goalieBox, 'right');
	this.bottomSideline = 	new Zone(new Vec2(C, B - D), type.sideline, 'right');	
	this.bounds = 			new Zone(new Vec2(C, D), type.bounds, 'none');

	this.zones = [];

	this.zones.push(this.grass);
	this.zones.push(this.topSideline);
	this.zones.push(this.leftBackline);
	this.zones.push(this.leftGoal);
	this.zones.push(this.leftGoalieBox);
	this.zones.push(this.rightBackline);
	this.zones.push(this.rightGoal);
	this.zones.push(this.rightGoalieBox);
	this.zones.push(this.bottomSideline);
	this.zones.push(this.bounds);

	// Set up physical walls on the field (the goals)
	this.barriers = [];

	// Left side goalposts
	this.barriers.push(new Entity(new Vec2(C - dims.goalDepth, B / 2 - dims.goalWidth / 2 - dims.postWidth / 2), new Vec2(0, 0), type.goalSide));
	this.barriers.push(new Entity(new Vec2(C - dims.goalDepth, B / 2 - dims.goalWidth / 2), new Vec2(0, 0), type.goalBack));
	this.barriers.push(new Entity(new Vec2(C - dims.goalDepth, B / 2 + dims.goalWidth / 2 - dims.postWidth / 2), new Vec2(0, 0), type.goalSide));

	// Right side goalposts
	this.barriers.push(new Entity(new Vec2(A - C, B / 2 - dims.goalWidth / 2 - dims.postWidth / 2), new Vec2(0, 0), type.goalSide));
	this.barriers.push(new Entity(new Vec2(A - C + dims.goalDepth, B / 2 - dims.goalWidth / 2), new Vec2(0, 0), type.goalBack));
	this.barriers.push(new Entity(new Vec2(A - C, B / 2 + dims.goalWidth / 2 - dims.postWidth / 2), new Vec2(0, 0), type.goalSide));
}

// Initial position for a player
Field.prototype.newPlayerPosition = function(player) {
	switch (player.side) {
		case 'left':
			player.pos.set(new Vec2(dims.sidelineWidth + dims.goalieBoxDepth, dims.fieldWidth / 2));
			break;	
		case 'right':
			player.pos.set(new Vec2(dims.fieldLength - (dims.sidelineWidth + dims.goalieBoxDepth), dims.fieldWidth / 2));
			break;
	}		
}

	// Do stuff with the ball related to where it is on the field
Field.prototype.interact = function(ball) {
	for (b in this.barriers) {
		ball.bounce(this.barriers[b]);
	}
}

Field.prototype.testZones = function( ball ) {
	if (ball.overlaps(this.leftGoal)) {
		if (ball.z == 0) {
			//ball.vel.zero();
			ball.inboundPos.set(new Vec2(this.grass.width / 2 - ball.width / 2, this.grass.height / 2 - ball.height / 2));
			return new Event('right', Event.prototype.TYPE.GOAL);
		} else {
			ball.bounce(this.leftGoal);
		}
	}

	if (ball.overlaps(this.rightGoal)) {
		if (ball.z == 0) {		
			//ball.vel.zero();
			ball.inboundPos.set(new Vec2(this.grass.width / 2 - ball.width / 2, this.grass.height / 2 - ball.height / 2));
			return new Event('left', Event.prototype.TYPE.GOAL);
		} else {
			ball.bounce(this.rightGoal);
		}
	}

	if (ball.overlaps(this.leftBackline)) {
		ball.inboundPos.set( new Vec2 (this.leftBackline.pos.x + this.leftBackline.width, ball.pos.y ) );
		return new Event('', Event.prototype.TYPE.THROWIN);
	}

	if (ball.overlaps(this.topSideline)) {
		ball.inboundPos.set(new Vec2(ball.pos.x, this.topSideline.pos.y + this.topSideline.height));
		return new Event('', Event.prototype.TYPE.THROWIN);
	}

	if (ball.overlaps(this.bottomSideline)) {
		ball.inboundPos.set(new Vec2(ball.pos.x, this.bottomSideline.pos.y - ball.height));
		return new Event('', Event.prototype.TYPE.THROWIN);
	}

	if (ball.overlaps(this.rightBackline)) {
		ball.inboundPos.set( new Vec2( this.rightBackline.pos.x, ball.pos.y ) );
		return new Event('', Event.prototype.TYPE.THROWIN);
	}
}

module.exports = Field;
