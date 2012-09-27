text = { }

text.pad0 = function(str, q) {
	if (q <= 0) return '';

	if (str.length >= q) str = str.slice(str.length - q);
	while (str.length < q) str = '0' + str;
	
	return str;
}
