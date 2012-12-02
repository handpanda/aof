var color1 = 'purple';
var color2 = 'white';
var color3 = 'black';
var color4 = 'green';

var MenuElement = function(elementType, internalName, displayName, pos, style, data, action) {
	this.elementType = elementType;
	this.internalName = internalName;
	this.style = style;
	this.width = this.style.width;
	this.height = this.style.height;
	
	this.displayName = displayName;
	this.pos = pos;
	this.realPos = pos;
	this.data = data;
	this.action = action;
	
	this.diagonal = Math.sqrt( this.style.width * this.style.width + this.style.height * this.style.height );
	this.wipeStripes = 40;
	this.stripeWidth = this.diagonal / this.wipeStripes;	
	this.wipeY = 0;
	this.wipeYVel = 50;

	this.hovered = false;
	this.selected = false;
	this.chosen = false;
}

MenuElement.prototype.onMouseHit = function() {
	if ( this.hovered ) {
		this.doAction();
	}
}

MenuElement.prototype.update = function( scrollBox ) {
	var hovered = false;
	var selected = false;

	this.realPos.setValues( scrollBox.viewportW / 2 - this.width / 2, this.pos.y );

	if (mousePos.x >= this.realPos.x && mousePos.x <= this.realPos.x + this.width &&
		mousePos.y >= this.realPos.y && mousePos.y <= this.realPos.y + this.height) {
		hovered = true;
		if (mousedown) {
			selected = true;
		}
	}

	switch (this.elementType) {
		case 'button':
			//if (selected == true && this.selected == false) this.doAction();
			break;
		case 'textbox':
			this.doAction();
			break;
	}
	
	this.hovered = hovered;
	
	if ( this.hovered ) {
		if ( this.wipeY > -this.diagonal ) this.wipeY += -this.wipeYVel; 
		if ( this.wipeY < -this.diagonal ) this.wipeY = -this.diagonal;
	} else {
		if ( this.wipeY < 0 ) this.wipeY += this.wipeYVel * 2;
		if ( this.wipeY > 0 ) this.wipeY = 0;
	}
}

MenuElement.prototype.nameMatches = function( name ) {
	return ( name == this.internalName );
}

MenuElement.prototype.draw = function(context) {
	context.font = '24pt bold';
	
	switch (this.elementType) {
		case 'button':
			if (this.chosen) context.fillStyle = color2;
			else if (this.selected) context.fillStyle = color2;
			else context.fillStyle = color1;

			context.strokeStyle = context.fillStyle;
			
			context.save();
				context.translate( this.realPos.x, this.realPos.y );
				
				context.beginPath();
					context.moveTo( this.style.cornerRadius, 0 );
					context.lineTo( this.style.width - this.style.cornerRadius, 0 );
					context.arcTo( this.style.width, 0, this.style.width, this.style.cornerRadius, this.style.cornerRadius );
					context.lineTo( this.style.width, this.style.height - this.style.cornerRadius );
					context.arcTo( this.style.width, this.style.height, this.style.width - this.style.cornerRadius, this.style.height, this.style.cornerRadius );
					context.lineTo( this.style.cornerRadius, this.style.height );
					context.arcTo( 0, this.style.height, 0, this.style.height - this.style.cornerRadius, this.style.cornerRadius );
					context.lineTo( 0, this.style.cornerRadius );
					context.arcTo( 0, 0, this.style.cornerRadius, 0, this.style.cornerRadius );
					context.fill();
					context.clip();
					context.save();
						context.translate( this.style.width, this.style.height );
						context.rotate( -Math.PI / 4 );
						context.translate( -this.diagonal, 0);
						context.fillStyle = 'white';
						context.fillRect( 0, this.wipeY, this.diagonal * 2, this.diagonal);
					context.restore();
			context.restore();

			context.textAlign = 'center';
			if (this.chosen) context.fillStyle = color4;
			else if (this.selected) context.fillStyle = color3;
			else if (this.hovered) context.fillStyle = color3;
			else context.fillStyle = color3;

			context.fillText(this.displayName, this.realPos.x + this.style.width / 2, this.realPos.y + this.style.height - this.style.cornerRadius, this.style.width);

			break;
		case 'textbox':
			context.textAlign = 'center';
			context.fillStyle = color2;

			context.fillText(this.displayName, this.realPos.x + this.style.width / 2, this.realPos.y + this.style.height - this.style.cornerRadius, this.style.width);
			break;
		case 'title':
			context.textAlign = 'center';
			context.fillStyle = color2;
			context.font = "italic 150px bolder fantasy";
			
			context.fillText(this.displayName, this.realPos.x + this.style.width / 2, this.realPos.y + this.style.height - this.style.cornerRadius, this.style.width);
			break;
	}
}

MenuElement.prototype.doAction = function() {
	if (this.action != null) this.action();
}
