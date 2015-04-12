/*
*
* Using Philips Color Kinetics protocol on port 6038
*
*/
PX.techs.kinetTech = {

	broadcast: true,

	socketId: false,

	init: function () {

		// Create and Bind UDP
		chrome.sockets.udp.create({}, function(socketInfo) {
			chrome.sockets.udp.bind(socketInfo.socketId, "0.0.0.0", 0, function (){
				PX.techs.kinetTech.socketId = socketInfo.socketId;
			} );
		});
	},

	broadcastPort: function (port, rgb) {

		if(PX.techs.kinetTech.socketId > 0 && typeof port.address != 'undefined') {

			while(rgb.length < 216){

				// Each pack must be at least 72 nodes worth of RGB data, if we have less add black.
				rgb.push(0);
			}

			// Construct a UDP Packet with RGB
			var a = 24;
			var len = rgb.length;

			//if (is150Server) {
			//	a = 21;
			//}

			var arrayBuffer = new ArrayBuffer(a + len + 296);
			var data = new Uint16Array(arrayBuffer);

			// !CK Protocol
			data[0] = 0x0104;
			data[1] = 0x4adc;
			data[2] = 0x0001;

			//if (is150Server) {
			//	data[6] = (byte) (("01")); // instead of 0x08
			//}// data[3] = 0x08;

			data[3] = 0x0108;
			data[4] = 0x0000;
			data[5] = 0x0000;
			data[6] = 0xffff;
			data[7] = 0xffff;

			var p = port.hardwarePort.toString(16);
			if(p.length < 2){
				p = "0" + p;
			}
			data[8] = parseInt("0x00" + p);

			/*
			if (is150Server) {
				data[17] = (byte) (("ff")); 9
				data[18] = (byte) (("ff")); 
				data[19] = (byte) (("ff")); 10
				data[20] = (byte) (("00"));
			} else {
				*/
				data[9]  = 0x0000;
				data[10] = 0x0200;
				data[11] = 0x0000;
			//}

			data[12] = 0x0000;

			a = 12;
			var st = "";

			// RGB
			for (var i = 0; i < rgb.length; i++) {

				var m = rgb[i].toString(16);
				if(m.length < 2){
					m = "0" + m;
				}
				st = m + st;

				if(i % 2 === 1){
					data[a] = parseInt("0x" + st);

					st = "";
					a++;
				}
			};

			// Send RGB data as a UDP packet with CK header data over port 6038.
			chrome.sockets.udp.send(PX.techs.kinetTech.socketId, data.buffer, port.address, 6038, function(sendInfo) {
				//console.log("UDP Sent: " + sendInfo.bytesSent);
			});
		}
	}
};