

// ****** Platform ******

var ap = { REVISION: '1' };		// Global object
ap.shaders = {};				// Internal shaders 
ap.clips = {}; 					// Loaded shaders as clips
ap.register = {}; 				// Loaded shaders get referenced here internally for quick lookup

// TODO this should be a list of objects that we load at runtime, hardcoded for now
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


// Port Type Constants
ap.PORT_TYPE_OFF = 0;
ap.PORT_TYPE_KINET_1 = 1; // strands
ap.PORT_TYPE_KINET_2 = 2; // tiles
ap.PORT_TYPE_KINET_3 = 3; // colorblasts
ap.PORT_TYPE_KINET_4 = 4;
ap.PORT_TYPE_DMX_1 = 5; // Movers, for testing
ap.PORT_TYPE_DMX_2 = 6;
ap.PORT_TYPE_DMX_3 = 7;
ap.PORT_TYPE_LASER_1 = 8;


// Channel Type Constants
ap.CHANNEL_TYPE_OFF = 0;
ap.CHANNEL_TYPE_BLEND = 1;
ap.CHANNEL_TYPE_FX = 2;
ap.CHANNEL_TYPE_SCENE = 3;


// Pod Hardware Group Modes Constants
ap.HARDWAREGROUP_OFF = 0;
ap.HARDWAREGROUP_SOLO = 1;
ap.HARDWAREGROUP_EXCLUDE = 2;


// Temporary Preset Management // TODO dynamic clip loading system
ap.demoClipNames = ["OFF", "SolidColor", "ColorSineBar", "ColorSwirls", "LineCosSin", "SimpleSwirl",
"SinSpiral", "SineParticles", "DiSinSwirl", "HexifyRadial", "SinCosTan"];

ap.demoHardware = ["ApHardwareTest", "Grid+zLayer", "RanZGrid"];


function getVariableTypeFromShorthand(shorthand){
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
}

/*
* Returns a cloned an object.
* @param	The object to clone.
* http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
*/
function clone(obj) {
	if (null === obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
 */
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

/*
* Return the lowest power of two that is big enough to contain x
*/
function lowestPowerOfTwo(x) {
	return Math.pow(2, Math.ceil(Math.log(x)/Math.log(2)));
}
/*
* ************* APPLICATION MANAGER *************** 
*
* Handles GL state and rendering responsibilities.
*
*/

var AppManager = function (container) {

	this.glWidth = 0;
	this.glHeight = 0;

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

	this.time = 0;
	this.speed = 0.045;
	this.simSize = 128;
	this.pixels;
	this.readPixels = false;

	this.nodeTexture = THREE.ImageUtils.loadTexture( "images/nodeflare250.png" );  // TODO preload this

	this.coordsMap;

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

		this.renderer = new THREE.WebGLRenderer( /*{ preserveDrawingBuffer: this.readPixels } */); // Some browsers might need preserveDrawingBuffer to readPixels
		this.renderer.setSize( this.glWidth, this.glHeight );
		this.renderer.autoClear = false;
		this.container.appendChild( this.renderer.domElement ); 
		this.container.appendChild( this.stats.domElement );

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 30, this.glWidth / this.glHeight, 1, 100000 );
		this.camera.position.z = 2000;
		this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement);

		this.geometry = new THREE.Geometry();

		//this.updateNodePoints();
		//this.updateMainSourceShader();

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
		this.stats.update();


		//this.camera.position.x += ( mouseX - this.camera.position.x ) * 0.05;
		//this.camera.position.y += ( - mouseY - this.camera.position.y ) * 0.05;
		//this.camera.lookAt( this.scene.position );
		this.controls.update();


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

			// Render the node and plane scene using the generated texture
			this.renderer.render( this.scene, this.camera );
		}
		
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
		this.scene.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.rtTextureB }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -900;
		this.scene.add( quad );

		materialScreen = new THREE.ShaderMaterial( {

			uniforms: 		{u_texture:   { type: "t", value: this.coordsMap }},
			vertexShader: 	ap.shaders.SimpleTextureShader.vertexShader,
			fragmentShader: ap.shaders.SimpleTextureShader.fragmentShader,
			depthWrite: false

		} );

		quad = new THREE.Mesh( testPlane, materialScreen );
		quad.position.x = -1200;
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
		ap.channels.setPodPos(1, new PodPosition(minx, miny, 0, maxx - minx, maxy - miny, 1));
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
		if(this.scene.getObjectByName(name)){
			// If the pointCloud has already been added, remove it so we can add it fresh
			this.scene.remove( this.pointCloud );
		}

		this.pointCloud = new THREE.PointCloud( this.geometry, this.nodeShaderMaterial );
		this.pointCloud.sortParticles = true;
		this.pointCloud.name = name;

		// Center // TODO offset coords based on window size
		this.pointCloud.position.x = -400;
		this.pointCloud.position.y = -400;

		this.scene.add( this.pointCloud );

		console.log("AP Nodes: " + this.geometry.vertices.length);

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

	}

};
/*
 * ************* CHANNEL MANAGER *************** 
 * Handles the state of all Channels running in the Universe.
 * Channels may contain Pods, which may contain Clips (structured shaders).
 *
 */

