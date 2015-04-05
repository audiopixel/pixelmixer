/*
*
* Manage adding and removing several types of hardware into state as Nodes
*
*/

PX.HardwareManager = function () {

	this.pointSizes = [PX.pointSize, 200, 50];
	this.pointSprites = [PX.pointSprite];

};

PX.HardwareManager.prototype = {

	init: function () {

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

		// Add node values to 'PX.ports' for each defined port
		for(var unit in imported.hardwareunit){

			var _unit = imported.hardwareunit[unit];

			for(var port in _unit.ports){

				var _port = _unit.ports[port];

				if(!PX.ports[_port.portid-1]){
					// If a port is not defined create a default one
					PX.ports.setPort(_port.portid + portOffset, new PX.Port());
				}

				for(var node in _port.nodes){

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
				PX.ports.setNodes(_port.portid + portOffset, _port.nodes);
			}
		}
	},

	/*
	* Import nodes using a array of positions [x,y,z]
	*
	* @param port 		The port to load the nodes to.
	* @param vertices 	The array of vertices to create node positions from.
	*/
	importVertices: function (params) {

		if(!PX.ports[params.port-1]){
			// If a port is not defined create a default one
			PX.ports.setPort(params.port, new PX.Port());
		}

		PX.ports.setNodes(params.port, params.vertices);
	},


	/*
	* Create a simple 2D grid of nodes at a pitch distance
	*
	* @param portStart 	The port to load these nodes into.
	* @param x 			Translate position x for grid.
	* @param y 			Translate position y for grid.
	* @param z 			Translate position z for grid.
	* @param width 		How many nodes wide.
	* @param height 	How many nodes tall.
	* @param pitch 		How far the nodes are spaces from each other.
	* @param positionId If specified create position id from the min and max of grid
	*/
	addSimpleNodeGrid: function (params) {

		// If a port slot is not defined just add it to the next open one
		if(!params.port){
			params.port = PX.ports.ports.length + 1;
		}

		var s = 100000000000;
		var minx = s;
		var maxx = -s;
		var miny = s;
		var maxy = -s;

		var nodes = [];
		var node = {};
		for ( e = 0; e < params.width; e ++ ) { 
			for ( i = 0; i < params.height; i ++ ) { 

				node = {};
				node.x = ((e * params.pitch) + params.x);
				node.y = ((i * params.pitch) + params.y);
				node.z = params.z;
				nodes.push(node);

				minx = Math.min(minx, node.x);
				maxx = Math.max(maxx, node.x);
				miny = Math.min(miny, node.y);
				maxy = Math.max(maxy, node.y);
			}
		}
		var port = new PX.Port({name: "port name " + port, nodes: nodes});
		PX.ports.setPort(params.port, port);

		// If we are not the first designated port set the pod position as a default (testing)
		if(params.positionId > 1){
			PX.channels.setPodPos(params.port, new PX.PodPosition({x: minx, y: miny, z: node.z, w: maxx - minx, h: maxy - miny, d: node.z+1}));
		}

	},

	// ----- testing ----

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

		PX.ports.setNodes(port, nodes);
	},

	addTestPortsGrid: function (portStart, xOffset, yOffset) {

		// Test using a simple grid of ports (containing nodes): 
		var xTOffset = 830;
		var yTOffset = 1100;
		var xS = 0;
		var yS = 0;
		for ( u = 0; u < 15; u ++ ) { 
			var nodes = [];
			for ( e = 0; e < 18; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 24; i ++ ) { 

					var node = {};
					node.x = ((e * 40) + xS - 650 + xOffset) * 0.26;
					node.y = ((i * 40) + yS + yOffset) * 0.26;
					node.z = (Math.random() * 300) - 150;
					nodes.push(node);
				}
			}
			var port = new PX.Port({name: "port name " + port, nodes: nodes});
			PX.ports.setPort(u + portStart, port);

			xS += xTOffset;
			if((u + 2) % 5 == 1){
				xS = 0;
				yS += yTOffset;
			}
		}
	},

	addTestPortsGrid2: function (portStart, xOffset, yOffset) {
		var nodes = [];
		// Test using a simple grid of ports (containing nodes): 
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					var node = {};
					node.x = ((e * 20) - 340 + xOffset);
					node.y = ((i * 20) + 30 + yOffset);
					nodes.push(node);
				}
			}
			var port = new PX.Port({name: "port name " + port, nodes: nodes});
			PX.ports.setPort(portStart, port);
	},

	addTestPortsGrid3: function (portStart, xOffset, yOffset) {
		var nodes = [];
		var node = {};
		// Test using a simple grid of ports (containing nodes): 
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					node = {};
					node.x = ((e * 20) - 340 + xOffset);
					node.y = ((i * 20) + 30 + yOffset) - 1;
					nodes.push(node);
				}
			}
			var port = new PX.Port({name: "port name " + port, nodes: nodes});
			PX.ports.setPort(portStart, port);

			nodes = [];
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					if((i+ 2) % 2 == 1 ){

						node = {};
						node.x = ((e * 20) - 340 + xOffset);
						node.y = ((i * 20) + 30 + yOffset);
						node.z = 110;
						nodes.push(node);
					}
				}
			}
			port = new PX.Port({name: "port name " + port, nodes: nodes});
			PX.ports.setPort(portStart + 1, port);

			nodes = [];
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					if((i - 1) % 3 == 1 && (e - 1) % 2 == 1){

						node = {};
						node.x = ((e * 20) - 340 + xOffset) - 1;
						node.y = ((i * 20) + 30 + yOffset) - 1;
						node.z = 210;
						nodes.push(node);
					}
				}
			}
			port = new PX.Port({name: "port name " + port, nodes: nodes});
			PX.ports.setPort(portStart + 2, port);
	},

	setCustomPointSprite: function (type, path) {
		this.pointSprites[type] = path;
	},

	getCustomPointSprite: function (type) {
		if(type === 0){ return PX.pointSprite; }
		return this.pointSprites[type];
	},

	setCustomPointSize: function (type, size) {
		this.pointSizes[type] = size;
	},

	getCustomPointSize: function (type) {
		if(type === 0){ return PX.pointSize; }
		return this.pointSizes[type];
	}

};
