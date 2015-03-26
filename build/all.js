

// ****** Platform ******

var ap = { REVISION: '1' };		// Global object
ap.ready = false;				
ap.simSize;

ap.shaders = {};				// Internal shaders 
ap.clips = {}; 					// Loaded shaders as clips
ap.imported = {}; 				// Currently imported port (and possibly node) data


// ****** Constants ******

// Blend Constants
ap.BLEND = {};
ap.BLEND.OFF = 0;
ap.BLEND.Add = 1;
ap.BLEND.Subtract = 2;
ap.BLEND.Darkest = 3;
ap.BLEND.Lightest = 4;
ap.BLEND.Difference = 5;
ap.BLEND.Exclusion = 6;
ap.BLEND.Multiply = 7;
ap.BLEND.Screen = 8;
ap.BLEND.Overlay = 9;
ap.BLEND.HardLight = 10;
ap.BLEND.SoftLight = 11;
ap.BLEND.Dodge = 12;
ap.BLEND.Burn = 13;
ap.BLEND.LinearBurn = 14;
ap.BLEND.LinearLight = 15;
ap.BLEND.VividLight = 16;
ap.BLEND.PinLight = 17;
ap.BLEND.Fx = 1; // Use 'add' if this happens to get passed, all fx 'blending' happens outside blend()

ap.BLENDS = [ 'Add', 'Substract', 'Darkest', 'Lightest', 'Difference', 'Exclusion', 'Multiply', 'Screen','Overlay', 
			'HardLight', 'SoftLight', 'Dodge', 'Burn', 'LinearBurn', 'LinearLight', 'VividLight', 'PinLight'];


// ap.Port Type Constants
ap.PORT_TYPE_OFF = 0;
ap.PORT_TYPE_KINET_1 = 1; // strands
ap.PORT_TYPE_KINET_2 = 2; // tiles
ap.PORT_TYPE_KINET_3 = 3; // colorblasts
ap.PORT_TYPE_KINET_4 = 4;
ap.PORT_TYPE_DMX_1 = 5; // Movers, for testing
ap.PORT_TYPE_DMX_2 = 6;
ap.PORT_TYPE_DMX_3 = 7;
ap.PORT_TYPE_LASER_1 = 8;


// ap.Channel Type Constants
ap.CHANNEL_TYPE_OFF = 0;
ap.CHANNEL_TYPE_ADD = 1;
ap.CHANNEL_TYPE_FX = 2;
ap.CHANNEL_TYPE_SCENE = 3;


// Pod Hardware Group Modes Constants
ap.HARDWAREGROUP_OFF = 0;
ap.HARDWAREGROUP_SOLO = 1;
ap.HARDWAREGROUP_EXCLUDE = 2;


// Clip position map Constants
ap.MAP_NORMAL = 0;
ap.MAP_ALT1 = 1;
ap.MAP_ALT2 = 2;


// Temporary Preset Management 
ap.demoClipNames = ["TestFrame", "SolidColor", "ColorSineBar", "ColorSwirls", "LineCosSin", "SimpleSwirl",
"SinSpiral", "SineParticles", "DiSinSwirl", "HexifyRadial", "SinCosTan"];

ap.demoHardware = ["ApHardwareTest", "Grid+zLayer", "RanZGrid"];



// ****** Internal Utils ******

ap.getVariableTypeFromShorthand = function(shorthand){
	var type;
	switch ( shorthand ) {
		case "i": type = "int"; break;
		case "f": type = "float"; break;
		case "t": type = "sampler2D"; break;
		case "v2": type = "vec2"; break;
		case "v3": type = "vec3"; break;
		case "v4": type = "vec4"; break;
		// TODO add 'matrix' and 'array support'
	}
	return type;
};

// ** Public **

ap.speed = 0.07;				// How much we increase 'global time' per 'animation frame'
ap.useTransforms = false;		// Pod transforms (swap axis, translate, scale)
ap.usePodUniforms = false;		// Allow u_pos_id uniforms to update a pod position by id 

ap.pointCloud = {};				// Main point cloud that displays node colors
ap.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
ap.pointMaterial = {};			// Shader of the point cloud that displays the node colors
								



// ** Internal **

ap.material = false;			// Main shader referenced here, set false initially to flag that its not ready



ap.init = function(scene, renderer, maxNodeCount){

	 // Tag each shader with a incremental id, for easy lookup later
	var i = 0;
	for (var property in ap.clips) {
		if (ap.clips.hasOwnProperty(property)) {
			ap.clips[property].id = i;
			i++;
		}
	}

	// Maintain the lowest possible power of 2 texture size based on maxNodeCount
	maxNodeCount = maxNodeCount || Math.pow(128, 2); 	// Default: 16384 (128*128)
	ap.simSize = 4;										// Minimum: 16 (4*4)
	while(Math.pow(ap.simSize, 2) < maxNodeCount){
		ap.simSize *= 2;
	}

	ap.ports = new ap.PortManager();
	ap.hardware = new ap.HardwareManager();
	ap.channels = new ap.ChannelManager();
	ap.app = new ap.AppManager(scene, renderer);

	ap.ports.init();
	ap.hardware.init();
	ap.channels.init();
	ap.app.init();

	// If size not yet been defined, do it with some defaults
	if(!ap.appSize){
		ap.setSize(600, 400);
	}


};


ap.updateShader = false;
ap.updateFresh = false;
ap.updateShaderLimiter = 0;
ap.update = function() {

	//if(frameCount % 30 == 1){ // Slow framerate testing

	if(!ap.app){

		console.log("AP Error: Need to call ap.init before ap.update.");

	}else if(ap.ready){

		// Update everything else if we don't have to update the shader this frame
		if((!ap.updateShader || ap.updateShaderLimiter < 4) && ap.updateShaderLimiter > 0){

			// ** Main loop update 
			ap.app.update();
			ap.ports.update();
			ap.hardware.update();
			ap.channels.update();

		}else{

			// Shader needs update
			ap.app.updateMainSourceShader();
			ap.app.update();
			ap.updateShaderLimiter = 0;
			ap.updateShader = false;
			ap.updateFresh = false;
		}
		ap.updateShaderLimiter++;

	}
};


ap.pointPosition = [-400, -400, 0]; // Defaults
ap.setPointPosition = function(x, y, z) {
	ap.pointPosition = [x, y, z];
	if(ap.pointCloud.position){
		ap.pointCloud.position.x = x;
		ap.pointCloud.position.y = y;
		ap.pointCloud.position.z = z;
	}
};

ap.appSize;
ap.setSize = function(width, height) {

	ap.appSize = [width, height];

	if(ap.app){

		ap.app.glWidth = width;
		ap.app.glHeight = height;

		if(ap.app.readPixels){
			ap.app.pixels = new Uint8Array(4 * ap.app.glWidth * ap.app.glHeight);
		}

		ap.app.renderer.setSize( ap.app.glWidth, ap.app.glHeight );

	}
};


ap.updateNodePoints = function () {

	ap.app.updateGeometry();
	ap.app.generateCoordsMap();
	ap.app.createNodePointCloud();

};

ap.get = function(uniform, channel, pod, clip) {
	if(!channel){
		return ap.material.uniforms[uniform].value;
	}else{
		return ap.getUniform(uniform, channel, pod, clip).value;
	}
};

ap.set = function(uniform, value, channel, pod, clip) {
	if(!channel){
		ap.material.uniforms[uniform].value = value;
	}else{
		ap.getUniform(uniform, channel, pod, clip).value = value;
		ap.setObjProperty(uniform, value, channel, pod, clip);
	}
};

ap.getUniform = function(uniform, channel, pod, clip) {
	var addy = "_" + channel;
	if(pod){ addy += "_" + pod; 
	if(clip){ addy += "_" + clip; }}
	return ap.material.uniforms[addy + "_" + uniform];
};