var ChannelManager = function () {

	this.channels = [];
	this.podpositions = [];

	/*

	--hold state:
	---------------------------------------

	pod objects stored on channel objects

		channels = [];
		channels[0] = new Channel(); // 0 is the address. associative/holey arrays ok, its only looped once when we regenerate shader 
		channels[0].type = "content"; // or 'fx' and 'scenefx' eventually
		channels[0].pods = [];
		channels[0].pods[0] = new Pod(); // '0.0' is the 'channel.pod' address
		channels[0].pods[0].mix = 1;
		channels[0].pods[0].clips = [];
		channels[0].pods[0].clips[0] = new Clip(); // '0.0.0' is the 'channel.pod.clip' address
		channels[0].pods[0].clips[0].id = 12; // colorwash clip for example



	any number of channel objects
		type (content, fx, or scene)
		mix value
		mod values (just for mix)

		any number of pod objects
			mix value
			blend value
			mod values (just for mix)
			position group id (that this pod references position data from)
			hardware group id (up to 3 of them)
				exclude or solo mode (for all hardware groups)

			any number of clip objects
				mix value
				blend value
				param values
				mod values (for mix and params)
				clip id (so we know which shader to grab from library)


	any number of position group objects (each pod must point to one of these) (maybe refactor into seperate manager?)
		id
		position data: xyz, whd


	--responsibilites:
	---------------------------------------

	main responsibility is to build source shader from 'snippets that have pod and clip data baked in'
		the shader gets re-generated anytime
			a pod gets added or deleted
			a pod changes it's hardware group(s), or how it uses the hardware group(s) (exclude or solo) 
			a pod changes which position group it references
			a position group's coordinates change (if actively referenced by a pod)

	define shader uniforms (to be used as clip params and properties)


	when in editor mode, show all the pod position groups, record any coordinate changes


	*/

};

