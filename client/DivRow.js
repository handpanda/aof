define( [], function() {

var DivRow = function( className, data ) {
	// First row with column names
	this.banner = document.createElement( "tr" );
	this.banner.className = className;

	// Foldout div appears when banner is clicked
	this.detailsContainer = document.createElement( "tr" );
	this.detailsContainer.className = "details-container";
	this.detailsContainer.style.display = "none";

	// Content
	this.details = document.createElement( "td" );
	this.detailsContainer.appendChild( this.details );

	this.cells = {};

	this.data = {};
	if ( data !== undefined ) this.data = data;

	var _this = this;

	this.banner.addEventListener( "click", function(e) {
		var lastDisplayState = _this.detailsContainer.style.display;

		_this.banner.dispatchEvent( new CustomEvent( "details-opened" ));

		// If player table was hidden before, show it
		if ( lastDisplayState == "none" ) {
			_this.detailsContainer.style.display = "table-row";
		}
	});	
}

DivRow.prototype.removeCells = function() {
	while( this.banner.firstChild ) {
		this.banner.removeChild( this.banner.firstChild );
	}	
}

DivRow.prototype.parseData = function( newData ) {
	for ( var key in newData ) {
		this.data[key] = newData[key];
	}	
}

DivRow.prototype.update = function() {
	for ( var key in this.data ) {
		if ( this.cells[key] !== undefined ) {
			this.cells[key].innerHTML = this.data[key];
		}
	}
}

DivRow.prototype.setBanner = function( colNames ) {
	this.colNames = colNames;

	// Remove all children (cells)
	this.removeCells();

	// Add a new cell for each column in the formats
	// Populate cells with data if the key exists in data
	for ( c in this.colNames ) {
		var name = this.colNames[c];

		cell = document.createElement( "td" );

		cell.id = name;

		// Display value if it exists
		if ( this.data[name] !== undefined ) {
			cell.innerHTML = this.data[name];
		}
	
		this.cells[name] = cell;

		this.banner.appendChild( cell );
	}

	this.details.colSpan = colNames.length;
}

return DivRow;

});