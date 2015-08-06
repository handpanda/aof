define( ["jquery", "screens", "nations", "client/sendEvent" ], function($, screens, nations, sendEvent ) {

var menudims = {
	list: { name: 'list', xPos: 0, yPos: 0, width: 500},
	exitbutton: { name: 'exitbutton', xPos: 5, yPos: 5, width: 300},
	score: { name: 'score', xPos: 305, yPos: 5, width: 500},
}

var Menu = function() {
	this.gameList = [];
	this.vScroll = 0;
	
	this.currentScreen = screens.LIST;

	this.statusString = "";
	
	this.y = 0;

	this.registerHandlers();
}	

Menu.prototype.clearGameList = function() {
	this.gameList = [];
}

Menu.prototype.addGame = function( game ) {
	var found = false;
			
	for (g in this.gameList) {
		if (game.id == this.gameList[g].id) {
			found = true;
			break;
		}
	}		
	
	if ( !found ) {
		this.gameList.push( game );
	}
}

Menu.prototype.switchScreen = function( target ) {
	sendEvent( "switch-screen", { toScreen: target });
}

Menu.prototype.registerHandlers = function() {
	var _this = this;

	document.addEventListener( "switch-screen", function( e ) {
		_this.currentScreen = e.detail.toScreen;

		_this.refresh();
	});
}

Menu.prototype.refresh = function() {
	this.y = menudims.list.yPos + this.vScroll;
	
	var textbox;

	console.log('refresh');
	console.log(this.gameList.length);
	
	var team1image = document.getElementById("team1image");
	var team2image = document.getElementById("team2image");

	var team1Nation = nations[0];
	var team2Nation = nations[0];

	switch (this.currentScreen) {
		case screens.TITLE:
			console.log('title');
			break;
		case screens.LIST:
			var center = $( "#center" );

			center.empty();

			center.append( "AGE OF FOOTBALL" );

			var newGameButton = document.createElement( "div" );

			newGameButton.setAttribute("class", "row-fluid buffer" );

			var _this = this;

			newGameButton.onclick = function() {
				_this.switchScreen(screens.NEWGAMETEAM1);
			}

			newGameButton.innerHTML = "New Game";

			center.append( $( newGameButton ) );

			// List of games in progress
			for (g in this.gameList) {
				var game = this.gameList[g];

				var joinGameButton = document.createElement( "div" );

				joinGameButton.setAttribute("class", "row-fluid buffer" );
				
				joinGameButton.onclick = function() {
					sendEvent( "attempt-join-game", { id: game.id } );
				}

				joinGameButton.innerHTML = this.gameList[g].team1Nation.name + " vs " + this.gameList[g].team2Nation.name;
			
				center.append( $( joinGameButton ) );
			}
			break;
		case screens.NEWGAMETEAM1:
			console.log('new game');
			
			var center = document.getElementById( "center" );
			var row = document.createElement( "div" );

			center.innerHTML = "";

			center.innerHTML += "Choose Teams";

			var left = document.createElement("div");
			left.setAttribute("class", "span6");

			var right = document.createElement("div");
			right.setAttribute("class", "span6");

			//left.innerHTML += "Team 1";
			//right.innerHTML += "Team 2";

			center.appendChild(row);
			row.appendChild(left);
			row.appendChild(right);		

			for (n in nations) {
				var div = document.createElement("div");
					div.setAttribute("class", "row buffer");

					div.teamNation = nations[n];
					div.imageName = nations[n].img;

					div.onclick = function() {
						team1Nation = this.teamNation;
						team1image.src = this.imageName;
					};
					div.innerHTML = nations[n].name;
				left.appendChild(div);
			}

			for (n in nations) {
				var div = document.createElement("div");
					div.setAttribute("class", "row buffer");

					div.teamNation = nations[n];
					div.imageName = nations[n].img;

					div.onclick = function() {
						team2Nation = this.teamNation;
						team2image.src = this.imageName;
					};
					div.innerHTML = nations[n].name;
				right.appendChild(div);
			}

			var div = document.createElement("div");
				div.setAttribute("class", "row buffer");

				div.onclick = function() {
					sendEvent( "attempt-add-game", { team1Nation: team1Nation, team2Nation: team2Nation } );

					sendEvent( "switch-screen", { toScreen: screens.LIST } );
				};

				div.innerHTML = "Start";
			center.appendChild( div );

			break;
		case screens.GAME:
			var center = document.getElementById( "center" );

			center.innerHTML = "";

			var div = document.createElement("div");
				div.setAttribute("class", "span12");
				div.setAttribute("style", "background-color:purple");

				div.onclick = function() {
					var e = new Event( "leave-game" );
					document.dispatchEvent( e );
				};

				div.innerHTML = "Back to Lobby";
			center.appendChild( div );

			break;
	}
}

Menu.prototype.setStatusString = function( string ) {
	this.statusString = string;
}

return Menu;

});