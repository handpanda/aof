define (["client/ClientEntity"], function ( ClientEntity ) {

var SightLine = function( fromPos, toPos ) {
	ClientEntity.call( this, new Vec2( 0, 0 ), type.none, '' );
	
// those eyes dig deep
	
	this.fromPos = fromPos.copy();
	this.toPos = toPos.copy();
	
	this.angle = Math.atan2( this.toPos.y - this.fromPos.y, this.toPos.x - this.fromPos.x );	
	this.width = toPos.distanceTo( this.fromPos );
	this.height = 40;
	
	var offset = 20;
	
	this.pos = this.fromPos.plus( new Vec2( offset, -this.height / 2 ).rotate( -this.angle ) );
	this.updateSides();
	
// You got me through that summer. I don't think I ever told you that.

	var topLeft = new Vec2( offset, -this.height / 2 );
	var topRight = new Vec2( offset + this.width, -this.height / 2);
	var bottomRight = new Vec2( offset + this.width, this.height / 2);
	var bottomLeft = new Vec2( offset, this.height / 2 );
	
	topLeft.rotate( -this.angle ).add( this.fromPos );
	topRight.rotate( -this.angle ).add( this.fromPos );
	bottomRight.rotate( -this.angle ).add( this.fromPos );
	bottomLeft.rotate( -this.angle ).add( this.fromPos );
	
	this.maxLeft = Math.min( topLeft.x, topRight.x, bottomRight.x, bottomLeft.x );
	this.maxRight = Math.max( topLeft.x, topRight.x, bottomRight.x, bottomLeft.x );
	this.maxTop = Math.min( topLeft.y, topRight.y, bottomRight.y, bottomLeft.y );
	this.maxBottom = Math.max( topLeft.y, topRight.y, bottomRight.y, bottomLeft.y );	
}

SightLine.prototype = new ClientEntity();
SightLine.prototype.constructor = SightLine;

});