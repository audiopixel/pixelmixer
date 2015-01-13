/*
* ************* STATE MANAGER *************** 
*
* Handles the State of the universe. Ports which contain either Nodes or Planes.
*
*/

var StateManager = function (ap) {

	this.ports = [];
	

};

StateManager.prototype = {

	init: function () {

		//console.log('init' + this.ap);
	},

	update: function () {

		//console.log('update ' + this.tick);
	},

	// ************* Ports ***********************

	//setPortState(int port, int hardwarePort, String name, int type, int nodeCount, String address) 
	setPortState: function (port, hardwarePort, name, type, nodeCount, address) {
		var portData = {};
		portData.portId = port;
		portData.hardwarePort = hardwarePort;
		portData.name = name;
		portData.type = type;
		portData.nodeCount = nodeCount;
		portData.address = address;
		this.ports[port-1] = portData;
	},

	getPortState: function (port) {
		return this.ports[port-1];
	},

	clearPort: function (port) {
		delete this.ports[port-1];
	},

	clearAllPorts: function () {
		this.ports = [];
	}

}
