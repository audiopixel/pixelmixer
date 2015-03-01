// http://glslsandbox.com/e#18004.0

ap.clips.SineParticlesClip = {

	id: 9,

	params: {

		"p1": { value: 0.5, desc: "scale" }

	},

	fragmentFunctions: [

		[ "float  metaball ( vec2 pos, float offset) {",
				"float t = u_time + offset;",
				"vec2 metaballPos = vec2(sin(t * .8), cos(t));",
				"return 1. / length(pos - metaballPos);",
			"}"

		].join("\n")

	],
	
	fragmentMain: [

		"vec2 p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (_p1 * 6.);",

		"float cf = 0.;",
		"for(int i = 0; i < 20; i++) {",
			"cf += metaball(p, float(i) / 5.) / 20.;",
		"}",

		"gl_FragColor = vec4( vec3( cf, cf * 0.5, sin( cf + u_time / 3.0 ) * 0.75 ), 1.0 );"

	].join("\n")

};
