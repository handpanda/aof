var clientMan = function(pos, side) {
	clientEntity.call( this, pos, type.player, side );
	
	this.hasBall = 	false;
	
	this.pastPositions = [];
	
	this.stamina = 0;
	
	this.destPos = new Vec2( 0, 0 );
	
	this.sightLine = new clientEntity( new Vec2( 0, 0 ), type.none, '' );
	this.obstructed = false;
	
	this.occluder = null;
	this.leftOption = null;
	this.rightOption = null;
	this.leftOccluder = null;
	this.rightOccluder = null;
	this.interDestPos = null;
}

clientMan.prototype = new clientEntity();
clientMan.prototype.constructor = clientMan;

clientMan.prototype.updateSightLine = function() {
	this.sightLine = new SightLine( this.center, this.destPos );
	this.obstructed = false;
}

clientMan.prototype.testAgainstTree = function( playerTree, mark, bounds ) {
	this.occluder = null;
	this.leftOption = null;
	this.rightOption = null;
	this.leftOccluder = null;
	this.rightOccluder = null;
	
	this.obstructed = playerTree.isContainedBy( this.sightLine, mark );
	
	// We are occluded and have to go a different direction
	if ( this.obstructed && playerTree.occluder != null && bounds != null ) {
		this.occluder = playerTree.occluder;
		
		var v = this.sightLine.toPos.minus( this.sightLine.fromPos ).swap().normalize().scale(300);
		v.y *= -1
		var v2 = v.copy().flip();
		
		this.leftOption = new SightLine( this.occluder.center, bounds.clip( this.occluder.center.plus( v ) ) );
		this.rightOption = new SightLine( this.occluder.center, bounds.clip( this.occluder.center.plus( v2 ) ) );
		
		var leftLen = -1;
		
		if ( playerTree.isContainedBy( this.leftOption, false ) && playerTree.occluder != null ) {
			this.leftOccluder = playerTree.occluder;
			leftLen = this.occluder.center.distanceTo( this.leftOccluder.center );
			this.interDestPos = this.occluder.center.plus( this.leftOccluder.center ).scale( 0.5 );
		} else {
			leftLen = this.occluder.center.distanceTo( this.leftOption.toPos );
			this.interDestPos = this.occluder.center.plus( this.leftOption.toPos ).scale( 0.5 ); 
		}
		
		if ( playerTree.isContainedBy( this.rightOption, false ) && playerTree.occluder != null ) {
			this.rightOccluder = playerTree.occluder;
			if ( leftLen == -1 || this.occluder.center.distanceTo( this.rightOccluder.center ) < leftLen ) {
				this.interDestPos = this.occluder.center.plus( this.rightOccluder.center ).scale( 0.5 );	
			}
		} else {
			if ( leftLen == -1 || this.occluder.center.distanceTo( this.rightOption.toPos ) < leftLen ) {
				this.interDestPos = this.occluder.center.plus( this.rightOption.toPos ).scale( 0.5 ); 				
			}
		}
	} else {
		this.interDestPos = null;
	}
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