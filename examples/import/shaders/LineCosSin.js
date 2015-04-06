// http://glslsandbox.com/e#18326.3

PX.clips.LineCosSin = {

	params: {

		"p1": { value: .8, desc: "scale" }

	},

	fragmentFunctions: [

		[ 
			"vec3 rotateAxis(vec3 axis, float ang, vec3 vec)",
			"{",
				"axis = normalize(axis);",
				"return vec * cos(ang) + cross(axis, vec) * sin(ang) + axis * dot(axis, vec) * (1.0 - cos(ang));",
			"}"

		].join("\n"),

		[ 
			"vec3 colorSpace(vec3 space){",
				"vec3 s = space; ",
				"space+=(2.+cos(s)+sin(s))/pi;",
				"s = (rotateAxis(space,length(space)/pi,-s));",
				
				"for(int i=1;i<3+1;i++)",
				"{",
					"float ii = float(i);",
					"float ee = pi/(float(i));",
					"space +=  (cos(s/ii)+sin(s*ee))*ee;",
				    "space.x+= (sin(s.z/ii)*sin(s.y/ii)+cos(s.x*ee))*ee;",
					"space.y+= (sin(s.x/ii)*cos(s.x/ii)+sin(s.y*ee))*ee;",
					"space.z+= (cos(s.y/ii)*sin(s.z/ii)+cos(s.z*ee))*ee;",
					"space +=  (rotateAxis(-space,ee,s))/ii;",
					
					"s += space;",
				"}",
				
				"vec3 col = 0.5+sin(s)*0.5;",
				"vec3 hol = 0.5+cos(s)*0.5;;",
				"return ((hol+col+(hol*col))/3.);",
			"}",

		].join("\n")

	],
	
	constants: [

		"#define pi    3.1415926535897932384626433832795 //pi",

	],

	fragmentMain: [

		"float t = max(_p1, .01);",
		"vec2 p = (gl_FragCoord.xy / resolution.xy - .5)*0.99 * t;",
		"p.x *= resolution.x / resolution.y;",
		
		//"look = (mouse-0.5)*2.0*pi;", // TODO add in mouse support
		"vec2 look = vec2(.5,.5);",
		"look.y = -clamp(look.y,-pi/2.0,pi/2.0);",

		"vec3 camDir = normalize(vec3(p-vec2(resolution.x/resolution.y,1.0) / 2.0, .5));",
		
		"camDir = rotateAxis(vec3(1,0,0),look.y,camDir);",
		"camDir = rotateAxis(vec3(0,1,0),look.x,camDir);",
		
		"vec3 c = colorSpace(normalize(camDir)+sin((time * .35)/pi));",

		"gl_FragColor = vec4( c, 1.0 );",

	].join("\n")

};
