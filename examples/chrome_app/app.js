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

	PX.init(scene, renderer, {  speed: .012, broadcast: true, readPixels: true, pointSize: 30, pointSprite: "images/nodeflare250.png" });
	PX.setSize(glWidth, glHeight);


	// ----------------


	addCkDenseTile(1, 60, -275);
	addCkDenseTile(1, -680, -275);
	//addCkDenseTile(2, -275, 475);
	//addCkDenseTile(2, -925, 475);

	PX.updateNodePoints();

	// This flags each port for broadcasing with the "kinetTech"
	for (var i = 0; i < 1; i++) {
		PX.ports.getPort(i+1).type = "kinetTech";
		PX.ports.getPort(i+1).broadcast = true;
		PX.ports.getPort(i+1).hardwarePort = i+1;
		PX.ports.getPort(i+1).address = "10.0.3.185";
	}


	// ----------------


	// ** Add a shader to Channel 1

	PX.simpleSetup({channel: 1, ids: ["HexifyRadial"]});

	// Change scale
	PX.set("p1", .3, 1, 1, 1); // Channel 1, Pod 1, Clip 1



	// ----------------


	// ** Start the main loop

	animate();


});

function addCkDenseTile(port, x, y) {

	// ** Add a simple grid of Nodes 

	var params = {};		// Position coordinates for the entire grid
	params.x = x;		
	params.y = y;
	params.z = -0;
	params.width = 6;		// How many pixels for the entire grid
	params.height = 6;
	params.pitch = 110;		// How far each pixel is spaced
	params.port = port;

	PX.hardware.addSimpleNodeGrid(params);
}

var frameScale = 0;
var delta = 0.013;
function animate() {

	// Main update loop

	if(PX.ready){
		/*
		frameScale += delta;
		if(frameScale > 1.4 || frameScale < 0){
			delta = -delta;
		}
		PX.set("p1", frameScale, 1, 1, 1);*/

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