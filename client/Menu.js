define( ["jquery", "screens", "nations" ], function($, screens, nations) {

var menudims = {
	list: { name: 'list', xPos: 0, yPos: 0, width: 500},
	exitbutton: { name: 'exitbutton', xPos: 5, yPos: 5, width: 300},
	score: { name: 'score', xPos: 305, yPos: 5, width: 500},
}

var Menu = function() {
	this.gameList = [];
	this.vScroll = 0;
	this.interButtonSpacing = 6;
	
	this.currentScreen = screens.LIST;

	this.buttonStyle = {};
	this.statusString = "";
	
	this.buttonStyle.fontSize = 18;
	this.buttonStyle.font = this.buttonStyle.fontSize + 'pt bold';
	this.buttonStyle.cornerRadius = 6;
	this.buttonStyle.width = menudims.list.width;
	this.buttonStyle.height = this.buttonStyle.fontSize + this.buttonStyle.cornerRadius * 2;
	
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

Menu.prototype.switchScreen = function( toScreen ) {
	var e = new Event( "switch-screen" );
	e.detail = { toScreen: toScreen };

	document.dispatchEvent(e);
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
			newGameButton.setAttribute("style", "background-color:purple;");

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
				joinGameButton.setAttribute("style", "background-color:purple;");
				
				joinGameButton.onclick = function() {
					var e = new Event( "attempt-join-game" );
					e.data = { id: game.id };
					document.dispatchEvent( e );
				}

				joinGameButton.innerHTML = this.gameList[g].team1Nation.name + " vs " + this.gameList[g].team2Nation.name;
			
				center.append( $( joinGameButton ) );
			}
			break;
		case screens.NEWGAMETEAM1:
			console.log('new game');
			
			var menuholder = document.getElementById( "menuholder" );
			var center = document.getElementById( "center" );

			center.innerHTML = "";

			center.innerHTML += "Choose Teams";

			var row = document.createElement("div");
			row.setAttribute("class", "row-fluid");
			row.onclick = function() {
				menuholder.style.top--;
			};

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
					div.setAttribute("style", "background-color:purple");

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
					div.setAttribute("style", "background-color:purple");

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
				div.setAttribute("style", "background-color:purple");

				div.onclick = function() {
					var e = new Event( "attempt-add-game" );
					e.team1Nation = team1Nation;
					e.team2Nation = team2Nation;
					document.dispatchEvent( e );

					e = new Event( "switch-screen" );
					e.toScreen = screens.LIST;
					document.dispatchEvent( e );
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