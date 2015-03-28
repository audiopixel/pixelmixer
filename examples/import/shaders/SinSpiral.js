// http://glslsandbox.com/e#18044.4
// Shader by Nicolas Robert [NRX]
// bqq
// modified by @hintz

PX.clips.SinSpiral = {

	params: {

		"p1": { value: 1.0, desc: "scale" }

	},

	fragmentMain: [

		"float t = max(_p1, .01);",
		"vec2 p = (gl_FragCoord.xy / resolution.xy - .5)*0.99 * t;",
		"p.x *= resolution.x / resolution.y;",
		"float d2D = 0.8 / length (p) + time  * 5.0;",
		"float a2D = atan (p.y, p.x);",
		"float qq = d2D * 0.1 + sin(d2D) * 0.2 * cos(a2D * 3.0) + sin(d2D * 0.2) * 0.3 * cos(a2D * 8.0)",
			"+ max(0.0, sin(d2D * 0.1 + 99.0) - 0.5) * cos(a2D * 20.0 + sin(d2D * 0.2) * 5.0)",
			"+ max(0.0, sin(d2D * 0.03 + 201.0) - 0.5) * cos(a2D * 15.0 + sin(d2D * 0.2) * 5.0);",
		"vec3 c = vec3(sin(qq * 2.0), sin(qq * 3.1), sin(qq * 5.01));",
		
		"c = c * 0.5 + 0.5;",
		"gl_FragColor = vec4(c, 1.0);"

	].join("\n")

};
