var objects = require('./object.js');

var Ball = function(pos, offset, objtype, side) {
	objects.Entity.call( this, pos, offset, objtype, side );
}

Ball.prototype = new objects.Entity();
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

Ball.prototype.draw = function( context ) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.scale(1 - this.z, 1 - this.z);
			context.translate(-this.width / 2, -this.height / 2);
			context.fillRect(0, 0, this.width, this.height);
		context.restore();
		context.font = '24px serif';
		context.fillStyle = 'black';
		context.fillText(this.z, 0, 0);
	context.restore();		
}

module.exports = Ball;