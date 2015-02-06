/**
 * Basic fx test shader in ap clip harness

 * ****** Helper Methods:
*
* vec3 rgb2hsv(vec3 c); 						// Convert RGB to HSV
* vec3 hsv2rgb(vec3 c); 						// Convert HSV to RGB
* vec3 blend(vec3 c1, vec3 c2, float type);		// Blend Modes (1-17)
* float rand(vec2 co);							// Random Generator	(vec2)
* float mix(float a, float b, float mix);		// Mix two floats
* 
**/


ap.clips.HueFxClip = {

	id: 16,

	fx: true,

	params: {

		"p1": { value: 1.0, desc: "hue" },
		"p2": { value: 1.0, desc: "saturation" },
		"p3": { value: 0.0, desc: "thresMin" },
		"p4": { value: 1.0, desc: "thresMax" },
		"p5": { value: 1.0, desc: "sparkleRate" },
		"p6": { value: 0.0, desc: "sparkleHue" }

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

		// Clamp the saturation
		"ap_hsv.y *= __p2;",

/*
		// Min and Max 
		"t = __p4;",
		"if(t == 1.0){t = 0.0;}",
		"if(ap_hsv[0] > 1.0){ ap_hsv[0] =  ap_hsv[0] - floor(ap_hsv[0]); }",
		"if(t > __p3 && (ap_hsv[2] > t || ap_hsv[2] < __p3)){",
			// Fully discard brightness for now - could soften with various factors
			"ap_hsv[2] = 0.;",
		"}",
*/

		// whitesparkle based on threshold brightness
		"ap_hsv[2] = min(ap_hsv[2], 1.0);",
		"if(ap_hsv[2] > __p5){",
			"if(random > (.95 + ((1.0 - __p6) * .05) )){",
				"ap_hsv[1] = 0.0;",
				"ap_hsv[2] = 1.0;",
			"}else{",
				"ap_hsv[2] = 0.0;",
			"}",
		"}",

		//"if(ap_hsv[0] > 1.0){ ap_hsv[0] =  ap_hsv[0] - floor(ap_hsv[0]); }",

/*
		// whitesparkle based on hue
		"t = ap_hsv[0] + __p5;",
		"if(t > 1.0){ t = t- floor(t); }",
		"if(t < 0.05){",
			"if(random > (0.8 + ((1.0 - __p6) * .3) )){",
				"ap_hsv[2] = 1.0;",
			"}",
		"}",
*/

		// Convert back to rgb
		"c = hsv2rgb(ap_hsv);",

		// Output fx
		"ap_fxOut = vec4(c.r, c.g, c.b, 1.0);" 

		].join("\n")

};