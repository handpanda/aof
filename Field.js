var objects = require('./object.js');
var event = require('./event.js');
var room = require('./Room.js');

/*
	Game field
*/

var Field = function() {
	this.room = new room.Room(new Vec2(0, 0), objects.dims.fieldLength, objects.dims.fieldWidth);
	
	// Set up field zones
	var A = objects.dims.fieldLength;
	var B = objects.dims.fieldWidth;
	var C = objects.dims.backlineWidth;
	var D = objects.dims.sidelineWidth;

	this.grass = 		new objects.gameObject(new Vec2(0, 0), new Vec2(0, 0), objects.type.field, 'none');
	this.topSideline = 	new objects.gameObject(new Vec2(C, 0), new Vec2(0, 0), objects.type.sideline, 'top');
	this.leftBackline = 	new objects.gameObject(new Vec2(0, 0), new Vec2(0, 0), objects.type.backline, 'left');
	this.leftGoal = 	new objects.gameObject(new Vec2(C - objects.dims.goalDepth, B / 2 - objects.dims.goalWidth / 2), new Vec2(0, 0), objects.type.goal, 'left');
	this.leftGoalieBox = 	new objects.gameObject(new Vec2(C, B / 2 - objects.dims.goalieBoxWidth / 2), new Vec2(0, 0), objects.type.goalieBox, 'left');
	this.rightBackline = 	new objects.gameObject(new Vec2(A - C, 0), new Vec2(0, 0), objects.type.backline, 'right');
	this.rightGoal = 	new objects.gameObject(new Vec2(A - C, B / 2 - objects.dims.goalWidth / 2), new Vec2(0, 0), objects.type.goal, 'right');
	this.rightGoalieBox = 	new objects.gameObject(new Vec2(A - C - objects.dims.goalieBoxDepth, B / 2 - objects.dims.goalieBoxWidth / 2), new Vec2(0, 0), objects.type.goalieBox, 'right');
	this.bottomSideline = 	new objects.gameObject(new Vec2(C, B - D), new Vec2(0, 0), objects.type.sideline, 'right');	

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

	// Set up physical walls on the field (the goals)
	var barriers = [];

	// Left side goalposts
	barriers.push(new objects.gameObject(new Vec2(C - objects.dims.goalDepth, B / 2 - objects.dims.goalWidth / 2 - objects.dims.postWidth / 2), new Vec2(0, 0), objects.type.goalSide));
	barriers.push(new objects.gameObject(new Vec2(C - objects.dims.goalDepth, B / 2 - objects.dims.goalWidth / 2), new Vec2(0, 0), objects.type.goalBack));
	barriers.push(new objects.gameObject(new Vec2(C - objects.dims.goalDepth, B / 2 + objects.dims.goalWidth / 2 - objects.dims.postWidth / 2), new Vec2(0, 0), objects.type.goalSide));

	// Right side goalposts
	barriers.push(new objects.gameObject(new Vec2(A - C, B / 2 - objects.dims.goalWidth / 2 - objects.dims.postWidth / 2), new Vec2(0, 0), objects.type.goalSide));
	barriers.push(new objects.gameObject(new Vec2(A - C + objects.dims.goalDepth, B / 2 - objects.dims.goalWidth / 2), new Vec2(0, 0), objects.type.goalBack));
	barriers.push(new objects.gameObject(new Vec2(A - C, B / 2 + objects.dims.goalWidth / 2 - objects.dims.postWidth / 2), new Vec2(0, 0), objects.type.goalSide));

	// Initial position for a player
	this.newPlayerPosition = function(player) {
		switch (player.side) {
			case 'left':
				player.pos.set(new Vec2(objects.dims.sidelineWidth + objects.dims.goalieBoxDepth, objects.dims.fieldWidth / 2));
				break;	
			case 'right':
				player.pos.set(new Vec2(objects.dims.fieldLength - (objects.dims.sidelineWidth + objects.dims.goalieBoxDepth), objects.dims.fieldWidth / 2));
				break;
		}		
	}

	// Do stuff with the ball related to where it is on the field
	this.interact = function(ball) {
		for (b in barriers) {
			ball.bounce(barriers[b]);
		}

		if (ball.overlaps(this.leftGoal)) {
			ball.vel.zero();
			ball.pos.set(new Vec2(this.grass.width / 2 - ball.width / 2, this.grass.height / 2 - ball.height / 2));
			return new event.Event('right', event.type.GOAL);
		}

		if (ball.overlaps(this.rightGoal)) {
			ball.vel.zero();
			ball.pos.set(new Vec2(this.grass.width / 2 - ball.width / 2, this.grass.height / 2 - ball.height / 2));
			return new event.Event('left', event.type.GOAL);
		}

		if (ball.overlaps(this.leftBackline)) {
			if (ball.center.y < this.grass.height / 2) {
				ball.vel.zero();
				ball.pos.set(this.leftGoalieBox.pos.plus(new Vec2(this.leftGoalieBox.width - ball.width / 2, - ball.height / 2)));			
			} else {
				ball.vel.zero();
				ball.pos.set(this.leftGoalieBox.pos.plus(new Vec2(this.leftGoalieBox.width - ball.width / 2, this.leftGoalieBox.height - ball.height / 2)));			
			}
			return new event.Event('', event.type.GOALKICK);
		}

		if (ball.overlaps(this.topSideline)) {
			ball.vel.zero();
			ball.pos.set(new Vec2(ball.pos.x, this.topSideline.pos.y + this.topSideline.height));
			return new event.Event('', event.type.THROWIN);
		}

		if (ball.overlaps(this.bottomSideline)) {
			ball.vel.zero();
			ball.pos.set(new Vec2(ball.pos.x, this.bottomSideline.pos.y - ball.height));
			return new event.Event('', event.type.THROWIN);
		}

		if (ball.overlaps(this.rightBackline)) {
			if (ball.center.y < this.grass.height / 2) {
				ball.vel.zero();
				ball.pos.set(this.rightGoalieBox.pos.plus(new Vec2(-ball.width / 2, -ball.height / 2)));			
			} else {
				ball.vel.zero();
				ball.pos.set(this.rightGoalieBox.pos.plus(new Vec2(-ball.width / 2, this.rightGoalieBox.height - ball.height / 2)));			
			}
			return new event.Event('', event.type.GOALKICK);
		}
	}
}

module.exports = field;
