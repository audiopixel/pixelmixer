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
	this.initialUniforms = {};

	this.cameraRTT;
	this.sceneRTT;
	this.rtTextureA;
	this.rtTextureB;
	this.rtToggle = true;
	
	this.controls;
	this.camera;

	this.pointSizes = [];
	this.pointTypes = [];
	this.geoX = [];
	this.geoY = [];

	this.render = true;
	this.fragmentShader;
	this.time = 0;

	this.coordsMap;
	this.portsMap;
	this.dataMap;
	this.altMap1;
	this.altMap2;
	this.gl;

	this.plane = new THREE.PlaneBufferGeometry( PX.simSize, PX.simSize );
	PX.pointGeometry = new THREE.BufferGeometry();

};



PX.AppManager.prototype = {

	init: function () {

		// We create two source textures and swap between them every frame, so we can always reference the last frame values
		this.rtTextureA = new THREE.WebGLRenderTarget( PX.simSize, PX.simSize, {minFilter: THREE.NearestMipMapNearestFilter,magFilter: THREE.NearestFilter,format: THREE.RGBFormat});
		this.rtTextureB = this.rtTextureA.clone();

		this.cameraRTT = new THREE.OrthographicCamera( PX.simSize / - 2, PX.simSize / 2, PX.simSize / 2, PX.simSize / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

		
		PX.pointGeometry = new THREE.BufferGeometry();

		PX.updateNodePoints();
		//this.updateMainSourceShader();

		if(PX.readPixels){
			PX.pixels = new Uint8Array(4 * Math.pow(PX.simSize, 2));
			this.gl = this.renderer.getContext();
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
			PX.material.uniforms.time.value = this.time;
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

			// Capture colormap for broadcast output and store it in PX.pixels
			if(PX.readPixels){
				this.gl.readPixels(0, 0, PX.simSize, PX.simSize, this.gl.RGBA, this.gl.UNSIGNED_BYTE, PX.pixels);
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
		var l = "";
		var grabTxt = "";
		var defintions = "";
		var f = 0;
		var c = 0;

		var shader = {};
		shader.constants = [];
		shader.fragmentFunctions = [];

		// Reimplement line breaks
		var results = shaderTxt.split("\n");
		for (i = 0; i < results.length; i++) {

			l = results[i].trim();
			l = l.replace(/ +(?= )/g,''); // remove multiple spaces

			// Strip out comments if detected
			if(l.indexOf("//") > -1){
				l = l.substring(0, l.indexOf('//'));
			}

			if(l.length > 0){
				l = l.replace("main (", "main("); // remove multiple spaces
				l = l.replace(";", ";\n");
				l = l.replace("}", "}\n");
				l = l.replace("{", "{\n");

				var lbreak = "";
				if(l.indexOf("#") > -1){
					lbreak = "\n";
				}
				grabTxt += l + lbreak;
			}
		}

		// Break the formatted shader up into functions and constants
		results = grabTxt.split("\n");
		grabTxt = "";
		l = "";
		for (var i = 0; i < results.length; i++) {

			l = results[i].trim();
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
					l = l.replace("surfacePosition", "(gl_FragCoord.xy/resolution.xy-.5)");
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
		}

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

			msg = msg.trim();
			msg = msg.replace(/ +(?= )/g,''); // remove multiple spaces
			if(msg.indexOf("#ifdef GL_") > -1){return true;}
			if(msg.indexOf("#else") > -1){return true;}
			if(msg.indexOf("#endif") > -1){return true;}
			if(msg.indexOf("uniform float time") > -1){return true;}
			if(msg.indexOf("uniform float random") > -1){return true;}
			if(msg.indexOf("uniform vec2 mouse") > -1){return true;}
			if(msg.indexOf("uniform vec2 resolution") > -1){return true;}
			if(msg.indexOf("precision highp float") > -1){return true;}
			if(msg.indexOf("precision mediump float") > -1){return true;}
			if(msg.indexOf("precision lowp float") > -1){return true;}
			if(msg.indexOf("varying vec2 surfacePosition") > -1){return true;}
			if(msg.indexOf("void main(") > -1){return true;}
			if(msg.indexOf("define time") > -1){return true;}
			return false;
		}

		//console.log(defintions);
		//console.log(shader);
		//console.log(grabTxt);

		PX.clips[name] = shader;

	},
		
	// Overwrite if we want to do more granular time control per clip or anything more complex than incrementing
	clipUpdateTime: function (clipObj, timeUniform, channel, pod, clip) {

		timeUniform.value += (clipObj.speed * PX.speed);

	},
			
	updateClips: function () {

		for (var i = 0; i < PX.channels.channels.length; i++) { var channel = PX.channels.channels[i];
			
			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) { var pod = channel.pods[e];
					
					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) { var clip = pod.clips[u];
							
							if(clip && PX.clips[clip.id]){

								// update time uniform
								this.clipUpdateTime(clip, PX.material.uniforms["_"+(i+1)+"_"+(e+1)+"_"+(u+1)+"_"+"time"], i+1, e+1, u+1);

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
		this.pointSizes = [];
		this.pointTypes = [];
		this.geoX = [];
		this.geoY = [];
		PX.pointGeometry = new THREE.BufferGeometry();


		// Generate portsMap data texture for all the nodes x,y,z
		var b = new Float32Array( Math.pow(PX.simSize, 2) * 4 );
		PX.pointVertices = [];

		// Update 'PX.pointGeometry' with all the known nodes on state
		// Create attributes for each one to pass to the shader
		var t = 0;
		var k = 0;
		for ( e = 0; e < PX.ports.getPorts().length; e ++ ) { 

			var port = PX.ports.getPort(e + 1);

			if(port && port.nodes){
				for ( i = 0; i < port.nodes.length; i ++ ) { 

					var vertex = new THREE.Vector3();
					vertex.x = port.nodes[i].x || 0;
					vertex.y = port.nodes[i].y || 0;
					vertex.z = port.nodes[i].z || 0;
					PX.pointVertices.push( vertex );
					port.nodes[i].indexId = t;

					// for each point push along x, y values to reference correct pixel in u_colorMaps
					var imageSize = PX.simSize; 
					var tx = (t+1) % imageSize;
					if(tx === 0){
						tx = imageSize;
					}
					var ty = ((t+2) - tx) / imageSize;
					this.pointSizes.push(PX.hardware.getCustomPointSize(port.nodesType));

					var type = port.nodesType;
					if(!PX.pointSprite && type === 0){
						type = -1; // if we don't have a sprite defined the default is no sprite
					}
					if(PX.hardware.getCustomPointSprite(type)){
						type = (type + 2)*2;
						this.pointTypes.push(type);
					}

					this.geoX.push(tx / imageSize - 0.5 / imageSize);
					this.geoY.push(ty / imageSize + 0.5 / imageSize);
					t++;

					b[ k     ] = e + 1;			// PortId
					b[ k + 1 ] = i + 1; 		// NodeId
					b[ k + 2 ] = port.nodesType;// NodeType

					b[ k + 3 ] = 1;
					k += 4;
				}
			}
		}

		// After we have collected all the positions of the nodes in PX.pointVertices
		// Transfer them to the new BufferGeometry object for GPU consumption
		var bufferVertices = new Float32Array( PX.pointVertices.length * 3 );
		for (var i = 0; i < PX.pointVertices.length; i++) {
			bufferVertices[ i*3 + 0 ] = PX.pointVertices[i].x;
			bufferVertices[ i*3 + 1 ] = PX.pointVertices[i].y;
			bufferVertices[ i*3 + 2 ] = PX.pointVertices[i].z;
		}
		PX.pointGeometry.addAttribute( 'position', new THREE.BufferAttribute( bufferVertices, 3 ) );


		// Create data texture from Portsmap Data
		this.portsMap = new THREE.DataTexture( b, PX.simSize, PX.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.portsMap.minFilter = THREE.NearestFilter;
		this.portsMap.magFilter = THREE.NearestFilter;
		this.portsMap.needsUpdate = true;
		this.portsMap.flipY = false;
	},

	generateCoordsMap: function () {

		// Generate coordsMap data texture for all the nodes x,y,z
		var a = new Float32Array( Math.pow(PX.simSize, 2) * 4 );
		var t = 0;

		var s = 100000000000;
		var minx = s;
		var maxx = -s;
		var miny = s;
		var maxy = -s;
		var minz = s;
		var maxz = -s;


		for ( var k = 0, kl = a.length; k < kl; k += 4 ) {
			var x = 0;
			var y = 0;
			var z = 0;

			if(PX.pointVertices[t]){
				x = PX.pointVertices[t].x ;// / this.base;
				y = PX.pointVertices[t].y ;// / this.base;
				z = PX.pointVertices[t].z ;// / this.base;

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
		PX.channels.setPodPos(1, new PX.PodPosition({x: minx, y: miny, z: minz, w: maxx - minx, h: maxy - miny, d: maxz - minz}));

		this.coordsMap = new THREE.DataTexture( a, PX.simSize, PX.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.coordsMap.minFilter = THREE.NearestFilter;
		this.coordsMap.magFilter = THREE.NearestFilter;
		this.coordsMap.needsUpdate = true;
		this.coordsMap.flipY = false;

	},

	generateDataMap: function (data1, data2, data3) {

		// Generate 32x32 texture, that can hold 3 sets of 1024 floats
		var a = new Float32Array( 4096 ); // Math.pow(32, 2) * 4

		var v1;
		var v2;
		var v3;
		var t = 0;

		for ( var k = 0, kl = a.length; k < kl; k += 4 ) {

			v1 = 0; v2 = 0; v3 = 0;
			if(data1 && data1[t]){ v1 = data1[t]; }
			if(data2 && data2[t]){ v2 = data2[t]; }
			if(data3 && data3[t]){ v3 = data3[t]; }

			a[ k + 0 ] = v1;
			a[ k + 1 ] = v2;
			a[ k + 2 ] = v3;

			if(v1 + v2 + v3 === 0){
				a[ k + 3 ] = 0;
			}else{
				a[ k + 3 ] = 1;
			}
			t++;
		}

		this.dataMap = new THREE.DataTexture( a, 32, 32, THREE.RGBAFormat, THREE.FloatType );
		this.dataMap.minFilter = THREE.NearestFilter;
		this.dataMap.magFilter = THREE.NearestFilter;
		this.dataMap.needsUpdate = true;
		this.dataMap.flipY = false;

		if(PX.material){
			PX.material.uniforms.dataTexture.value = this.dataMap;
		}

	},

	merge: function(obj1, obj2){
		var obj3 = {};
		for (var attrname in obj1) {
			if(obj1[attrname]){ obj3[attrname] = obj1[attrname]; }
		}
		for (var attrname2 in obj2) {
			if(obj2[attrname2]){ obj3[attrname2] = obj2[attrname2]; }
		}
		return obj3;
	},

	createNodePointCloud: function(){

		/*
		var attributes = { // For each node we pass along it's indenodx value and x, y in relation to the colorMaps
			a_pointSizes:  { type: 'f', value: this.pointSizes },
			a_texId:  		{ type: 'f', value: this.pointTypes },
			a_geoX:        { type: 'f', value: this.geoX },
			a_geoY:        { type: 'f', value: this.geoY }
		};
		*/

		//PX.pointGeometry.addAttribute( 'a_pointSizes', new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		console.log(PX.pointGeometry);
		PX.pointGeometry.addAttribute( 'a_pointSizes', new THREE.BufferAttribute( this.pointSizes, 1 ) );
		PX.pointGeometry.addAttribute( 'a_texId', new THREE.BufferAttribute( this.pointTypes, 1 ) );
		PX.pointGeometry.addAttribute( 'a_geoX', new THREE.BufferAttribute( this.geoX, 1 ) );
		PX.pointGeometry.addAttribute( 'a_geoY', new THREE.BufferAttribute( this.geoY, 1 ) );

		//attributes:     this.merge(attributes, PX.shaders.PointCloudShader.attributes),






		// Use image for sprite if defined, otherwise default to drawing a square
		var useTexture = 0;
		if(PX.pointSprite){
			useTexture = 1;
		}

		var uniforms = {
			u_res:   { type: "f", value: PX.app.glWidth / PX.app.glHeight },
			u_colorMap:   { type: "t", value: this.rtTextureA },
			u_useTexture: { type: "i", value: useTexture }
		};

		// Defaults to main texture, add 2 custom sprite textures also if they are defined
		var textures = [THREE.ImageUtils.loadTexture( PX.pointSprite )];
		for (var i = 0; i < 2; i++) {
			if(PX.hardware.getCustomPointSprite(i+1)){
				textures[i+1] = THREE.ImageUtils.loadTexture( PX.hardware.getCustomPointSprite(i+1) );
			}
		}
		uniforms.u_texArray = { type: "tv", value: textures};

		PX.pointMaterial = new THREE.ShaderMaterial( {

			uniforms:       this.merge(uniforms, PX.shaders.PointCloudShader.uniforms),
			vertexShader:   PX.shaders.PointCloudShader.vertexShader,
			fragmentShader: PX.shaders.PointCloudShader.fragmentShader,
			depthTest:      true,
			transparent:    PX.pointTransparent
		});

		var name = "PixelMixer Nodes";
		if(this.sceneMain.getObjectByName(name)){
			
			// If the pointCloud has already been added, remove it so we can add it fresh
			this.sceneMain.remove( PX.pointCloud );
		}


		PX.pointCloud = new THREE.PointCloud( PX.pointGeometry, PX.pointMaterial );
		PX.pointCloud.name = name;

		if(PX.pointPosition){
			PX.pointCloud.position.x = PX.pointPosition[0];
			PX.pointCloud.position.y = PX.pointPosition[1];
			PX.pointCloud.position.z = PX.pointPosition[2];
		}

		this.sceneMain.add( PX.pointCloud );

		if(PX.pointVertices.length > 0){

			if(!PX.ready){
				console.log("PixelMixer v" + PX.version + ", SimSize: " + PX.simSize + "x" +  PX.simSize + ", Nodes: " + PX.pointVertices.length);
			}
			PX.ready = true;

		}

	},

	updateMainSourceShader: function(){

		// Internal core uniforms
		var uniforms = {
			time: { type: "f", value: this.time },
			mouse: { type: "v2", value: new THREE.Vector2( PX.mouseX, PX.mouseY ) },
			_random: { type: "f", value: Math.random() },
			dataTexture: { type: "t", value: null },
			u_coordsMap: { type: "t", value: this.coordsMap },
			u_portsMap: { type: "t", value: this.portsMap },
			u_prevCMap: { type: "t", value: this.rtTextureB },
			u_mapSize: { type: "f", value: PX.simSize }
		};

		// Generate the source shader from the current loaded channels
		var sourceShader = PX.channels.generateSourceShader();
		var sourceUniforms = "";


		if(PX.usePodPosUniforms){
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

		// If uniforms are set before shader is generated, they have been recorded, unload them here
		for (uniform in this.initialUniforms) {
			if(uniforms[uniform]){
				uniforms[uniform].value = this.initialUniforms[uniform].value;
				delete this.initialUniforms[uniform];
			}
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


		// Don't update fresh each time and instead carry over existing uniforms
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
		PX.material.uniforms.u_portsMap.value = this.portsMap;
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

		// TODO possible optimize : seems this would be faster to update and not create new quad each time, but registers slower actually
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
		frag = frag.replace(/getTexData/g, "_97");
		return frag.trim();
		
	}


	///////////////// test
	/*
	addPlanesForTesting: function(){

		var y = -800;

		testPlane = new THREE.PlaneBufferGeometry( PX.simSize * 2, PX.simSize * 2 );
		
		var materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureA }},
			vertexShader: 	PX.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: PX.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		var quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.y = y;
		this.sceneMain.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureB }},
			vertexShader: 	PX.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: PX.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.y = y - 200;
		this.sceneMain.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.coordsMap }},
			vertexShader: 	PX.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: PX.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -500;
		quad.position.y = y;
		this.sceneMain.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.portsMap }},
			vertexShader: 	PX.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: PX.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -500;
		quad.position.y = y - 200;
		this.sceneMain.add( quad );

	}*/

};