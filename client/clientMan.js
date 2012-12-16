var clientMan = function(pos, side) {
	clientEntity.call( this, pos, type.player, side );
	
	this.hasBall = 	false;
	
	this.pastPositions = [];
	
	this.stamina = 0;
}

clientMan.prototype = new clientEntity();
clientMan.prototype.constructor = clientMan;

clientMan.prototype.draw = function( context ) {
	this.pastPositions.push( this.pos );
	if ( this.pastPositions.length > 10 ) this.pastPositions.pop();
	
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.fillStyle = this.type.color;
			if (this.side == 'left') context.fillStyle = 'blue';
			if (this.side == 'right') context.fillStyle = 'red';				
			context.save();
				context.save();
					context.rotate(this.angle);
	
					switch (this.action) {
					case ACT.STAND:
					case ACT.KICK:
					case ACT.RUN:
						// Body
						context.fillRect(-dims.manDepth / 2, -dims.manWidth / 2, dims.manDepth, dims.manWidth);
						
						// Head
						context.fillStyle = 'black';
						context.fillRect(-dims.headLength / 2, -dims.headWidth / 2, dims.headLength, dims.headWidth);
	
						break;
					case ACT.SLIDE:			
						// Legs				
						context.strokeStyle = 'white';
						context.lineWidth = this.width * 4 / 9;
						context.beginPath();
						context.moveTo(0, -this.width * 2.5 / 9);
						context.lineTo(30, -this.width * 2.5 / 9);
						context.moveTo(0, this.width * 2.5 / 9);
						context.lineTo(50, this.width * 2.5 / 9);
						context.stroke();										
	
						// Body
						context.fillRect(-dims.manDepth * 3 / 4, -dims.manWidth / 2, dims.manDepth, dims.manWidth);
						
						// Head
						context.fillStyle = 'black';
						context.fillRect(-dims.headLength, -dims.headWidth / 2, dims.headLength, dims.headWidth);
						break;
					}
				context.restore();
				
				// Debug Text
				if ( inDebugMode ) {
					
					// Client ID
					context.font = '24px serif';
					context.fillStyle = 'white';
					context.fillText(this.clientid, 0, 0);
					
					// Latency
					context.font = '24px serif';
					context.fillStyle = 'orange';
					context.fillText(this.latency + '/' + this.msecsSinceLastPing, 0, 24);
				}
			context.restore();	
		context.restore();
	context.restore();	
}