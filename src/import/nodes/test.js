/**
 * Test importing node data as defined ports
 */

ap.imported = { // Attach to our ap global for easy reference now, TODO async load independent object later

	scale: 3.0, // Optional scale value

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

};