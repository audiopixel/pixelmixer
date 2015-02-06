/**
 * Basic fx test shader in ap clip harness - simply offsets hue value for now

 * ****** Helper Methods:
*
* vec3 rgb2hsv(vec3 c); 						// Convert RGB to HSV
* vec3 hsv2rgb(vec3 c); 						// Convert HSV to RGB
* vec3 blend(vec3 c1, vec3 c2, float type);		// Blend Modes (1-17)
* float rand(vec2 co);							// Random Generator	(vec2)
* float mix(float a, float b, float mix);		// Mix two floats
* 
**/


ap.clips.TestFxClip = {

	id: 5,

	fx: true,

	params: {

		"p1": { value: 1.0, desc: "hue" }

	},

	fragmentMain: [

		//"ap_fxIn", // use this to capture the incoming color value, and do something with it

		//"ap_fxOut", // use this to send the outgoing color value after the fx is complete

		//"c", // use this as a temporary color value without having to declare a new one



		// let's convert to hsv
		"ap_hsv = rgb2hsv(ap_fxIn);",

		// Offset the hue
		"ap_hsv.x += __p1;",
		"if(ap_hsv.x > 1.0){",
			"ap_hsv.x -= 1.0;",
		"}",

		// Convert back to rgb
		"c = hsv2rgb(ap_hsv);",


		"ap_fxOut = vec4(c.r, c.g, c.b, 1.0);" 

		].join("\n")

};