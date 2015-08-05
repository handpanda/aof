if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define( [], function() {

var Event = function(side, eventtype) {
	this.side = side;
	this.type = eventtype;
}

Event.prototype.TYPE = {
	GOAL: 0,
	GOALKICK: 1,
	THROWIN: 2,
	CORNERKICK: 3,
	ENDOFGAME: 4,
}

return Event;

});