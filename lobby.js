var game = require('./game.js');
var team = require('./Team.js');
var discrete = require('./discrete.js');

/*
	Main Menu
*/
var lobby = function() {
	// List of games
	this.games = [];
}

// Make new game between two specific teams
lobby.prototype.addGame = function(team1Name, team2Name) {
	this.games.push(new game.game(new team.Team(team1Name, 'left'), new team.Team(team2Name, 'right'), []));
}
	
// Make a new game between two random teams
lobby.prototype.addRandomGame = function() {
	var leftTeamName, rightTeamName;
	leftTeamName = discrete.randElem(team.names);
	do {
		rightTeamName = discrete.randElem(team.names);
	} while (rightTeamName == leftTeamName);

	this.addGame(leftTeamName, rightTeamName);		
}

module.exports.lobby = lobby;
