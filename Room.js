if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define ( [], function() {

var Room = function(pos, width, height) {
	// Dimensions are in units of tiles
	this.pos = pos;
	this.width = width;
	this.height = height;
}
	
// Update with data from the server
Room.prototype.grab = function(data) {
	this.pos = data.pos;
	this.width = data.width;
	this.height = data.height;
}

return Room;

});