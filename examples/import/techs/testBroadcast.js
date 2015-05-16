/*
*
* Example test structure of a Tech.
*
* Each loaded Tech is passed a port of rgb values every frame if it's broadcast flag is on.
* It's up to the Tech to decide what to do with the color values.
* (broadcast UDP, or hit REST end points, or record colors, etc).
*
*/
PX.techs.testBroadcast = {

	broadcast: true, // Whatever you set here is the default, loaded Tech's have no other starting default state
						// Keep in mind there is also 'PX.broadcast' which is a master override for all loaded Techs.

	init: function () {

		// This gets called once on load, regardless if 'broadcast' is set true or not.

	},

	update: function () {

		// Called after all ports have called broadcastPort()

	},

	// RGB values get passed per port
	broadcastPort: function (port, rgb) {

		// RGB values in array [ c1.r, c1.g, c1.b,  c2.r, c2.g, c2.b,  c3.r, c3.g, c3.b ... ]
		console.log("Port " + port + ", has " + rgb.length + " colors.");

		// Example looping through colors
		for (var i = 0; i < rgb.length; i++) {

			// This gets called 3 times (RGB) for every color
			// console.log("Color: " + rgb[i]);

			if(i % 2 === 1){

				// This gets called after each set of RGB value
			}

		}
	}
};