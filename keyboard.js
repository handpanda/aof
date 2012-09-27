var state = {
	up: 0,
	hit: 1,
	held: 2,
}

var keys = {
	left  : state.up,
	right : state.up,
	up    : state.up,
	down  : state.up,
	z     : state.up,
	x     : state.up,
}

module.exports.state = state;