ap.getObj = function(channel, pod, clip) {
	var obj = ap.channels.channels[channel-1];
	if(pod){ obj = obj.pods[pod-1]; 
	if(clip){ obj = obj.clips[clip-1]; }}
	return obj;
};

ap.setObj = function(newObj, channel, pod, clip) {
	if(!pod){
		ap.channels.channels[channel-1] = newObj;
	}else if(!clip){
		ap.channels.channels[channel-1].pods[pod-1] = newObj;
	}else{
		ap.channels.channels[channel-1].pods[pod-1].clips[clip-1] = newObj;
	}
};

ap.getObjProperty = function(property, channel, pod, clip) {
	var obj = ap.getObj(channel, pod, clip);
	return obj[property];
};

ap.setObjProperty = function(property, value, channel, pod, clip) {
	var obj = ap.getObj(channel, pod, clip);
	obj[property] = value;
};

ap.load = function(json){
	ap.channels.channels = json;
	ap.updateShader = true;
	ap.updateFresh = true;
};

ap.stringify = function(){
	return JSON.stringify(ap.channels.channels);
};
/*
*
* Handles GL state and rendering responsibilities.
* 
* Webgl implementation uses Three.js at the moment to support a larger audience
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
	
	this.controls;
	this.camera;

	this.geoX = [];
	this.geoY = [];
	this.passIndex = [];

	this.fragmentShader;

	this.time = 0;
	this.pixels;

	this.render = true;
	this.readPixels = false;

	this.nodeTexture = THREE.ImageUtils.loadTexture( "images/nodeflare250.png" );

	this.coordsMap;
	this.altMap1;
	this.altMap2;

	this.plane = new THREE.PlaneBufferGeometry( ap.simSize, ap.simSize );
	ap.pointGeometry = new THREE.Geometry();


	// TODO
	//this.portsMap;
};



ap.AppManager.prototype = {

	init: function () {

		// We create two source textures and swap between them every frame, so we can always reference the last frame values
		this.rtTextureA = new THREE.WebGLRenderTarget( ap.simSize, ap.simSize, {minFilter: THREE.NearestMipMapNearestFilter,magFilter: THREE.NearestFilter,format: THREE.RGBFormat});
		this.rtTextureB = this.rtTextureA.clone();

		this.cameraRTT = new THREE.OrthographicCamera( ap.simSize / - 2, ap.simSize / 2, ap.simSize / 2, ap.simSize / - 2, -10000, 10000 );
		this.sceneRTT = new THREE.Scene();

		
		ap.pointGeometry = new THREE.Geometry();

		ap.updateNodePoints();
		//this.updateMainSourceShader();

		if(this.readPixels){
			this.pixels = new Uint8Array(4 * this.glWidth * this.glHeight);
		}

	},

	update: function () {

		this.time += ap.speed;


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.sceneMain.position );

		//this.renderer.clear();
		

		// Update uniforms
		if(this.render && ap.ready){

			ap.material.uniforms._time.value = this.time;
			ap.material.uniforms._random.value = Math.random();

			// Render first scene into texture
			if(this.rtToggle){
				ap.material.uniforms.u_prevCMap.value = this.rtTextureB;
				this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureA, true );
				ap.pointMaterial.uniforms.u_colorMap.value = this.rtTextureA;
			}else{
				ap.material.uniforms.u_prevCMap.value = this.rtTextureA;
				this.renderer.render( this.sceneRTT, this.cameraRTT, this.rtTextureB, true );
				ap.pointMaterial.uniforms.u_colorMap.value = this.rtTextureB;
			}
			this.rtToggle = !this.rtToggle;

			this.updateTimePerClip();


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

	},

	setSize: function(width, height){
		this.glWidth = width;
		this.glHeight = height;
	},


	///////////////// test

	addPlanesForTesting: function(){

		testPlane = new THREE.PlaneBufferGeometry( ap.simSize * 2, ap.simSize * 2 );
		
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
			
	updateTimePerClip: function () {

		for (var i = 0; i < ap.channels.channels.length; i++) { var channel = ap.channels.channels[i];
			
			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) { var pod = channel.pods[e];
					
					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) { var clip = pod.clips[u];
							
							if(clip){
								ap.material.uniforms["_"+(i+1)+"_"+(e+1)+"_"+(u+1)+"_"+"time"].value += (clip.speed * ap.speed);
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
		ap.pointGeometry = new THREE.Geometry();

		// Update 'ap.pointGeometry' with all the known nodes on state
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
					ap.pointGeometry.vertices.push( vertex );

					// for each point push along x, y values to reference correct pixel in u_colorMaps
					var imageSize = ap.simSize; 
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
		var a = new Float32Array( Math.pow(ap.simSize, 2) * 4 );
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

			if(ap.pointGeometry.vertices[t]){
				x = ap.pointGeometry.vertices[t].x ;// / this.base;
				y = ap.pointGeometry.vertices[t].y ;// / this.base;
				z = ap.pointGeometry.vertices[t].z ;// / this.base;

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
		ap.channels.setPodPos(1, new ap.PodPosition(minx, miny, minz, maxx - minx, maxy - miny, maxz - minz));

		// Testing on pod pos #2
		//ap.channels.setPodPos(2, new ap.PodPosition(minx + 90, miny + 90, 0, maxx - minx - 180, maxy - miny - 180, 1));
		//ap.channels.setPodPos(2, new ap.PodPosition(-190, 140, 0, 1070, 575, 1));

		this.coordsMap = new THREE.DataTexture( a, ap.simSize, ap.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.coordsMap.minFilter = THREE.NearestFilter;
		this.coordsMap.magFilter = THREE.NearestFilter;
		this.coordsMap.needsUpdate = true;
		this.coordsMap.flipY = true;

		/*
		// testing
		this.altMap1 = new THREE.DataTexture( a, ap.simSize, ap.simSize, THREE.RGBAFormat, THREE.FloatType );
		this.altMap1.minFilter = THREE.NearestFilter;
		this.altMap1.magFilter = THREE.NearestFilter;
		this.altMap1.needsUpdate = true;
		this.altMap1.flipY = true;
		*/

	},

	createNodePointCloud: function(){
		
		var attributes = { // For each node we pass along it's index value and x, y in relation to the colorMaps
			a_geoX:        { type: 'f', value: this.geoX },
			a_geoY:        { type: 'f', value: this.geoY },
			a_index:        { type: 'f', value: this.passIndex }
		};

		var uniforms = {
			u_colorMap:   { type: "t", value: this.rtTextureA },
			u_texture:    { type: "t", value: this.nodeTexture }
		};


		ap.pointMaterial = new THREE.ShaderMaterial( {

			uniforms:       merge(uniforms, ap.shaders.PointCloudShader.uniforms),
			attributes:     merge(attributes, ap.shaders.PointCloudShader.attributes),
			vertexShader:   ap.shaders.PointCloudShader.vertexShader,
			fragmentShader: ap.shaders.PointCloudShader.fragmentShader,
			depthTest:      false,
			transparent:    true
		});

		var name = "AP Nodes";
		if(this.sceneMain.getObjectByName(name)){
			// If the pointCloud has already been added, remove it so we can add it fresh
			this.sceneMain.remove( ap.pointCloud );
		}

		ap.pointCloud = new THREE.PointCloud( ap.pointGeometry, ap.pointMaterial );
		ap.pointCloud.sortParticles = true;
		ap.pointCloud.name = name;

		if(ap.pointPosition){
			ap.pointCloud.position.x = ap.pointPosition[0];
			ap.pointCloud.position.y = ap.pointPosition[1];
			ap.pointCloud.position.z = ap.pointPosition[2];
		}

		this.sceneMain.add( ap.pointCloud );

		if(ap.pointGeometry.vertices.length > 0){

			console.log("AP Nodes: " + ap.pointGeometry.vertices.length);
			ap.ready = true;

		}

	},

	updateMainSourceShader: function(){

		// Internal core uniforms
		var uniforms = {
			_time: { type: "f", value: this.time },
			_random: { type: "f", value: Math.random() },
			u_coordsMap: { type: "t", value: this.coordsMap },
			u_prevCMap: { type: "t", value: this.rtTextureB },
			u_mapSize: { type: "f", value: ap.simSize }
		};

		// Generate the source shader from the current loaded channels
		var sourceShader = ap.channels.generateSourceShader();
		var sourceUniforms = "";


		if(ap.usePodUniforms){
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

			var type = ap.getVariableTypeFromShorthand(sourceShader.uniforms[uniform].type);

			sourceUniforms += "uniform " + type + " " + uniform + ";\n";
			uniforms[uniform] = sourceShader.uniforms[uniform];
		}

		// If we are using alt maps include the internal properties
		if(this.altMap1){
			sourceUniforms += "uniform sampler2D u_altMap1; vec4 ap_alt1; \n";
			uniforms.u_altMap1 = { type: "t", value: this.altMap1 };
		}
		if(this.altMap2){
			sourceUniforms += "uniform sampler2D u_altMap2; vec4 ap_alt2; \n";
			uniforms.u_altMap2 = { type: "t", value: this.altMap2 };
		}


		// If the flag is to update fresh ignore the existing uniforms 
		if(!ap.updateFresh){

			// If the material already exists, transfer over the value of any uniforms that have remained
			if(ap.material){
				for (uniform in uniforms) {
					if(ap.material.uniforms[uniform]){
						uniforms[uniform].value = ap.material.uniforms[uniform].value;
					}
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
		ap.material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: this.fragmentShader
		} );

		// Update uniforms directly
		ap.material.uniforms.u_coordsMap.value = this.coordsMap;
		ap.material.uniforms.u_prevCMap.value = this.rtTextureB;

		if(this.altMap1){
			ap.material.uniforms.u_altMap1.value = this.altMap1;
		}
		if(this.altMap2){
			ap.material.uniforms.u_altMap2.value = this.altMap2;
		}


		//console.log(sourceShader);
		//console.log(ap.material.uniforms);
		//console.log(this.fragmentShader);


		// Main quad that gets rendered as the source shader
		var name = "SourceQuad";
		var lookupObj = this.sceneRTT.getObjectByName(name);
		if(lookupObj){
			// If the quad has already been added, remove it so we can add it fresh
			this.sceneRTT.remove(lookupObj);
		}
		var quad = new THREE.Mesh( this.plane, ap.material );
		quad.position.z = -100;
		quad.name = name;
		this.sceneRTT.add( quad );

		// TODO possible optimize : seems this would be faster to update and not create new quad each time, but looks slower actually
		//ap.material.uniforms = uniforms;
		//ap.material.needsUpdate = true;

	},

	// Minimize the fragment shader before it gets sent to gpu
	minFragmentShader: function(frag){

		frag = frag.replace(/ap_alt/g, "_0");
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
/*
 *
 * Handles the state of all known Channels
 *
 * Channels may contain Pods, which may contain Clips (structured shaders).
 *
 */

ap.ChannelManager = function () {

	this.channels = [];
	this.podpositions = [];

};

ap.ChannelManager.prototype = {

	init: function () {

	},

	update: function () {

		// For every clip in each pods channel, we call it's update function if it's defined
		for (var i = 0; i < this.channels.length; i++) { var channel = this.channels[i];

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) { var pod = channel.pods[e];

					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) { var clip = pod.clips[u];

							if(clip){ var shader = ap.clips[clip.id];

								// If the clip defined update function call it with proper clip addressing
								if(shader && shader.update && ap.app.material){
									shader.update("_" + (i+1) + "_" + (e+1) + "_" + (u+1), ap.app.material.uniforms);
								}
							}
						}
					}
				}
			}
		}
	},

	generateSourceShader: function () {

		var uniforms = {};
		var constants = {};
		var fragList = {};
		var fragFuncList = {};
		var fragFuncOutput = this.generateSizingFunctions();
		var fragFuncHelpers = "";
		var output = "";
		var fragOutput = "";
		var lastKnownPos = {};
		var lastKnownRes = "";

		// Return the nth word of a string http://stackoverflow.com/a/11620169
		function nthWord(str, n) {
			var m = str.match(new RegExp('^(?:\\w+\\W+){' + --n + '}(\\w+)'));
			return m && m[1];
		}

		// Now create the mixed down output
		for (var i = 0; i < this.channels.length; i++) {

			var channel = this.channels[i];
			channel.address = "_" + (i+1);


			var fxChannel = false;
			if(channel.type === ap.CHANNEL_TYPE_FX){
				fxChannel = true;
			}

			output += "if(_channel_mix>0.){ \n";


			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix };

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];
					pod.address = channel.address + "_" + (e+1);

					// uniforms 'mix' & 'blend' for the pod
					uniforms[pod.address + "_mix"] = { type: "f", value: pod.mix };
					uniforms[pod.address + "_blend"] = { type: "f", value: pod.blend };

					var fxPod = false;
					if(pod.clips && pod.clips.length){

						for (var o = 0; o < pod.positionIds.length; o++) {

							output += "//-- \n";

							var podPos = this.getPodPos(pod.positionIds[o]);

							// Set the resolution (if it's changed) for the next set of nodes to be the current pods position bounding box
							if(lastKnownPos !== podPos){
								lastKnownPos = podPos;

								// Only update the res if we need to
								var res = "vec2(" + podPos.w + ", " + podPos.h + ");";
								if(ap.usePodUniforms){
									res = "vec2(getPodSize(" + pod.positionIds[o] + ").x, getPodSize(" + pod.positionIds[o] + ").y);";
								}
								if(lastKnownRes !== res){
									lastKnownRes = res;
									output += "resolution = " + res + " \n";
								}

								// Offset the xyz coordinates with the pod's xy to get content to stretch and offset properly // ap_xyz2 is the original real coordinates
								output += "ap_xyz = offsetPos(ap_xyz2, " + pod.positionIds[o] + ", ap_xyz.w);\n";
							}

							// Check to see if the nodes are in the position bounding box, if not don't render these clips // ap_xyz2 is the original real coordinates
							output += "if(_pod_mix > 0. && checkBounds(ap_xyz2, "+pod.positionIds[o]+") > 0.){ \n";


							fxPod = true; // If the only clips that are in this pod are fx's then treat pod as a fx output and don't blend
							for (u = 0; u < pod.clips.length; u++) {

								var clip = pod.clips[u];
								if(clip){

									var shader = ap.clips[clip.id];


									if(!fragList[pod.clips[u].id]){
										fragList[pod.clips[u].id] = true;

										// Declare each clips constants, but we can't declare them more than once so record which ones we have declared already
										for (var variable in shader.constants) {

											if(!constants[variable]){ // If we don't already have the constant mark it as in use and include it.
												constants[variable] = 1; 
												var type = ap.getVariableTypeFromShorthand(shader.constants[variable].type);
												fragFuncOutput += type + " " + variable + " = " + shader.constants[variable].value + ";";
											}
										}fragFuncOutput += "\n";

										if(shader.fragmentFunctions){
											for (var v = 0; v < shader.fragmentFunctions.length; v++) {

												// Duplicate method checking - right now just checking based off the first 5 words of function
												var name = shader.fragmentFunctions[v].trim();
												name = nthWord(name, 1) + nthWord(name, 2) + nthWord(name, 3) + nthWord(name, 4) + nthWord(name, 5);
												if(!fragFuncList[name]){
													fragFuncList[name] = true;

													// Add the helper function to be included at the top of the shader
													fragFuncOutput += shader.fragmentFunctions[v] + "\n";
												}
											}
										}
										fragFuncHelpers += "else if(id == " + shader.id + "){\n";
										fragFuncHelpers += shader.fragmentMain.replace("gl_FragColor", "returnColor");
										fragFuncHelpers += "\n";
										fragFuncHelpers = fragFuncHelpers.replace(/gl_FragCoord/g, "ap_xyz");
										fragFuncHelpers += "\n}\n";
										//fragFuncHelpers += "////////\n";
									}


									clip.address = pod.address +"_" + (u+1);
									if(clip.id.length > 0 && shader){

										// If the clip defined params transfer default values over to the obj
										for (var param in shader.params) {
											ap.setObjProperty(param, shader.params[param].value, i+1, e+1, u+1);
											
											// Create params with default values
											uniforms[clip.address + "_" + param] = { type: "f", value: shader.params[param].value };
										}

										// If the clip defined properties define them as addressed uniforms
										for (var property in shader.properties) {
											uniforms[clip.address + "_" + property] = shader.properties[property];
										}

										// If the clip defined optional init() method call it with addressing
										if(shader.init){
											shader.init(clip.address, uniforms);
										}


										// Define uniforms for each clip
										uniforms[clip.address + "_mix"] = { type: "f", value: clip.mix }; // TODO modulation uniforms 
										uniforms[clip.address + "_blend"] = { type: "f", value: clip.blend }; 
										uniforms[clip.address + "_time"] = { type: "f", value: ap.app.time }; 


										// Pass along input param values if they are defined on clip
										var params = ["0.","0.","0.","0.","0.","0.","0.","0.","0."];
										for (var j = 0; j < params.length; j++) {
											if(shader.params["p"+(j+1)]){
												params[j] = (clip.address+"_p"+(j+1));
											}
										}

										fragOutput = "";
										if(clip.posMap == ap.MAP_ALT1 && ap.app.altMap1){
											fragOutput += "ap_xyz = offsetPos(ap_alt1, " + pod.positionIds[o] + ", ap_xyz.w);\n";
										}

										fragOutput += "ap_rgb2 = superFunction(_clip_mix, "+ shader.id +", _fxIn, _clip_time, "+params[0]+","+params[1]+","+params[2]+","+params[3]+","+params[4]+","+params[5]+","+params[6]+","+params[7]+","+params[8]+");";

										// Replace the standard GL color array with an internal one so that we can mix and merge, and then output to the standard when we are done
										//fragOutput = fragOutput.replace(/ap_fxOut/g, "ap_rgbV4");
										fragOutput = fragOutput.replace(/gl_FragCoord/g, "ap_xyz");


										// ------------ Clip Mix Blend & Fx --------------

										var fx = ap.clips[clip.id].fx;
										if(u === 0){
											
											fragOutput += "ap_rgb = ap_rgb2; \n";
											if(!fx && !fxChannel){
												fxPod = fxChannel;
												fragOutput += "ap_rgb = ap_rgb * (_clip_mix); \n";  // Clip mix for this shader
											}else{
												fragOutput += "ap_rgb = mix(ap_p, ap_rgb2, _clip_mix); \n";
											}

										}else{

											if(fx || fxChannel){
												// Fx clip: mix the original with the result of fx
												fragOutput += "ap_rgb = mix(ap_rgb, ap_rgb2, _clip_mix); \n";

											}else{
												// Blend in the shader with ongoing mix
												fragOutput += "ap_rgb2 = ap_rgb2 * (_clip_mix); \n";
												fragOutput += "ap_rgb = blend(ap_rgb2, ap_rgb, _clip_blend); \n"; // Clip mix for this shader
												fxPod = fxChannel;
											}

										}

										// Inject addressing for uniforms that are flagged (i.e. replace "_clip_mix" with "_1_1_1_mix")
										fragOutput = fragOutput.replace(/_clip_/g, clip.address + "_");
										fragOutput = fragOutput.replace(/__/g, clip.address + "_"); // Also detect the clip shorthand '__'
										
										// For use by effects clips: set the incoming value from the last clip, or the last pod if we are the first clip
										if(u === 0){
											fragOutput = fragOutput.replace(/_fxIn/g, "ap_p");
										}else{
											fragOutput = fragOutput.replace(/_fxIn/g, "ap_rgb");
										}

										// Merge the clip fragment shaders as we move along
										output += fragOutput;
									}
								}

							}
						
							//  -------------- Pod Mix Blend & Fx --------------


							if(fxPod){

								// Fx pod: mix the original with the result of fx_rgb, _pod_mix); \n";
								output += "ap_p = mix(ap_p, ap_rgb, _pod_mix); \n";

							}else{

								if(e === 0){

									// If we are the very first pod mix output value, don't blend from previous pod
									output += "ap_p = ap_rgb * (_pod_mix); \n";

								}else{

									// Blend in last pod with current pod
									output += "ap_rgb = ap_rgb * (_pod_mix); \n";
									output += "ap_p = blend(ap_p, ap_rgb, _pod_blend); \n";
								}
							}
							
							output += "}";

							//output += "/////////////////////////////////-------------//-------------- \n";

						}

					}

					output = output.replace(/_pod_/g, pod.address + "_") + "\n";

				}

			}

				
			//  -------------- Channel Mix & Fx --------------

			if(i === 0){
				output += "ap_c = ap_p = ap_p * (_channel_mix); \n";
			}else{

				if(fxChannel){
					output += "ap_c = mix(ap_c, ap_p, _channel_mix); \n";
				}else{
					output += "ap_p = ap_p * (_channel_mix); \n";
					output += "ap_c = blend(ap_c, ap_p, 1.); \n"; // Channels always blend using 'add'
				}
			}
			output += "}";

			output = output.replace(/_channel_/g, channel.address + "_") + "\n";
		}

		fragFuncHelpers = fragFuncHelpers.slice(5, fragFuncHelpers.length); // cut the first 'else' out 
		fragFuncHelpers = "vec4 returnColor = vec4(0.,0.,0.,0.); if(_mi == 0.){return vec3(0.,0.,0.);} \n" + fragFuncHelpers;
		fragFuncHelpers += "return max(min(vec3(returnColor.x, returnColor.y, returnColor.z), vec3(1.0)), vec3(0.0)); \n";
		fragFuncHelpers = "vec3 superFunction(float _mi, int id, vec3 _fxIn, float time, float _p1, float _p2, float _p3, float _p4, float _p5, float _p6, float _p7, float _p8, float _p9) { \n" + fragFuncHelpers + "}\n";
		
		fragFuncOutput += fragFuncHelpers;

		// Set alt map coordinates if they are defined
		if(ap.app.altMap1){
			output = "ap_alt1 = texture2D( u_altMap1, v_vUv);" + output;
		}
		if(ap.app.altMap2){
			output = "ap_alt2 = texture2D( u_altMap2, v_vUv);" + output;
		}


		//console.log(uniforms);
		//console.log(fragFuncOutput);
		//console.log(output);

		


		return {uniforms: uniforms, fragmentFunctions: fragFuncOutput, fragmentMain: output + "\n"};
	},

	generateSizingFunctions: function () {
		
		// Pod Position function
		var m = "";

		if(ap.usePodUniforms){
			m += "if(d == u_pos_id){\n";
				m += "p = vec3(u_pos_x, u_pos_y, u_pos_z);\n";
			m += "}";
		}
		for (var i = 0; i < this.podpositions.length; i++) {
			m += "else if(d == " + (i+1) + "){\n";
			m += "p = vec3("+this.podpositions[i].x+","+this.podpositions[i].y+","+this.podpositions[i].z+");\n";
			m += "}\n";
		}
		if(!ap.usePodUniforms){ m = m.slice(5, m.length);} // cut the first 'else' out 
		m = "vec3 p = vec3(0.,0.,0.); \n" + m;
		m += "return p; \n";
		m = "vec3 getPodPos(int d) { \n" + m + "}\n";

		var output = m;
		m = "";

		if(ap.usePodUniforms){
			m += "if(d == u_pos_id){\n";
				m += "p = vec3(u_pos_w, u_pos_h, u_pos_d);\n";
			m += "}";
		}

		// Pod Size function
		for (i = 0; i < this.podpositions.length; i++) {
			m += "else if(d == " + (i+1) + "){\n";
			m += "p = vec3("+this.podpositions[i].w+","+this.podpositions[i].h+","+this.podpositions[i].d+");\n";
			m += "}\n";
		}
		if(!ap.usePodUniforms){ m = m.slice(5, m.length);} // cut the first 'else' out 
		m = "vec3 p = vec3(0.,0.,0.); \n" + m;
		m += "return p; \n";
		m = "vec3 getPodSize(int d) { \n" + m + "}\n";

		output += m;

		if(ap.useTransforms){

			// Pod Offset (translation)
			m = "";
			for (i = 0; i < this.podpositions.length; i++) {
				m += "else if(d == " + (i+1) + "){\n";
				m += "p = vec3("+this.podpositions[i].xt+","+this.podpositions[i].yt+","+this.podpositions[i].zt+");\n";
				m += "}\n";
			}
			m = m.slice(5, m.length); // cut the first 'else' out 
			m = "vec3 p = vec3(0.,0.,0.); \n" + m;
			m += "return p; \n";
			m = "vec3 getPodOffset(int d) { \n" + m + "}\n";

			output += m;

			// Pod Scale & Flipmode
			m = "";
			for (i = 0; i < this.podpositions.length; i++) {
				m += "else if(d == " + (i+1) + "){\n";
				m += "p = vec4("+this.podpositions[i].xs+","+this.podpositions[i].ys+","+this.podpositions[i].zs+","+this.podpositions[i].flipmode+");\n";
				m += "}\n";
			}
			m = m.slice(5, m.length); // cut the first 'else' out 
			m = "vec4 p = vec4(0.,0.,0.,0.); \n" + m;
			m += "return p; \n";
			m = "vec4 getPodScale(int d) { \n" + m + "}\n";

			output += m;
		}

		// Method to check xyz+whd against another // TODO account for non rectangular shapes
		output += ["float checkBounds(vec4 b, int p)",
		"{",										
			"vec3 s = getPodPos(p);",
			"if(b.x >= s.x && b.y >= s.y && b.z >= s.z){ ",
				"vec3 e = getPodSize(p);",
				"if(b.x <= (e.x + s.x) && b.y <= (e.y + s.y) && b.z <= (e.z + s.z)) {",
				"	return 1.;",
			"}}",			
		"	return 0.;",
		"}"].join("\n");

		// Offset xyz from pod position id
		output += "vec4 offsetPos(vec4 b, int p, float w){\n";

			output += "vec3 c = getPodPos(p);\n";
			output += "float x = b.x - c.x;\n";
			output += "float y = b.y - c.y;\n";
			output += "float z = b.z - c.z;\n";
			output += "float t = x;\n";

			// For performance reasons use a lighter and manual version of Matrix transforms
			if(ap.useTransforms){

				// swap axis
				output += "vec4 s = getPodScale(p);\n";
				output += "if(s.w == 1.){";
					output += "x=y;y=t;\n";		// swap x-y
				output += "}else if(s.w == 2.){";	
					output += "x=z;z=t;\n";		// swap x-z
				output += "}else if(s.w == 3.){";
					output += "t=y;y=z;z=t;\n";	// swap y-z
				output += "}\n";

				output += "vec3 d = getPodOffset(p);\n";
				output += "vec3 e = getPodSize(p);\n";

				// translate: (magnitude of 8)
				output += "x += (e.x * 8. * (d.x - .5));\n";
				output += "y += (e.y * 8. * (d.y - .5));\n";
				output += "z += (e.z * 8. * (d.z - .5));\n";

				// scale/flip/mirror: (magnitude of 8)
				output += "x += (b.x - (e.x * .5 + c.x)) * (1.-(s.x * 2.))*8.;\n";
				output += "y += (b.y - (e.y * .5 + c.y)) * (1.-(s.y * 2.))*8.;\n";
				output += "z += (b.z - (e.z * .5 + c.z)) * (1.-(s.z * 2.))*8.;\n";

			}

			output += "return vec4(x, y, z, w);\n";

		output += "}\n";

		//console.log(output);
		return output;
	},

	// ************* Channels ***********************


	setChannel: function (channelId, channelObject) {
		this.channels[channelId-1] = channelObject;
	},

	getChannel: function (channelId) {
		return this.channels[channelId-1];
	},

	getChannels: function () {
		return this.channels;
	},

	clearChannel: function (channelId) {
		delete this.channels[channelId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllChannels: function () {
		this.channels = [];
	},

	clearAllPodsInChannel: function (channelId) {
		delete this.channels[channelId-1].pods; // TODO optimize: most likely better to not use 'delete'
	},

	// ************* Pod Positions ***********************

	setPodPos: function (podPositionId, podPositionObject) {
		this.podpositions[podPositionId-1] = podPositionObject;
	},

	getPodPos: function (podPositionId) {
		if(!this.podpositions[podPositionId-1]){
			// If pod position doesn't exist default to the first main pod sized to everything
			//console.log("Warning: Cannot find pod position (" + podPositionId + "), using default (1).");
			return this.podpositions[0];
		}
		return this.podpositions[podPositionId-1];
	},

	clearPodPos: function (podPositionId) {
		delete this.podpositions[podPositionId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPodPos: function () {
		this.podpositions = [];
	},

	// ************* Clips ***********************

	setClip: function (channel, pod, clip, clipObj) {
		// If channel doesn't exist ignore this request
		if(!this.channels[channel-1]){
			return false;
		}
		// If a pod does not yet exist create a default one with clip obj
		if(!this.channels[channel-1].pods[pod-1]){
			this.channels[channel-1].pods[pod-1] = new Pod(1, 1, ap.BLEND.Add, [clipObj]);
		}else{
			// Todo transfer over existing data like mix, if it's not defined on new clip obj
			this.channels[channel-1].pods[pod-1].clips[clip-1] = clipObj;
		}
	},

	clearClip: function (channel, pod, clip) {
		delete this.channels[channel-1].pods[pod-1].clips[clip-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllClipsInPod: function (channel, pod) {
		delete this.channels[channel-1].pods[pod-1].clips;  // TODO optimize: most likely better to not use 'delete'
	}

};

/*
*
* Manage adding and removing several types of hardware into state as Nodes
*
*/

ap.HardwareManager = function () {

};

ap.HardwareManager.prototype = {

	init: function () {

		// Testing various configurations:

		//this.addTestPortsGrid3(1, 0, 0);
		//this.addSimpleNodeGrid(1, 0, 0, 0, 30, 40, 33);
		//this.addSimpleNodeGrid(2, 0, 220, 0, 32, 20, 33);

		// Simulate Importing nodes from external file
		//this.importNodes(ap.imported, 1, 350, 100, 500);
		//ap.channels.setPodPos(2, new ap.PodPosition(-190, 140, -100, 1070, 575, 1000));
		//ap.channels.setPodPos(2, new ap.PodPosition(-540, 140, -100, 700, 575, 1000));
		//ap.channels.setPodPos(3, new ap.PodPosition(540, 140, -100, 700, 575, 1000));

	},

	update: function () {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
	},

	// -------------------------------------------------

	/*
	* Import nodes using the 'import/ports' structured file format.
	*
	* @param imported 		The JS obj to import from.
	* @param portOffset 	Optional value to offset the port values from.
	* @param xOffset 		Optional value to offset the x values from.
	* @param yOffset 		Optional value to offset the y values from.
	* @param zOffset 		Optional value to offset the z values from.
	* @param scale 			Optional overwrite value to scale nodes from.
	*/
	importNodes: function (imported, portOffset, xOffset, yOffset, zOffset, scale) {
		portOffset = portOffset || 0;
		xOffset = xOffset || 0;
		yOffset = yOffset || 0;
		zOffset = zOffset || 0;
		imported.scale = imported.scale || 1.0;

		// Use the scale value defined in JS object unless one is passed as an argument instead
		var _scale = scale || imported.scale; 

		// Add node values to 'ap.ports' for each defined port
		for(var unit in imported.hardwareunit){

			var _unit = imported.hardwareunit[unit];

			for(var port in _unit.ports){

				var _port = _unit.ports[port];

				for(var node in _port.nodes){

					var _node = _port.nodes[node];

					_node.x = _node.x || 0;
					_node.y = _node.y || 0;
					_node.z = _node.z || 0;

					_node.x *= _scale;
					_node.y *= _scale;
					_node.z *= _scale;

					_node.x += xOffset;
					_node.y += yOffset;
					_node.z += zOffset;

				}
				ap.ports.setNodes(_port.portid + portOffset, _port.nodes);
			}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
		}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
	},

	addTestGrid: function (port, xOffset, yOffset) {

		var nodes = [];
		for ( e = 0; e < 24; e ++ ) { // Simulate a simple node grid for now
			for ( i = 0; i < 14; i ++ ) { 

				var node = {};
				node.x = (e * 30) + xOffset;
				node.y = (i * 30) + yOffset;
				node.z = 0;
				nodes.push(node);
			}
		}

		ap.ports.setNodes(port, nodes);
	},

	addTestPortsGrid: function (portStart, xOffset, yOffset) {

		// Test using a simple grid of ports (containing nodes): 
		var xTOffset = 830;
		var yTOffset = 1100;
		var xS = 0;
		var yS = 0;
		for ( u = 0; u < 15; u ++ ) { 
			var nodes = [];
			for ( e = 0; e < 18; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 24; i ++ ) { 

					var node = {};
					node.x = ((e * 40) + xS - 650 + xOffset) * 0.26;
					node.y = ((i * 40) + yS + yOffset) * 0.26;
					node.z = (Math.random() * 300) - 150;
					nodes.push(node);
				}
			}
			var port = new ap.Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(u + portStart, port);

			xS += xTOffset;
			if((u + 2) % 5 == 1){
				xS = 0;
				yS += yTOffset;
			}
		}
	},

	addTestPortsGrid2: function (portStart, xOffset, yOffset) {
		var nodes = [];
		// Test using a simple grid of ports (containing nodes): 
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					var node = {};
					node.x = ((e * 20) - 340 + xOffset);
					node.y = ((i * 20) + 30 + yOffset);
					nodes.push(node);
				}
			}
			var port = new ap.Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(portStart, port);
	},

	addTestPortsGrid3: function (portStart, xOffset, yOffset) {
		var nodes = [];
		var node = {};
		// Test using a simple grid of ports (containing nodes): 
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					node = {};
					node.x = ((e * 20) - 340 + xOffset);
					node.y = ((i * 20) + 30 + yOffset) - 1;
					nodes.push(node);
				}
			}
			var port = new ap.Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(portStart, port);

			nodes = [];
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					if((i+ 2) % 2 == 1 ){

						node = {};
						node.x = ((e * 20) - 340 + xOffset);
						node.y = ((i * 20) + 30 + yOffset);
						node.z = 110;
						nodes.push(node);
					}
				}
			}
			port = new ap.Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(portStart + 1, port);

			nodes = [];
			for ( e = 0; e < 70; e ++ ) { // Simulate a simple node grid for now
				for ( i = 0; i < 38; i ++ ) { 

					if((i - 1) % 3 == 1 && (e - 1) % 2 == 1){

						node = {};
						node.x = ((e * 20) - 340 + xOffset) - 1;
						node.y = ((i * 20) + 30 + yOffset) - 1;
						node.z = 210;
						nodes.push(node);
					}
				}
			}
			port = new ap.Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(portStart + 2, port);
	},


	addSimpleNodeGrid: function (port, x, y, z, width, height, pitch) {

		var minx = 100000000000;
		var maxx = 0;
		var miny = 100000000000;
		var maxy = 0;

		var nodes = [];
		for ( e = 0; e < width; e ++ ) { 
			for ( i = 0; i < height; i ++ ) { 

				var node = {};
				node.x = ((e * pitch) + x);
				node.y = ((i * pitch) + y);
				node.z = z;
				nodes.push(node);

				minx = Math.min(minx, node.x);
				maxx = Math.max(maxx, node.x);
				miny = Math.min(miny, node.y);
				maxy = Math.max(maxy, node.y);
			}
		}
		var portd = new ap.Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
		ap.ports.setPort(port, portd);

		// If we are not the first designated port set the pod position as a default (testing)
		if(port > 1){
			ap.channels.setPodPos(port, new ap.PodPosition(minx, miny, z, maxx - minx, maxy - miny, z+1));
		}

	}

};

