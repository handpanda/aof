define( ["client/DivTable",
		 "client/DivRow"],

		function( DivTable, DivRow ) {

var playerColumnNames = ["id", "Team", "Goals", "Position"];

var GameRow = function( className, data ) {
	DivRow.call( this, className, data );

	// Add table of player names
	this.playerTable = new DivTable( "game-players", playerColumnNames);

	this.details.appendChild( this.playerTable.dom ); 
}
GameRow.prototype = new DivRow();
GameRow.prototype.constructor = GameRow;

GameRow.prototype.parseGame = function( game ) {
	this.data.id = game.id;
	this.data.Score = game.team1Nation.shortname + " " + 0 + " - " + 0 + " " + game.team2Nation.shortname;

	var seconds = Math.floor( (Date.now() - game.startTime ) / 1000 );

	this.data.Time = Math.floor( seconds / 60 ) + ":" + seconds % 60;
	this.data.Players = 0 + "/12";

	this.data.actions = ["Join", "Spectate", "Delete"];
}

return GameRow

});