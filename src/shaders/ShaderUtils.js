/**
 * Shader Utils:
 *
 * ** Helper Methods for each imported shader:
 *
 * vec3 rgb2hsv(vec3 c); 						// Convert RGB to HSV
 * vec3 hsv2rgb(vec3 c); 						// Convert HSV to RGB
 * vec3 blend(vec3 c1, vec3 c2, float type);	// Blend Modes (1-17)
 * float rand(vec2 co);							// Random Generator	(vec2)
 *
 */


PMX.shaders.ShaderUtils = [

	"vec3 rgb2hsv(vec3 c){",
	    "vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
	   " vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));",
	    "vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));",

	    "float d = q.x - min(q.w, q.y);",
	    "float e = 1.0e-10;",
	    "return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
	"}",

	"vec3 hsv2rgb(vec3 c) {",
	"	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
	"	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
	"	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
	"}",


	"vec3 blend(vec3 c1, vec3 c2, float type)",
	"{",
		"if(type == 0.0){ return c1; }else						",// Off",
		"if(type == 1.0){ return c1 + c2; }else					",// Add",
		"if(type == 2.0){ return c1 - c2; }else					",// Subtract",
		"if(type == 3.0){ return min(c1, c2); }else				",// Darkest",
		"if(type == 4.0){ return max(c1, c2); }else				",// Lighest",
		"if(type == 5.0){ return abs(c2 - c1); }else				",// DIFFERENCE",
		"if(type == 6.0){ return c1 + c2 - 2.0 * c1 * c2; }else	",// EXCLUSION",
		"if(type == 7.0){ return c1 * c2; }else					",// Multiply",
		"if(type == 8.0){ return (c1 + c2) - (c1 * c2); }else	",// Screen",
		//"													// Overlay",
		"if(type == 9.0){ return vec3((c2.r <= 0.5) ? (2.0 * c1.r * c2.r) : (1.0 - 2.0 * (1.0 - c2.r) * (1.0 - c1.r)),(c2.g <= 0.5) ? (2.0 * c1.g * c2.g) : (1.0 - 2.0 * (1.0 - c2.g) * (1.0 - c1.g)),(c2.b <= 0.5) ? (2.0 * c1.b * c2.b) : (1.0 - 2.0 * (1.0 - c2.b) * (1.0 - c1.b))); }else",
		//"													// HARD LIGHT",
		"if(type == 10.0){ return vec3((c1.r <= 0.5) ? (2.0 * c1.r * c2.r) : (1.0 - 2.0 * (1.0 - c1.r) * (1.0 - c2.r)),(c1.g <= 0.5) ? (2.0 * c1.g * c2.g) : (1.0 - 2.0 * (1.0 - c1.g) * (1.0 - c2.g)),(c1.b <= 0.5) ? (2.0 * c1.b * c2.b) : (1.0 - 2.0 * (1.0 - c1.b) * (1.0 - c2.b))); }else",
		//"												// SOFT LIGHT",
		"if(type == 11.0){ return vec3((c1.r <= 0.5) ? (c2.r - (1.0 - 2.0 * c1.r) * c2.r * (1.0 - c2.r)) : (((c1.r > 0.5) && (c2.r <= 0.25)) ? (c2.r + (2.0 * c1.r - 1.0) * (4.0 * c2.r * (4.0 * c2.r + 1.0) * (c2.r - 1.0) + 7.0 * c2.r)) : (c2.r + (2.0 * c1.r - 1.0) * (sqrt(c2.r) - c2.r))),(c1.g <= 0.5) ? (c2.g - (1.0 - 2.0 * c1.g) * c2.g * (1.0 - c2.g)) : (((c1.g > 0.5) && (c2.g <= 0.25)) ? (c2.g + (2.0 * c1.g - 1.0) * (4.0 * c2.g * (4.0 * c2.g + 1.0) * (c2.g - 1.0) + 7.0 * c2.g)) : (c2.g + (2.0 * c1.g - 1.0) * (sqrt(c2.g) - c2.g))),(c1.b <= 0.5) ? (c2.b - (1.0 - 2.0 * c1.b) * c2.b * (1.0 - c2.b)) : (((c1.b > 0.5) && (c2.b <= 0.25)) ? (c2.b + (2.0 * c1.b - 1.0) * (4.0 * c2.b * (4.0 * c2.b + 1.0) * (c2.b - 1.0) + 7.0 * c2.b)) : (c2.b + (2.0 * c1.b - 1.0) * (sqrt(c2.b) - c2.b)))); }else",
		//"												// DODGE",
		"if(type == 12.0){ return vec3((c1.r == 1.0) ? 1.0 : min(1.0, c2.r / (1.0 - c1.r)),(c1.g == 1.0) ? 1.0 : min(1.0, c2.g / (1.0 - c1.g)),(c1.b == 1.0) ? 1.0 : min(1.0, c2.b / (1.0 - c1.b))); }else",
		//"													// Burn",
		"if(type == 13.0){ return vec3((c1.r == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.r) / c1.r)),(c1.g == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.g) / c1.g)), (c1.b == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.b) / c1.b))); }else",
		"if(type == 14.0){ return (c1 + c2) - 1.0; }else",//			// LINEAR BURN",
		"if(type == 15.0){ return 2.0 * c1 + c2 - 1.0; }else",//		// LINEAR LIGHT	",	
		//"													// VIVID LIGHT",
		"if(type == 16.0){ return vec3((c1.r <= 0.5) ? (1.0 - (1.0 - c2.r) / (2.0 * c1.r)) : (c2.r / (2.0 * (1.0 - c1.r))),(c1.g <= 0.5) ? (1.0 - (1.0 - c2.g) / (2.0 * c1.g)) : (c2.g / (2.0 * (1.0 - c1.g))),(c1.b <= 0.5) ? (1.0 - (1.0 - c2.b) / (2.0 * c1.b)) : (c2.b / (2.0 * (1.0 - c1.b)))); }else",
		//"											// PIN LIGHT",
		"if(type == 17.0){ return vec3((c1.r > 0.5) ? max(c2.r, 2.0 * (c1.r - 0.5)) : min(c2.r, 2.0 * c1.r), (c1.r > 0.5) ? max(c2.g, 2.0 * (c1.g - 0.5)) : min(c2.g, 2.0 * c1.g),(c1.b > 0.5) ? max(c2.b, 2.0 * (c1.b - 0.5)) : min(c2.b, 2.0 * c1.b)); }else",
		"{ return c1 + c2; }								",//		// Add (default)",
	"}",
/*
	"vec3 nv(vec4 c)",
	"{",
	  "  return max(min(vec3(c.r, c.g, c.b), vec3(1.0)), vec3(0.0));",
	"}",
*/
	
	"float rand(vec2 co)",
	"{",
	  "  highp float a = 12.9898;",
	  "  highp float b = 78.233;",
	  "  highp float c = 43758.5453;",
	  "  highp float dt= dot(co.xy ,vec2(a,b));",
	  "  highp float sn= mod(dt,3.14);",
	  "  return fract(sin(sn) * c);",
	"}"


].join("\n");