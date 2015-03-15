/**
 * Simple shader for displaying a texture
 */
 

ap.shaders.SimpleTextureShader = {

	uniforms: {

		"u_texture":   { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 v_vUv;",
		"void main() {",
			"v_vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 v_vUv;",
		"uniform sampler2D u_texture;",

		"void main() {",
		"	gl_FragColor = texture2D( u_texture, v_vUv );",
		"}",

	].join("\n")

};
