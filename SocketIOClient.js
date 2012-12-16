var Client = require( "./Client.js" );

var SocketIOClient = function( ioClient ) {
	Client.call( this );

	if ( ioClient === undefined ) return;

	this.ioClient = ioClient;

	this.address = ioClient.handshake.address.address;
	this.port = ioClient.handshake.address.port;
}

this.prototype = new Client();
this.prototype.constructor = SocketIOClient;

SocketIOClient.prototype.on = function( packetName, func ) {
	this.ioClient.on( packetName, func );
}

SocketIOClient.prototype.emit = function( packetName, packetData ) {
	this.ioClient.emit( packetName, packetData );
}

SocketIOClient.prototype.broadcast = function( packetName, packetData ) {
	this.ioClient.broadcast.emit( packetName, packetData );
}

module.exports = SocketIOClient;