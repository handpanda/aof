eventType = {
	GOAL: 0,
	GOALKICK: 1,
	THROWIN: 2,
	CORNERKICK: 3,
}

var Event = function(side, eventtype) {
	this.side = side;
	this.type = eventtype;
}

module.exports.type = eventType;
module.exports.Event = Event;
