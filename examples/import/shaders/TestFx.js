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


PX.clips.TestFx = {

	fx: true,

	params: {

		"p1": { value: 1.0, desc: "hue" }

	},

	fragmentMain: [

		//"_fxIn", // use this to capture the incoming color value, and do something with it

		//"c", // use this as a temporary color value without having to declare a new one



		// let's convert to hsv
		"px_hsv = rgb2hsv(_fxIn);",

		// Offset the hue
		"px_hsv.x += _p1;",
		"if(px_hsv.x > 1.0){",
			"px_hsv.x -= 1.0;",
		"}",

		// Convert back to rgb
		"vec3 c = hsv2rgb(px_hsv);",


		"gl_FragColor = vec4(c.r, c.g, c.b, 1.0);" 

		].join("\n")

};