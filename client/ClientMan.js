define ([	
			"juego/image", 

			"nations", 
			"type",
			"Act",

			"client/ClientEntity", 
		], function ( 
			image, 

			nations, 
			entityType,
			ACT,

			ClientEntity 
		) {

// Bring image stuff into ClientMan namespace
var Palette = image.Palette;
var RegularImage = image.RegularImage;
var Animation = image.Animation;
var AnimatedImage = image.AnimatedImage;
var AnimationRunner = image.AnimationRunner;
var Color = image.Color;

var noPalette = new image.Palette( [], [] );
var prussianPalette = new image.Palette( [ 	new Color( 0  , 0  , 0  , 255 ),
											new Color( 255, 255, 255, 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 255, 0  , 0  , 255 ) ], 
										 [ 	new Color( 0  , 0  , 0  , 255 ),
											new Color( 0  , 50 , 150 , 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 50 , 50 , 50 , 255 ) ] );
var polishPalette = new image.Palette( [ 	new Color( 0  , 0  , 0  , 255 ),
											new Color( 255, 255, 255, 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 255, 0  , 0  , 255 ) ], 
									   [ 	new Color( 0  , 0  , 0  , 255 ),
											new Color( 255, 255, 255, 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 255, 0  , 0  , 255 ) ] );
var swedishPalette = new image.Palette( [	new Color( 0  , 0  , 0  , 255 ),
											new Color( 255, 255, 255, 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 255, 0  , 0  , 255 ) ], 
										[	new Color( 0  , 0  , 0  , 255 ),
											new Color( 0  , 50 , 255, 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 255, 200, 0  , 255 ) ] );
var cossackPalette = new image.Palette( [  	new Color( 0  , 0  , 0  , 255 ),
											new Color( 255, 255, 255, 255 ),
											new Color( 240, 208, 192, 255 ),
											new Color( 255, 0  , 0  , 255 ) ], 
										[ 	new Color( 0  , 0  , 0  , 255 ),
											new Color( 150, 50 , 0  , 255 ),
											new Color( 140, 108, 92 , 255 ),
											new Color( 125, 30 , 90 , 255 ) ] );


var manImg = new image.AnimatedImage( "img/player.png", 
																16, 16, 0, 0, noPalette);
var prussianImg = new image.AnimatedImage( "img/player.png", 
																16, 16, 0, 0, 
																prussianPalette );
var polishImg = new image.AnimatedImage( "img/player.png", 
																16, 16, 0, 0, 
																polishPalette );
var cossackImg = new image.AnimatedImage( "img/player.png", 
																16, 16, 0, 0, 
																cossackPalette );
var swedishImg = new image.AnimatedImage( "img/player.png", 
																16, 16, 0, 0, 
																swedishPalette );

var manAnim = {
	stand: {
		Up: new Animation( "stand Up", manImg, [0], 2),
		UpRight: new Animation( "stand Up Right", manImg, [8], 2),
		Right: new Animation( "stand Right", manImg, [16], 2),
		DownRight: new Animation( "stand Down Right", manImg, [24], 2),
		Down: new Animation( "stand Down", manImg, [32], 2),
		DownLeft: new Animation( "stand Down Left", manImg, [40], 2),
		Left: new Animation( "stand Left", manImg, [48], 2),
		UpLeft: new Animation( "stand Up Left", manImg, [56], 2),	
	},
	kick: {
		Up: new Animation( "stand Up", manImg, [88], 2),
		UpRight: new Animation( "stand Up Right", manImg, [89], 2),
		Right: new Animation( "stand Right", manImg, [90], 2),
		DownRight: new Animation( "stand Down Right", manImg, [91], 2),
		Down: new Animation( "stand Down", manImg, [92], 2),
		DownLeft: new Animation( "stand Down Left", manImg, [93], 2),
		Left: new Animation( "stand Left", manImg, [94], 2),
		UpLeft: new Animation( "stand Up Left", manImg, [95], 2),	
	},	
	walk: {
		Up: new Animation( "Walk Up", manImg, [0, 2, 3, 4, 6, 7], 2),
		UpRight: new Animation( "Walk Up Right", manImg, [8, 10, 11, 12, 14, 15], 2),
		Right: new Animation( "Walk Right", manImg, [16, 18, 19, 20, 22, 23], 2),
		DownRight: new Animation( "Walk Down Right", manImg, [24, 26, 27, 28, 30, 31], 2),
		Down: new Animation( "Walk Down", manImg, [32, 34, 35, 36, 38, 39], 2),
		DownLeft: new Animation( "Walk Down Left", manImg, [40, 42, 43, 44, 46, 47], 2),
		Left: new Animation( "Walk Left", manImg, [48, 50, 51, 52, 54, 55], 2),
		UpLeft: new Animation( "Walk Up Left", manImg, [56, 58, 59, 60, 62, 63], 2),
	},
	run: {
		Up: new Animation( "run Up", manImg, [0, 1, 2, 3, 4, 5, 6, 7], 1),
		UpRight: new Animation( "run Up Right", manImg, [8, 9, 10, 11, 12, 13, 14, 15], 1),
		Right: new Animation( "run Right", manImg, [16, 17, 18, 19, 20, 21, 22, 23], 1),
		DownRight: new Animation( "run Down Right", manImg, [24, 25, 26, 27, 28, 29, 30, 31], 1),
		Down: new Animation( "run Down", manImg, [32, 33, 34, 35, 36, 37, 38, 39], 1),
		DownLeft: new Animation( "run Down Left", manImg, [40, 41, 42, 43, 44, 45, 46, 47], 1),
		Left: new Animation( "run Left", manImg, [48, 49, 50, 51, 52, 53, 54, 55], 1),
		UpLeft: new Animation( "run Up Left", manImg, [56, 57, 58, 59, 60, 61, 62, 63], 1),	
	},
}

var ClientMan = function(pos, side, team) {
	ClientEntity.call( this, pos, entityType.player, side );

	this.updateSides();
	
	this.pastPositions = [];

	this.stamina = 0;
	this.sprinting = false;
	
	this.destPos = new Vec2( 0, 0 );
	
	this.occluder = null;
	this.leftOption = null;
	this.rightOption = null;
	this.leftOccluder = null;
	this.rightOccluder = null;
	this.interDestPos = null;

	console.log( team );

	this.mainRunner = new AnimationRunner( this.posX, this.posY, false, false );
	this.mainRunner.setLoopingAnim( manAnim.walkDown );
	this.mainRunner.setScale( 3.0 );

	if ( team.name == nations[3].name ) this.mainRunner.image = swedishImg;
	if ( team.name == nations[2].name ) this.mainRunner.image = polishImg;
	if ( team.name == nations[0].name ) this.mainRunner.image = cossackImg;
	if ( team.name == nations[1].name ) this.mainRunner.image = prussianImg;
}

ClientMan.prototype = new ClientEntity();
ClientMan.prototype.constructor = ClientMan;

ClientMan.prototype.draw = function( context ) {
	this.pastPositions.push( this.pos );
	if ( this.pastPositions.length > 10 ) this.pastPositions.pop();

	var action = manAnim.stand;

	switch (this.action) {
		case ACT.STAND:
			action = manAnim.stand;
			break;
		case ACT.RUN:
			action = manAnim.walk;
			if ( this.sprinting ) {
				action = manAnim.run;
			}
			break;
		case ACT.KICK:
		case ACT.SLIDE:
			action = manAnim.kick;
			break;
	}

	while ( this.angle < 0 ) this.angle += Math.PI * 2;
	while ( this.angle >= Math.PI * 2 ) this.angle -= Math.PI * 2;
	var p4 = Math.PI / 4;

	var a = -p4 / 2;

	var anim;

	if ( this.angle > a ) anim = action.Right; a += p4;
	if ( this.angle > a ) anim = action.DownRight; a += p4;
	if ( this.angle > a ) anim = action.Down; a += p4;
	if ( this.angle > a ) anim = action.DownLeft; a += p4;
	if ( this.angle > a ) anim = action.Left; a += p4;
	if ( this.angle > a ) anim = action.UpLeft; a += p4;
	if ( this.angle > a ) anim = action.Up; a += p4;
	if ( this.angle > a ) anim = action.UpRight; a += p4;

	this.mainRunner.setLoopingAnim( anim );

	this.mainRunner.update( this.pos.x, this.pos.y, false, false );

	this.mainRunner.draw( context );

	context.fillText( this.action, this.pos.x, this.pos.y)

	context.save();
		context.translate(this.center.x, this.center.y);			
				
			// Debug Text
			//if ( inDebugMode ) {
				
				// Client ID
				context.font = '24px serif';
				context.fillStyle = 'white';
				context.fillText(this.clientid, 0, 0);
				
				// Latency
				context.font = '24px serif';
				context.fillStyle = 'orange';
				context.fillText(this.latency + '/' + this.msecsSinceLastPing, 0, 24);
			//}
	context.restore();
}

return ClientMan;

});