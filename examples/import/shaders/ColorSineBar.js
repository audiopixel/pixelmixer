// http://glslsandbox.com/e#17790.0
/*
  Daily an hour GLSL sketch by @chimanaco 11/30
*/

PX.clips.ColorSineBar = {

	params: {

		"p1": { value: 0.5, desc: "scale" },

	},

	fragmentMain: [

		"vec2 p = (( gl_FragCoord.xy / resolution.xy ) - vec2(0.5, 0.5)) * (_p1 * 2.);",
		"vec2 direction = vec2(cos(time), sin(time));",

		"float sx = 0.15 * sin( 5.0 * p.x - time - length(p)); ",
		"float dy = 1.0 / ( 10.0 * abs(p.y - sx ));",
		"vec3 c = hsv2rgb(vec3( ( (p.x + 0.1) * dy) * 0.5 + cos(dot(p, direction)) * 5.0, 0.4, dy));",
		"gl_FragColor = vec4( c, 1.0 );"

	].join("\n")

};
