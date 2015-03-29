/*
*
* Handles the state of all Ports in the Universe.
*
* 	Ports are a way to organize sets of Nodes.
* 	All Nodes must be associated with a Port.
*
* 	Ports may also define network and addressing data.
* 
* 
*
*/

PX.PortManager = function () {

	this.ports = [];

};

PX.PortManager.prototype = {

	init: function () {

		if(PX.broadcast){

			// If broadcast is on loop each port
			for ( e = 0; e < PX.ports.getPorts().length; e ++ ) { 

				var port = PX.ports.getPort(e + 1);
				if(port && port.broadcast && port.type && port.nodes){

					// if we have a defined tech we can use it to broadcast
					if(PX.techs[port.type]){

						PX.techs[port.type].broadcast(port);

					}

				}
			}
		}

		// Call init method on techs if they are defined
		for (var tech in PX.techs) {

			if(PX.techs[tech].init){

				PX.techs[tech].init();
			}
		}
	},

	update: function () {

		if(PX.broadcast){

			// If broadcast is on loop each port
			for ( e = 0; e < PX.ports.getPorts().length; e ++ ) { 

				var port = PX.ports.getPort(e + 1);
				if(port && port.broadcast && port.type && port.nodes){

					// if we have a defined tech we can use it to broadcast
					if(PX.techs[port.type]){

						PX.techs[port.type].broadcast(port);

					}

				}
			}
		}

		
// tech: uses it's port/node increment as the id
	// we then use that id as which 3 values we grab from pixels array
	// tech.broadcast(portObject, nodeIndex, pixels array)


	},

	// ************* Nodes ***********************

	getNodes: function (portId) {
		return this.ports[portId-1].nodes;
	},

	getNodeCount: function (portId) {
		return this.ports[portId-1].nodes.length;
	},

	setNodes: function (portId, nodes) {
		if(!this.ports[portId-1]){ this.ports[portId-1] = {}; }
		this.ports[portId-1].nodes = nodes;
	},

	// Add some nodes with imposed uniform values
	setNodesOffset: function (portId, nodes, offsetX, offsetY, offsetZ) {
		if(!this.ports[portId-1]){ this.ports[portId-1] = {}; }
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].x += offsetX;
			nodes[i].y += offsetY;
			nodes[i].z += offsetZ;
		}
		this.ports[portId-1].nodes = nodes;
	},

	// Add some nodes that only have x, y data, imposed with a uniform z value
	setNodesFlat: function (portId, nodes, z) {
		if(!this.ports[portId-1]){ this.ports[portId-1] = {}; }
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].z = z;
		}
		this.ports[portId-1].nodes = nodes;
	},

	clearNodes: function (portId) {
		delete  this.ports[portId-1].nodes; // TODO optimize: most likely better to not use 'delete'
	},


	// ************* Ports ***********************

	setPort: function (portId, portObject) {
		this.ports[portId-1] = portObject;
	},

	getPort: function (portId) {
		return this.ports[portId-1];
	},

	getPorts: function () {
		return this.ports;
	},

	// Add details to a existing port
	addPortDetails: function (portId, port) {
		if(!this.ports[portId-1]){ console.log("Error: Cannot add details to unexisting Port " + portId); return; }
		var nodes = this.ports[portId-1].nodes; // Preserve the nodes if they exists

		// Merge this.ports[portId-1] + new port data
		var obj3 = {};
		for (var attrname in this.ports[portId-1]) {
			if(this.ports[portId-1][attrname]){ obj3[attrname] = this.ports[portId-1][attrname]; }
		}
		for (var attrname2 in port) {
			if(port[attrname2]){ obj3[attrname2] = port[attrname2]; }
		}
		this.ports[portId-1] = obj3;

		this.ports[portId-1].nodes = nodes;
	},

	clearPort: function (portId) {
		delete this.ports[portId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPorts: function () {
		delete this.ports;
		this.ports = []; // TODO optimize: most likely better to not use 'delete'
	}

};
