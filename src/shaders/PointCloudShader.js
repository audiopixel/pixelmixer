/**
 *
 * Simple node shader for displaying on ap nodes
 *
 * Overide this class to represent nodes in different ways
 *
 */


PX.shaders.PointCloudShader = {

	vertexShader: [

		"uniform float u_res;",
		"attribute float a_pointSizes;",
		"attribute float a_geoX;",
		"attribute float a_geoY;",
		"attribute float a_texId;",
		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_texId;",

		"void main() {",
			"v_geoX = a_geoX;",
			"v_geoY = a_geoY;",
			"v_texId = a_texId;",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"gl_PointSize = (a_pointSizes * ( 5000. /  length( mvPosition.xyz )  )) / u_res;",
			"gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform int u_useTexture;",
		"uniform sampler2D u_colorMap;",
		"uniform sampler2D u_texArray[ 3 ];",

		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_texId;",

		//"vec4 distBall = vec4(1.0);",

		"void main() {", 

			// TODO, expose ability to use this ball sprite
			//"distBall = 1.- (vec4(sqrt(  pow(.5 - gl_PointCoord.x, 2.) + pow(.5 - gl_PointCoord.y, 2.)  )) * 2.);",

			"if(v_texId > 7.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texArray[2], gl_PointCoord);",
			"}else if(v_texId > 5.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texArray[1], gl_PointCoord);",
			"}else if(v_texId > 3.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texArray[0], gl_PointCoord);",
			"}else{",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * vec4(1.);",
			"}",

			"if (gl_FragColor.a < 0.05) {",
	            "discard;",
	        "}",
		"}"

	].join("\n")

};
