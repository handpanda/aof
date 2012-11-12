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

module.exports = Event;
