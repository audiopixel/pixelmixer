
// (String name, int type, String address, int hardwarePort [optional], Array nodes [optional]) 
var Port = function (name, type, address, hardwarePort, nodes) {

	this.name = name;
	this.type = type;
	this.address = address;
	this.nodes = nodes || [];
	this.hardwarePort = hardwarePort || 1;

};

Port.prototype = {

}
