/**
 *
 * Main Shader that all other shaders get injected into
 *
 */


PX.MainShader = {

	fragmentShader: [
		
		"#INCLUDESHADERUTILS",

		"precision mediump float;",
		"float px_index;",
		"vec4 px_xyz;",
		"vec4 px_xyz2;",
		"vec3 px_lastRgb;",
		"vec3 px_rgb = vec3(0.);",
		"vec3 px_hsv;",
		"vec3 px_rgb2;",
		"vec4 px_rgbV4;",
		"vec3 px_c = vec3(0.);",
		"vec3 px_p = vec3(0.);",
		"vec2 resolution;",
		"vec2 surfacePosition = vec2(0.);",
		"float random;",

		"float px_port;",
		"float px_id;",
		"float px_type;",


		"varying vec2 v_vUv;",
		"uniform float time;",
		"uniform float _random;",
		"uniform float u_mapSize;",
		"uniform vec2 mouse;",
		"uniform sampler2D u_coordsMap;",
		"uniform sampler2D u_prevCMap;",
		"uniform sampler2D u_portsMap;",


		"#INCLUDESHADERFUNCTIONS",

		"void main() {",

			"random = rand(vec2(gl_FragCoord[0] * (gl_FragCoord[2] + 1.), gl_FragCoord[1] * _random) * (time * 0.0001));",

			// Black is default
			
			//********************************************
			
			// px_xyz: coordinates that get overwritten with each pod
			// px_xyz2: original reference coordinates that never get overwritten
			"px_xyz2 = px_xyz = texture2D( u_coordsMap, v_vUv);",
			"if(px_xyz[3] == 0.0){ discard; }",

			"px_index = ((1.0 - v_vUv.y) * u_mapSize * u_mapSize + v_vUv.x * u_mapSize);",
			"px_lastRgb = vec3(texture2D( u_prevCMap, v_vUv));",

			"px_p = vec3(texture2D( u_portsMap, v_vUv));",
			"px_port = px_p.r;",
			"px_id = px_p.g;",
			"px_type = px_p.b;",
			"px_p = vec3(0.);",

			//********************************************

			"#INCLUDESHADERS",

			"gl_FragColor = vec4(px_c, 1.0);",

		"}"

	].join("\n")

};
