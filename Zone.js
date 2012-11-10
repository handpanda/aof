var Entity = require('./Entity.js');

var Zone = function(pos, objtype, side) {
	Entity.call( this, pos, objtype, side );
}

Zone.prototype = new Entity();
Zone.prototype.constructor = Zone;

module.exports = Zone;