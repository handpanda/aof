define( [], function() {

var DivTable = function( id, colNames ) {
	this.dom = document.createElement( "table" );
	this.dom.id = id;

	this.header = document.createElement( "thead" );
	this.dom.appendChild( this.header );

	this.colNames = colNames;
	this.setHeader( this.colNames );

	this.rows = [];

	this.dom.addEventListener( "details-opened", function(e) {
		// Hide all player tables in this game table
		$( gameTable.dom ).find( ".details-container" ).css( "display", "none" );

		//e.stopPropagation();
	}, true);	
}

DivTable.prototype.setHeader = function( colNames ) {
	$( this.header ).children( "th" ).remove();

	for ( c in colNames ) {
		$( this.header ).append( "<th>" + colNames[c] + "</th>" );
	}
}

DivTable.prototype.insertRow = function( divRow ) {
	this.rows.push( divRow );

	divRow.setBanner( this.colNames );

	this.dom.appendChild( divRow.banner );
	this.dom.appendChild( divRow.detailsContainer );
}

DivTable.prototype.clearRows = function( divRow ) {
	this.rows = [];

	while( this.dom.firstChild ) {
		this.dom.removeChild( this.dom.firstChild );
	}
}

return DivTable;

});