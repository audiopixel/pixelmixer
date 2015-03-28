// http://glslsandbox.com/e#17645.2

PX.clips.SinCosTan = {

	params: {

		"p1": { value: 0.35, desc: "scale" }

	},

	fragmentMain: [

		"vec2 p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (_p1 * 2.);",
		"vec3 c = vec3(0.,0.,0.);",
		"for(float i = 0.; i < 10.; i++)",
		"{",
			"c.r += floor(sin((p.x*16.) * p.y + mod(time,3.1415*2.0))+ i*0.1)*0.1;",
			"c.g -= floor(cos((p.y*16.) * p.x + mod(time,3.1415*2.0))+ i*0.1)*0.1;",
			"c.b += floor(tan((p.x*16.) * p.y + mod(time*2.0,3.1415*2.0))+ i*0.2)*0.1;",
		"}",
		"gl_FragColor = vec4(c, 1.0);"

	].join("\n")

};
