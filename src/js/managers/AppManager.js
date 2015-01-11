/*
* ************* APPLICATION MANAGER *************** 
*
* Handles application state and three.js rendering responsibilities (outside of UI modules).
*
*/

var AppManager = function (ap) {

	this.ap = ap;

	this.container;
	this.cameraRTT, this.sceneRTT, this.renderer;

	this.rtTexture;

	this.scene;
	this.controls;
	this.camera;



	this.time;

	// TODO
	/*
	this.rtTextureA, this.rtTextureB, this.coordsMap, this.portsMap;
	this.simSize = 0;
	this.base = 10000000;
	this.rtToggle = true;

	this.nodeShaderMaterial;
	*/
};



AppManager.prototype = {

	init: function () {

		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;

		this.cameraRTT = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

		this.rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );


		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.autoClear = false;
		this.container.appendChild( this.renderer.domElement ); 

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1700;
		this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement);


		material = new THREE.ShaderMaterial( {

			uniforms: { time: { type: "f", value: 0.0 } },
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragment_shader_pass_1' ).textContent

		} );

		var materialScreen = new THREE.ShaderMaterial( {

			uniforms: { tDiffuse: { type: "t", value: this.rtTexture } },
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,

			depthWrite: false

		} );

		var plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight );

		quad = new THREE.Mesh( plane, material );
		quad.position.z = -100;
		this.sceneRTT.add( quad );

		quad = new THREE.Mesh( plane, materialScreen );
		quad.position.z = -100;
		this.scene.add( quad );

	},

	update: function () {

		this.time = Date.now() * 0.0015;


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.scene.position );
		this.controls.update();

		

		this.renderer.clear();

		// Render first scene into texture

		this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTexture, true );

		// Render full screen quad with generated texture

		// TODO turn this on when we need to capture for broadcast
			//this.renderer.render( this.scene, this.cameraRTT );
			//gl = renderer.getContext();
			//gl.readPixels(0, 0, 12, 12, gl.RGBA, gl.UNSIGNED_BYTE, pixels); //TODO update size
			//this.renderer.clear();


		this.renderer.render( this.scene, this.camera );
		
	},

	// temporary for testing
	setContainer: function ( _container ) {

		this.container = _container;
	}

}
