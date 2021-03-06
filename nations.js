if ( typeof define !== "function" ) {
	var define = require("amdefine")(module);
}

define( [], function() {

var nations = [
	pru = { name: 'Dnieper Cossacks', shortname: "DNI", img: 'img/cossacks50.png' },
	cos = { name: 'Kingdom of Prussia', shortname: "PRU", img: 'img/prussia50.png' },
	pol = { name: 'Polish Home Army', shortname: "POL", img: 'img/poland50.png' },
	swe = { name: 'Swedish Empire', shortname: "SWE", img: 'img/sweden50.png' },

	irq = { name: 'Iroquois Nation', shortname: "IRQ", img: '' },
	lig = { name: 'Legio I Germanica', shortname: "LIG", img: '' },
	tib = { name: 'Empire of Tibet', shortname: "TIB", img: '' },
	ip = { name: 'Immortals Persepolis', shortname: "IP", img: '' },	
];

return nations;

})