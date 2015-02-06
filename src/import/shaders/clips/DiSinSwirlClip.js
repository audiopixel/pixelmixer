/**
 * Basic test shader in ap clip harness
 */


ap.clips.DiSinSwirlClip = {

	id: 15, 
	
	params: { // (optional uniforms)

		"p1": { value: 0.5, desc: "scale" }

	},
	
	variables: { // (optional internal variables)

		// These are internal variables that are used inside fragmentMain // TODO implement - to be defined with the shader importer
		"mov0": { type: "f" },
		"mov1": { type: "f" },
		"mov2": { type: "f" },
		"c1": { type: "f" },
		"c2": { type: "f" },
		"c3": { type: "f" }
	},


	fragmentMain: [ // Note we only need the Fragment shader and not the Vertex shader as well


		// TODO position data comes from Pod/Clip coordinates
		"p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (__p1 * 6.);",

		"mov0 = p.x+p.y+cos(sin(u_time)*2.0)*100.+sin(p.x/100.)*1000.;",
		"mov1 = p.y;",
		"mov2 = p.x;",
		"c1 = abs(sin(mov1+u_time)/2.+mov2/2.-mov1-mov2+u_time);",
		"c2 = abs(sin(c1+sin(mov0/1000.+u_time)+sin(p.y/40.+u_time)+sin((p.x+p.y)/100.)*3.));",
		"c3 = abs(sin(c2+cos(mov1+mov2+c2)+cos(mov2)+sin(p.x/1000.)));",

		"c1 = c1 * 0.25;",

		"gl_FragColor = vec4(c2,c3,c1, 1.0); // end shader"



		].join("\n"),


	// Optional JS methods that can be defined per shader 

	init: function(address, uniforms){

		//uniforms[address + "_v1"].value = Math.random(); // Example of using properties
	},

	update: function(address, uniforms){

		//uniforms[address + "_v1"].value = Math.random(); // Example of using properties
	}
};