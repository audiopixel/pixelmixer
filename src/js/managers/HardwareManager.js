/*
* ************* HARDWARE MANAGER *************** 
*
* Handles adding and removing Physical Hardware in the Universe as either a Node or a Plane.
*
*/

var HardwareManager = function (ap) {

};

HardwareManager.prototype = {

	init: function () {

		ap.state.setPortState(1, 2, "port name 01", ap.PORT_TYPE_KINET_1, "10.0.0.20");
		this.addNodeTestGrid(1, 0);
		
		ap.state.setPortState(2, 2, "port name 02", ap.PORT_TYPE_KINET_1, "10.0.0.21");
		this.addNodeTestGrid(2, -440);

/*
		// testing
		var that = this;
		setTimeout(function(){
			ap.state.setPortState(2, 2, "port name 02", ap.PORT_TYPE_KINET_1, "10.0.0.21");
			that.addNodeTestGrid(2, -440);
		}, 1000);
*/
	},

	update: function () {

		//console.log('update ' + this.tick);
	},

	addNodeTestGrid: function (port, yOffset) {

		var nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var node = {};
				node.x = (e * 30) - 370;
				node.y = (i * 30) - 200 + yOffset;
				node.z = 0;
				nodes.push(node);
			}
		}

		ap.state.addNodes(port, nodes);
	}

}
