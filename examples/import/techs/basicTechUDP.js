/*
*
* Example showing Chrome App UDP packet being sent everyframe with the passed RGB values for every port.
*
*/
PX.techs.basicTechUDP = {

	// flag we can use to indicate whether we should currently be broadcasting
	broadcast: true,

	// you don't need to set this as it will get it set when udp is ready
	socketId: false,

	init: function () {

		// Create and Bind UDP using address data
		chrome.sockets.udp.create({}, function(socketInfo) {
			chrome.sockets.udp.bind(socketInfo.socketId, "10.0.0.1", 0, function (){
				PX.techs.basicTechUDP.socketId = socketInfo.socketId;
			} );
		});
	},

	broadcastPort: function (port, rgb) {

		// If we have a socketId and port address we can broadcast
		if(PX.techs.basicTechUDP.socketId > 0 && typeof port.address != 'undefined') {

			// Reserve 3 slots for header data
			var a = 3;

			// Create array the length we want to send
			var arrayBuffer = new ArrayBuffer(a + rgb.length);
			var data = new Uint16Array(arrayBuffer);

			// Add header data manually
			data[0] = 0x0104;
			data[1] = 0x4adc;
			data[2] = 0x0001;

			// Add RGB values
			for (var i = 0; i < rgb.length; i++) {

				var m = rgb[i].toString(16);
				if(m.length < 2){
					m = "0" + m;
				}
				st = m + st;

				// Pack 3 color values into byte
				if(i % 2 === 1){
					data[a] = parseInt("0x" + st);

					st = "";
					a++;
				}
			}

			// Send UDP packet over port 8000.
			chrome.sockets.udp.send(PX.techs.basicTechUDP.socketId, data.buffer, port.address, 8000, function(sendInfo) {
				console.log("UDP Sent: " + sendInfo.bytesSent);
			});
		}
	}
};