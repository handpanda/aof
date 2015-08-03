/*
	Team

	One of the groups of players in a game
*/

var Team = function(nation, side) {
	this.side = side;
	this.nation = nation;
}

var nations = [
	pru = { name: 'Dnieper Cossacks', img: 'img/cossacks50.png' },
	cos = { name: 'Kingdom of Prussia', img: 'img/prussia50.png' },
	pol = { name: 'Polish Home Army', img: 'img/poland50.png' },
	swe = { name: 'Swedish Empire', img: 'img/sweden50.png' },
]

module.exports.Team = Team;
module.exports.nations = nations;
