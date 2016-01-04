var Game = require('./Game.js');
var Team = require('./Team.js');
var nations = require('./nations.js');
var discrete = require('./discrete.js');
var createRandom = require('./createRandom.js');

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
Lobby.prototype.addGame = function(team1Nation, team2Nation) {
	var game = new Game(new Team(team1Nation, 'left'), new Team(team2Nation, 'right'), []);
	game.addAIPlayers( this.hPlayers, this.vPlayers );
	
	this.games.push( game );
	console.log('Lobby: ' + 'added game ' + game.id + ': ' + team1Nation.name + ' v ' + team2Nation.name );
	
	return game.id;
}
	
// Make a new game between two random teams
Lobby.prototype.addRandomGame = function() {
	var leftTeamNation, rightTeamNation;
	leftTeamNation = discrete.randElem(nations);
	do {
		rightTeamNation = discrete.randElem(nations);
	} while (rightTeamNation == leftTeamNation);

	this.addGame(leftTeamNation, rightTeamNation);		
}

Lobby.prototype.getClientGameList = function() {
	// Make a list of the games currently happening
	var gameList = [];
	
	for (g in this.games) {
		gameList.push( this.games[g].getClientData() );
	} 	
	
	return gameList;
}

module.exports = Lobby;
