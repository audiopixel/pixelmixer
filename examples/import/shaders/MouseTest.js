/**
 * Basic mouse test. Reference the vec2 mouse.
 */


PX.clips.MouseTest = {

	fragmentMain: [
		
		"gl_FragColor = vec4(mouse.x, 0., mouse.y, 1.0);" 

		].join("\n")

};
