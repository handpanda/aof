var objects = require('./object.js');

var Zone = function(pos, offset, objtype, side) {
	objects.Entity.call( this, pos, offset, objtype, side );
}

Zone.prototype = new objects.Entity();
Zone.prototype.constructor = Zone;

module.exports = Zone;