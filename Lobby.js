var Game = require('./Game.js');
var team = require('./Team.js');
var discrete = require('./discrete.js');

/*
	Main Menu
*/
var Lobby = function() {
	// List of games
	this.games = [];
	this.hPlayers = 4;
	this.vPlayers = 2;
}

Lobby.prototype.setDefaultPlayerCount = function( hPlayers, vPlayers ) {
	this.hPlayers = hPlayers;
	this.vPlayers = vPlayers;
}

// Make new game between two specific teams
Lobby.prototype.addGame = function(team1Name, team2Name) {
	var game = new Game(new team.Team(team1Name, 'left'), new team.Team(team2Name, 'right'), []);
	game.addAIPlayers( this.hPlayers, this.vPlayers );
	
	this.games.push( game );
	console.log('Lobby: ' + 'added game ' + game.id + ': ' + team1Name + ' v ' + team2Name );
	
	return game.id;
}
	
// Make a new game between two random teams
Lobby.prototype.addRandomGame = function() {
	var leftTeamName, rightTeamName;
	leftTeamName = discrete.randElem(team.names);
	do {
		rightTeamName = discrete.randElem(team.names);
	} while (rightTeamName == leftTeamName);

	this.addGame(leftTeamName, rightTeamName);		
}

module.exports = Lobby;
