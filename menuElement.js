var menuElement = function(type, name, title, pos, width, height, data, action) {
	this.type = type;
	this.name = name;
	this.title = title;
	this.pos = pos;
	this.width = width;
	this.height = height;
	this.data = data;
	this.action = action;

	this.hovered = false;
	this.selected = false;
	this.chosen = false;

	this.draw = function(context) {
		switch (this.type) {
			case 'button':
				if (this.chosen) context.fillStyle = color2;
				else if (this.selected) context.fillStyle = color2;
				else context.fillStyle = color1;

				context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		
				context.textAlign = 'center';
				context.font = '24pt bold';
				if (this.chosen) context.fillStyle = color4;
				else if (this.selected) context.fillStyle = color1;
				else if (this.hovered) context.fillStyle = color3;
				else context.fillStyle = color2;
	
				context.fillText(this.title, pos.x + this.width / 2, pos.y + this.height);
				break;
			case 'textbox':
				context.fillStyle = color3;

				context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
		
				context.textAlign = 'center';
				context.font = '24pt bold';
				context.fillStyle = color2;
	
				context.fillText(this.title, pos.x + this.width / 2, pos.y + this.height);
				break;
		}
	}

	this.doAction = function() {
		if (this.action != null) this.action();
	}
}
