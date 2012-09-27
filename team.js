var team = function(name, side) {
	this.name = name;
	this.side = side;

	this.players = [];

	this.log = function() {
		console.log('Team: ' + this.name + ', ' + this.side);
	}
}

var names = [ 'Chinese', 'Romans', 'Aztecs', 'Vikings', 'Mongols', 'Cossacks' ]; 

module.exports.team = team;
module.exports.names = names;
