/**
 *
 * Main Shader that all other shaders get injected into
 *
 */


ap.MainShader = {

	fragmentShader: [
		
		"#INCLUDESHADERUTILS",

		"precision mediump float;",
		"float ap_index;",
		"vec4 ap_xyz;",
		"vec4 ap_xyz2;",
		"vec3 ap_lastRgb;",
		"vec3 ap_rgb = vec3(0.);",
		"vec3 ap_hsv;",
		"vec3 ap_rgb2;",
		"vec4 ap_rgbV4;",
		"vec3 ap_c = vec3(0.);",
		"vec3 ap_p = vec3(0.);",
		"vec2 resolution;",
		"float random;",

		"varying vec2 v_vUv;",
		"uniform float _time;",
		"uniform float _random;",
		"uniform float u_mapSize;",
		"uniform sampler2D u_coordsMap;",
		"uniform sampler2D u_prevCMap;",
		//uniform sampler2D u_portsMap;

		// TODO optimize this list to only include what we need each regeneration
		"#define picu  31.006276680299820175476315067101 //pi cubed, pi^3",
		"#define pisq  9.8696044010893586188344909998762 //pi squared, pi^2",
		"#define twpi  6.283185307179586476925286766559  //two pi, 2*pi ",
		"#define pi    3.1415926535897932384626433832795 //pi",
		"#define prpi  1.4396194958475906883364908049738 //pi root of pi",
		"#define trpi  1.0471975511965977461542144610932 //one third of pi, pi/3",
		"#define lgpi  0.4971498726941338543512682882909 //log(pi)       ",
		"#define rcpi  0.31830988618379067153776752674503// reciprocal of pi  , 1/pi  ",
		
		/*
		"#define ptpi 1385.4557313670110891409199368797 //powten(pi)",
		"#define pipi  36.462159607207911770990826022692 //pi pied, pi^pi",
		"#define pepi  23.140692632779269005729086367949 //powe(pi);",
		"#define chpi  11.59195327552152062775175205256  //cosh(pi)",
		"#define shpi  11.548739357257748377977334315388 //sinh(pi)",
		"#define sqpi  1.7724538509055160272981674833411 //square root of pi ",
		"#define hfpi  1.5707963267948966192313216916398 //half pi, 1/pi",
		"#define cupi  1.4645918875615232630201425272638 //cube root of pi",
		"#define lnpi  1.1447298858494001741434273513531 //logn(pi); ",
		"#define thpi  0.99627207622074994426469058001254//tanh(pi)",
		"#define rcpipi  0.0274256931232981061195562708591 // reciprocal of pipi  , 1/pipi ",*/

		"#INCLUDESHADERFUNCTIONS",

		"void main() {",

			"random = rand(vec2(gl_FragCoord[0] * (gl_FragCoord[2] + 1.), gl_FragCoord[1] * _random) * (_time * 0.0001));",

			// Black is default
			"ap_rgb = vec3(0.0);",
			
			//********************************************
			
			// ap_xyz: coordinates that get overwritten with each pod
			// ap_xyz2: original reference coordinates that never get overwritten
			"ap_xyz2 = ap_xyz = texture2D( u_coordsMap, v_vUv);",
			"if(ap_xyz[3] == 0.0){ discard; }",

			"ap_index = ((1.0 - v_vUv.y) * u_mapSize * u_mapSize + v_vUv.x * u_mapSize);",
			"ap_lastRgb = vec3(texture2D( u_prevCMap, v_vUv));",

			//********************************************

			"#INCLUDESHADERS",

			"gl_FragColor = vec4(ap_c, 1.0);",

		"}"

	].join("\n")

};
