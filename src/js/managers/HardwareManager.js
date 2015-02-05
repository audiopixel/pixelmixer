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

		// Test using a simple grid of ports (containing nodes): 
		var xOffset = 570;
		var yOffset = 730;
		var xS = 0;
		var yS = 0;
		for ( u = 0; u < 15; u ++ ) { 
			var nodes = [];
			for ( e = 0; e < 18; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 24; i ++ ) { 

					var node = {};
					node.x = (e * 30) + xS - 1050;
					node.y = (i * 30) + yS - 550;
					node.z = Math.random() * 150;
					nodes.push(node);
				}
			}
			var port = new Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(u + 1, port);

			xS += xOffset;
			if((u + 2) % 5 == 1){
				xS = 0;
				yS += yOffset;
			}
		}

		// Simulate Importing nodes from external file
		//this.importNodes(ap.imported, 18, 0, 0, -100);
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
