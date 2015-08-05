/*
 * anim1
 * 
 * The string flies past several times, then a sweep from the bottom right
 * 
 * Arguments:
 * 	string - the string to display
 *  color - the primary color to use
 * 
 */
define ( ["juego/ScrollBox"], function( ScrollBox ) {

var anim1 = function( string, color, ScrollBox ) {
	this.string = string; // The string to display
	
	this.width = 72 * 4; // Width of the text
	this.height = 72 + 20; // Height of the text
	
	this.textStartX = ScrollBox.viewportW;
	this.textEndX = ScrollBox.viewportW / 2;
	
	this.posX = this.textStartX; // Horizontal position of the text
	this.posY = ScrollBox.viewportH / 2 - this.height / 2; // Vertical position of the text 
	
	this.bottom = ScrollBox.viewportH;
	this.right = ScrollBox.viewportW;
	
	this.diagonalDistance = ScrollBox.canvasDiagonal;
	
	this.velX = -300; // Horizontal velocity of the text 
	this.velY = 0; // Vertical velocity of the text
	
	this.color = color; // Primary color of the text and wipe
	this.style = "italic 150px bolder fantasy"; // Text style

	this.passes = 0; // How many times the text has crossed the screen
	this.maxPasses = 1; // How many passes to allow before starting the wipe

	this.removeThis = false; // Whether or not the animation is over

	// The wipe is a bunch of stripes in alternating colors	
	this.wipeY = 0; // Vertical position of the wipe (rotated 45 degrees counterclockwise)
	this.wipeYVel = -130; // Vertical velocity of the wipe
	this.stripeWidth = 40; // Stripe thickness, in pixels 
	this.wipeStripes = this.diagonalDistance / this.stripeWidth + 2; // Enough stripes to fill the screen diagonally

	this.stage = 0; // Which part of the animation we are on
}

anim1.prototype.complete = function() {
	this.stage = 3; // Go to the last stage
}

anim1.prototype.update = function() {
	switch ( this.stage ) {
		// Stage 0: Text making multiple passes
		case 0:
			// Move the text
			this.posX += this.velX;
			
			// Wrap the text horizontally
			if (this.posX < -this.width) {
				this.posX = this.textStartX;
				this.velX *= 0.9;
				this.passes++;
			}
			
			// Move to the next stage if we've made enough passes
			if ( this.passes > this.maxPasses ) this.stage = 1;
			
			break;
			
		// Stage 1: Text stops in the middle of the screen	
		case 1:
			// Slide towards the center 
			this.posX = 0.8 * this.posX + 0.2 * this.textEndX;
			
			// If we're at the center, go to the next stage
			if ( Math.abs( this.posX - this.textEndX) < 10 ) {
				this.stage = 2;
				this.posX = this.textEndX;
			}
			
			break;
			
		// Stage 2: Wiping endlessly
		case 2:
			
			// Move the wipe
			this.wipeY += this.wipeYVel;
			
			// Wrap the wipe so it looks like it's going on forever
			while ( this.wipeY < -this.diagonalDistance - this.stripeWidth * 2 ) this.wipeY += this.stripeWidth * 2;
			
			break;
			
		// Stage 3: Wipe transition back to the game
		case 3:
		
			// Move the wipe
			this.wipeY += this.wipeYVel;
			
			// If the wipe has moved completely off-screen, end the animation
			if ( this.wipeY < -this.diagonalDistance * 2 ) this.removeThis = true;
			
			break;
	}
}

anim1.prototype.render = function( context ) {
	context.textAlign = 'center';
	
	if ( this.stage < 3 || this.wipeY > -this.diagonalDistance ) {
		context.font = this.style;
		context.strokeStyle = 'white';
		context.lineWidth = 15;
		context.strokeText( this.string, this.posX, this.posY );
		context.fillStyle = this.color;
		context.fillText( this.string, this.posX, this.posY );
	}
	
	context.save();
	context.translate( this.right, this.bottom );
	context.rotate( -Math.PI / 4 );
	context.translate( -this.diagonalDistance, 0);
	for ( var y = 0; y < this.wipeStripes; y++ ) {
		if ( y % 2 ) context.fillStyle = this.color;
		else context.fillStyle = 'white';

		context.fillRect( 0, this.wipeY + y * this.stripeWidth, this.diagonalDistance * 2, this.stripeWidth);
	}
	context.restore();
}

anim1.prototype.loop = function() {
	this.update();
	this.render( context );
}

return anim1;

});