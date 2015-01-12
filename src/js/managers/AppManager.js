/*
* ************* APPLICATION MANAGER *************** 
*
* Handles application model state and gl rendering responsibilities.
*
*/

var AppManager = function (ap, container) {

	this.ap = ap;
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';

	this.container = container;
	this.renderer;

	this.cameraRTT;
	this.sceneRTT;
	this.rtTexture;

	this.scene;
	this.controls;
	this.camera;
	this.material;

	this.geoX;
	this.geoY;
	this.passIndex;

	this.particleSystem;
	this.geometry;

	this.time;
	this.simSize = 128;

	this.nodeTexture = THREE.ImageUtils.loadTexture( "images/nodeflare1.png" );  // TODO preload this

	this.coordsMap;
	this.base = 10000000;

	// TODO
	/*
	this.rtTextureA, this.rtTextureB, this.portsMap;
	this.rtToggle = true;

	this.nodeShaderMaterial;
	*/

};



AppManager.prototype = {

	init: function () {

		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;

		this.cameraRTT = new THREE.OrthographicCamera( this.simSize / - 2, this.simSize / 2, this.simSize / 2, this.simSize / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

		this.rtTexture = new THREE.WebGLRenderTarget( this.simSize, this.simSize, {minFilter: THREE.NearestMipMapNearestFilter,magFilter: THREE.NearestFilter,format: THREE.RGBFormat});
				
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.autoClear = false;
		this.container.appendChild( this.renderer.domElement ); 
		this.container.appendChild( this.stats.domElement );

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 1700;
		this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement);

		this.geometry = new THREE.Geometry();

		//---------------

		 // TODO allow these to be changed and update on the fly
		this.addNodesAsTestGrid();
		this.generateCoordsMap();

		//---------------

		this.addMainSourceShader();
		this.addNodeShader();

		//this.addTestPlane(); // testing
	},

	update: function () {

		this.time = Date.now() * 0.0015;
		this.stats.update();


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.scene.position );
		this.controls.update();
		

		//this.renderer.clear();

		// Render first scene into texture
		this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTexture, true );

/*		// TODO turn this on when we need to capture for broadcast
			// Render full screen quad with generated texture
			this.renderer.render( this.sceneRTT, this.cameraRTT );
			gl = renderer.getContext();
			gl.readPixels(0, 0, 12, 12, gl.RGBA, gl.UNSIGNED_BYTE, pixels); //TODO update size
			this.renderer.clear();
*/

		// Render the node and plane scene using the generated texture
		this.renderer.render( this.scene, this.camera );


		// Update uniforms

		this.material.uniforms.u_time.value += .05;
		
	},

	///////////////// test

	addNodesAsTestGrid: function () {
		// TODO - addNodes() function triggered by HardwareManager()
		// Add basic test nodes right here for now
		this.geoX = [];
		this.geoY = [];
		this.passIndex = [];

		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var vertex = new THREE.Vector3();
				vertex.x = (e * 30) - 155;
				vertex.y = (i * 30) - 155;
				this.geometry.vertices.push( vertex );
			}
		}
		for ( i = 1; i <= this.geometry.vertices.length; i ++ ) {
			// for each point push along x, y values to reference correct pixel in u_colorMaps
			var imageSize = this.simSize; 
			var tx = (i) % imageSize;
			if(tx == 0){
				tx = imageSize;
			}
			var ty = ((i+1) - tx) / imageSize;

			this.geoX.push(tx / imageSize - 0.5 / imageSize);
			this.geoY.push(1.0 - ty / imageSize - 0.5 / imageSize); // flip y
			this.passIndex.push(i-1);
		}
	},

	addTestPlane: function(){
		var plane = new THREE.PlaneBufferGeometry( this.simSize, this.simSize );
		var materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		ap.SimpleTextureShader.uniforms,
			vertexShader: 	ap.SimpleTextureShader.vertexShader,
			fragmentShader: ap.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		materialScreen.uniforms.u_texture.value = this.rtTexture; // set the texture as uniform

		quad = new THREE.Mesh( plane, materialScreen );
		quad.position.z = -100;
		this.scene.add( quad );
	},

	/////////////////

	generateCoordsMap: function () {

		// Generate coordsMap data texture for all the nodes x,y,z
		var a = new Float32Array( Math.pow(this.simSize, 2) * 4 );
		var t = 0;
		for ( var k = 0, kl = a.length; k < kl; k += 4 ) {
			var x = 0;
			var y = 0;
			var z = 0;

			if(this.geometry.vertices[t]){
				x = this.geometry.vertices[t].x / this.base;
				y = this.geometry.vertices[t].y / this.base;
				z = this.geometry.vertices[t].z / this.base;
				a[ k + 3 ] = 1;
			}else{
				a[ k + 3 ] = 0;
			}

			a[ k + 0 ] = x;
			a[ k + 1 ] = y;
			a[ k + 2 ] = z;
			t++;

		}

		this.coordsMap = new THREE.DataTexture( a, this.simSize, this.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.coordsMap.minFilter = THREE.NearestFilter;
		this.coordsMap.magFilter = THREE.NearestFilter;
		this.coordsMap.needsUpdate = true;
		this.coordsMap.flipY = true;
	},

	addNodeShader: function(){
		
		var attributes = ap.NodeShader.attributes;
		attributes.a_geoX.value = this.geoX;
		attributes.a_geoY.value = this.geoY;
		attributes.a_index.value = this.passIndex;

		var uniforms = ap.NodeShader.uniforms;
		uniforms.u_colorMap.value = this.rtTexture;
		uniforms.u_texture.value = this.nodeTexture;

		nodeShaderMaterial = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			attributes:     attributes,
			vertexShader:   ap.NodeShader.vertexShader,
			fragmentShader: ap.NodeShader.fragmentShader,

			depthTest:      false,
			transparent:    true
		});

		this.particleSystem = new THREE.PointCloud( this.geometry, nodeShaderMaterial );
		this.particleSystem.sortParticles = true;
		this.scene.add( this.particleSystem );
	},

	addMainSourceShader: function(){
		// TODO generate this as the master merged shader from all the pods output
		// Main quad and texture that gets rendered as the source shader
		this.material = new THREE.ShaderMaterial( {
			uniforms: {
				u_time: { type: "f", value: 0.0 },
				u_coordsMap: { type: "t", value: this.coordsMap },
				u_mapSize: { type: "f", value: this.simSize }
			},
			vertexShader: ap.SimpleTextureShader.vertexShader,
			fragmentShader: document.getElementById( 'fragment_shader_pass_1' ).textContent
		} );

		var plane = new THREE.PlaneBufferGeometry( this.simSize, this.simSize );
		quad = new THREE.Mesh( plane, this.material );
		quad.position.z = -100;
		this.sceneRTT.add( quad );
	}

}
