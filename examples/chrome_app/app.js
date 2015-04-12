var glWidth = window.innerWidth;
var glHeight = window.innerHeight;

var scene;
var renderer;
var camera;
var controls;
var container;


window.addEventListener("load", function() {

	// ----------------


	// ** Standard Three.js setup

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer(); 
	renderer.setSize( glWidth, glHeight );
	renderer.autoClear = false;

	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement ); 

	camera = new THREE.PerspectiveCamera( 30, glWidth / glHeight, 1, 100000 );
	camera.position.z = 2000;
	controls = new THREE.TrackballControls( camera, renderer.domElement);


	// ----------------


	// ** Initialize PixelMixer

	PX.init(scene, renderer, {  broadcast: true, readPixels: true, pointSize: 30, pointSprite: "images/nodeflare250.png" });
	PX.setSize(glWidth, glHeight);


	// ----------------


	// ** Add a simple grid of Nodes 

	var params = {};		// Position coordinates for the entire grid
	params.x = -275;		
	params.y = -275;
	params.z = -0;
	params.width = 6;		// How many pixels for the entire grid
	params.height = 6;
	params.pitch = 110;		// How far each pixel is spaced

	PX.hardware.addSimpleNodeGrid(params);
	PX.updateNodePoints();


	// This tells the 'testBroadcast' tech to broadcast the color values of the port we just created
	PX.ports.getPort(1).type = "kinetTech";
	PX.ports.getPort(1).broadcast = true;
	PX.ports.getPort(1).hardwarePort = 16;
	PX.ports.getPort(1).address = "10.0.3.185";


	// ----------------


	// ** Add a shader to Channel 1

	PX.simpleSetup({channel: 1, ids: ["HexifyRadial"]});

	// Change scale
	PX.set("p1", .3, 1, 1, 1); // Channel 1, Pod 1, Clip 1


	// ----------------


	// ** Start the main loop

	animate();


});

function animate() {

	// Main update loop

	if(PX.ready){

		PX.update();
		controls.update();
		renderer.render( scene, camera );

	}

	requestAnimationFrame( animate );
}


function onWindowResize() {

	// Resize logic
	glWidth = window.innerWidth;
	glHeight = window.innerHeight;

	PX.setSize(glWidth, glHeight);

	camera.aspect = glWidth / glHeight;
	camera.updateProjectionMatrix();
	controls.handleResize();

}
window.addEventListener( 'resize', onWindowResize, false );