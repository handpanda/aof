type = {
	GOAL: 0,
	GOALKICK: 1,
	THROWIN: 2,
	CORNERKICK: 3,
}

var event = function(side, eventtype) {
	this.side = side;
	this.type = eventtype;
}

module.exports.type = type;
module.exports.event = event;
