var Entity = require('./Entity.js');
var type = require("./type.js");

var Ball = function(pos, objtype, side) {
	Entity.call( this, pos, type.Ball, side );
}

Ball.prototype = new Entity();
Ball.prototype.constructor = Ball;

// Bounce off some other object
Ball.prototype.bounce = function(otherObject) {
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

module.exports = Ball;