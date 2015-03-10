/**
 * Basic test shader in ap clip harness
 * Draws a blue frame around red and green left to right gradients
 */


ap.clips.TestFrameClip = {

	id: 3, // OSC requires id's to be integers
	
	params: { // (optional uniforms)

		// Each shader can have upto 6 params that are controlled by it's UI / modulations
		// TODO: define display ranges that will be shown in UI (percentage of param value)
		"p1": { value: 1.0, desc: "scale" }

	},

	// Optional helper functions used inside fragmentMain // TODO implement - to be defined with the shader importer

	fragmentFunctions: [

		[ "vec3 red() {",
			"	return vec3(1.0, 0.0, 0.0);",
			"}"

		].join("\n"),

		[

			"vec4 red(float bright) {",
			"	return vec4(bright, 0.0, 0.0, 1.0);",
			"}"

		].join("\n")

	],

	/*
	* Optionally defined constants.
	* Handy for heavy lifting that only needs to happen once, yet needs to be referenced constantly.
	* Make sure to define them with unique names as they will get overwritten if clips have different values but same names.
	*/
	constants: {

		"test_constant": { type: "v2", value: "vec2(1. * 2., 1.)" }

	},

	fragmentMain: [ // Note we only need the Fragment shader and not the Vertex shader as well

		/**
		*
		* ****** Helper Properties:
		* 
		* float ap_index;								// Current node: index value (integer)
		* vec4 ap_xyz;									// Current node: xyz coordinates (or other values to map to)
		* vec3 ap_lastRgb;								// Current node: rgb value last frame. 4th value discard slot
		* vec3 ap_rgb;									// Current node: rgb ouput value
		* 
		* float _time;									// Uniform: Animation speed, movement should be tied to this other inputs
		* float _random;								// Uniform: Random value (0-1)
		* float u_mapSize;								// Uniform: The pixelmap size of all nodes
		* sampler2D u_coordsMap;						// Uniform: The xyz coordinates of all nodes stored in a texture
		* sampler2D u_prevCMap;							// Uniform: The previous rgb colors of all nodes stored in a texture
		*
		*
		* ****** Helper Methods:
		*
		* vec3 rgb2hsv(vec3 c); 						// Convert RGB to HSV
		* vec3 hsv2rgb(vec3 c); 						// Convert HSV to RGB
		* vec3 blend(vec3 c1, vec3 c2, float type);		// Blend Modes (1-17)
		* float rand(vec2 co);							// Random Generator	(vec2)
		* float mix(float a, float b, float mix);		// Mix two floats
		* 
		**/

		/**
		* 
		* ****** Still to come: (work in progress) // TODO
		*
		* sampler2D u_portsMap		
		* Clip position data: scale and offset
		* PortId data
		* HardwareGroup Id's
		* Pod's positiond data: x y z width height depth
		*
		* Loader harness to bootstrap these values to any GLSL fragment shader
		* 
		**/

		"float rx = gl_FragCoord.x / resolution.x;",
		"float ry = gl_FragCoord.y / resolution.y;",

		//"blue = red(0.0).r;", // Example of using a helper method
		"float blue = 0.;//__v1;", // Example of using a property

		"float cf = ((_p1 * .5) + .5) * .98;", // Example of using a built in already existing var (nice to not have to create another one)
		
		// Create a blue border
		"if(ry < (1. - cf) || ry > (cf)){",
		"	blue = 1.0;",
		"}else if(rx < (1. - cf) || rx > (cf)){",
		"	blue = 1.0;",
		"}",

		"gl_FragColor = vec4( rx, ry, blue, 1.0 );"
		//"gl_FragColor = vec4( 0., 0., blue, 1.0 );"


		//"vec3 c = vec3(1., 0., 0.);",
		//"gl_FragColor = vec4( 0.5, 0., 1., 1.0 );"

		].join("\n"),


	// Optional JS methods that can be defined per shader 

	init: function(address, uniforms){

		//uniforms[address + "_v1"].value = Math.random(); // Example of using properties
	},

	update: function(address, uniforms){

		//uniforms[address + "_v1"].value = Math.random(); // Example of using properties
	}
};