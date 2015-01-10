/*
* ************* STATE MANAGER *************** 
*
* Handles the State of the universe. Ports which contain either Nodes or Planes.
*
*/

var StateManager = function (ap) {

	this.ap = ap;

};

StateManager.prototype = {

	init: function ( value ) {

		//console.log('init' + this.ap);
	},

	update: function ( value ) {

		//console.log('update ' + this.tick);
	}

}
