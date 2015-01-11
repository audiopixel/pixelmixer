
var TestManager = function (ap) {

	this.ap = ap;

	this.tick = 0;

	/*
	ap.signals.moduleInit.add( function () {


	} );

	ap.signals.moduleUpdate.add( function () {


		controls.update();
		renderer.render( scene, camera );
	} );
	*/

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
