/*

	Entity.js - physical game Entity
	
*/
var dims = require("./dims.js");
var type = require("./type.js");

var idstat = 0;

/*
	One of the Entity in the game - ball, player, field region
*/
var Entity = function(pos, objtype, side) {
	this.type = type.ball;
	if ( objtype !== undefined ) this.type = 	objtype;
	this.pos = new Vec2( 0, 0 );
	if ( pos !== undefined ) this.pos = 	pos;
	this.width =	this.type.width;
	this.height = 	this.type.height;
	
	this.id = 	idstat++;
	this.clientid = 0;
	this.msecsSinceLastPing = 0;
	this.latency = 0;
	this.angle = 	0.0;
	this.center =   new Vec2(this.pos.x + this.width / 2, this.pos.y + this.width / 2);
	this.centerToPos = this.center.minus(this.pos);
	this.facedir = 	new Vec2(Math.cos(this.angle), Math.sin(this.angle));
	this.vel = 	new Vec2(0, 0);
	this.speed = 	0;
	this.topSpeed = 0;
	this.class = 	0;
	this.side = 	side;
	this.z = 0;
	this.velZ = 0;

	this.isAuto = false;
	this.anchor = this.pos.copy();
	this.radius = 0;
}

// Update reference values for the object
Entity.prototype.update = function() {
	this.center.x =  this.pos.x + this.width / 2;
	this.center.y =  this.pos.y + this.height / 2;
	this.facedir.x = Math.cos(this.angle);
	this.facedir.y = Math.sin(this.angle);	
}

// Check for overlap with another object (both are modeled as rectangles with (x, y) in the top left corner)
Entity.prototype.overlaps = function(otherObject) {
	if (	this.pos.x + this.width  + this.vel.x > otherObject.pos.x 		       + otherObject.vel.x &&
		this.pos.x		 + this.vel.x < otherObject.pos.x + otherObject.width  + otherObject.vel.x &&
		this.pos.y + this.height + this.vel.y > otherObject.pos.y 		       + otherObject.vel.y &&
		this.pos.y 		 + this.vel.y < otherObject.pos.y + otherObject.height + otherObject.vel.y ) {
		return true;
	}	

	return false;			
}

module.exports = Entity;
