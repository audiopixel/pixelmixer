/*
* ************* HARDWARE MANAGER *************** 
*
* Handles adding and removing Physical Hardware in the Universe as either a Node or a Plane.
*
*/

var HardwareManager = function () {

};

HardwareManager.prototype = {

	init: function () {

		// Testing: lets simulate using the editor to create two initial test grids 

		var port1 = new Port(1, 2, "port name 01", ap.PORT_TYPE_KINET_1, "10.0.0.20");
		ap.ports.setPort(1, port1);
		this.addTestGrid(1, 0);
		
		ap.app.updateNodePoints();

		var port2 = new Port(2, 2, "port name 02", ap.PORT_TYPE_KINET_1, "10.0.0.21");
		ap.ports.setPort(2, port2);
		this.addTestGrid(2, -440);
		
		ap.app.updateNodePoints();

	},

	update: function () {

		//console.log('update ' + this.tick);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
	},

	addTestGrid: function (port, yOffset) {

		var nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var node = {};
				node.x = (e * 30) - 370;
				node.y = (i * 30) - 200 + yOffset;
				node.z = 0;
				nodes.push(node);
			}
		}

		ap.ports.addNodes(port, nodes);
	}

}
