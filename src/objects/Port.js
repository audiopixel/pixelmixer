/*
*
* Ports are way to organize sets of Nodes.
* All Nodes must be associated with a Port.
*
* Ports may also define network and addressing data.
*
*/

// (String name, int type, String address, int hardwarePort [optional], Array nodes [optional]) 
ap.Port = function (name, type, address, hardwarePort, nodes) {

	this.name = name;
	this.type = type;
	this.address = address || "";
	this.nodes = nodes || [];
	this.hardwarePort = hardwarePort || 1;

};