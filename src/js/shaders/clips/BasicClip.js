/**
 * Basic test shader in ap clip harness
 */
 

ap.clips.BasicClip = {

	id: 1, // OSC requires id's to be integers

	input: 		'rgb', // 'rgb' default if not specified, 'hsb/hsv' also excepted. 
	output: 	'rgb', // 'rgb' default if not specified, 'hsb/hsv' also excepted. 

	params: { // (uniforms)
		// each shader can have upto 6 params that are controlled by it's UI / modulations
		"p1": { type: "f", value: 0.5, desc: "scale" },
		"p2": { type: "f", value: 0.0, desc: "hue" }

	},
	
	values: { // (uniforms)
		// these are values that can be referenced from init/update methods, and passed as uniforms
		"v1": { type: "f", value: 1.0, desc: "testV1" },
		"v2": { type: "f", value: 1.0, desc: "testV2" }

	},

	fragmentShader: [ // Note we only need the Fragment shader and not the Vertex shader as well

		"float rtime = abs(u_time);",
		"p = (((0.5/*p1*/ * 18000.0) + 500.0) * vec2( ap_xyz[0], ap_xyz[2]) - ap_xyz[1] * fract(rtime*0.00007));",
		"p[0] += 0.1;",
		"vec2 q = vec2( cos(p.x), sin(p.y) );",
		"rtime = rtime + q.x * q.y + length( q );",
		"vec3 c = vec3( 0.0 );",
		"c += vec3(2.0, 2.5, 1.0) * fract( (              p.x - p.y + fract(rtime*0.0017) ) * 5.0 ) ;",
		"c -= vec3(1.0, 2.0, 2.3) * fract( (sin(u_time*0.25)*p.x - p.y + fract(rtime*0.0015) ) * 5.0 ) ;",
		"c += ( p.x * p.y );",

		"c = max(c, vec3(0.0));",
		"c = min(c, vec3(1.0));",
		"vec3 rgb_2 = c * u_mix2; // mix",

		"hsl = rgb2hsv(rgb_2); // hue knob",
		"hsl[0] += 0.0;//p2;",
		"if(hsl[0] > 1.0){ hsl[0] =  hsl[0] - floor(hsl[0]); }"

	].join("\n"),


	// Optional JS methods that can be defined per shader // TODO implement

	init: function(){

		console.log("init");
	},

	update: function(){

		console.log("update");
	}
};