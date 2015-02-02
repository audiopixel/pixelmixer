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

		// Testing: lets simulate using the editor to create two initial test grids //

		var port1 = new Port("port name 01", ap.PORT_TYPE_KINET_1, "10.0.0.20", 1);
		ap.ports.setPort(1, port1);
		this.addTestGrid(1, 0, 0);

		var port2 = new Port("port name 02", ap.PORT_TYPE_KINET_1, "10.0.0.21", 1);
		ap.ports.setPort(2, port2);
		this.addTestGrid(2, 0, 440);


		var portId = 16;

		// Simulate adding nodes that only have x, y data, imposed to a uniform z value
		//var nodes = [{x: 0, y: 0}, {x: 0, y: 20}, {x: 0, y: 40}, {x: 0, y: 60}, {x: 20, y: 0}, {x: 20, y: 20}, {x: 20, y: 40}, {x: 20, y: 60}];
		//ap.ports.setNodes(portId, nodes);
		//ap.ports.setNodesFlat(portId + 1, nodes, -100);


		// Simulate importing node data with only partially known port data
		var port = new Port(null, null, "10.0.0.20", null);
		port.nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 24; i ++ ) { 

				var node = {};
				node.x = (e * 30);
				node.y = (i * 30);
				node.z = Math.random() * 200;
				port.nodes.push(node);
			}
		}
		//ap.ports.setPort(portId, port);
		ap.ports.setNodesOffset(portId, port.nodes, 0, 0, 100); // Test adding nodes on a port not yet defined


		// Simpulate importing networking data for existing ports
		//ap.ports.addPortDetails(portId, new Port("port name 01", ap.PORT_TYPE_KINET_1, null, 1, nodes));

		// Test
		//console.log(ap.ports.getPort(portId));



		// Simulate Importing nodes from external file
		this.importNodes(ap.imported, 18, 0, 0, -100);
		//this.importNodes(ap.imported, 18, 400, 300, -100);

	},

	update: function () {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
	},

	// -------------------------------------------------

	/*
	* Import nodes using the 'import/ports' structured file format.
	*
	* @param imported 		The JS obj to import from.
	* @param portOffset 	Optional value to offset the port values from.
	* @param xOffset 		Optional value to offset the x values from.
	* @param yOffset 		Optional value to offset the y values from.
	* @param zOffset 		Optional value to offset the z values from.
	* @param scale 			Optional overwrite value to scale nodes from.
	*/
	importNodes: function (imported, portOffset, xOffset, yOffset, zOffset, scale) {
		portOffset = portOffset || 0;
		xOffset = xOffset || 0;
		yOffset = yOffset || 0;
		zOffset = zOffset || 0;
		imported.scale = imported.scale || 1.0;

		// Use the scale value defined in JS object unless one is passed as an argument instead
		var _scale = scale || imported.scale; 

		// Add node values to 'ap.ports' for each defined port
		for(unit in imported.hardwareunit){

			var _unit = imported.hardwareunit[unit];

			for(port in _unit.ports){

				var _port = _unit.ports[port];

				for(node in _port.nodes){

					var _node = _port.nodes[node];

					_node.x = _node.x || 0;
					_node.y = _node.y || 0;
					_node.z = _node.z || 0;

					_node.x *= _scale;
					_node.y *= _scale;
					_node.z *= _scale;

					_node.x += xOffset;
					_node.y += yOffset;
					_node.z += zOffset;

				}
				ap.ports.setNodes(_port.portid + portOffset, _port.nodes);
			}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
		}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
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
