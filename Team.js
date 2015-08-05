/*
	Team

	One of the groups of players in a game
*/

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define( [], function() {

var Team = function(nation, side) {
	this.side = side;
	this.nation = nation;
}

return Team;

});