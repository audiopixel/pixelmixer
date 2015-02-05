// http://glslsandbox.com/e#19453.0

ap.clips.SimpleSwirlClip = {

	id: 13,

	params: {

		"p1": { value: 1.0, desc: "scale" }

	},

	variables: { // (optional internal variables)

		"newp": { type: "v2" }

	},

	fragmentMain: [

		"p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (p1 * 4.);",
		"for(int i=1;i<50;i++)",
		"{",
			"newp=p;",
			"newp.x+=0.6/float(i)*sin(float(i)*p.y+u_time*20.0/40.0+0.3*float(i))+1.0;",
			"newp.y+=0.6/float(i)*sin(float(i)*p.x+u_time*20.0/40.0+0.3*float(i+10))-1.4;",
			"p=newp;",
		"}",
		"c=vec3(0.5*sin(3.0*p.x)+0.5,0.5*sin(3.0*p.y)+0.5,sin(p.x+p.y));",
		"gl_FragColor=vec4(c, 1.0);"

	].join("\n")

};
