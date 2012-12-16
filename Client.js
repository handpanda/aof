var Client = function() {
	this.ident = 0;
	this.msecsSinceLastPing = 0;
	this.latency = 0;

	this.address = 0;
	this.port = 0;
}

Client.prototype.emit = function( packetName, packetData ) {
	
}

Client.prototype.broadcast = function( packetName, packetData ) {
	
}

module.exports = Client;