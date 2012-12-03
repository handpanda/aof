var clientZone = function(pos, objtype, side) {
	clientEntity.call( this, pos, objtype, side );
}

clientZone.prototype = new clientEntity();
clientZone.prototype.constructor = clientZone;

clientZone.prototype.draw = function( context ) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.fillStyle = this.type.color;
			if (this.side == 'left') context.fillStyle = 'blue';
			if (this.side == 'right') context.fillStyle = 'red';				

			switch (this.type.name) {
				case type.field.name:
					context.fillRect(0, 0, this.width, this.height);

					context.strokeStyle = "white";
					context.lineWidth = dims.borderWidth;

					context.beginPath();
					context.moveTo(dims.backlineWidth, dims.sidelineWidth);
					context.lineTo(dims.fieldLength - dims.backlineWidth, dims.sidelineWidth);
					context.lineTo(dims.fieldLength - dims.backlineWidth, dims.fieldWidth - dims.sidelineWidth);
					context.lineTo(dims.backlineWidth, dims.fieldWidth - dims.sidelineWidth);
					context.closePath();
					context.stroke();
					
					context.lineWidth = dims.postWidth;
					context.beginPath();
					context.moveTo(dims.fieldLength / 2, dims.sidelineWidth);
					context.lineTo(dims.fieldLength / 2, dims.fieldWidth - dims.sidelineWidth);
					context.stroke();

					context.beginPath();
					context.arc(dims.fieldLength / 2, dims.fieldWidth / 2, dims.centerRadius, 0, 2 * Math.PI, false);
					context.stroke();						
					break;
				case type.goalieBox.name:
					context.strokeStyle = 'white';
					context.lineWidth = dims.postWidth;
					switch (this.side) {
						case 'left':
							context.beginPath();
							context.moveTo(0, 0);
							context.lineTo(this.width, 0);
							context.lineTo(this.width, this.height);
							context.lineTo(0, this.height);
							context.stroke();
							break;
						case 'right':
							context.beginPath();
							context.moveTo(this.width, 0);
							context.lineTo(0, 0);
							context.lineTo(0, this.height);
							context.lineTo(this.width, this.height);
							context.stroke();
							break;
					}

					break;
				case type.goal.name:
					//context.fillRect(0, 0, this.width, this.height);
					
					break;
			}
		context.restore();
	context.restore();
}

clientZone.prototype.drawOverlay = function( context ) {
	context.save();
		context.translate(this.pos.x, this.pos.y);
		context.save();
			context.fillStyle = this.type.color;
			if (this.side == 'left') context.fillStyle = 'blue';
			if (this.side == 'right') context.fillStyle = 'red';				

			switch (this.type.name) {
				
				case type.goal.name:
					context.strokeStyle = "white";
					context.lineWidth = dims.postWidth;
					context.strokeStyle = "white";
					context.lineWidth = dims.postWidth;

					switch (this.side) {		
						case 'left':
							context.beginPath();
							context.moveTo(this.width, 0);
							context.lineTo(0, 0);
							context.lineTo(0, this.height);
							context.lineTo(this.width, this.height);
							context.closePath();
							context.stroke();
							break;
						case 'right':
							context.beginPath();
							context.moveTo(0, 0);
							context.lineTo(this.width, 0);
							context.lineTo(this.width, this.height);
							context.lineTo(0, this.height);
							context.closePath();
							context.stroke();
							break;
					}	
										
					var vThreads = 10;
					var hThreads = Math.floor( vThreads / this.width * this.height );
					
					context.beginPath();
					context.lineWidth = 2;
					for ( var x = 0; x < this.width; x += this.width / vThreads) {
						context.moveTo(x, 0);
						context.lineTo(x, this.height);
					}
					for ( var y = 0; y < this.height; y += this.height / hThreads) {
						context.moveTo(0, y);
						context.lineTo(this.width, y);
					}
					context.stroke();
					break;
			}
		context.restore();
	context.restore();
}