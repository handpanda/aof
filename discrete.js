var discrete = { }

discrete.randInt = function(a, b) {
	return a + Math.floor(Math.random() * (b - a));
}

discrete.randElem = function(arr) {
	return arr[discrete.randInt(0, arr.length)]; 
}

module.exports = discrete;
