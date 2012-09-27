vec2 = function(x, y) {
	this.x = x;
	this.y = y;

	this.zero = function() {
		this.x = 0;
		this.y = 0;
	}

	this.dot = function(v) {
		return this.x * v.x + this.y * v.y;
	}

	this.set = function(v) {
		this.x = v.x;
		this.y = v.y;

		return this;
	}

	this.copy = function() {
		return new vec2(this.x, this.y);
	}

	this.add = function(v) {
		this.x += v.x;
		this.y += v.y;
	
		return this;
	}

	this.plus = function(v) {
		return new vec2(this.x + v.x, this.y + v.y);
	}

	this.sub = function(v) {
		this.x -= v.x;
		this.y -= v.y;

		return this;
	}

	this.minus = function(v) {
		return new vec2(this.x - v.x, this.y - v.y);
	}

	this.scale = function(s) {
		this.x *= s;
		this.y *= s;

		return this;
	}

	this.times = function(s) {
		return new vec2(this.x * s, this.y * s);
	}

	this.flip = function() {
		return this.scale(-1);
	}

	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	this.normalize = function() {
		if (this.length() == 0.0) return this;

		return this.scale(1.0 / this.length());
	}

	this.rotate = function(a) {
		var x = this.x;
		var y = this.y;

		this.x = x * Math.cos(a) - y * Math.sin(a);
		this.y = x * Math.sin(a) + y * Math.cos(a);

		return this;
	}
}

module.exports = vec2;
