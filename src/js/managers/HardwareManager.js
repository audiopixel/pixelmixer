/*
* ************* HARDWARE MANAGER *************** 
*
* Handles adding and removing Physical Hardware in the Universe as either a Node or a Plane.
*
*/

var HardwareManager = function (ap) {

};

HardwareManager.prototype = {

	init: function ( value ) {

		this.addNodeTestGrid();
	},

	update: function ( value ) {

		//console.log('update ' + this.tick);
	},

	addNodeTestGrid: function () {
		var nodes = [];

		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var node = {};
				node.x = (e * 30) - 370;// + (Math.random() * 100);
				node.y = (i * 30) - 200;// + (Math.random() * 100);
				node.z = 0;
				nodes.push(node);
			}
		}

		ap.app.addNodes(nodes);
	}

}
