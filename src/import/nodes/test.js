/**
 * Test importing node data as defined ports
 */

ap.imported = { // Attach to our ap global for easy reference now, TODO async load independent object later

	scale: 1.4, // Optional scale value

	hardwareunit: [

		{

			ports: [

				{
					
					portid: 1,

					nodes: [ 

						{}, 				// Each coordinate is optional, default values are 0
						{x: 20, y: 0},
						{x: 40, y: 0},
						{x: 60, y: 0},
						{x: 80, y: 0},
						{x: 0, y: 20},
						{x: 20, y: 20},
						{x: 40, y: 20},
						{x: 60, y: 20},
						{x: 80, y: 20},
						{x: 0, y: 40},
						{x: 20, y: 40},
						{x: 40, y: 40},
						{x: 60, y: 40},
						{x: 80, y: 40}

					]
				},

				{

					portid: 2,

					nodes: [

						{x: 100, y: 0, z: 0},
						{x: 120, y: 0, z: 0},
						{x: 140, y: 0, z: 0},
						{x: 160, y: 0, z: 0},
						{x: 180, y: 0, z: 0},
						{x: 100, y: 20, z: 0},
						{x: 120, y: 20, z: 0},
						{x: 140, y: 20, z: 0},
						{x: 160, y: 20, z: 0},
						{x: 180, y: 20, z: 0},
						{x: 100, y: 40, z: 0},
						{x: 120, y: 40, z: 0},
						{x: 140, y: 40, z: 0},
						{x: 160, y: 40, z: 0},
						{x: 180, y: 40, z: 0}

					]
				}
			]
		},

		{

			ports: [

				{
					
					portid: 3,

					nodes: [ 

						{x: 300}, 
						{x: 320, y: 0},
						{x: 340, y: 0},
						{x: 360, y: 0},
						{x: 380, y: 0},
						{x: 300, y: 20},
						{x: 320, y: 20},
						{x: 340, y: 20},
						{x: 360, y: 20},
						{x: 380, y: 20},
						{x: 300, y: 40},
						{x: 320, y: 40},
						{x: 340, y: 40},
						{x: 360, y: 40},
						{x: 380, y: 40}

					]
				},

				{

					portid: 4,

					nodes: [

						{x: 400, y: 0, z: 0},
						{x: 420, y: 0, z: 0},
						{x: 440, y: 0, z: 0},
						{x: 460, y: 0, z: 0},
						{x: 480, y: 0, z: 0},
						{x: 400, y: 20, z: 0},
						{x: 420, y: 20, z: 0},
						{x: 440, y: 20, z: 0},
						{x: 460, y: 20, z: 0},
						{x: 480, y: 20, z: 0},
						{x: 400, y: 40, z: 0},
						{x: 420, y: 40, z: 0},
						{x: 440, y: 40, z: 0},
						{x: 460, y: 40, z: 0},
						{x: 480, y: 40, z: 0}

					]
				}
			]
		}
	]

};