ChannelManager.prototype = {

	init: function () {

	},

	update: function () {

		// For every clip in each pods channel, we call it's update function if it's defined
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];

					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) {
							var clip = pod.clips[u];
							if(clip){

								var srcClip = ap.clips[ap.register[clip.clipId]];

								// If the clip defined update function call it with proper clip addressing
								if(srcClip && srcClip.update && ap.app.material){
									srcClip.update("_" + (i+1) + "_" + (e+1) + "_" + (u+1), ap.app.material.uniforms);
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
		var variables = {};
		var fragmentFunctions = {};
		var fragmentFunctionOutput = "";
		var output = "";
		var fragOutput = "";

		var lastKnownPos = {};

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			channel.address = "_" + (i+1);

			var fxChannel = false;
			if(channel.type === ap.CHANNEL_TYPE_FX){
				fxChannel = true;
			}

			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix }; // TODO modulation uniforms 

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];
					pod.address = channel.address + "_" + (e+1);

					// uniforms 'mix' & 'blend' for the pod
					uniforms[pod.address + "_mix"] = { type: "f", value: pod.mix }; // TODO modulation uniforms 
					uniforms[pod.address + "_blend"] = { type: "f", value: pod.blend };

					var fxPod = false;
					// Set pod position data for use by all the clips in this pod
					if(pod.clips && pod.clips.length){

						// TODO account for resolution to use 3D if there is depth data
						var podPos = this.getPodPos(pod.positionId);

						// Set the resolution (if it's changed) for the next set of nodes to be the current pods position bounding box
						if(lastKnownPos !== podPos){
							output += "resolution = vec2(" + podPos.w + ", " + podPos.h + "); \n";
							lastKnownPos = podPos;

							// Offset the xyz coordinates with the pod's xy to get content to stretch and offset properly // ap_xyz2 is the original real coordinates
							
						} output += "ap_xyz.x = ap_xyz2.x - " + podPos.x.toFixed(1) + "; \n";
							output += "ap_xyz.y = ap_xyz2.y - " + podPos.y.toFixed(1) + "; \n";

						// Declare each clips variables, but we can't declare them more than once so record which ones we have declared already
						for (var u = 0; u < pod.clips.length; u++) {

							if(pod.clips[u]){

								var sourceShader = ap.clips[ap.register[pod.clips[u].clipId]];
								if(sourceShader){
									for (var variable in sourceShader.variables) {

										if(!variables[variable]){ // If we don't already have the variable mark it as in use and include it.
											variables[variable] = 1; 
											var type = getVariableTypeFromShorthand(sourceShader.variables[variable].type);
											output += type + " " + variable + ";";
										}
									}output += "\n";
									for (var fragmentFunction in sourceShader.fragmentFunctions) {
										if(!fragmentFunctions[fragmentFunction]){ // If we don't already have the function mark it as in use and include it.
											fragmentFunctions[fragmentFunction] = 1; 
											fragmentFunctionOutput += sourceShader.fragmentFunctions[fragmentFunction] + " \n";
										}
									}
								}
							}
						}output += "\n";

						// Check to see if the nodes are in the position bounding box, if not don't render these clips // ap_xyz2 is the original real coordinates
						output += "if(ap_xyz2.x >= " + podPos.x.toFixed(1) + " && ap_xyz2.y >= " + podPos.y.toFixed(1) + " && ap_xyz2.x <= " + (podPos.w + podPos.x).toFixed(1) + " && ap_xyz2.y <= " + (podPos.h + podPos.y).toFixed(1) + ") { \n";


						fxPod = true; // If the only clips that are in this pod are fx's then treat pod as a fx output and don't blend
						for (u = 0; u < pod.clips.length; u++) {

							var clip = pod.clips[u];
							if(clip){

								var srcClip = ap.clips[ap.register[clip.clipId]];
								clip.address = pod.address +"_" + (u+1);
								if(srcClip){

									// If the Clip defined properties define them as addressed uniforms
									for (var property in srcClip.properties) {
										uniforms[clip.address + "_" + property] = srcClip.properties[property];
									}

									// If the clip defined optional init() method call it with addressing
									if(srcClip.init){
										srcClip.init(clip.address, uniforms);
									}

									// Create params with default values
									for (var param in srcClip.params) {
										uniforms[clip.address + "_" + param] = { type: "f", value: srcClip.params[param].value };
									}


									// uniforms 'mix' & 'blend' for the clip
									uniforms[clip.address + "_mix"] = { type: "f", value: clip.mix }; // TODO modulation uniforms 
									uniforms[clip.address + "_blend"] = { type: "f", value: clip.blend }; 


									// Lookup the correct imported clip based on the id stored on the clip object
									fragOutput = srcClip.fragmentMain + "\n";

									// Replace the standard GL color array with an internal one so that we can mix and merge, and then output to the standard when we are done
									fragOutput = fragOutput.replace(/gl_FragColor/g, "ap_rgbV4");
									fragOutput = fragOutput.replace(/ap_fxOut/g, "ap_rgbV4");
									fragOutput = fragOutput.replace(/gl_FragCoord/g, "ap_xyz");

									// Normalize into Vector3
									fragOutput += "ap_rgb2 = vec3(ap_rgbV4.r, ap_rgbV4.g, ap_rgbV4.b); \n"; // vec4 -> vec3
									fragOutput += "ap_rgb2 = max(min(ap_rgb2, vec3(1.0)), vec3(0.0)); \n";



									// ------------ Clip Mix Blend & Fx --------------

									var fx = ap.clips[ap.register[clip.clipId]].fx;
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
									
									if(fx){
										// If we are an effects clip set the incoming value from the last clip, or the last pod if we are the first clip
										if(u === 0){
											fragOutput = fragOutput.replace(/ap_fxIn/g, "ap_p");
										}else{
											fragOutput = fragOutput.replace(/ap_fxIn/g, "ap_rgb");
										}
									}

									// Merge the clip fragment shaders as we move along
									output += fragOutput;
								}
							}
						}
						
						// If the clips are not in this pod set color value to 0 unless it's a fx and let the value pass }
						output += "}";output += " else{ ap_rgb = ap_p; } \n";

						if(fxPod){
							// If this is an effects pod don't change values for anything outside the bounding box
							//output += " else{ ap_rgb = ap_p; } \n";
						}else{
							// Otherwise clear any values that are outside the bounding box
							//output += " else{ ap_rgb = vec3(0.0);} \n";
						}
					}

					
					//  -------------- Pod Mix Blend & Fx --------------

					// If we are the very first pod mix output value, don't blend from previous pod
					if(e === 0){
						output += "ap_rgb = ap_rgb * (_pod_mix); \n";
						output += "ap_p = ap_rgb; \n";

					}else{
						if(fxPod){
							// Fx pod: mix the original with the result of fx

							//output += "ap_p = ap_rgb; \n";
							output += "ap_p = mix(ap_p, ap_rgb, _pod_mix); \n";

						}else{
							// Blend in last pod with current pod, if it's not the first pod in this channel
							output += "ap_rgb = ap_rgb * (_pod_mix); \n";
							output += "ap_p = blend(ap_p, ap_rgb, _pod_blend); \n";
							//output += "//-------------=-=- \n";
						}
					}

					output = output.replace(/_pod_/g, pod.address + "_") + "\n";
				}

			}

				
			//  -------------- Channel Mix & Fx --------------

			if(i === 0){
				output += "ap_p = ap_p * (_channel_mix); \n";
				output += "ap_c = ap_p; \n";
			}else{

				if(fxChannel){
					output += "ap_c = mix(ap_c, ap_p, _channel_mix); \n";
				}else{
					output += "ap_p = ap_p * (_channel_mix); \n";
					output += "ap_c = blend(ap_c, ap_p, 1.0); \n"; // Channels always blend using 'add'
				}
			}

			output = output.replace(/_channel_/g, channel.address + "_") + "\n";
		}

		//console.log(uniforms);
		//console.log(output);

		/*
		// TODO regenerate Metamap data: (if any of this changed)

			port id
			node id
			index
			hardware group 1
			hardware group 2
			hardware group 3
			hardware group mode: off, exclude, or solo

		*/


		return new Shader(uniforms, fragmentFunctionOutput, output + "\n");

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
* ************* HARDWARE MANAGER *************** 
*
* Handles adding and removing Physical Hardware in the Universe as either a Node or a Plane.
*
*/

