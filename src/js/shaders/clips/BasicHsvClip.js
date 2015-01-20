/**
 * Basic HSV test shader in ap clip harness
 */


ap.clips.BasicHsvClip = {

	id: 3,

	input: 		'rgb',
	output: 	'hsv',

	fragmentMain: [

		"gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);" // Output RGB Red

		// TODO
		//"gl_FragColorHsv = vec4(1.0, 0.0, 1.0, 1.0);" // Output HSV Red

		].join("\n")

};
