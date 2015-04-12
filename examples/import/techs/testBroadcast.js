/*
*
* Example test structure of a Tech.
*
* Each loaded Tech is passed a port of rgb values every frame if it's broadcast flag is on.
* It's up to the Tech to decide what to do with the color values.
* (broadcast UDP, or hit REST end points, or record colors, etc).
*
*/
PX.techs.testBroadcastType = {

	broadcast: true, // Whatever you set here is the default, loaded Tech's have no other starting default state
						// Keep in mind there is also 'PX.broadcast' which is a master override for all loaded Techs.

	init: function () {

		// This gets called once on load, regardless if 'broadcast' is set true or not.
		
	},

	broadcastPort: function (port, rgb) {

		// This gets called every frame, but only if 'broadcast' is set true.

		//console.log("Broadcast port: " + port);
		//console.log(rgb);

	}

};