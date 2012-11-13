var clientBall = function(pos, side) {
	clientEntity.call( this, pos, type.ball, side );
}

clientBall.prototype = new clientEntity();
clientBall.prototype.constructor = clientBall;

clientBall.prototype.draw = function( context ) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.beginPath();
			context.strokeStyle = this.type.color;
			context.lineWidth = this.width / 3;
			context.fillStyle = this.type.color;
			context.scale(1 - this.z, 1 - this.z);
			context.arc( 0, 0, this.width / 6, 0, Math.PI * 2, false);
			//context.fillRect(0, 0, this.width, this.height);
			context.stroke();
			
		context.restore();
	context.restore();		
}
