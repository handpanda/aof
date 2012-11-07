text = { }

/*
	text.pad0

	Pad a string with zeroes to a certain length

	Returns: the padded string		
*/

text.pad0 = function(str, q) {
	if (q <= 0) return '';

	if (str.length >= q) str = str.slice(str.length - q);
	while (str.length < q) str = '0' + str;
	
	return str;
}