/*
*
* Handles the state of all Ports in the Universe.
*
* Ports are way to organize sets of Nodes.
* All Nodes must be associated with a Port.
*
* Ports may also define network and addressing data.
*
*/

ap.PortManager = function () {

	this.ports = [];

};

ap.PortManager.prototype = {

	init: function () {

	},

	update: function () {

	},

	// ************* Nodes ***********************

	getNodes: function (portId) {
		return this.ports[portId-1].nodes;
	},

	getNodeCount: function (portId) {
		return this.ports[portId-1].nodes.length;
	},

	setNodes: function (portId, nodes) {
		if(!this.ports[portId-1]){ this.ports[portId-1] = {}; }
		this.ports[portId-1].nodes = nodes;
	},

	// Add some nodes with imposed uniform values
	setNodesOffset: function (portId, nodes, offsetX, offsetY, offsetZ) {
		if(!this.ports[portId-1]){ this.ports[portId-1] = {}; }
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].x += offsetX;
			nodes[i].y += offsetY;
			nodes[i].z += offsetZ;
		}
		this.ports[portId-1].nodes = nodes;
	},

	// Add some nodes that only have x, y data, imposed with a uniform z value
	setNodesFlat: function (portId, nodes, z) {
		if(!this.ports[portId-1]){ this.ports[portId-1] = {}; }
		for (var i = 0; i < nodes.length; i++) {
			nodes[i].z = z;
		}
		this.ports[portId-1].nodes = nodes;
	},

	clearNodes: function (portId) {
		delete  this.ports[portId-1].nodes; // TODO optimize: most likely better to not use 'delete'
	},


	// ************* Ports ***********************

	setPort: function (portId, portObject) {
		this.ports[portId-1] = portObject;
	},

	getPort: function (portId) {
		return this.ports[portId-1];
	},

	getPorts: function () {
		return this.ports;
	},

	// Add details to a existing port
	addPortDetails: function (portId, port) {
		if(!this.ports[portId-1]){ console.log("Error: Cannot add details to unexisting Port " + portId); return; }
		var nodes = this.ports[portId-1].nodes; // Preserve the nodes if they exists

		// Merge this.ports[portId-1] + new port data
		var obj3 = {};
		for (var attrname in this.ports[portId-1]) {
			if(this.ports[portId-1][attrname]){ obj3[attrname] = this.ports[portId-1][attrname]; }
		}
		for (var attrname2 in port) {
			if(port[attrname2]){ obj3[attrname2] = port[attrname2]; }
		}
		this.ports[portId-1] = obj3;

		this.ports[portId-1].nodes = nodes;
	},

	clearPort: function (portId) {
		delete this.ports[portId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPorts: function () {
		delete this.ports;
		this.ports = []; // TODO optimize: most likely better to not use 'delete'
	}

};

/*
*
* Channels are a mixable collection of Pods.
* Pods may also contain a set of Clips (shaders).
*
* @param name		String, Optional name.
* @param type		Int, ap.CHANNEL_TYPE_ADD or ap.CHANNEL_TYPE_FX.
* @param mix		Int, overall mix control for entire Channel.
* @param blend 		Int, 1-17 Blend modes specified in constants.
* @param pods 		Pods[], Array of Pod objects. Pods may also contain Clips.
*
*/

ap.Channel = function (params) {

	this.name = params.name;
	this.type = params.type 		|| ap.CHANNEL_TYPE_ADD;
	this.mix = params.mix 			|| 0;
	this.blend = params.blend 		|| ap.BLEND.Add;
	this.pods = params.pods 		|| [];

};
/*
*
* Clips are a internal harness used for each shader.
*
* @param id 	String, name of the shader "SinSpiral".
* @param mix 		Float, 0-1.
* @param blend 		Int, 1-17 Blend modes specified in constants.
* @param posMap 	Int, Position xyz map, default is normal.
* @param speed 		Float, 1 is normal, 0 is no motion.
* @param p1-p9 		Float, assignable uniforms per shader.
*
*/

ap.Clip = function (params) {

	this.id = params.id;
	this.mix = params.mix 			|| 1;
	this.blend = params.blend 		|| ap.BLEND.Add;
	this.posMap = params.posMap 	|| ap.MAP_NORMAL;
	this.speed = params.speed 		|| 1;

	this.p1 = params.p1 || 0;
	this.p2 = params.p2 || 0;
	this.p3 = params.p3 || 0;
	this.p4 = params.p4 || 0;
	this.p5 = params.p5 || 0;
	this.p6 = params.p6 || 0;
	this.p7 = params.p7 || 0;
	this.p8 = params.p8 || 0;
	this.p9 = params.p9 || 0;
};

ap.Clip.prototype = {

	setParams: function (p1, p2, p3, p4, p5, p6, p7, p8, p9) {
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
		this.p4 = p4;
		this.p5 = p5;
		this.p6 = p6;
		this.p7 = p7;
		this.p8 = p8;
		this.p9 = p9;
	}

};

/*
*
* Pods contain position and blend data for a group of Clips.
* They allow you to blend multiple Clips, and then blend the result into other Clips.
* They can be associated with multiple position areas.
*
* @param positionIds 	Int[], a list of all position ids to draw this Pod's content into.
* @param mix 			Float, 0-1.
* @param blend 			Int, 1-17 Blend modes specified in constants.
* @param clips 			Clip[], a list of Clips that render the content from shaders.
*
*/


ap.Pod = function (params) {

	this.positionIds = params.positionIds || [];
	this.mix = params.mix || 1;
	this.blend = params.blend || ap.BLEND.Add;
	this.clips = params.clips || [];

	// TODO - this data should be packed into portsMap, useful for creating specific groups of nodes outside of xyz or port data
	// this.hardwareGroupMode = hardwareGroupMode || ap.HARDWAREGROUP_OFF;			// Off, Exclude, or Solo Mode
	// this.hardwareGroupIds = hardwareGroupIds || [];
};
/*
*
* Pod Positions define coordinates for Pods to associate with.
* Multiple Pods may associate to any amount of Pod Positions.
*
*/

ap.PodPosition = function (x, y, z, width, height, depth, xt, yt, zt, xs, ys, zs, flipmode) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = width || 0;
	this.h = height || 0;
	this.d = depth || 0;

	this.xt = xt || 0.5;
	this.yt = yt || 0.5;
	this.zt = zt || 0.5;
	this.xs = xs || 0.5;
	this.ys = ys || 0.5;
	this.zs = zs || 0.5;
	this.flipmode = flipmode || 0;
};
/*
*
* Ports are way to organize sets of Nodes.
* All Nodes must be associated with a Port.
*
* Ports may also define network and addressing data.
*
*/

