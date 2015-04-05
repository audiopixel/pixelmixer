/**
 *
 * Simple node shader for displaying on ap nodes
 *
 * Overide this class to represent nodes in different ways
 *
 */


PX.shaders.PointCloudShader = {

	uniforms: {
		//u_colorMap:   { type: "t", value: null },
		//u_texture:    { type: "t", value: null }
	},

	attributes: { 
		//a_geoX:        { type: 'fv1', value: null },
		//a_geoY:        { type: 'fv1', value: null },
		//a_index:        { type: 'fv1', value: null }
	},

	vertexShader: [

		"uniform float u_res;",
		"attribute float a_pointSizes;",
		"attribute float a_geoX;",
		"attribute float a_geoY;",
		"attribute float a_index;",
		"attribute float a_texId;",
		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_index;",
		"varying float v_texId;",

		"void main() {",
			"v_geoX = a_geoX;",
			"v_geoY = a_geoY;",
			"v_index = a_index;",
			"v_texId = a_texId;",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"gl_PointSize = (a_pointSizes * ( 4000. /  length( mvPosition.xyz )  )) / u_res;",
			"gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform int u_useTexture;",
		"uniform sampler2D u_texture;",
		"uniform sampler2D u_texture1;",
		"uniform sampler2D u_texture2;",
		"uniform sampler2D u_colorMap;",

		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_index;",
		"varying float v_texId;",

		"void main() {",

			"if(v_texId == 0.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texture, gl_PointCoord);", // default
			"}else if(v_texId == 1.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texture1, gl_PointCoord);",
			"}else if(v_texId == 2.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texture2, gl_PointCoord);",
			"}else{",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * vec4(1.);",
			"}",
		"}"

	].join("\n")

};
