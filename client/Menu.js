var menudims = {
	list: { name: 'list', xPos: 0, yPos: 0, width: 500},
	exitbutton: { name: 'exitbutton', xPos: 5, yPos: 5, width: 300},
	score: { name: 'score', xPos: 305, yPos: 5, width: 500},
}

var Menu = function() {
	this.elementList = [];
	this.gameList = [];
	this.vScroll = 0;
	this.interButtonSpacing = 6;
	
	this.buttonStyle = {};
	this.statusString = "";
	
	this.buttonStyle.fontSize = 18;
	this.buttonStyle.font = this.buttonStyle.fontSize + 'pt bold';
	this.buttonStyle.cornerRadius = 6;
	this.buttonStyle.width = menudims.list.width;
	this.buttonStyle.height = this.buttonStyle.fontSize + this.buttonStyle.cornerRadius * 2;
	
	this.y = 0;
}

Menu.prototype.clearChosenEntries = function(name) {
	for (l in this.elementList) {
		if (this.elementList[l].nameMatches( name ) ) this.elementList[l].chosen = false;
	}
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

Menu.prototype.addListElement = function( elementType, internalName, displayName, data, func ) {
	this.elementList.push(new MenuElement(	elementType,
											internalName, 
											displayName, 
											new Vec2(menudims.list.xPos, this.y), 
											this.buttonStyle,
											data, 
											func ) );
											
	this.y += this.buttonStyle.height + this.interButtonSpacing;											
}

Menu.prototype.update = function( scrollBox ) {
	for (l in this.elementList) {
		var elem = this.elementList[l];

		elem.update( scrollBox );
	}
}

Menu.prototype.onMouseHit = function( ) {
	for (l in this.elementList) {
		var elem = this.elementList[l];

		elem.onMouseHit();
	}	
}

Menu.prototype.refresh = function( scrollBox ) {
	this.elementList = [];
	this.y = menudims.list.yPos + this.vScroll;

	console.log('refresh');
	console.log(this.gameList.length);
	
	switch (currentScreen) {
		case screen.TITLE:
			console.log('title');
			break;
		case screen.LIST:
			this.addListElement( 'spacer', '', '', { }, null );
			this.addListElement( 'spacer', '', '', { }, null );
			this.addListElement( 'spacer', '', '', { }, null );

			console.log('list');

			this.addListElement( 'title', 'title', 'AGE OF FOOTBALL', { }, null );
			
			this.addListElement( 'spacer', '', '', { }, null );
			
			this.addListElement( 'button', 'howto', 'How to Play', { }, function() {
				
				
			});
			
			// Button to make a new game
			this.addListElement( 'button', 'new game', 'New Game', { },
						function() {
							switchScreen(screen.NEWGAMETEAM1);
						});

			this.addListElement( 'spacer', '', '', { }, null );
			
			this.addListElement( 'textbox', 'listtitle', 'Join a Game', { }, null );
			
			// List of games in progress
			for (g in this.gameList) {
				this.addListElement( 'button', 'game', this.gameList[g].team1Name + ' vs ' + this.gameList[g].team2Name, { id: this.gameList[g].id },
							function() {
								console.log( "button press");
								attemptToJoinGame( this.data.id );
							});
			}
			break;
		case screen.NEWGAMETEAM1:
			console.log('new game');
			
			var menu = this;
			
			this.addListElement( 'textbox', 'team1', 'Team 1:', { }, null);

			for (n in names) {
				this.addListElement( 'button', 'team1', names[n],
							{ },
							function() {
								team1Name = this.displayName;
								menu.clearChosenEntries('team1');
								this.chosen = true;
							});
			}
			
			this.addListElement( 'spacer', '', '', { }, null );
			this.addListElement( 'button', 'next', 'Next',
						{ },
						function() {
							switchScreen( screen.NEWGAMETEAM2 );
						});
			
			break;
		case screen.NEWGAMETEAM2:

			var menu = this;

			this.addListElement('textbox', 'team2', 'Team 2:', { }, null);		

			for (n in names) {
				console.log(names[n]);
				this.addListElement('button', 'team2', names[n],
							{ },
							function() {
								team2Name = this.displayName;
								menu.clearChosenEntries('team2');
								this.chosen = true;
							});
			}
			this.addListElement( 'spacer', '', '', { }, null );
			this.addListElement( 'button', 'start', 'Start!',
				{ },
				function() {
					attemptToAddGame(team1Name, team2Name);	
				});

			break;	
		case screen.GAME:
			console.log('game');
			this.addListElement( 'button', 'exit', 'Back to Lobby',
				{ },
				function() {
					leaveGame();
				});
			this.addListElement( 'textbox', 'status', '',
				{ },
				function() {
					this.displayName = getGameStatusString();
				});
			break;
	}
	
	this.update( scrollBox );
}

Menu.prototype.setStatusString = function( string ) {
	this.statusString = string;
}

Menu.prototype.draw = function( context ) {
	context.font = this.buttonStyle.font;
	
	context.save();
	
	for (l in this.elementList) {
		this.elementList[l].draw(context);
	}
	
	context.restore();
}
