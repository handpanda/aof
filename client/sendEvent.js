define( [], function() {

var sendEvent = function( eventName, eventData ) {
	var ev = new CustomEvent( eventName, { detail: eventData } );

	document.dispatchEvent( ev );
}

return sendEvent;

})