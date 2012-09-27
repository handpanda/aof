var game = require('./game.js');
var team = require('./team.js');
var discrete = require('./discrete.js');

var lobby = function() {
	this.games = [];

	this.addGame = function(team1Name, team2Name) {
		this.games.push(new game.game(new team.team(team1Name, 'left'), new team.team(team2Name, 'right'), []));
	}

	this.addRandomGame = function() {
		var leftTeamName, rightTeamName;
		leftTeamName = discrete.randElem(team.names);
		do {
			rightTeamName = discrete.randElem(team.names);
		} while (rightTeamName == leftTeamName);

		this.addGame(leftTeamName, rightTeamName);		
	}
};

module.exports.lobby = lobby;
