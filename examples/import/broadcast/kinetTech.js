/*
*
* Using Philips Color Kinetics protocol on port 6038
*
*/
PX.techs.kinetTech = {

	broadcast: true,

	socketId: false,

	init: function () {

		chrome.sockets.udp.create({}, function(socketInfo) {
			this.socketId = socketInfo.socketId;
		});
		
	},

	broadcastPort: function (port, rgb) {

		//console.log("Broadcast port: " + port);
		//console.log(rgb);


		if(this.socketId /* && port.address != ""*/) {

			// Construct a UDP Packet with RGB
			var a = 24;
			var len = rgb.length;
			//if (is150Server) {
			//	a = 21;
			//}

			// !CK Protocol
			var data = new ArrayBuffer(a + len + 296);
			data[0] = 0x04;
			data[1] = 0x01;
			data[2] = 0xdc;
			data[3] = 0x4a;
			data[4] = 0x01;
			data[5] = 0x00;
			data[6] = 0x08;

			//if (is150Server) {
			//	data[6] = (byte) (PApplet.unhex("01"));
			//}

			data[7] = 0x01;
			data[8] = 0x00;
			data[9] = 0x00;
			data[10] = 0x00;
			data[11] = 0x00;
			data[12] = 0x00;
			data[13] = 0x00;
			data[14] = 0x00;
			data[15] = 0x00;

			var p = port.hardwarePort.toString(16);
			if(p.length < 2){
				p = "0" + p;
			}
			data[16] = parseInt("0x" + p);

			/*
			if (is150Server) {
				data[17] = (byte) (PApplet.unhex("ff"));
				data[18] = (byte) (PApplet.unhex("ff"));
				data[19] = (byte) (PApplet.unhex("ff"));
				data[20] = (byte) (PApplet.unhex("00"));
			} else {
				*/
				data[17] = 0x00;
				data[18] = 0x00;
				data[19] = 0x00;
				data[20] = 0x00;
				data[21] = 0x02;
				data[22] = 0x00;
				data[23] = 0x00;
			//}
			// RGB
			for (var i = 0; i < (len / 3); i++) {
				data[a] = rgb[i * 3];
				data[a + 1] = rgb[i * 3 + 1];
				data[a + 2] = rgb[i * 3 + 2];
				a += 3;
			}

			var packet = new Uint16Array(data);

			
			chrome.sockets.udp.send(this.socketId, packet.buffer, port.address, 6038, function(sendInfo) {
				console.log("sent " + sendInfo.bytesSent);
			});
			
		}

	}

};