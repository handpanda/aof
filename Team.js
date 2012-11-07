/*
	Team

	One of the groups of players in a game
*/

var Team = function(name, side) {
	this.name = name;
	this.side = side;

	this.log = function() {
		console.log('Team: ' + this.name + ', ' + this.side);
	}
}

var names = [ 'Chinese', 'Romans', 'Aztecs', 'Vikings', 'Mongols', 'Cossacks' ]; 

module.exports.Team = Team;
module.exports.names = names;
