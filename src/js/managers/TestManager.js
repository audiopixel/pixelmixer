
var TestManager = function (ap) {

	this.ap = ap;

	this.tick = 0;

};

TestManager.prototype = {

	init: function ( value ) {

		//console.log('init' + this.ap);

	},

	update: function ( value ) {

		//console.log('update ' + this.tick);
		this.tick++;

		// Example of managers talking to each other:
		//console.log(this.ap.testManagerDuce.checkStatus());

	}

}
