/*
*
* Ports are way to organize sets of Nodes.
* Ports may also define network and addressing data.
* All Nodes must be associated with a Port.
*
* Note: For projects not broadcasting Nodes can all be in the first Port.
*
* @param name			String, Port name (optional)
* @param type			ID
* @param broadcast		Boolean, If true (and PX.broadcast too) broadcast out using type protocol
* @param address		String, Base network address (i.e. 10.0.0.1)
* @param hardwarePort	Number, Port of network address
* @param nodes			Object, Contains x, y, z, position coordinate properties
*
*/

PX.Port = function (params) {

	params = 			params || {};
	this.name = 		params.name || "";
	this.type = 		params.type || "test";
	this.broadcast = 	params.broadcast || false;
	this.address = 		params.address || "";
	this.nodes = 		params.nodes || [];
	this.nodesType = 	params.nodesType || 0;
	this.hardwarePort = params.hardwarePort || 1;
	this.id =			params.id || -1;

};