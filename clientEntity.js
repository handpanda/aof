/*

	clientclientEntity.js - client-side entities 
	
*/

// Specifications for Entity
var type = {
	player    : { name: 'player', width: 40  , height: 40, color: 'white' },
	ball      : { name: 'ball', width: 25  , height: 25, color: 'white' },
	field     : { name: 'field', width: dims.fieldLength, height: dims.fieldWidth, color: 'green' },
	sideline  : { name: 'sideline', width: dims.fieldLength - dims.sidelineWidth / 2, height: dims.sidelineWidth, color: 'blue' },
	backline  : { name: 'backline', width: dims.backlineWidth, height: dims.fieldWidth, color: 'red' },
	goal      : { name: 'goal', width: dims.goalDepth , height: dims.goalWidth, color: 'yellow' },
	goalieBox : { name: 'goalieBox', width: dims.goalieBoxDepth , height: dims.goalieBoxWidth, color: 'purple' },
	goalSide  : { name: 'goalSide', width: dims.sidelineWidth, height: dims.postWidth },
	goalBack  : { name: 'goalBack', width: dims.postWidth, height: dims.goalWidth },
}

/*
	One of the Entity in the game - ball, player, field region
*/
var clientEntity = function(pos, objtype, side) {
	this.type = type.ball;
	if ( objtype !== undefined ) this.type = 	objtype;
	this.pos = new Vec2( 0, 0 );
	if ( pos !== undefined ) this.pos = 	pos;
	this.width =	this.type.width;
	this.height = 	this.type.height;
	this.id = -1;
	this.clientid = -1;
	this.latency = 0;
	this.msecsSinceLastPing = 0;
	this.angle = 	0.0;
	this.center =   new Vec2(this.pos.x + this.width / 2, this.pos.y + this.width / 2);
	this.faceDir = 	new Vec2(Math.cos(this.angle), Math.sin(this.angle));
	this.action  = 	ACT.STAND;
	this.vel = 	new Vec2(0, 0);
	this.class = 	0;
	this.side = 	side;
	this.z = 0;
	this.velZ = 0;
}

// Draw the object
clientEntity.prototype.draw = function(context) {
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

// Get updated values from the server
clientEntity.prototype.grab = function(data) {
	this.type = 	data.type;
	this.pos = 	 	data.pos;	
	this.vel = 	 	data.vel;
	this.z = 	 	data.z;
	this.velZ =	 	data.velZ;
	this.width = 	data.width;
	this.height = 	data.height;	
	this.angle = 	data.angle;
	this.center =	data.center;
	this.faceDir =	data.faceDir;
	this.kick = 	data.kick;
	this.side = 	data.side;
	this.action = 	data.action;
	this.class = 	data.class;
	this.latency = 	data.latency;
	this.msecsSinceLastPing = data.msecsSinceLastPing;
}