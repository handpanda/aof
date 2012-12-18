var clientMan = function(pos, side) {
	clientEntity.call( this, pos, type.player, side );
	
	this.hasBall = 	false;
	
	this.pastPositions = [];
	
	this.stamina = 0;
	
	this.destPos = new Vec2( 0, 0 );
	
	this.sightLine = new clientEntity( new Vec2( 0, 0 ), type.none, '' );
	this.obstructed = false;
	
	this.occluder = null;
}

clientMan.prototype = new clientEntity();
clientMan.prototype.constructor = clientMan;

clientMan.prototype.updateSightLine = function() {
	this.sightLine.angle = Math.atan2( this.destPos.y - this.pos.y, this.destPos.x - this.pos.x );	
	this.sightLine.width = this.destPos.distanceTo( this.pos );
	this.sightLine.height = 20;
	
	this.sightLine.pos = this.center.plus( new Vec2( 20, -this.sightLine.height / 2 ).rotate( -this.sightLine.angle ) );
	this.sightLine.updateSides();

	var topLeft = new Vec2( 20, -this.sightLine.height / 2 );
	var topRight = new Vec2( 20 + this.sightLine.width, -this.sightLine.height / 2);
	var bottomRight = new Vec2( 20 + this.sightLine.width, this.sightLine.height / 2);
	var bottomLeft = new Vec2( 20, this.sightLine.height / 2 );
	
	topLeft.rotate( -this.sightLine.angle ).add( this.center );
	topRight.rotate( -this.sightLine.angle ).add( this.center );
	bottomRight.rotate( -this.sightLine.angle ).add( this.center );
	bottomLeft.rotate( -this.sightLine.angle ).add( this.center );
	
	this.sightLine.maxLeft = Math.min( topLeft.x, topRight.x, bottomRight.x, bottomLeft.x );
	this.sightLine.maxRight = Math.max( topLeft.x, topRight.x, bottomRight.x, bottomLeft.x );
	this.sightLine.maxTop = Math.min( topLeft.y, topRight.y, bottomRight.y, bottomLeft.y );
	this.sightLine.maxBottom = Math.max( topLeft.y, topRight.y, bottomRight.y, bottomLeft.y );
	
	this.obstructed = false;
}

clientMan.prototype.testAgainstTree = function( playerTree, mark ) {
	this.occluder = null;
	
	this.obstructed = playerTree.isContainedBy( this.sightLine, mark, this );
	
	if ( playerTree.occluder != null ) this.occluder = playerTree.occluder;
}

clientMan.prototype.testAgainstMan = function( man ) {
	this.obstructed = this.sightLine.containsPoint( man.center );
}

clientMan.prototype.draw = function( context ) {
	this.pastPositions.push( this.pos );
	if ( this.pastPositions.length > 10 ) this.pastPositions.pop();
	
	//context.fillStyle = 'orange';
	//context.fillRect( this.pos.x, this.pos.y, this.width, this.height );
	
	context.save();
		context.translate(this.center.x, this.center.y);
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