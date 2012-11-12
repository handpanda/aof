/*
	Team

	One of the groups of players in a game
*/

var Team = function(name, side) {
	this.name = name;
	this.side = side;
}

var names = [ 'Romans', 'Golden Horde', 'Mongols', 'Cossacks', 'Prussians', 'Spartans', 'Spanish Empire', 'Polish Home Army', 'French Resistance', 'Barbary Corsairs' ]; 

module.exports.Team = Team;
module.exports.names = names;
