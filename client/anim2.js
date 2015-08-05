define ( ["juego/ScrollBox"], function( ScrollBox ) {

var anim2 = function( string, color, ScrollBox ) {
	this.color = color;
	this.string = string;
	
	this.width = 72 * 4;
	this.height = 72 + 20;

	this.textStartX = ScrollBox.viewportW / 2;
	this.textEndX = ScrollBox.viewportW / 2;

	this.middle = ScrollBox.viewportH / 2 + this.height / 2;
	this.bottom = ScrollBox.viewportH + 120;
	
	this.posX = this.textStartX;
	this.posY = this.bottom;

	this.diagonalDistance = ScrollBox.canvasDiagonal;

	this.velX = 0;
	this.velY = -50;
	
	this.wipeVel = -25;
	
	this.style = "italic 120px bolder fantasy";

	this.removeThis = false;
	
	this.stage = 0;
	
	this.passes = 0;
	this.maxPasses = 2;
	
	this.bulge = 0.0;
	
	this.wipeY = 0;
	this.wipeYVel = -130;
	this.stripeWidth = 40;
	this.wipeStripes = this.diagonalDistance / this.stripeWidth + 2;
}

anim2.prototype.complete = function() {
	this.stage = 3;
}
 
anim2.prototype.update = function() {
	this.bulge *= 0.7;	
	
	switch( this.stage ) {
		case 0:
			this.posY += this.velY;
			if ( this.posY < this.middle ) {
				this.stage = 1;
				this.bulge = 0.4;
				this.passes++;
				this.posY = this.bottom;
			}
			break;
		case 1:
			this.posY += this.velY;
			if ( this.posY < this.middle ) {
				this.bulge = 0.4;
				this.passes++;
				this.posY = this.bottom;
				if ( this.wipes > this.maxPasses ) this.stage = 2;
			}
			break;
		case 2:
			this.wipeY += this.wipeYVel;
			while ( this.wipeY < -this.diagonalDistance - this.stripeWidth * 2 ) this.wipeY += this.stripeWidth * 2;
			break;
		case 3:
			this.wipeY += this.wipeYVel;
			if ( this.wipeY < -this.diagonalDistance * 2 ) this.removeThis = true;
			break;
	}		
}

anim2.prototype.render = function( context ) {
	context.textAlign = 'center';
	
	context.font = this.style;
	context.lineWidth = 15;	
	context.fillStyle = this.color;	
	context.strokeStyle = 'white';
	
	if ( this.stage > 0 && ( this.stage < 3 || this.wipeY > -this.diagonalDistance)) {
		context.save();
			context.translate( this.posX, this.middle );
			context.scale( 1.0 + this.bulge, 1.0 + this.bulge );
			context.strokeText( this.string, 0, 0 );
			context.fillText( this.string, 0, 0 );
		context.restore();
	}
	if ( this.stage < 2 ) {
		context.strokeText( this.string, this.posX, this.posY );
		context.fillText( this.string, this.posX, this.posY );
	} else {
		if ( this.stage >= 2 ) {
			context.save();
				context.translate( 0, this.bottom );
				context.rotate( Math.PI / 4 );
				context.translate( -this.diagonalDistance, 0);
				for ( var y = 0; y < this.wipeStripes; y++ ) {
					if ( y % 2 ) context.fillStyle = this.color;
				else context.fillStyle = 'white';
				
					context.fillRect( 0, this.wipeY + y * this.stripeWidth, this.diagonalDistance * 2, this.stripeWidth);
				}
			context.restore();
		}
	}
}

anim2.prototype.loop = function() {
	this.update();
	this.render( context );
}

return anim2;

});