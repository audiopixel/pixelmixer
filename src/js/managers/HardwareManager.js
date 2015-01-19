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

		var port1 = new Port(1, 1, "port name 01", ap.PORT_TYPE_KINET_1, "10.0.0.20");
		ap.ports.setPort(1, port1);
		this.addTestGrid(1, 0);

		var port2 = new Port(2, 1, "port name 02", ap.PORT_TYPE_KINET_1, "10.0.0.21");
		ap.ports.setPort(2, port2);
		this.addTestGrid(2, 440);

		/*
		var port3 = new Port(3, 1, "port name 03", ap.PORT_TYPE_KINET_1, "10.0.0.21");
		ap.ports.setPort(3, port3);
		this.addTestGrid(3, 880);
		*/
		
		//ap.app.updateNodePoints(); // only need to call this when we add nodes after init

	},

	update: function () {

		//console.log('update ' + this.tick);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
	},

	addTestGrid: function (port, yOffset) {

		var nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var node = {};
				node.x = (e * 30);
				node.y = (i * 30) + yOffset;
				node.z = 0;
				nodes.push(node);
			}
		}

		ap.ports.getPort(port).nodes = nodes;
	}

}
