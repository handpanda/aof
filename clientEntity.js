/*

	clientclientEntity.js - client-side entities 
	
*/

// Specifications for objects
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

var direction = {
	none  : 0,//{ x:  0, y:  0 },
	left  : 1,//{ x: -1, y:  0 },
	right : 2,//{ x:  1, y:  0 }, 
	up    : 3,//{ x:  0, y: -1 },
	down  : 4,//{ x:  0, y:  1 },
}

var contact = function(dir) {
	this.dir = dir;
}

/*
	Stages of a kick (UNIMPLEMENTED)
*/
var kickState = {
	idle: 0,
	charging: 1,
	lofting: 2,
	lofted: 3,
	kicking: 4,
}

/*
	Player actions and how they are related
*/	
var ACT = {
	STAND: 0,
	RUN: 1,
	KICK: 2,
	SLIDE: 3,
	PUNT: 4,

	ACTIONS: 5, // Total number of actions

	
	// Can a player doing action A switch to action B?
	// from:	STAND	RUN	KICK	SLIDE	PUNT
	transfer: [	true, 	true, 	true, 	true,	true,  // to:	STAND
		   	true, 	true, 	true, 	false,  true,  // 	RUN
		   	true, 	true, 	false, 	false,	false, //	KICK
		   	true, 	true, 	false, 	false,	false, // 	SLIDE
			true,	true,	false,  false,  false, //	PUNT
								],

	canTransfer: function(fromaction, toaction) {
		return ACT.transfer[fromaction + toaction * ACT.ACTIONS];
	},

	// Can a player doing some action move freely (i.e with the arrow keys) ?
	canAccelerate: function(action) {
		switch (action) {
		case ACT.STAND:
		case ACT.RUN:
		case ACT.KICK:
			return true;
		case ACT.SLIDE:
		case ACT.PUNT:
			return false;
		}
	}
}

// Kinds of players, will be used for AI (UNIMPLEMENTED)
var CLASS = {
	GOALKEEPER: 0,
	DEFENCEMAN: 1,
	MIDFIELDER: 2,
	STRIKER:    3,
}

var idstat = 0;

/*
	One of the objects in the game - ball, player, field region
*/
var clientEntity = function(pos, objtype, side) {
	this.type = type.ball;
	if ( objtype !== undefined ) this.type = 	objtype;
	this.pos = new Vec2( 0, 0 );
	if ( pos !== undefined ) this.pos = 	pos;
	this.width =	this.type.width;
	this.height = 	this.type.height;
	this.id = 	idstat++;
	this.clientid = 0;
	this.ping = 0;
	this.angle = 	0.0;
	this.center =   new Vec2(this.pos.x + this.width / 2, this.pos.y + this.width / 2);
	this.facedir = 	new Vec2(Math.cos(this.angle), Math.sin(this.angle));
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
	this.facedir =	data.facedir;
	this.kick = 	data.kick;
	this.side = 	data.side;
	this.action = 	data.action;
	this.class = 	data.class;
	this.ping = 	data.ping;
}