var EnvInfo = function( params ) {
	this.goalPos = new Vec2( 0, 0 );
	this.anchorPos = new Vec2( 0, 0 );
	this.ballPos = new Vec2( 0, 0 );
	this.isBallFree = false;
	this.ballSide = 'none';	
	
	this.setValues( params );
}

EnvInfo.prototype.setValues = function( values ) {
	if ( values === undefined ) return;
	
	for ( key in values ) {
		if ( this[key] === undefined ) {
			console.warn("/EnvInfo/: undefined parameter " + key);
			continue;
		}
		
		var currentValue = this[key];
		var newValue = values[key];
		
		if ( currentValue instanceof Vec2 ) {
			this[key].set( newValue );
		} else {
			this[key] = newValue;
		}
	}
}

module.exports = EnvInfo;
