define( ["juego/ScrollBox"], function( ScrollBox ) {

var AOFScrollBox = function( params ) {
	this.canvas = document.getElementById("main");
	this.context = this.canvas.getContext("2d");
	
	this.currentRoom = null;
	this.canvasDiagonal = 0;

	ScrollBox.call( this, params );
}

AOFScrollBox.prototype = new ScrollBox();
AOFScrollBox.prototype.constructor = AOFScrollBox;

AOFScrollBox.prototype.clearCanvas = function() {
	this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
	this.context.beginPath();
}

AOFScrollBox.prototype.centerOn = function( x, y ) {
	this.setScroll( x - this.viewportW / 2, y - this.viewportH / 2 );
}

AOFScrollBox.prototype.getContext = function() {
	return this.context;
}

AOFScrollBox.prototype.getCurrentRoom = function() {
	return this.currentRoom;
}

AOFScrollBox.prototype.grabCurrentRoom = function( data ) {
	this.currentRoom.grab( data );
}

AOFScrollBox.prototype.setCurrentRoom = function( room ) {
	this.currentRoom = room;
}

AOFScrollBox.prototype.calcValues = function() {
	this.canvas.width = this.canvas.parentElement.offsetWidth;//window.innerWidth * 0.9;
	this.canvas.height = window.innerHeight * 0.9;

	this.canvasDiagonal = Math.sqrt( this.canvas.width * this.canvas.width + this.canvas.height * this.canvas.height );	

	this.viewportW = this.canvas.width;
	this.viewportH = this.canvas.height;
	
	if ( this.currentRoom == null ) {
		this.hPixels = this.canvas.width;
		this.vPixels = this.canvas.height; 
	} else {
		this.hPixels = this.currentRoom.width;
		this.vPixels = this.currentRoom.height;
	}	
}

return AOFScrollBox;

});