if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define( [], function() {

var ACT = {
	STAND: 0,
	RUN: 1,
	SPRINT: 2,
	KICK: 3,
	SLIDE: 4,
	PUNT: 5,

	ACTIONS: 6, // Total number of actions

	/*
	 * NEW ACTIONS NEED TO BE ADDED TO SWITCH STATEMENTS IN:
	 * 
	 * 	ClientMan.draw() in ClientMan.js
	 *  Man.attemptAction() in Man.js
	 */
	
	// Can a player doing action A switch to action B?
	// from:	STAND	SPRINT	RUN		KICK	SLIDE	PUNT
	transfer: [	true, 	true,	true, 	true, 	true,	true,  // to:	STAND
		   		true, 	true,	true, 	true, 	false,  true,  // 		RUN
		   		true, 	true,	true, 	true, 	false,  true,  // 		SPRINT
		   		true, 	true,	true, 	false, 	false,	false, //		KICK
		   		true, 	true,	true, 	false, 	false,	false, // 		SLIDE
				true,	true,	true,	false,  false,  false, //		PUNT
																],

	canTransfer: function(fromaction, toaction) {
		return ACT.transfer[fromaction + toaction * ACT.ACTIONS];
	},

	// Can a player doing some action move freely (i.e with the arrow keys) ?
	canAccelerate: function(action) {
		switch (action) {
		case ACT.STAND:
		case ACT.RUN:
		case ACT.SPRINT:
		case ACT.KICK:
			return true;
		case ACT.SLIDE:
		case ACT.PUNT:
			return false;
		}
	}
}

return ACT;

});