// (String name, int type, String address, int hardwarePort [optional], Array nodes [optional]) 
ap.Port = function (name, type, address, hardwarePort, nodes) {

	this.name = name;
	this.type = type;
	this.address = address || "";
	this.nodes = nodes || [];
	this.hardwarePort = hardwarePort || 1;

};
/**
 * Main Shader that all other shaders get injected into
 */


ap.MainShader = {

	fragmentShader: [

		
		"#INCLUDESHADERUTILS",


		"precision mediump float;",
		"float ap_index;",
		"vec4 ap_xyz;",
		"vec4 ap_xyz2;",
		"vec3 ap_lastRgb;",
		"vec3 ap_rgb = vec3(0.);",
		"vec3 ap_hsv;",
		"vec3 ap_rgb2;",
		"vec4 ap_rgbV4;",
		"vec3 ap_c = vec3(0.);",
		"vec3 ap_p = vec3(0.);",
		"vec2 resolution;",
		"float random;",

		"varying vec2 v_vUv;",
		"uniform float _time;",
		"uniform float _random;",
		"uniform float u_mapSize;",
		"uniform sampler2D u_coordsMap;",
		"uniform sampler2D u_prevCMap;",
		//uniform sampler2D u_portsMap;

		// TODO optimize this list to only include what we need each regeneration
		"#define picu  31.006276680299820175476315067101 //pi cubed, pi^3",
		"#define pisq  9.8696044010893586188344909998762 //pi squared, pi^2",
		"#define twpi  6.283185307179586476925286766559  //two pi, 2*pi ",
		"#define pi    3.1415926535897932384626433832795 //pi",
		"#define prpi  1.4396194958475906883364908049738 //pi root of pi",
		"#define trpi  1.0471975511965977461542144610932 //one third of pi, pi/3",
		"#define lgpi  0.4971498726941338543512682882909 //log(pi)       ",
		"#define rcpi  0.31830988618379067153776752674503// reciprocal of pi  , 1/pi  ",
		/*
		"#define ptpi 1385.4557313670110891409199368797 //powten(pi)",
		"#define pipi  36.462159607207911770990826022692 //pi pied, pi^pi",
		"#define pepi  23.140692632779269005729086367949 //powe(pi);",
		"#define chpi  11.59195327552152062775175205256  //cosh(pi)",
		"#define shpi  11.548739357257748377977334315388 //sinh(pi)",
		"#define sqpi  1.7724538509055160272981674833411 //square root of pi ",
		"#define hfpi  1.5707963267948966192313216916398 //half pi, 1/pi",
		"#define cupi  1.4645918875615232630201425272638 //cube root of pi",
		"#define lnpi  1.1447298858494001741434273513531 //logn(pi); ",
		"#define thpi  0.99627207622074994426469058001254//tanh(pi)",
		"#define rcpipi  0.0274256931232981061195562708591 // reciprocal of pipi  , 1/pipi ",*/

		"#INCLUDESHADERFUNCTIONS",

		"void main() {",

			"random = rand(vec2(gl_FragCoord[0] * (gl_FragCoord[2] + 1.), gl_FragCoord[1] * _random) * (_time * 0.0001));",

			// Black is default
			"ap_rgb = vec3(0.0);",
			
			//********************************************
			
			// ap_xyz: coordinates that get overwritten with each pod
			// ap_xyz2: original reference coordinates that never get overwritten
			"ap_xyz2 = ap_xyz = texture2D( u_coordsMap, v_vUv);",
			"if(ap_xyz[3] == 0.0){ discard; }",

			"ap_index = ((1.0 - v_vUv.y) * u_mapSize * u_mapSize + v_vUv.x * u_mapSize);",
			"ap_lastRgb = vec3(texture2D( u_prevCMap, v_vUv));",

			//********************************************

			"#INCLUDESHADERS",

			"gl_FragColor = vec4(ap_c, 1.0);",

		"}"

	].join("\n")

};

