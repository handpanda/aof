var room = function(pos, width, height) {
	// Dimensions are in units of tiles
	this.pos = pos;
	this.width = width;
	this.height = height;

	
	// Update with data from the server
	this.grab = function(data) {
		this.pos = data.pos;
		this.width = data.width;
		this.height = data.height;
	}
}

module.exports.room = room;
