/**
 * Basic fx test shader in ap clip harness
 */


ap.clips.BasicFxClip = {

	id: 4,

	fx: true,

	fragmentMain: [

		//"ap_fxIn", // use this to capture the incoming color value, and do something with it

		//"ap_fxOut", // use this to send the outgoing color value after the fx is complete

		//"ap_temp", // use this as a temporary color value without having to declare a new one


		// In this case we are switching the r and b channels:

		"ap_fxOut = vec4(ap_fxIn.b, ap_fxIn.g, ap_fxIn.r, 1.0);" 

		].join("\n")

};