var HardwareManager = function () {

};

HardwareManager.prototype = {

	init: function () {
/*
		
*/
		
		// Simulate Importing nodes from external file
		this.importNodes(ap.imported, 1, 350, 100, 500);
		ap.channels.setPodPos(2, new PodPosition(-190, 140, 0, 1070, 575, 1));

		//this.addTestPortsGrid3(1, 0, 0);


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
			var port = new Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
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
			var port = new Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
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
			var port = new Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
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
			port = new Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
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
			port = new Port("port name " + port, ap.PORT_TYPE_KINET_1, null, null, nodes);
			ap.ports.setPort(portStart + 2, port);
	}

};

/*
* ************* PORT MANAGER *************** 
*
* Handles the state of all Ports in the Universe.
* Ports may contain either Nodes or Planes.
*
*/

var PortManager = function () {

	this.ports = [];

};

PortManager.prototype = {

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
		this.ports[portId-1] = merge(this.ports[portId-1], port);
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
* ************* UI MANAGER *************** 
*
* One possible View & Controller state of the MVC application
*
*/

var UiManager = function () {

	this.guiData;

	this.gui = new dat.GUI({
		load: ap.datguiJson,
		preset: 'ApHLineBar'
	});

};

UiManager.prototype = {

	init: function () {


			// -------Temporary: Create some Channels/Pods/Clips for testing----------

			
			// Let's create some test channels for now (TODO: this should be loaded from current project settings)
			var mix = 1;
			var mix2 = 1;
			var pods = [];

			//pods[3] = new Pod(1, mix, ap.BLEND.Add, [new Clip(2, mix, ap.BLEND.Add), new Clip(5, mix, ap.BLEND.Fx)]);
			//pods[2] = new Pod(3, mix, ap.BLEND.Add, [new Clip(3, mix2, ap.BLEND.Add), new Clip(5, 1, ap.BLEND.Fx)]);
			pods[1] = new Pod(2, mix, ap.BLEND.LinearLight, [new Clip(12, mix, ap.BLEND.Add), new Clip(5, 1, ap.BLEND.Fx)]);
			pods[0] = new Pod(1, mix, ap.BLEND.Add, [new Clip(8, mix2, ap.BLEND.Add), new Clip(5, 1, ap.BLEND.Fx)]);

			ap.channels.setChannel(1, new Channel("TestChannel1", ap.CHANNEL_TYPE_BLEND, mix, ap.BLEND.Add, pods));


			var pods2 = [];
			pods2[0] = new Pod(1, mix, ap.BLEND.Add, [new Clip(16, 1, ap.BLEND.Fx)]);

			ap.channels.setChannel(2, new Channel("Post FX1", ap.CHANNEL_TYPE_FX, mix, ap.BLEND.Add, pods2));

			ap.app.updateNodePoints();
			ap.app.updateMainSourceShader();





			// ****** UI ******  // TODO replace dat.gui with react components (or similar) that reflect model: ap.channels 

			// The list of state that the UI is representing (V) and setting (C)
			this.guiData  = {
				Channel1Mix:  1,
				/*
				S3Blend:  'Add',
				S3ClipId:  0,
				S3Mix:  1,
				S3Scale:  1,
				Hue3Mix:  1,
				*/
				S2Blend:  "LinearLight",
				S2ClipId:  ap.demoClipNames[5],
				S2Mix:  1,
				S2Scale:  0.7,
				S2HueTint:  1,

				S1Mix:  1,
				S1ClipId:  ap.demoClipNames[3],
				S1Scale:  0.7,
				S1HueTint:  1,

				Hue:  1,
				Saturation:  1,
				HueClamp:  1,
				SatClamp:  1,
				Smooth:  0.5,
				PreAmp:  1,
				//Threshold:  1,
				//Noise:  0,

				Speed: ap.app.speed,
				PointSize: 80,
				Hardware: ap.demoHardware[0]

			};
			
			// Add preset controls
			this.gui.remember(this.guiData);


			// =========Event listeners===============


			this.gui.add( this.guiData, "Channel1Mix", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_mix.value = _in; });
			
			this.gui.add( { SnapToFront:function(){
				ap.app.controls.reset();
				f2.close();
				f3.close();
				f5.close();
			} } ,'SnapToFront');

			//var f1 = gui.addFolder('Shader 1'); 		f1.open();
			var f2 = this.gui.addFolder('Shader 1'); 	//	f2.open();
			var f3 = this.gui.addFolder('Shader 2'); 	//	f3.open();
			var f4 = this.gui.addFolder('Post FX'); 		//	f4.open();
			var f5 = this.gui.addFolder('Settings'); 	//	f5.open();

			/*
			// Pod 3
			f1.add( guiData, 'S3Blend', ap.BLENDS )		.onChange(function () { uniformBlendChange( guiData.S3Blend, "_1_3"); });
			f1.add( guiData, 'S3ClipId', ap.demoClipNames).onChange(function () { uniformClipTypeChange( guiData.S3ClipId, 1, 3, 1 ); });
			f1.add( guiData, "S3Mix", 0.0, 1.0, 1.0 )	.onChange(function () { ap.app.material.uniforms._1_3_1_mix.value = guiData.S3Mix; });
			f1.add( guiData, "S3Scale", 0.0, 1.0, 1.0 )	.onChange(function () { ap.app.material.uniforms._1_3_1_p1.value = guiData.S3Scale; });
			f1.add( guiData, "Hue3Mix", 0.0, 1.0, 1.0 )	.onChange(function () { ap.app.material.uniforms._1_3_2_p1.value = guiData.Hue3Mix; });
			*/
			// Pod 2
			f2.add( this.guiData, 'S2ClipId', ap.demoClipNames).onChange(function (_in) { ap.ui.uniformClipTypeChange(_in, 1, 2, 1 ); });
			f2.add( this.guiData, "S2Mix", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_2_1_mix.value =_in; });
			f2.add( this.guiData, "S2Scale", 0.1, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_2_1_p1.value =_in; });
			f2.add( this.guiData, "S2HueTint", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_2_2_p1.value =_in; });
			f2.add( this.guiData, 'S2Blend', ap.BLENDS )		.onChange(function (_in) { ap.ui.uniformBlendChange(_in, "_1_2"); });
			
			// Pod 1
			f3.add( this.guiData, 'S1ClipId', ap.demoClipNames).onChange(function (_in) { ap.ui.uniformClipTypeChange(_in, 1, 1, 1 ); });
			f3.add( this.guiData, "S1Mix", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_1_1_mix.value =_in; });
			f3.add( this.guiData, "S1Scale", 0.1, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_1_1_p1.value =_in; });
			f3.add( this.guiData, "S1HueTint", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._1_1_2_p1.value =_in; });
			
			// Post Fx
			f4.add( this.guiData, "Hue", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._2_1_1_p1.value =_in; });
			f4.add( this.guiData, "HueClamp", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._2_1_1_p2.value =_in; });
			f4.add( this.guiData, "Saturation", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._2_1_1_p3.value =_in; });
			f4.add( this.guiData, "SatClamp", 0.0, 1.0, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._2_1_1_p4.value =_in; });
			f4.add( this.guiData, "Smooth", 0.0, 0.98, 1.0 )	.onChange(function (_in) { ap.app.material.uniforms._2_1_1_p5.value =_in; });
			f4.add( this.guiData, "PreAmp", 0.0, 1.0, 0.0 )	.onChange(function (_in) { ap.app.material.uniforms._2_1_1_p6.value =_in; });
			//f4.add( this.guiData, "Threshold", 0.0, 1.0, 1.0 ).onChange(function (_in) { ap.app.material.uniforms._2_1_1_p5.value =_in; });
			//f4.add( this.guiData, "Noise", 0.0, 1.0, 1.0 ).onChange(function (_in) { ap.app.material.uniforms._2_1_1_p6.value =_in; });
			
			// Global Settings (temporary for demo)
			f5.add( this.guiData, 'Hardware', ap.demoHardware).onChange(function (_in) {

				ap.ports.clearAllPorts();

				switch(_in){
					case ap.demoHardware[0]:

						ap.channels.setPodPos(2, new PodPosition(-190, 140, 0, 1070, 575, 1));
						ap.hardware.importNodes(ap.imported, 1, 0, 0, 0);
						break;
					case ap.demoHardware[1]:

						ap.channels.setPodPos(2, { x: -339, y: 30, z: 10, w: 1378, h: 738, d: 1 });
						ap.hardware.addTestPortsGrid3(1, 0, 0);
						break;

					case ap.demoHardware[2]:

						ap.channels.setPodPos(2, new PodPosition(-190, 286, 0, 1070, 242, 1));
						ap.hardware.addTestPortsGrid(1, 0, 0);
						break;


					default: 
						ap.hardware.importNodes(ap.imported, 1, 0, 0, 0);
					break;
				}
					ap.app.updateNodePoints(); // only need to call this when we add nodes after_init
					ap.app.updateMainSourceShader();

					updateShader = true;

			});
			f5.add( this.guiData, "Speed", 0.025, 0.8, 1.0 ).onChange(function (_in) { ap.app.speed =_in; });
			f5.add( this.guiData, "PointSize", 45.0, 90.0, 1.0 ).onChange(function (_in) { ap.app.nodeShaderMaterial.uniforms.u_pointSize.value =_in; });
			


			

			// Close folders on startup by default

			f2.close();
			f3.close();
			//f4.close();
			f5.close();

	},

	update: function () {

	}, 

	/*
	* Trigger a blend change on ap.app.material based on a defined address
	*/
	uniformBlendChange: function (guiItem, address) { 
		var blend = 1.0;
		if(guiItem === ap.BLENDS[0]){       blend = 1.0;
		}else if(guiItem === ap.BLENDS[1]){ blend = 2.0; 
		}else if(guiItem === ap.BLENDS[2]){ blend = 3.0; 
		}else if(guiItem === ap.BLENDS[3]){ blend = 4.0; 
		}else if(guiItem === ap.BLENDS[4]){ blend = 5.0;
		}else if(guiItem === ap.BLENDS[5]){ blend = 6.0;
		}else if(guiItem === ap.BLENDS[6]){ blend = 7.0; 
		}else if(guiItem === ap.BLENDS[7]){ blend = 8.0;
		}else if(guiItem === ap.BLENDS[8]){ blend = 9.0;
		}else if(guiItem === ap.BLENDS[9]){ blend = 10.0;
		}else if(guiItem === ap.BLENDS[10]){ blend = 11.0;
		}else if(guiItem === ap.BLENDS[11]){ blend = 12.0;
		}else if(guiItem === ap.BLENDS[12]){ blend = 13.0;
		}else if(guiItem === ap.BLENDS[13]){ blend = 14.0;
		}else if(guiItem === ap.BLENDS[14]){ blend = 15.0;
		}else if(guiItem === ap.BLENDS[15]){ blend = 16.0;
		}else if(guiItem === ap.BLENDS[16]){ blend = 17.0;
		}
		ap.app.material.uniforms[address + "_blend"].value = blend;
	},


	/*
	* Trigger a clip type change - demo and testing for now // TODO dynamic UI listing
	*/
	uniformClipTypeChange: function (clipName, channel, pod, clip) {

		var clipId = 0;

		if(clipName !== "OFF"){
			// TODO don't require clips to end in Clip
			clipId = ap.clips[clipName + "Clip"].id;
		}

		ap.channels.setClip(channel, pod, clip, new Clip(clipId, 1.0, ap.BLEND.Add));

		updateShader = true;
	}

};


