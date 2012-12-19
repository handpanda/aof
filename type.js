var dims = require("./dims.js");

// Specifications for Entity
var type = {
	player    : { name: 'player', width: 40  , height: 40, color: 'white' },
	ball      : { name: 'ball', width: 25  , height: 25, color: 'white' },
	field     : { name: 'field', width: dims.fieldLength, height: dims.fieldWidth, color: 'rgb(83, 155, 38)' },
	sideline  : { name: 'sideline', width: dims.fieldLength - dims.sidelineWidth / 2, height: dims.sidelineWidth, color: 'blue' },
	backline  : { name: 'backline', width: dims.backlineWidth, height: dims.fieldWidth, color: 'red' },
	goal      : { name: 'goal', width: dims.goalDepth , height: dims.goalWidth, color: 'yellow' },
	goalieBox : { name: 'goalieBox', width: dims.goalieBoxDepth , height: dims.goalieBoxWidth, color: 'purple' },
	goalSide  : { name: 'goalSide', width: dims.sidelineWidth, height: dims.postWidth },
	goalBack  : { name: 'goalBack', width: dims.postWidth, height: dims.goalWidth },
	bounds	  : { name: 'bounds', width: dims.fieldLength - dims.backlineWidth * 2, height: dims.fieldWidth - dims.sidelineWidth * 2, color: 'green' }
}

module.exports = type;