// http://glslsandbox.com/e#17645.2

ap.clips.SwooshClip = {

	id: 7,

	params: {

		"p1": { value: 0.35, desc: "scale" }

	},

	fragmentMain: [

		"p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (__p1 * 2.);",
		"c = vec3(0.0,0.0,0.0);",
		"for(float i = 0.0; i < 10.0; i++)",
		"{",
			"c.r += floor(sin((p.x*16.0) * p.y + mod(u_time,3.1415*2.0))+ i*0.1)*0.1;",
			"c.g -= floor(cos((p.y*16.0) * p.x + mod(u_time,3.1415*2.0))+ i*0.1)*0.1;",
			"c.b += floor(tan((p.x*16.0) * p.y + mod(u_time*2.0,3.1415*2.0))+ i*0.2)*0.1;",
		"}",
		"gl_FragColor = vec4(c, 1.0);"

	].join("\n")

};
