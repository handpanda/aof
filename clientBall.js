var clientBall = function(pos, objtype, side) {
	clientEntity.call( this, pos, objtype, side );
}

clientBall.prototype = new clientEntity();
clientBall.prototype.constructor = clientBall;

clientBall.prototype.draw = function( context ) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.fillStyle = this.type.color;
			context.scale(1 - this.z, 1 - this.z);
			context.translate(-this.width / 2, -this.height / 2);
			context.fillRect(0, 0, this.width, this.height);
		context.restore();
		context.font = '24px serif';
		context.fillStyle = 'black';
		context.fillText(this.z, 0, 0);
	context.restore();		
}