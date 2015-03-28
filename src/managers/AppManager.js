/*
*
* Handles WebGL state and rendering responsibilities.
*
*/

PX.AppManager = function (scene, renderer) {

	this.glWidth = 0;
	this.glHeight = 0;

	this.sceneMain = scene;
	this.renderer = renderer;

	this.cameraRTT;
	this.sceneRTT;
	this.rtTextureA;
	this.rtTextureB;
	this.rtToggle = true;
	
	this.controls;
	this.camera;

	this.geoX = [];
	this.geoY = [];
	this.passIndex = [];

	this.fragmentShader;

	this.time = 0;

	this.render = true;

	this.nodeTexture = THREE.ImageUtils.loadTexture( "images/nodeflare250.png" );

	this.coordsMap;
	this.altMap1;
	this.altMap2;

	this.plane = new THREE.PlaneBufferGeometry( PX.simSize, PX.simSize );
	PX.pointGeometry = new THREE.Geometry();


	// TODO
	//this.portsMap;
};



PX.AppManager.prototype = {

	init: function () {

		// We create two source textures and swap between them every frame, so we can always reference the last frame values
		this.rtTextureA = new THREE.WebGLRenderTarget( PX.simSize, PX.simSize, {minFilter: THREE.NearestMipMapNearestFilter,magFilter: THREE.NearestFilter,format: THREE.RGBFormat});
		this.rtTextureB = this.rtTextureA.clone();

		this.cameraRTT = new THREE.OrthographicCamera( PX.simSize / - 2, PX.simSize / 2, PX.simSize / 2, PX.simSize / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

		
		PX.pointGeometry = new THREE.Geometry();

		PX.updateNodePoints();
		//this.updateMainSourceShader();

		if(PX.readPixels){
			PX.pixels = new Uint8Array(4 * Math.pow(PX.simSize, 2));
		}

	},

	update: function () {

		this.time += PX.speed;


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.sceneMain.position );

		//this.renderer.clear();
		

		if(this.render && PX.ready){

			// Update uniforms
			PX.material.uniforms._time.value = this.time;
			PX.material.uniforms._random.value = Math.random();

			// Render first scene into texture
			if(this.rtToggle){
				PX.material.uniforms.u_prevCMap.value = this.rtTextureB;
				this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureA, true );
				PX.pointMaterial.uniforms.u_colorMap.value = this.rtTextureA;
			}else{
				PX.material.uniforms.u_prevCMap.value = this.rtTextureA;
				this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureB, true );
				PX.pointMaterial.uniforms.u_colorMap.value = this.rtTextureB;
			}
			this.rtToggle = !this.rtToggle;

			this.updateClips();


			// Capture colormap for broadcast output
			if(PX.readPixels){

				// Render full screen quad with generated texture
				this.renderer.render( this.sceneRTT, this.cameraRTT );
				var gl = this.renderer.getContext();
				gl.readPixels(0, 0, PX.simSize, PX.simSize, gl.RGBA, gl.UNSIGNED_BYTE, PX.pixels);
				this.renderer.clear();

				// Test if we are receiving colors
				/*var receiving = false;
				for (var i = 0; i < PX.pixels.length; i++) {
					if(PX.pixels[i] > 0 && PX.pixels[i] < 255){ receiving = true; }
				};
				if(receiving){ console.log(receiving); };*/

			}

		}

	},

	setSize: function(width, height){

		this.glWidth = width;
		this.glHeight = height;

	},

	importShader: function (name, shaderTxt) {

		var brackStatus = 0;
		var grab = false;
		var grabTxt = "";
		var defintions = "";
		var f = 0;
		var c = 0;

		var shader = {};
		shader.constants = [];
		shader.fragmentFunctions = [];

		// Split shader by line breaks
		var results = shaderTxt.split("\n");
		for (var i = 0; i < results.length; i++) {

			var l = results[i].trim();
			l = l.replace(/ +(?= )/g,''); // remove multiple spaces

			if(l.length > 0){

				// Detect how many open and closed brackets
				var brackOpen  = l.replace(/[^{]/g, "").length;
				var brackClose = l.replace(/[^}]/g, "").length;
				brackStatus += brackOpen;
				brackStatus -= brackClose;

				// If we have a open bracket
				if(brackStatus > 0){
					grab = true;
				}

				if(grab){
					grabTxt += l + "\n";

					// If we have a closed bracket while we are open, close
					if(brackStatus === 0){
						grab = false;

						if(grabTxt.localeCompare("void main(") > -1){

							// Main function: Grab text between main brackets and add it to the sorce method
							shader.fragmentMain = grabTxt.slice(grabTxt.indexOf("{") + 1, grabTxt.lastIndexOf("}")); 

						}else{

							// Normal function: add it to the list
							shader.fragmentFunctions[f] = grabTxt;
							f++;
						}

						grabTxt = "";
					}

				// If the constant is not blacklisted add it
				}else if(!blackList(l)){

					shader.constants[c] = l;
					c++;
				}

			}

		};

		// If shader id's have already been registered make sure this imported one has a correct id
		if(PX.shaderCount > -1){ // Detect if PX.init() has been called
			if(PX.clips[name]){

				// Replacement
				shader.id = PX.clips[name].id;
			}else{
				
				// New
				PX.shaderCount++;
				shader.id = PX.shaderCount;
			}

		}

		function blackList(msg){
			if(msg.localeCompare("#ifdef GL_ES") > -1){return true;}
			if(msg.localeCompare("#endif") > -1){return true;}
			if(msg.localeCompare("uniform float time") > -1){return true;}
			if(msg.localeCompare("uniform float random") > -1){return true;}
			if(msg.localeCompare("uniform vec2 resolution") > -1){return true;}
			if(msg.localeCompare("precision highp float") > -1){return true;}
			if(msg.localeCompare("varying vec2 surfacePosition") > -1){return true;}
			return false;
		}

		//console.log(defintions);
		//console.log(shader);
		//console.log(grabTxt);

		PX.clips[name] = shader;

	},

			
	updateClips: function () {

		for (var i = 0; i < PX.channels.channels.length; i++) { var channel = PX.channels.channels[i];
			
			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) { var pod = channel.pods[e];
					
					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) { var clip = pod.clips[u];
							
							if(clip && PX.clips[clip.id]){

								// update uniform
								PX.material.uniforms["_"+(i+1)+"_"+(e+1)+"_"+(u+1)+"_"+"time"].value += (clip.speed * PX.speed);

								// If the clip defined update function call it with proper clip addressing
								var shader = PX.clips[clip.id];
								if(shader && shader.update && PX.material){
									shader.update("_" + (i+1) + "_" + (e+1) + "_" + (u+1), PX.material.uniforms);
								}
							}
						}
					}
				}
			}
		}
	},

	updateGeometry: function () {

		// Reset values and grab entire state fresh. Note this is only called once when hardware is added or removed
		this.geoX = [];
		this.geoY = [];
		this.passIndex = [];
		PX.pointGeometry = new THREE.Geometry();

		// Update 'PX.pointGeometry' with all the known nodes on state
		// Create attributes for each one to pass to the shader
		var t = 0;
		for ( e = 0; e < PX.ports.getPorts().length; e ++ ) { 

			var port = PX.ports.getPort(e + 1);

			if(port && port.nodes){
				for ( i = 0; i < port.nodes.length; i ++ ) { 

					var vertex = new THREE.Vector3();
					vertex.x = port.nodes[i].x || 0;
					vertex.y = port.nodes[i].y || 0;
					vertex.z = port.nodes[i].z || 0;
					PX.pointGeometry.vertices.push( vertex );
					port.nodes[i].indexId = t;

					// for each point push along x, y values to reference correct pixel in u_colorMaps
					var imageSize = PX.simSize; 
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

	generateCoordsMap: function () {

		// Generate coordsMap data texture for all the nodes x,y,z
		var a = new Float32Array( Math.pow(PX.simSize, 2) * 4 );
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

			if(PX.pointGeometry.vertices[t]){
				x = PX.pointGeometry.vertices[t].x ;// / this.base;
				y = PX.pointGeometry.vertices[t].y ;// / this.base;
				z = PX.pointGeometry.vertices[t].z ;// / this.base;

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
		PX.channels.setPodPos(1, new PX.PodPosition(minx, miny, minz, maxx - minx, maxy - miny, maxz - minz));

		// Testing on pod pos #2
		//PX.channels.setPodPos(2, new PX.PodPosition(minx + 90, miny + 90, 0, maxx - minx - 180, maxy - miny - 180, 1));
		//PX.channels.setPodPos(2, new PX.PodPosition(-190, 140, 0, 1070, 575, 1));

		this.coordsMap = new THREE.DataTexture( a, PX.simSize, PX.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.coordsMap.minFilter = THREE.NearestFilter;
		this.coordsMap.magFilter = THREE.NearestFilter;
		this.coordsMap.needsUpdate = true;
		this.coordsMap.flipY = true;

		// testing
		this.altMap1 = new THREE.DataTexture( a, PX.simSize, PX.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.altMap1.minFilter = THREE.NearestFilter;
		this.altMap1.magFilter = THREE.NearestFilter;
		this.altMap1.needsUpdate = true;
		this.altMap1.flipY = true;

	},

	createNodePointCloud: function(){

		
		function merge(obj1, obj2){
			var obj3 = {};
			for (var attrname in obj1) {
				if(obj1[attrname]){ obj3[attrname] = obj1[attrname]; }
			}
			for (var attrname2 in obj2) {
				if(obj2[attrname2]){ obj3[attrname2] = obj2[attrname2]; }
			}
			return obj3;
		}
		
		var attributes = { // For each node we pass along it's index value and x, y in relation to the colorMaps
			a_geoX:        { type: 'f', value: this.geoX },
			a_geoY:        { type: 'f', value: this.geoY },
			a_index:        { type: 'f', value: this.passIndex }
		};

		var uniforms = {
			u_colorMap:   { type: "t", value: this.rtTextureA },
			u_texture:    { type: "t", value: this.nodeTexture }
		};


		PX.pointMaterial = new THREE.ShaderMaterial( {

			uniforms:       merge(uniforms, PX.shaders.PointCloudShader.uniforms),
			attributes:     merge(attributes, PX.shaders.PointCloudShader.attributes),
			vertexShader:   PX.shaders.PointCloudShader.vertexShader,
			fragmentShader: PX.shaders.PointCloudShader.fragmentShader,
			depthTest:      false,
			transparent:    true
		});

		var name = "PixelMixer Nodes";
		if(this.sceneMain.getObjectByName(name)){
			
			// If the pointCloud has already been added, remove it so we can add it fresh
			this.sceneMain.remove( PX.pointCloud );
		}

		PX.pointCloud = new THREE.PointCloud( PX.pointGeometry, PX.pointMaterial );
		PX.pointCloud.sortParticles = true;
		PX.pointCloud.name = name;

		if(PX.pointPosition){
			PX.pointCloud.position.x = PX.pointPosition[0];
			PX.pointCloud.position.y = PX.pointPosition[1];
			PX.pointCloud.position.z = PX.pointPosition[2];
		}

		this.sceneMain.add( PX.pointCloud );

		if(PX.pointGeometry.vertices.length > 0){

			console.log("PixelMixer Nodes: " + PX.pointGeometry.vertices.length);
			PX.ready = true;

		}

	},

	updateMainSourceShader: function(){

		// Internal core uniforms
		var uniforms = {
			_time: { type: "f", value: this.time },
			_random: { type: "f", value: Math.random() },
			u_coordsMap: { type: "t", value: this.coordsMap },
			u_prevCMap: { type: "t", value: this.rtTextureB },
			u_mapSize: { type: "f", value: PX.simSize }
		};

		// Generate the source shader from the current loaded channels
		var sourceShader = PX.channels.generateSourceShader();
		var sourceUniforms = "";


		if(PX.usePodUniforms){
			uniforms.u_pos_id= { type: "i", value: 0 };
			uniforms.u_pos_x = { type: "f", value: 0. };
			uniforms.u_pos_y = { type: "f", value: 0. };
			uniforms.u_pos_z = { type: "f", value: 0. };
			uniforms.u_pos_w = { type: "f", value: 0. };
			uniforms.u_pos_h = { type: "f", value: 0. };
			uniforms.u_pos_d = { type: "f", value: 0. };

			sourceUniforms += "uniform int u_pos_id;\n";
			sourceUniforms += "uniform float u_pos_x;\n";
			sourceUniforms += "uniform float u_pos_y;\n";
			sourceUniforms += "uniform float u_pos_z;\n";
			sourceUniforms += "uniform float u_pos_w;\n";
			sourceUniforms += "uniform float u_pos_h;\n";
			sourceUniforms += "uniform float u_pos_d;\n";
		}

		// Add the uniforms from the current loaded channels
		for (var uniform in sourceShader.uniforms) {

			var type = PX.getVariableTypeFromShorthand(sourceShader.uniforms[uniform].type);

			sourceUniforms += "uniform " + type + " " + uniform + ";\n";
			uniforms[uniform] = sourceShader.uniforms[uniform];
		}

		// If we are using alt maps include the internal properties
		if(this.altMap1){
			sourceUniforms += "uniform sampler2D u_altMap1; vec4 px_alt1; \n";
			uniforms.u_altMap1 = { type: "t", value: this.altMap1 };
		}

		if(this.altMap2){
			sourceUniforms += "uniform sampler2D u_altMap2; vec4 px_alt2; \n";
			uniforms.u_altMap2 = { type: "t", value: this.altMap2 };
		}


		// If the flag is to update fresh ignore the existing uniforms 
		if(!PX.updateFresh){

			// If the material already exists, transfer over the value of any uniforms that have remained
			if(PX.material){
				for (uniform in uniforms) {
					if(PX.material.uniforms[uniform]){
						uniforms[uniform].value = PX.material.uniforms[uniform].value;
					}
				}
			}
		}


		// Internal core shader is merged with the loaded shaders
		this.fragmentShader = PX.MainShader.fragmentShader;
		this.fragmentShader = this.fragmentShader.replace("#INCLUDESHADERS", sourceShader.fragmentMain);

		// Add ShaderUtils and uniforms at the top
		this.fragmentShader = this.fragmentShader.replace("#INCLUDESHADERFUNCTIONS", sourceShader.fragmentFunctions);
		this.fragmentShader = this.fragmentShader.replace("#INCLUDESHADERUTILS", PX.shaders.ShaderUtils + sourceUniforms);

		this.fragmentShader = this.minFragmentShader(this.fragmentShader);
		

		// The main material object has uniforms that can be referenced and updated directly by the UI
		PX.material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: PX.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: this.fragmentShader
		} );


		// Update uniforms directly
		PX.material.uniforms.u_coordsMap.value = this.coordsMap;
		PX.material.uniforms.u_prevCMap.value = this.rtTextureB;

		if(this.altMap1){
			PX.material.uniforms.u_altMap1.value = this.altMap1;
		}
		if(this.altMap2){
			PX.material.uniforms.u_altMap2.value = this.altMap2;
		}


		//console.log(sourceShader);
		//console.log(PX.material.uniforms);
		//console.log(this.fragmentShader);

		// Main quad that gets rendered as the source shader
		var name = "SourceQuad";
		var lookupObj = this.sceneRTT.getObjectByName(name);
		if(lookupObj){
			// If the quad has already been added, remove it so we can add it fresh
			this.sceneRTT.remove(lookupObj);
		}
		var quad = new THREE.Mesh( this.plane, PX.material );
		quad.position.z = -100;
		quad.name = name;
		this.sceneRTT.add( quad );

		// TODO possible optimize : seems this would be faster to update and not create new quad each time, but looks slower actually
		//PX.material.uniforms = uniforms;
		//PX.material.needsUpdate = true;

	},

	// Minimize the fragment shader before it gets sent to gpu
	minFragmentShader: function(frag){

		frag = frag.replace(/px_alt/g, "_0");
		frag = frag.replace(/px_/g, "_");
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