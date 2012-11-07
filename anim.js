function goalAnim() {
	this.width = 72 * 4;
	this.height = 72 + 20;
	
	this.posX = canvas.width;
	this.posY = canvas.height / 2 - this.height / 2;
	
	this.string = "GOAL";

	this.velX = -300;
	this.velY = 0;
	
	this.style = "italic 150px bolder fantasy";

	this.passes = 0;

	this.removeThis = false;

	this.wipeY = 0;
	this.wipeYVel = -130;
	this.stripeWidth = 40;
	this.wipeStripes = canvasDiagonal / this.stripeWidth + 2;

	this.stage = 0;
}

goalAnim.prototype.complete = function() {
	this.stage = 3;
}

goalAnim.prototype.update = function() {
	switch ( this.stage ) {
		case 0:
			this.posX += this.velX;
			if (this.posX < -this.width) {
				this.posX = canvas.width;
				this.velX *= 0.9;
				this.passes++;
			}
			if ( this.passes > 5 ) this.stage = 1;
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

goalAnim.prototype.render = function( context ) {
	if ( this.stage < 3 ) {
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

goalAnim.prototype.loop = function() {
	this.update();
	this.render( context );
}

function goalKickAnim() {
	this.width = 72 * 4;
	this.height = 72 + 20;
	
	this.posX = canvas.width / 2;
	this.posY = canvas.height + 120;
	
	this.string = "GOAL KICK";

	this.velX = 0;
	this.velY = -50;
	
	this.style = "italic 120px bolder fantasy";

	this.removeThis = false;
}

goalKickAnim.prototype.complete = function() {
	this.removeThis = true;
}

goalKickAnim.prototype.update = function() {
	this.posY += this.velY;
}

goalKickAnim.prototype.render = function( context ) {
	context.font = this.style;
	context.strokeStyle = 'white';
	context.lineWidth = 15;
	context.strokeText( this.string, this.posX, this.posY );
	context.fillStyle = 'blue';
	context.fillText( this.string, this.posX, this.posY );

	context.fillRect( 0, this.posY + 60, canvas.width, canvas.height * 3);
}

goalKickAnim.prototype.loop = function() {
	this.update();
	this.render( context );
}

