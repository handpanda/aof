/*
 * anim.js
 * 
 * Transition animations
 * 
 */

/*
 * anim1
 * 
 * string flies past several times, then a sweep from the bottom right
 * 
 */
function anim1( string ) {
	this.string = string; // The string to display
	
	this.width = 72 * 4;
	this.height = 72 + 20;
	
	this.posX = canvas.width;
	this.posY = canvas.height / 2 - this.height / 2;
	
	this.velX = -300;
	this.velY = 0;
	
	this.style = "italic 150px bolder fantasy";

	this.passes = 0;
	this.maxPasses = 1;

	this.removeThis = false;

	this.wipeY = 0;
	this.wipeYVel = -130;
	this.stripeWidth = 40;
	this.wipeStripes = canvasDiagonal / this.stripeWidth + 2;

	this.stage = 0;
}

anim1.prototype.complete = function() {
	this.stage = 3;
}

anim1.prototype.update = function() {
	switch ( this.stage ) {
		case 0:
			this.posX += this.velX;
			if (this.posX < -this.width) {
				this.posX = canvas.width;
				this.velX *= 0.9;
				this.passes++;
			}
			if ( this.passes > this.maxPasses ) this.stage = 1;
			break;	
		case 1:
			this.posX = 0.8 * this.posX + 0.2 * (canvas.width / 2);
			if ( Math.abs( this.posX - canvas.width / 2 ) < 10 ) {
				this.stage = 2;
				this.posX = canvas.width / 2;
			}
			break;
		case 2:
			this.wipeY += this.wipeYVel;
			while ( this.wipeY < -canvasDiagonal - this.stripeWidth * 2 ) this.wipeY += this.stripeWidth * 2;
			break;
		case 3:
			this.wipeY += this.wipeYVel;
			if ( this.wipeY < -canvasDiagonal * 2 ) this.removeThis = true;
			break;
	}
}

anim1.prototype.render = function( context ) {
	if ( this.stage < 3 || this.wipeY > -canvasDiagonal ) {
		context.font = this.style;
		context.strokeStyle = 'white';
		context.lineWidth = 15;
		context.strokeText( this.string, this.posX, this.posY );
		context.fillStyle = 'red';
		context.fillText( this.string, this.posX, this.posY );
	}
	context.save();
	context.translate( canvas.width, canvas.height );
	context.rotate( -Math.PI / 4 );
	context.translate( -canvasDiagonal, 0);
	for ( var y = 0; y < this.wipeStripes; y++ ) {
		if ( y % 2 ) context.fillStyle = 'red';
		else context.fillStyle = 'white';

		context.fillRect( 0, this.wipeY + y * this.stripeWidth, canvasDiagonal * 2, this.stripeWidth);
	}
	context.restore();
}

anim1.prototype.loop = function() {
	this.update();
	this.render( context );
}

function anim2( string ) {
	this.string = string;
	
	this.width = 72 * 4;
	this.height = 72 + 20;

	this.middle = canvas.height / 2 + this.height / 2;
	this.bottom = canvas.height + 120;
	
	this.posX = canvas.width / 2;
	this.posY = this.bottom;

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
	this.wipeStripes = canvasDiagonal / this.stripeWidth + 2;
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
			while ( this.wipeY < -canvasDiagonal - this.stripeWidth * 2 ) this.wipeY += this.stripeWidth * 2;
			break;
		case 3:
			this.wipeY += this.wipeYVel;
			if ( this.wipeY < -canvasDiagonal * 2 ) this.removeThis = true;
			break;
	}		
}

anim2.prototype.render = function( context ) {
	context.font = this.style;
	context.lineWidth = 15;	
	context.fillStyle = 'blue';	
	context.strokeStyle = 'white';
	
	if ( this.stage > 0 && ( this.stage < 3 || this.wipeY > -canvasDiagonal)) {
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
				context.translate( 0, canvas.height );
				context.rotate( Math.PI / 4 );
				context.translate( -canvasDiagonal, 0);
				for ( var y = 0; y < this.wipeStripes; y++ ) {
					if ( y % 2 ) context.fillStyle = 'blue';
				else context.fillStyle = 'white';
				
					context.fillRect( 0, this.wipeY + y * this.stripeWidth, canvasDiagonal * 2, this.stripeWidth);
				}
			context.restore();
		}
	}
}

anim2.prototype.loop = function() {
	this.update();
	this.render( context );
}