/**
 * Simple node shader for displaying on ap nodes
 */


ap.shaders.PointCloudShader = {

	uniforms: {
		u_pointSize:  { type: 'f', value: 80.0 },
		//u_colorMap:   { type: "t", value: null },
		//u_texture:    { type: "t", value: null }
	},

	attributes: { 
		//a_geoX:        { type: 'fv1', value: null },
		//a_geoY:        { type: 'fv1', value: null },
		//a_index:        { type: 'fv1', value: null }
	},

	vertexShader: [

		"uniform float u_pointSize;",
		"attribute float a_geoX;",
		"attribute float a_geoY;",
		"attribute float a_index;",
		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_index;",

		"void main() {",
			"v_geoX = a_geoX;",
			"v_geoY = a_geoY;",
			"v_index = a_index;",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"gl_PointSize = u_pointSize * ( 300.0 / length( mvPosition.xyz ) );",
			"gl_Position = projectionMatrix * mvPosition;",
		"}",

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D u_texture;",
		"uniform sampler2D u_colorMap;",

		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_index;",

		"void main() {",
			"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texture, gl_PointCoord);",
		"}",

	].join("\n")

};

/**
 * ********** Shader Utils:

 * ** Helper Methods:
 *
 * vec3 rgb2hsv(vec3 c); 						// Convert RGB to HSV
 * vec3 hsv2rgb(vec3 c); 						// Convert HSV to RGB
 * vec3 blend(vec3 c1, vec3 c2, float type);	// Blend Modes (1-17)
 * float rand(vec2 co);							// Random Generator	(vec2)
 *
 */


