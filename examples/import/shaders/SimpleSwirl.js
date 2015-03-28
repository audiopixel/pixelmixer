// http://glslsandbox.com/e#19453.0

PX.clips.SimpleSwirl = {

	params: {

		"p1": { value: 1.0, desc: "scale" }

	},

	fragmentMain: [

		"vec2 p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (_p1 * 4.);",
		"for(int i=1;i<50;i++)",
		"{",
			"vec2 newp=p;",
			"newp.x+=0.6/float(i)*sin(float(i)*p.y+time*20.0/40.0+0.3*float(i))+1.0;",
			"newp.y+=0.6/float(i)*sin(float(i)*p.x+time*20.0/40.0+0.3*float(i+10))-1.4;",
			"p=newp;",
		"}",
		"vec3 c=vec3(0.5*sin(3.0*p.x)+0.5,0.5*sin(3.0*p.y)+0.5,sin(p.x+p.y));",
		"gl_FragColor=vec4(c, 1.0);"

	].join("\n")

};
