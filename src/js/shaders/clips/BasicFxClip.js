/**
 * Basic fx test shader in ap clip harness
 */


ap.clips.BasicFxClip = {

	id: 4,

	fx: true,

	fragmentMain: [

		//"gl_FragColor", // use this (or ap_xyz) to capture the incoming color value

		//"gl_FragColor", // Do something with it

		// In this case we are switching the r and b channels:

		"gl_FragColor = vec4(ap_rgb.r, ap_rgb.r, ap_rgb.r, 1.0);" 

		].join("\n")

};