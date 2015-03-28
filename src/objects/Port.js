/*
*
* Ports are way to organize sets of Nodes.
* Ports may also define network and addressing data.
* All Nodes must be associated with a Port.
*
* Note: For projects not broadcasting Nodes can all be in the first Port.
*
* @param name			String, Port name (optional)
* @param type			
* @param address		String, Base network address (i.e. 10.0.0.1)
* @param hardwarePort	Number, Port of network address
* @param nodes			Object, Contains x, y, z, position coordinate properties
*
*/

PX.Port = function (name, type, address, hardwarePort, nodes) {

	this.name = name || "unnamed port";
	this.type = type || "test";
	this.address = address || "";
	this.nodes = nodes || [];
	this.hardwarePort = hardwarePort || 1;

};