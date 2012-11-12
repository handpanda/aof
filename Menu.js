var Menu = function() {
		
	
}

Menu.prototype.update = function() {
	for (l in elementList) {
		var elem = elementList[l];

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
	elementList = [];
	
	console.log('refresh');
	console.log(gamelist.length);
	
	switch (currentScreen) {
		case screen.TITLE:
			console.log('title');
			break;
		case screen.LIST:
			console.log('list');
			var y = menudims.list.yPos + vScroll;

			// List of games in progress
			for (g in gamelist) {
				console.log(gamelist[g]);
				elementList.push(new MenuElement('button', 'game', gamelist[g].team1Name + ' vs ' + gamelist[g].team2Name, new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, 
							{ id: gamelist[g].id },
							function() {
								attemptToJoinGame( this.data.id );
							})
						);
				y += buttonHeight + interButtonSpacing;
			}

			// Button to make a new game
			elementList.push(new MenuElement('button', 'new game', 'New Game', new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight,
						{ },
						function() {
							switchScreen(screen.NEWGAME);
						})
					);
			break;
		case screen.NEWGAME:
			console.log('new game');
			var y = menudims.list.yPos + vScroll;
			
			elementList.push(new MenuElement('textbox', 'team1', 'Team 1:', new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, { }, null));
			y += buttonHeight + interButtonSpacing;	

			for (n in names) {
				console.log(names[n]);
				elementList.push(new MenuElement('button', 'team1', names[n], new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight,
							{ },
							function() {
								team1Name = this.title;
								clearChosenEntries('team1');
								this.chosen = true;
							})
						);
				y += buttonHeight + interButtonSpacing;	
			}

			y += buttonHeight + interButtonSpacing;	

			elementList.push(new MenuElement('textbox', 'team2', 'Team 2:', new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, { }, null));
			y += buttonHeight + interButtonSpacing;				

			for (n in names) {
				console.log(names[n]);
				elementList.push(new MenuElement('button', 'team2', names[n], new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight, 
							{ },
							function() {
								team2Name = this.title;
								clearChosenEntries('team2');
								this.chosen = true;
							})
						);
				y += buttonHeight + interButtonSpacing;	
			}

			y += buttonHeight + interButtonSpacing;	

			elementList.push(new MenuElement('button', 'start', 'Start!', new Vec2(menudims.list.xPos, y), menudims.list.width, buttonHeight,
						{ },
						function() {
							attemptToAddGame(team1Name, team2Name);	
						})
					);
			y += buttonHeight + interButtonSpacing;		

			break;	
		case screen.GAME:
			console.log('game');
			elementList.push(new MenuElement('button', 'exit', 'Back to Lobby', new Vec2(menudims.exitbutton.xPos, menudims.exitbutton.yPos),
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
	for (l in elementList) {
		elementList[l].draw(context);
	}
}