ap.shaders.ShaderUtils = [

	"vec3 rgb2hsv(vec3 c){",
	    "vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);",
	   " vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));",
	    "vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));",

	    "float d = q.x - min(q.w, q.y);",
	    "float e = 1.0e-10;",
	    "return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);",
	"}",

	"vec3 hsv2rgb(vec3 c) {",
	"	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
	"	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
	"	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
	"}",


	"vec3 blend(vec3 c1, vec3 c2, float type)",
	"{",
		"if(type == 0.0){ return c1; }else						",// Off",
		"if(type == 1.0){ return c1 + c2; }else					",// Add",
		"if(type == 2.0){ return c1 - c2; }else					",// Subtract",
		"if(type == 3.0){ return min(c1, c2); }else				",// Darkest",
		"if(type == 4.0){ return max(c1, c2); }else				",// Lighest",
		"if(type == 5.0){ return abs(c2 - c1); }else				",// DIFFERENCE",
		"if(type == 6.0){ return c1 + c2 - 2.0 * c1 * c2; }else	",// EXCLUSION",
		"if(type == 7.0){ return c1 * c2; }else					",// Multiply",
		"if(type == 8.0){ return (c1 + c2) - (c1 * c2); }else	",// Screen",
		//"													// Overlay",
		"if(type == 9.0){ return vec3((c2.r <= 0.5) ? (2.0 * c1.r * c2.r) : (1.0 - 2.0 * (1.0 - c2.r) * (1.0 - c1.r)),(c2.g <= 0.5) ? (2.0 * c1.g * c2.g) : (1.0 - 2.0 * (1.0 - c2.g) * (1.0 - c1.g)),(c2.b <= 0.5) ? (2.0 * c1.b * c2.b) : (1.0 - 2.0 * (1.0 - c2.b) * (1.0 - c1.b))); }else",
		//"													// HARD LIGHT",
		"if(type == 10.0){ return vec3((c1.r <= 0.5) ? (2.0 * c1.r * c2.r) : (1.0 - 2.0 * (1.0 - c1.r) * (1.0 - c2.r)),(c1.g <= 0.5) ? (2.0 * c1.g * c2.g) : (1.0 - 2.0 * (1.0 - c1.g) * (1.0 - c2.g)),(c1.b <= 0.5) ? (2.0 * c1.b * c2.b) : (1.0 - 2.0 * (1.0 - c1.b) * (1.0 - c2.b))); }else",
		//"												// SOFT LIGHT",
		"if(type == 11.0){ return vec3((c1.r <= 0.5) ? (c2.r - (1.0 - 2.0 * c1.r) * c2.r * (1.0 - c2.r)) : (((c1.r > 0.5) && (c2.r <= 0.25)) ? (c2.r + (2.0 * c1.r - 1.0) * (4.0 * c2.r * (4.0 * c2.r + 1.0) * (c2.r - 1.0) + 7.0 * c2.r)) : (c2.r + (2.0 * c1.r - 1.0) * (sqrt(c2.r) - c2.r))),(c1.g <= 0.5) ? (c2.g - (1.0 - 2.0 * c1.g) * c2.g * (1.0 - c2.g)) : (((c1.g > 0.5) && (c2.g <= 0.25)) ? (c2.g + (2.0 * c1.g - 1.0) * (4.0 * c2.g * (4.0 * c2.g + 1.0) * (c2.g - 1.0) + 7.0 * c2.g)) : (c2.g + (2.0 * c1.g - 1.0) * (sqrt(c2.g) - c2.g))),(c1.b <= 0.5) ? (c2.b - (1.0 - 2.0 * c1.b) * c2.b * (1.0 - c2.b)) : (((c1.b > 0.5) && (c2.b <= 0.25)) ? (c2.b + (2.0 * c1.b - 1.0) * (4.0 * c2.b * (4.0 * c2.b + 1.0) * (c2.b - 1.0) + 7.0 * c2.b)) : (c2.b + (2.0 * c1.b - 1.0) * (sqrt(c2.b) - c2.b)))); }else",
		//"												// DODGE",
		"if(type == 12.0){ return vec3((c1.r == 1.0) ? 1.0 : min(1.0, c2.r / (1.0 - c1.r)),(c1.g == 1.0) ? 1.0 : min(1.0, c2.g / (1.0 - c1.g)),(c1.b == 1.0) ? 1.0 : min(1.0, c2.b / (1.0 - c1.b))); }else",
		//"													// Burn",
		"if(type == 13.0){ return vec3((c1.r == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.r) / c1.r)),(c1.g == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.g) / c1.g)), (c1.b == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.b) / c1.b))); }else",
		"if(type == 14.0){ return (c1 + c2) - 1.0; }else",//			// LINEAR BURN",
		"if(type == 15.0){ return 2.0 * c1 + c2 - 1.0; }else",//		// LINEAR LIGHT	",	
		//"													// VIVID LIGHT",
		"if(type == 16.0){ return vec3((c1.r <= 0.5) ? (1.0 - (1.0 - c2.r) / (2.0 * c1.r)) : (c2.r / (2.0 * (1.0 - c1.r))),(c1.g <= 0.5) ? (1.0 - (1.0 - c2.g) / (2.0 * c1.g)) : (c2.g / (2.0 * (1.0 - c1.g))),(c1.b <= 0.5) ? (1.0 - (1.0 - c2.b) / (2.0 * c1.b)) : (c2.b / (2.0 * (1.0 - c1.b)))); }else",
		//"											// PIN LIGHT",
		"if(type == 17.0){ return vec3((c1.r > 0.5) ? max(c2.r, 2.0 * (c1.r - 0.5)) : min(c2.r, 2.0 * c1.r), (c1.r > 0.5) ? max(c2.g, 2.0 * (c1.g - 0.5)) : min(c2.g, 2.0 * c1.g),(c1.b > 0.5) ? max(c2.b, 2.0 * (c1.b - 0.5)) : min(c2.b, 2.0 * c1.b)); }else",
		"{ return c1 + c2; }								",//		// Add (default)",
	"}",
/*
	"vec3 nv(vec4 c)",
	"{",
	  "  return max(min(vec3(c.r, c.g, c.b), vec3(1.0)), vec3(0.0));",
	"}",
*/
	
	"float rand(vec2 co)",
	"{",
	  "  highp float a = 12.9898;",
	  "  highp float b = 78.233;",
	  "  highp float c = 43758.5453;",
	  "  highp float dt= dot(co.xy ,vec2(a,b));",
	  "  highp float sn= mod(dt,3.14);",
	  "  return fract(sin(sn) * c);",
	"}"


].join("\n");
/**
 * Simple shader for displaying a texture
 */
 

ap.shaders.SimpleTextureShader = {

	uniforms: {

		"u_texture":   { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 v_vUv;",
		"void main() {",
			"v_vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"varying vec2 v_vUv;",
		"uniform sampler2D u_texture;",

		"void main() {",
		"	gl_FragColor = texture2D( u_texture, v_vUv );",
		"}",

	].join("\n")

};
