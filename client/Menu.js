var menudims = {
	list: { name: 'list', xPos: 0, yPos: 100, width: 500},
	exitbutton: { name: 'exitbutton', xPos: 5, yPos: 5, width: 300},
	score: { name: 'score', xPos: 305, yPos: 5, width: 500},
}

var Menu = function() {
	this.elementList = [];
	this.gameList = [];
	this.vScroll = 0;
	this.interButtonSpacing = 6;
	this.buttonHeight = 24;
}

Menu.prototype.clearChosenEntries = function(name) {
	for (l in this.elementList) {
		if (this.elementList[l].name == name) this.elementList[l].chosen = false;
	}
}

Menu.prototype.clearGameList = function() {
	this.gameList = [];
}

Menu.prototype.addGame = function( game ) {
	var found = false;
			
	for (g in this.gameList) {
		if (game.id == gameList[g].id) {
			found = true;
			break;
		}
	}		
	
	if ( !found ) {
		this.gameList.push( game );
	}
}

Menu.prototype.update = function() {
	for (l in this.elementList) {
		var elem = this.elementList[l];

		var hovered = false;
		var selected = false;

		if (mousePos.x >= elem.pos.x && mousePos.x <= elem.pos.x + elem.width &&
			mousePos.y >= elem.pos.y && mousePos.y <= elem.pos.y + elem.height) {
			hovered = true;
			if (mousedown) {
				selected = true;
			}
		}

		switch (elem.type) {
			case 'button':
				if (selected == true && elem.selected == false) elem.doAction();
				break;
			case 'textbox':

				break;
		}
		
		elem.hovered = hovered;
		elem.selected = selected;
	}
}


Menu.prototype.refresh = function() {
	this.elementList = [];
	
	console.log('refresh');
	console.log(this.gameList.length);
	
	switch (currentScreen) {
		case screen.TITLE:
			console.log('title');
			break;
		case screen.LIST:
			console.log('list');
			var y = menudims.list.yPos + this.vScroll;

			// List of games in progress
			for (g in this.gameList) {
				console.log(this.gameList[g]);
				this.elementList.push(new MenuElement('button', 'game', this.gameList[g].team1Name + ' vs ' + this.gameList[g].team2Name, new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight, 
							{ id: this.gameList[g].id },
							function() {
								attemptToJoinGame( this.data.id );
							})
						);
				y += this.buttonHeight + this.interButtonSpacing;
			}

			// Button to make a new game
			this.elementList.push(new MenuElement('button', 'new game', 'New Game', new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight,
						{ },
						function() {
							switchScreen(screen.NEWGAME);
						})
					);
			break;
		case screen.NEWGAME:
			console.log('new game');
			var y = menudims.list.yPos + this.vScroll;
			
			var menu = this;
			
			this.elementList.push(new MenuElement('textbox', 'team1', 'Team 1:', new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight, { }, null));
			y += this.buttonHeight + this.interButtonSpacing;	

			for (n in names) {
				console.log(names[n]);
				this.elementList.push(new MenuElement('button', 'team1', names[n], new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight,
							{ },
							function() {
								team1Name = this.title;
								menu.clearChosenEntries('team1');
								this.chosen = true;
							})
						);
				y += this.buttonHeight + this.interButtonSpacing;	
			}

			y += this.buttonHeight + this.interButtonSpacing;	

			this.elementList.push(new MenuElement('textbox', 'team2', 'Team 2:', new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight, { }, null));
			y += this.buttonHeight + this.interButtonSpacing;				

			for (n in names) {
				console.log(names[n]);
				this.elementList.push(new MenuElement('button', 'team2', names[n], new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight, 
							{ },
							function() {
								team2Name = this.title;
								menu.clearChosenEntries('team2');
								this.chosen = true;
							})
						);
				y += this.buttonHeight + this.interButtonSpacing;	
			}

			y += this.buttonHeight + this.interButtonSpacing;	

			this.elementList.push(new MenuElement('button', 'start', 'Start!', new Vec2(menudims.list.xPos, y), menudims.list.width, this.buttonHeight,
						{ },
						function() {
							attemptToAddGame(team1Name, team2Name);	
						})
					);
			y += this.buttonHeight + this.interButtonSpacing;		

			break;	
		case screen.GAME:
			console.log('game');
			this.elementList.push(new MenuElement('button', 'exit', 'Back to Lobby', new Vec2(menudims.exitbutton.xPos, menudims.exitbutton.yPos),
						menudims.exitbutton.width, 24, 
						{ },
						function() {
							leaveGame();
						})
					); 
			break;
	}
}

Menu.prototype.draw = function( context ) {
	for (l in this.elementList) {
		this.elementList[l].draw(context);
	}
}