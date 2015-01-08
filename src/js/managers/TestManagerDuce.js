
var TestManagerDuce = function (ap) {

	this.ap = ap;

	this.tick = 0;

};

TestManagerDuce.prototype = {

	init: function ( value ) {

		//console.log('initDuce' + this.ap);

	},

	update: function ( value ) {

		//console.log('updateDuce ' + this.tick);
		this.tick++;

	},

	checkStatus: function () {
		return this.tick;
	}

}
