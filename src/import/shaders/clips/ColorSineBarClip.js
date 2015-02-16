// http://glslsandbox.com/e#17790.0
/*
  Daily an hour GLSL sketch by @chimanaco 11/30
*/

ap.clips.ColorSineBarClip = {

	id: 8,

	params: {

		"p1": { value: 0.1, desc: "scale" },

	},

	variables: { // (optional internal variables)

		"direction": { type: "v2" },
		"sx": { type: "f" },
		"dy": { type: "f" }

	},

	fragmentMain: [

		"p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (__p1 * 2.);",
		"direction = vec2(cos(u_time), sin(u_time));",

		"sx = 0.15 * sin( 5.0 * p.x - u_time - length(p)); ",
		"dy = 1.0 / ( 10.0 * abs(p.y - sx ));",
		"c = hsv2rgb(vec3( ( (p.x + 0.1) * dy) * 0.5 + cos(dot(p, direction)) * 5.0, 0.4, dy));",
		"gl_FragColor = vec4( c, 1.0 );"

	].join("\n")

};
