if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define( [], function() {

var screens = {
	TITLE: 0,
	LIST: 1,
	HOWTO: 2,
	GAME: 3,
	NEWGAMETEAM1: 4,
	NEWGAMETEAM2: 5,
	RESULT: 6,
};

return screens;

});