// http://glslsandbox.com/e#17600.0
// water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07

PX.clips.Water = {

	params: {

		"p1": { value: 0.5, desc: "scale" },

	},

	fragmentMain: [

		"vec2 p = (vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y) - vec2(0.5, 0.5)) * _p1;",
		"p = p*8.0- vec2(30.0);",
		"vec2 iv2 = p;",
		"float cf = 1.0;",
		"float inten = .05;",

		"for (int n = 0; n < 10; n++) ",
		"{",
		"	float t = (time * .5) * (1.0 - (3.0 / float(n+1)));",
		"	iv2 = p + vec2(cos(t - iv2.x) + sin(t + iv2.y), sin(t - iv2.y) + cos(t + iv2.x));",
		"	cf += 1.0/length(vec2(p.x / (sin(iv2.x+t)/inten),p.y / (cos(iv2.y+t)/inten)));",
		"}",
		"cf /= float(10);",
		"cf = 1.5-sqrt(cf);",
		"gl_FragColor = vec4(pow(cf, 7.0)) + vec4(0.0, 0.15, 0.25, 1.0);"

	].join("\n")

};
