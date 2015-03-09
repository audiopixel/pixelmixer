/*
* ************* APPLICATION MANAGER *************** 
*
* Handles GL state and rendering responsibilities.
*
*/

ap.AppManager = function (scene, renderer) {

	this.glWidth = 0;
	this.glHeight = 0;

	this.sceneMain = scene;
	this.renderer = renderer;

	this.cameraRTT;
	this.sceneRTT;
	this.rtTextureA;
	this.rtTextureB;
	this.rtToggle = true;
	
	this.nodeShaderMaterial;

	this.controls;
	this.camera;
	this.material;

	this.geoX = [];
	this.geoY = [];
	this.passIndex = [];

	this.geometry = new THREE.Geometry();
	this.pointCloud;
	this.fragmentShader;

	this.time = 0;
	this.speed = 0.045;
	this.simSize = 256;
	this.pixels;
	this.readPixels = false;

	this.nodeTexture = THREE.ImageUtils.loadTexture( "images/nodeflare250.png" );  // TODO preload this

	this.coordsMap;

	this.plane = new THREE.PlaneBufferGeometry( this.simSize, this.simSize );

	// TODO
	//this.portsMap;
};



ap.AppManager.prototype = {

	init: function () {

		// We create two source textures and swap between them every frame, so we can always reference the last frame values
		this.rtTextureA = new THREE.WebGLRenderTarget( this.simSize, this.simSize, {minFilter: THREE.NearestMipMapNearestFilter,magFilter: THREE.NearestFilter,format: THREE.RGBFormat});
		this.rtTextureB = this.rtTextureA.clone();

		this.cameraRTT = new THREE.OrthographicCamera( this.simSize / - 2, this.simSize / 2, this.simSize / 2, this.simSize / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

		
		this.geometry = new THREE.Geometry();

		this.updateNodePoints();
		this.updateMainSourceShader();

		if(this.readPixels){
			this.pixels = new Uint8Array(4 * this.glWidth * this.glHeight);
		}

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

		this.time += (this.speed) * .7;


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.sceneMain.position );


		//this.renderer.clear();
		

		// Update uniforms
		if(this.material && this.nodeShaderMaterial){
			this.material.uniforms.u_time.value = this.time;
			this.material.uniforms.u_random.value = Math.random();

			// Render first scene into texture
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


			// Capture colormap for broadcast output
			if(this.readPixels){

				// Render full screen quad with generated texture
				this.renderer.render( this.sceneRTT, this.cameraRTT );
				var gl = this.renderer.getContext();
				gl.readPixels(0, 0, this.glWidth, this.glHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
				this.renderer.clear();

				/*
				// Test if we are receiving colors
				var receiving = false;
				for (var i = 0; i < this.pixels.length; i++) {
					if(this.pixels[i] > 0 && this.pixels[i] < 255){ receiving = true; }
				};
				if(receiving){ console.log(receiving); };
				*/
			}

		}



		//TESTING************

		//ap.channels.setPodPos(2, { x: -339, y: 30, z: -1000, w: 1378, h: 738, d: 2000 });
		//ap.hardware.addTestPortsGrid(1, 0, 0);
		//this.updateGeometry();
		//this.generateCoordsMap();

		// this.updateNodePoints();

		//this.material.uniforms.u_coordsMap.value = this.coordsMap;
		//this.pointCloud.geometry = this.geometry;
		//this.pointCloud.geometry.verticesNeedUpdate = true;

	},

	setSize: function(width, height){
		this.glWidth = width;
		this.glHeight = height;
	},


	///////////////// test

	addPlanesForTesting: function(){

		testPlane = new THREE.PlaneBufferGeometry( this.simSize * 2, this.simSize * 2 );
		
		var materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureA }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		var quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -600;
		this.sceneMain.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureB }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -900;
		this.sceneMain.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.coordsMap }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -1200;
		this.sceneMain.add( quad );

	},

	/////////////////


	updateGeometry: function () {

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

			if(port && port.nodes){
				for ( i = 0; i < port.nodes.length; i ++ ) { 

					var vertex = new THREE.Vector3();
					vertex.x = port.nodes[i].x || 0;
					vertex.y = port.nodes[i].y || 0;
					vertex.z = port.nodes[i].z || 0;
					this.geometry.vertices.push( vertex );

					// TODO check port render type, if it's a directional light, or if it's a node (or plane eventually)

					// for each point push along x, y values to reference correct pixel in u_colorMaps
					var imageSize = this.simSize; 
					var tx = (t+1) % imageSize;
					if(tx === 0){
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
	},

	// Should get called whenever there are any changes on PortManager
	// (This is the main view that should reflect state)
	updateNodePoints: function () {

		this.updateGeometry();
		this.generateCoordsMap();
		this.createNodePointCloud();

	},

	generateCoordsMap: function () {

		// Generate coordsMap data texture for all the nodes x,y,z
		var a = new Float32Array( Math.pow(this.simSize, 2) * 4 );
		var t = 0;

		var minx = 100000000000;
		var maxx = 0;
		var miny = 100000000000;
		var maxy = 0;
		var minz = 100000000000;
		var maxz = 0;

		for ( var k = 0, kl = a.length; k < kl; k += 4 ) {
			var x = 0;
			var y = 0;
			var z = 0;

			if(this.geometry.vertices[t]){
				x = this.geometry.vertices[t].x ;// / this.base;
				y = this.geometry.vertices[t].y ;// / this.base;
				z = this.geometry.vertices[t].z ;// / this.base;

				minx = Math.min(minx, x);
				maxx = Math.max(maxx, x);
				miny = Math.min(miny, y);
				maxy = Math.max(maxy, y);
				minz = Math.min(minz, z);
				maxz = Math.max(maxz, z);

				a[ k + 3 ] = 1;
				t++;
			}else{
				a[ k + 3 ] = 0;
			}

			a[ k + 0 ] = x;
			a[ k + 1 ] = y;
			a[ k + 2 ] = z;
		}

		// We always set the first Pod Position as the bounding box that fits all nodes
		// TODO add z depth
		ap.channels.setPodPos(1, new PodPosition(minx, miny, minz, maxx - minx, maxy - miny, maxz - minz));
		//console.log(new PodPosition(minx, miny, 0, maxx - minx, maxy - miny, 1));

		// Testing on pod pos #2
		//ap.channels.setPodPos(2, new PodPosition(minx + 90, miny + 90, 0, maxx - minx - 180, maxy - miny - 180, 1));

		//ap.channels.setPodPos(2, new PodPosition(-190, 140, 0, 1070, 575, 1));

		this.coordsMap = new THREE.DataTexture( a, this.simSize, this.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.coordsMap.minFilter = THREE.NearestFilter;
		this.coordsMap.magFilter = THREE.NearestFilter;
		this.coordsMap.needsUpdate = true;
		this.coordsMap.flipY = true;


	},

	createNodePointCloud: function(){
		
		var attributes = { // For each node we pass along it's index value and x, y in relation to the colorMaps
			a_geoX:        { type: 'f', value: this.geoX },
			a_geoY:        { type: 'f', value: this.geoY },
			a_index:        { type: 'f', value: this.passIndex }
		};

		var uniforms = {
			u_colorMap:   { type: "t", value: this.rtTextureA },
			u_pointSize:  { type: 'f', value: ap.shaders.NodeShader.uniforms.u_pointSize.value },
			u_texture:    { type: "t", value: this.nodeTexture }
		};

		this.nodeShaderMaterial = new THREE.ShaderMaterial( {

			uniforms:       uniforms,
			attributes:     attributes,
			vertexShader:   ap.shaders.NodeShader.vertexShader,
			fragmentShader: ap.shaders.NodeShader.fragmentShader,

			depthTest:      false,
			transparent:    true
		});

		var name = "AP Nodes";
		if(this.sceneMain.getObjectByName(name)){
			// If the pointCloud has already been added, remove it so we can add it fresh
			this.sceneMain.remove( this.pointCloud );
		}

		this.pointCloud = new THREE.PointCloud( this.geometry, this.nodeShaderMaterial );
		this.pointCloud.sortParticles = true;
		this.pointCloud.name = name;

		// Center // TODO offset coords based on window size
		this.pointCloud.position.x = -400;
		this.pointCloud.position.y = -400;

		this.sceneMain.add( this.pointCloud );

		console.log("AP Nodes: " + this.geometry.vertices.length);

		ap.ready = true;

	},

	updateMainSourceShader: function(){

		// Internal core uniforms
		var uniforms = {
			u_time: { type: "f", value: this.time },
			u_random: { type: "f", value: Math.random() },
			u_coordsMap: { type: "t", value: this.coordsMap },
			u_prevCMap: { type: "t", value: this.rtTextureB },
			u_mapSize: { type: "f", value: this.simSize }
		};

		// Generate the source shader from the current loaded channels
		var sourceShader = ap.channels.generateSourceShader();
		var sourceUniforms = "";

		// Add the uniforms from the current loaded channels
		for (var uniform in sourceShader.uniforms) {

			var type = getVariableTypeFromShorthand(sourceShader.uniforms[uniform].type);

			sourceUniforms += "uniform " + type + " " + uniform + ";\n";
			uniforms[uniform] = sourceShader.uniforms[uniform];
		}

		// If the material already exists, transfer over the value of any uniforms that have remained
		if(this.material){
			for (uniform in uniforms) {
				if(this.material.uniforms[uniform]){
					uniforms[uniform].value = this.material.uniforms[uniform].value;
				}
			}
		}

		// Internal core shader is merged with the loaded shaders
		this.fragmentShader = ap.MainShader.fragmentShader;
		this.fragmentShader = this.fragmentShader.replace("#INCLUDESHADERS", sourceShader.fragmentMain);

		// Add ShaderUtils and uniforms at the top
		this.fragmentShader = this.fragmentShader.replace("#INCLUDESHADERFUNCTIONS", sourceShader.fragmentFunctions);
		this.fragmentShader = this.fragmentShader.replace("#INCLUDESHADERUTILS", ap.shaders.ShaderUtils + sourceUniforms);

		this.fragmentShader = this.minFragmentShader(this.fragmentShader);

		

		// The main material object has uniforms that can be referenced and updated directly by the UI
		this.material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: this.fragmentShader
		} );

		// Update uniforms directly
		this.material.uniforms.u_coordsMap.value = this.coordsMap;
		this.material.uniforms.u_prevCMap.value = this.rtTextureB;


		//console.log(sourceShader);
		//console.log(this.material.uniforms);
		//console.log(this.fragmentShader);


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

	},

	// Minimize the fragment shader before it gets sent to gpu
	minFragmentShader: function(frag){

		frag = frag.replace(/ap_/g, "_");
		frag = frag.replace(/_xyz/g, "_1");
		frag = frag.replace(/hsv2rgb/g, "_2");
		frag = frag.replace(/rgb2hsv/g, "_3");
		frag = frag.replace(/offsetPos/g, "_4");
		frag = frag.replace(/_rgb/g, "_5");
		frag = frag.replace(/_hsv/g, "_6");
		frag = frag.replace(/resolution/g, "_7");
		frag = frag.replace(/superFunction/g, "_8");
		frag = frag.replace(/checkBounds/g, "_9");
		frag = frag.replace(/returnColor/g, "_91");
		frag = frag.replace(/getPodSize/g, "_92");
		frag = frag.replace(/getPodPos/g, "_93");
		frag = frag.replace(/_lastRgb/g, "_94");
		frag = frag.replace(/getPodScale/g, "_95");
		frag = frag.replace(/getPodOffset/g, "_96");
		return frag;
	}

};