/*
* ************* APPLICATION MANAGER *************** 
*
* Handles GL state and rendering responsibilities.
*
*/

var AppManager = function (container) {

	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';

	this.container = container;
	this.renderer;

	this.cameraRTT;
	this.sceneRTT;
	this.rtTextureA;
	this.rtTextureB;
	this.rtToggle = true;
	
	this.nodeShaderMaterial;

	this.scene;
	this.controls;
	this.camera;
	this.material;

	this.geoX = [];
	this.geoY = [];
	this.passIndex = [];

	this.geometry = new THREE.Geometry();
	this.pointCloud;
	this.fragmentShader;
	this.material;

	this.time = 0;
	this.simSize = 128;

	this.nodeTexture = THREE.ImageUtils.loadTexture( "images/nodeflare1.png" );  // TODO preload this

	this.coordsMap;
	this.base = 10000000;

	this.plane = new THREE.PlaneBufferGeometry( this.simSize, this.simSize );

	// TODO
	//this.portsMap;
};



AppManager.prototype = {

	init: function () {

		// We create two source textures and swap between them every frame, so we can always reference the last frame values
		this.rtTextureA = new THREE.WebGLRenderTarget( this.simSize, this.simSize, {minFilter: THREE.NearestMipMapNearestFilter,magFilter: THREE.NearestFilter,format: THREE.RGBFormat});
		this.rtTextureB = this.rtTextureA.clone();

		this.cameraRTT = new THREE.OrthographicCamera( this.simSize / - 2, this.simSize / 2, this.simSize / 2, this.simSize / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

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

		this.updateMainSourceShader();


		this.updateNodePoints();

		//---------------
		// testing

		//this.addPlanesForTesting(); 

/*
		// Example of updating the nodes on the fly:
		var that = this;
		setTimeout(function(){
			//that.addNodesAsTestGrid(); // Change or add more nodes
			//that.updateNodes();

			that.updateMainSourceShader();
		}, 2000);
*/

		//---------------
	},

	update: function () {

		this.time += .05;
		this.stats.update();


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.scene.position );
		this.controls.update();
		

		//this.renderer.clear();

		// Render first scene into texture
		this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureA, true );

		if(this.rtToggle){
			this.material.uniforms.u_prevCMap.value = this.rtTextureB;
			this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureA, true );
			this.nodeShaderMaterial.uniforms.u_colorMap.value = this.rtTextureA;
		}else{
			this.material.uniforms.u_prevCMap.value = this.rtTextureA;
			this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureB, true );
			this.nodeShaderMaterial.uniforms.u_colorMap.value = this.rtTextureB;
		}
		this.rtToggle = !this.rtToggle;

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

		if(this.material){
			this.material.uniforms.u_time.value = this.time;
		}
		
	},

	///////////////// test

	addPlanesForTesting: function(){
		var materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureA }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		var quad = new THREE.Mesh( this.plane, materialScreen );
		quad.position.z = -100;
		this.scene.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureB }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		var quad = new THREE.Mesh( this.plane, materialScreen );
		quad.position.x = -200;
		quad.position.z = -100;
		this.scene.add( quad );

	},

	/////////////////

	// Should get called whenever there are any changes on PortManager
	// (This is the main view that should reflect state)
	updateNodePoints: function () {

		// Reset values and grab entire state fresh. Note this is only called once when hardware is added or removed
		this.geoX = [];
		this.geoY = [];
		this.passIndex = [];
		this.geometry = new THREE.Geometry();

		// Update 'this.geometry' with all the known nodes on state
		// Create attributes for each one to pass to the shader
		var t = 0;
		for ( e = 0; e < ap.ports.getPorts().length; e ++ ) { 

			var port = ap.ports.getPort(e + 1);

			if(port){
				for ( i = 0; i < port.nodes.length; i ++ ) { 

					var vertex = new THREE.Vector3();
					vertex.x = port.nodes[i].x;
					vertex.y = port.nodes[i].y;
					vertex.z = port.nodes[i].z;
					this.geometry.vertices.push( vertex );

					// TODO check port render type, if it's a directional light, or if it's a node (or plane eventually)

					// for each point push along x, y values to reference correct pixel in u_colorMaps
					var imageSize = this.simSize; 
					var tx = (t+1) % imageSize;
					if(tx == 0){
						tx = imageSize;
					}
					var ty = ((t+2) - tx) / imageSize;

					this.geoX.push(tx / imageSize - 0.5 / imageSize);
					this.geoY.push(1.0 - ty / imageSize - 0.5 / imageSize); // flip y
					this.passIndex.push(t);
					t++;
				}
			}
		}

		this.generateCoordsMap();
		this.material.uniforms.u_coordsMap.value = this.coordsMap;
		this.createNodePointCloud();

	},

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

	createNodePointCloud: function(){

		var attributes = ap.shaders.NodeShader.attributes;
		attributes.a_geoX.value = this.geoX;
		attributes.a_geoY.value = this.geoY;
		attributes.a_index.value = this.passIndex;

		var uniforms = ap.shaders.NodeShader.uniforms;
		uniforms.u_colorMap.value = this.rtTextureA;
		uniforms.u_texture.value = this.nodeTexture;

		this.nodeShaderMaterial = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			attributes:     attributes,
			vertexShader:   ap.shaders.NodeShader.vertexShader,
			fragmentShader: ap.shaders.NodeShader.fragmentShader,

			depthTest:      false,
			transparent:    true
		});

		var name = "AP Nodes";

		if(this.scene.getObjectByName(name)){
			// If the pointCloud has already been added, remove it so we can add it fresh
			this.scene.remove( this.pointCloud );
		}

		this.pointCloud = new THREE.PointCloud( this.geometry, this.nodeShaderMaterial );
		this.pointCloud.sortParticles = true;
		this.pointCloud.name = name;

		this.scene.add( this.pointCloud );

	},

	updateMainSourceShader: function(){

		// Internal core uniforms
		var uniforms = {
			u_time: { type: "f", value: this.time },
			u_coordsMap: { type: "t", value: this.coordsMap },
			u_prevCMap: { type: "t", value: this.rtTextureB },
			u_mapSize: { type: "f", value: this.simSize }
		}

		// Generate the source shader from the current loaded channels
		var sourceShader = ap.channels.generateSourceShader();
		var sourceUniforms = "";

		// Add the uniforms from the current loaded channels
		for (var uniform in sourceShader.uniforms) {

			var type;
			switch ( sourceShader.uniforms[uniform].type ) {
				case "f": type = "float"; break;
				case "t": type = "sampler2D"; break;
				case "i": type = "bool"; break;
				case "v2": type = "vec2"; break;
				case "v3": type = "vec3"; break;
				case "v4": type = "vec4"; break;
			}

			sourceUniforms += "uniform " + type + " " + uniform + ";\n";
			uniforms[uniform] = sourceShader.uniforms[uniform];
		}

		// If the material already exists, transfer over the value of any uniforms that have remained
		if(this.material){
			for (var uniform in uniforms) {
				if(this.material.uniforms[uniform]){
					uniforms[uniform].value = this.material.uniforms[uniform].value;
				}
			}
		}

// Testing - remove 
sourceShader.fragmentShader = sourceShader.fragmentShader.replace("110000", "" + Math.floor((Math.random() * 200000)));
		

		// Internal core shader is merged with the loaded shaders
		this.fragmentShader = document.getElementById( 'fragment_shader_pass_1' ).textContent;
		this.fragmentShader = this.fragmentShader.replace("//#INCLUDESHADERS", sourceShader.fragmentShader);

		// Add ShaderUtils and uniforms at the top
		this.fragmentShader = this.fragmentShader.replace("//#INCLUDESHADERUTILS", ap.shaders.ShaderUtils + sourceUniforms);

		// The main material object has uniforms that can be referenced and updated directly by the UI
		this.material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: this.fragmentShader
		} );


		// Main quad that gets rendered as the source shader
		var name = "SourceQuad";
		var lookupObj = this.sceneRTT.getObjectByName(name);
		if(lookupObj){
			// If the quad has already been added, remove it so we can add it fresh
			this.sceneRTT.remove(lookupObj);
		}
		var quad = new THREE.Mesh( this.plane, this.material );
		quad.position.z = -100;
		quad.name = name;
		this.sceneRTT.add( quad );

		// TODO possible optimize : seems this would be faster to update and not create new quad each time, but looks slower actually
		//this.material.uniforms = uniforms;
		//this.material.needsUpdate = true;
	}

}
