/*
* ************* PORT MANAGER *************** 
*
* Handles the state of all Ports in the Universe.
* Ports may contain either Nodes or Planes.
*
*/

ap.PortManager = function () {

	this.ports = [];

};

ap.PortManager.prototype = {

	init: function () {

	},

	update: function () {

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
		this.ports[portId-1] = merge(this.ports[portId-1], port);
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