var Channel = function (name, type, mix, blend, pods) {

	this.name = name;
	this.type = type 		|| ap.CHANNEL_TYPE_BLEND;
	this.mix = mix 			|| 0;
	this.blend = blend 		|| ap.BLEND.Add;
	this.pods = pods 		|| [];

};

Channel.prototype = {

};


var Clip = function (clipId, mix, blend) {

	this.clipId = clipId;
	this.mix = mix 			|| 0;
	this.blend = blend 		|| ap.BLEND.Add;

};

Clip.prototype = {

};


var Pod = function (positionId, mix, blend, clips, hardwareGroupMode, hardwareGroupIds) {

	this.positionId = positionId || 1;
	this.mix = mix || 0;
	this.blend = blend || ap.BLEND.Add;
	this.clips = clips || [];
	this.hardwareGroupMode = hardwareGroupMode || ap.HARDWAREGROUP_OFF;			// Off, Exclude, or Solo Mode
	this.hardwareGroupIds = hardwareGroupIds || [];
};

Pod.prototype = {

};


var PodPosition = function (x, y, z, width, height, depth) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = width || 0;
	this.h = height || 0;
	this.d = depth || 0;
};

PodPosition.prototype = {

};


// (String name, int type, String address, int hardwarePort [optional], Array nodes [optional]) 
var Port = function (name, type, address, hardwarePort, nodes) {

	this.name = name;
	this.type = type;
	this.address = address || "";
	this.nodes = nodes || [];
	this.hardwarePort = hardwarePort || 1;

};

Port.prototype = {

};


var Shader = function (uniforms, fragmentFunctions, fragmentMain) {

	this.uniforms = uniforms || {};
	this.fragmentFunctions = fragmentFunctions || "";
	this.fragmentMain = fragmentMain || "";

};

Shader.prototype = {

};
