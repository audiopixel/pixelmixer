// http://glslsandbox.com/e#19474.0

PX.clips.HexifyRadial = {

	params: {

		"p1": { value: 1.0, desc: "scale" }

	},

	fragmentFunctions: [ 

		[ 
			"vec2 hexifyWash(vec2 p,float hexCount){",
				"p*=hexCount;",
				"vec3 p2=floor(vec3(p.x/0.86602540378,p.y+0.57735026919*p.x,p.y-0.57735026919*p.x));",
				"float y=floor((p2.y+p2.z)/3.0);",
				"float x=floor((p2.x+(1.0-mod(y,2.0)))/2.0);",
				"return vec2(x,y)/hexCount;",
			"}"

		].join("\n")

	],

	fragmentMain: [

		"vec2 p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (_p1);",
		"p.x*=resolution.x/resolution.y;",
		"p=hexifyWash(p,80.0);",
		"float vr = 0.5*sin(10.*sqrt((p.x-0.5)*(p.x-0.5)+(p.y-0.5)*(p.y-0.5))+time*2.5)+0.5;",
		"float vg = 0.5*sin(20.*sqrt((p.x-0.5)*(p.x-0.5)+(p.y-0.25)*(p.y-0.25))-time*3.5)+0.5;",
		"float vb = 0.5*sin(30.*sqrt((p.x-0.5)*(p.x-0.5)+(p.y)*(p.y))+time*1.5)+0.5;",
		"gl_FragColor = vec4(vr,vg,vb,1);"

	].join("\n")

};
