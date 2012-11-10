var ACT = {
	STAND: 0,
	RUN: 1,
	KICK: 2,
	SLIDE: 3,
	PUNT: 4,

	ACTIONS: 5, // Total number of actions

	
	// Can a player doing action A switch to action B?
	// from:	STAND	RUN	KICK	SLIDE	PUNT
	transfer: [	true, 	true, 	true, 	true,	true,  // to:	STAND
		   	true, 	true, 	true, 	false,  true,  // 	RUN
		   	true, 	true, 	false, 	false,	false, //	KICK
		   	true, 	true, 	false, 	false,	false, // 	SLIDE
			true,	true,	false,  false,  false, //	PUNT
								],

	canTransfer: function(fromaction, toaction) {
		return ACT.transfer[fromaction + toaction * ACT.ACTIONS];
	},

	// Can a player doing some action move freely (i.e with the arrow keys) ?
	canAccelerate: function(action) {
		switch (action) {
		case ACT.STAND:
		case ACT.RUN:
		case ACT.KICK:
			return true;
		case ACT.SLIDE:
		case ACT.PUNT:
			return false;
		}
	}
}

module.exports = ACT;