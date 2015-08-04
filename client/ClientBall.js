define (["client/ClientEntity"], function ( ClientEntity ) {

var ClientBall = function(pos, side) {
	ClientEntity.call( this, pos, type.ball, side );
}

ClientBall.prototype = new ClientEntity();
ClientBall.prototype.constructor = ClientBall;

ClientBall.prototype.draw = function( context ) {
	//context.fillStyle = 'orange';
	//context.fillRect( this.pos.x, this.pos.y, this.width, this.height );	
	
	context.save();
		context.translate(this.center.x, this.center.y);
		context.save();
			context.beginPath();
			if (this.side == 'left') context.strokeStyle = 'blue';
			if (this.side == 'right') context.strokeStyle = 'red';
			context.lineWidth = this.width / 3;
			context.scale(1 - this.z, 1 - this.z);
			
			// x, y, radius, start angle, end angle, clockwise?
			context.arc( 0, 0, this.width / 6, 0, Math.PI * 2, false);
			//context.fillRect(0, 0, this.width, this.height);
			context.stroke();
			
		context.restore();
	context.restore();		
}

return ClientBall;

});