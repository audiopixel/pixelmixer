/**
 * Single Color
* 
**/


PX.clips.SolidColor = {

	params: {

		"p1": { value: 1.0, desc: "hue" }

	},

	fragmentMain: [

		// TODO add in control as RGB or HSV or both
		"vec3 c = vec3(1., 0., 0.);",

		// let's convert to hsv
		"c = rgb2hsv(c);",

		// Set the hue
		"c.x = _p1;",

		// Convert back to rgb
		"c = hsv2rgb(c);",


		"gl_FragColor = vec4( c.r, c.g, c.b, 1.0 );"

		].join("\n")

};