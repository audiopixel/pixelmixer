/**
 * Basic test shader in ap clip harness
 * Using minimum amount needed for a clip
 */


PX.clips.SimpleSpectrum = {

	params: { // (optional uniforms)

		"p1": { value: 0.5, desc: "amp" },
		"p2": { value: 0.0, desc: "flipmode" },
		"p3": { value: 0.0, desc: "start" },
		"p4": { value: 1.0, desc: "end" },
		"p5": { value: 1.0, desc: "green" },
		"p6": { value: 0.1, desc: "blue" }

	},

	fragmentFunctions: [
			
		[	// Reference a value from the data texture map by index
			"vec4 getTexData(float i) {",

				"float s = 32.;",
				"float sx = mod(i, s);",
				"if(sx == 0.0){ sx = s; }",
				"float sy = (i - sx) / s;",

				"return texture2D( dataTexture, vec2( sx / s, sy / s ) );",
			"}"

		].join("\n")
	],

	fragmentMain: [

		 // Resolution data
		"float rx = gl_FragCoord.x / resolution.x;",
		"float ry = gl_FragCoord.y / resolution.y;",

		// Flip X & Y
		"float amp;",
		"if(_p2 >= .5){",
			"amp = rx;",
			"rx = ry;",
			"ry = amp;",
		"}",

		// Reverse Y
		"if(_p2 >= .25 && _p2 <= .75){",
			"ry = 1. - ry;",
		"}",
		
		// Find which frequency to grab from the spectrum 
		"float a = (_p4 * 470.) * rx;",
		"float index = a + (_p3 *( 470. - a));",
		"vec4 dd = getTexData(index);",

		// Amp + RedYellowGreen effect
		"amp = _p1 * 350.;",
		"float vv = (dd.x * amp);",
		"gl_FragColor = vec4((vv * (1. - ry)) * ry, (vv * (.99 - (ry + .1))) * _p5, _p6, 1.0);"

		].join("\n")

};