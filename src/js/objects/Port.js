
// (int port, int hardwarePort, String name, int type, String address, Array nodes [optional]) 
var Port = function (portId, hardwarePort, name, type, address, nodes) {

	this.portId = portId;
	this.hardwarePort = hardwarePort;
	this.name = name;
	this.type = type;
	this.address = address;
	this.nodes = nodes || [];

};

Port.prototype = {

}
