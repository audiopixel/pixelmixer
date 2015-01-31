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
/*
		var port1 = new Port(1, 1, "port name 01", ap.PORT_TYPE_KINET_1, "10.0.0.20");
		ap.ports.setPort(1, port1);
		this.addTestGrid(1, 0, 0);

		var port2 = new Port(2, 1, "port name 02", ap.PORT_TYPE_KINET_1, "10.0.0.21");
		ap.ports.setPort(2, port2);
		this.addTestGrid(2, 0, 440);
*/

		// Simulate importing node data with only partially known port data
		var portId = 1;

		var port = new Port(null, null, null, null, "10.0.0.20");
		port.nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 24; i ++ ) { 

				var node = {};
				node.x = (e * 30);
				node.y = (i * 30);
				node.z = 0;
				port.nodes.push(node);
			}
		}
		ap.ports.setPort(portId, port);
		//ap.ports.setNodes(portId, port.nodes); // Test adding nodes on a port not yet defined


		// Simpulate importing networking data for existing ports
		ap.ports.addPortDetails(portId, new Port(portId, 1, "port name 01", ap.PORT_TYPE_KINET_1, null));

		// Test
		console.log(ap.ports.getPort(portId));

	},

	update: function () {

		//console.log('update ' + this.tick);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
	},

	addTestGrid: function (port, xOffset, yOffset) {

		var nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var node = {};
				node.x = (e * 30) + xOffset;
				node.y = (i * 30) + yOffset;
				node.z = 0;
				nodes.push(node);
			}
		}

		ap.ports.setNodes(port, nodes);
	}

}
