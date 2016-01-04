var Game = require( "./Game.js" );
var nations = require( "./nations.js" );

createRandom = {};

function randElement( array ) {
	return array[ Math.floor( Math.random() * array.length ) ];
}

module.exports = createRandom;