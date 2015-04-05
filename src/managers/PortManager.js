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
	},

	// ************* Nodes ***********************

	getNodes: function (portId) {
		return this.ports[portId-1].nodes;
	},

	getNodeCount: function (portId) {
		return this.ports[portId-1].nodes.length;
	},

	setNodes: function (portId, nodes) {
		if(!this.ports[portId-1]){
			this.setPort(portId, new PX.Port({name: "Port " + portId}));
		}
		this.ports[portId-1].nodes = nodes;
	},

	addNode: function (portId, node) {
		if(!this.ports[portId-1]){
			this.setPort(portId, new PX.Port({name: "Port " + portId}));
		}
		this.ports[portId-1].nodes[this.ports[portId-1].nodes.length] = node;
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
