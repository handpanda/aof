/*

	ClientEntity.js - client-side entities 
	
*/
define( ["juego/Vec2", "dims", "Act", "type"], function( Vec2, dims, ACT, entityType ) {

/*
	One of the Entity in the game - ball, player, field region
*/
var ClientEntity = function(pos, objtype, side) {
	this.type = entityType.ball;
	if ( objtype !== undefined ) this.type = 	objtype;

	this.pos = new Vec2( 0, 0 );
	if ( pos !== undefined ) this.pos = 	pos;
	this.vel = new Vec2( 0, 0 );
	this.width =	this.type.width;
	this.height = 	this.type.height;
	this.id = -1;
	this.team = null;
	this.clientid = -1;
	this.latency = 0;
	this.msecsSinceLastPing = 0;
	this.angle = 	0.0;
	this.center =   new Vec2(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
	this.action = 	ACT.STAND;
	this.side = 	side;
	this.z = 0;
	this.velZ = 0;
	this.sprinting = false;

	console.log( "hello" );

	this.updateSides();
}

// Update intrinsic values of the entity
ClientEntity.prototype.updateSides = function() {
	this.center.setValues( this.pos.x + this.width / 2, this.pos.y + this.height / 2 );	
	
	this.left = this.pos.x + this.vel.x;
	this.right = this.pos.x + this.width + this.vel.x;
	this.top = this.pos.y + this.vel.y;
	this.bottom = this.pos.y + this.height + this.vel.y;
}

// Draw the object
ClientEntity.prototype.draw = function(context) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.fillStyle = this.type.color;
			if (this.side == 'left') context.fillStyle = 'blue';
			if (this.side == 'right') context.fillStyle = 'red';				

			context.fillRect( this.pos.x, this.pos.y, this.width, this.height );
		context.restore();
	context.restore();
}

ClientEntity.prototype.drawRect = function( context ) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.rotate( this.angle );
		context.save();
			context.fillRect( 0, 0, this.width, this.height );
		context.restore();
	context.restore();	
	
	context.lineWidth = 3;
	context.strokeStyle = 'blue';

	context.beginPath();
		
		context.moveTo( this.maxLeft, this.maxTop );
		context.lineTo( this.maxRight, this.maxTop );
		context.lineTo( this.maxRight, this.maxBottom );
		context.lineTo( this.maxLeft, this.maxBottom );
		context.closePath();
	context.stroke();
}

// Get updated values from the server
ClientEntity.prototype.grab = function(data) {
	this.type = 	data.type;
	this.pos = 	 	data.pos;
	this.team =   data.team;
	this.z = 	 	data.z;
	this.velZ =	 	data.velZ;
	this.width = 	data.width;
	this.height = 	data.height;	
	this.angle = 	data.angle;
	this.dir = 	data.dir;
	this.side = 	data.side;
	this.action = 	data.action;
	this.latency = 	data.latency;
	this.stamina =	data.stamina;
	this.sprinting = data.sprinting;
	this.msecsSinceLastPing = data.msecsSinceLastPing;
}

// Test whether this entity overlaps another
ClientEntity.prototype.overlaps = function( otherEntity ) {
	var left1 = this.pos.x + this.vel.x;
	var left2 = otherEntity.pos.x + ( otherEntity.vel.x < 0 ? otherEntity.vel.x : 0 );
	var right1 = this.pos.x + this.width + this.vel.x;
	var right2 = otherEntity.pos.x + otherEntity.width + ( otherEntity.vel.x > 0 ? otherEntity.vel.x : 0 );
	var top1 = this.pos.y + this.vel.y;
	var top2 = otherEntity.pos.y + ( otherEntity.vel.y < 0 ? otherEntity.vel.y : 0 );
	var bottom1 = this.pos.y + this.height + this.vel.y;
	var bottom2 = otherEntity.pos.y + otherEntity.height + ( otherEntity.vel.y > 0 ? otherEntity.vel.y : 0 );
	
	if ((bottom1 > top2) &&
		(top1 < bottom2) &&
		(right1 > left2) &&
		(left1 < right2)) { 
	
		// The two objects' collision boxes overlap
		return true;
	}
	
	// The two objects' collision boxes do not overlap
	return false;
}

ClientEntity.prototype.containsPoint = function( point ) {
	var p = point.minus( this.pos );
	p.rotate( this.angle );
	p.add( this.pos );
	
	if ( p.x >= this.left && p.x <= this.right && p.y >= this.top && p.y <= this.bottom ) return true;
	else return false;
}

ClientEntity.prototype.hBound = function( point ) {
	var p = point.minus( this.pos );
	p.rotate( this.angle );
	p.add( this.pos );
	
	if ( p.x < this.left ) return -1;
	else if ( p.x > this.right ) return 1;
	else return 0;	
}

ClientEntity.prototype.vBound = function( point ) {
	var p = point.minus( this.pos );
	p.rotate( this.angle );
	p.add( this.pos );
	
	if ( p.y < this.top ) return -1;
	else if ( p.y > this.bottom ) return 1;
	else return 0;	
}

ClientEntity.prototype.setValues = function( values ) {
	if ( values === undefined ) return;
	
	for ( key in values ) {
		if ( this[key] === undefined ) {
			console.warn("/EnvInfo/: undefined parameter " + key);
			continue;
		}
		
		var currentValue = this[key];
		var newValue = values[key];
		
		if ( currentValue instanceof Vec2 ) {
			this[key].set( newValue );
		} else {
			this[key] = newValue;
		}
	}
}

return ClientEntity;

});