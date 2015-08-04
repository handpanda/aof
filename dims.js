if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define( [], function() {

var dims = {
	
	// Field reference dimensions
	fieldLength : 2000,
	fieldWidth : 1000,
	goalWidth : 300,
	goalDepth : 150,
	sidelineWidth : 150,
	backlineWidth: 300,
	goalieBoxWidth : 400,
	goalieBoxDepth : 200,
	postWidth: 10,
	borderWidth: 15,
	centerRadius: 200,

	// Object reference dimensions
	manWidth : 40,
	manHeight : 40,
	manDepth : 30,
	legWidth : 10,
	strideLength : 30, 
	legLength : 30,
	headWidth : 25,
	headLength : 30,
}

return dims;

});