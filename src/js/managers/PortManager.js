/*
* ************* PORT MANAGER *************** 
*
* Handles the state of all Ports in the Universe.
* Ports may contain either Nodes or Planes.
*
*/

var PortManager = function () {

	this.ports = [];

};

PortManager.prototype = {

	init: function () {

	},

	update: function () {

	},

	// ************* Ports ***********************

	setPort: function (portId, portObject) {
		this.ports[portId-1] = portObject;
	},

	getPort: function (portId) {
		return this.ports[portId-1];
	},

	clearPort: function (portId) {
		delete this.ports[portId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPorts: function () {
		this.ports = [];
	},

	// ************* Ports ***********************

	addNodes: function (portId, nodes) {
		this.ports[portId-1].nodes = nodes;
	}

}
