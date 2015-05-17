
var PX = { version: '0.1.1' };	// Global PixelMixer object


// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* Api: -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*


PX.readPixels = false;			// Turn this on if you need to receive color values of all the pixels
PX.broadcast = false;			// Update any defined techs to broadcast with the lastest pixels

PX.speed = 0.02;				// How much we increase 'global time' per 'animation frame'
PX.useTransforms = false;		// Pod transforms (swap axis, translate, scale)
PX.usePodPosUniforms = false;	// Allow u_pos_id uniforms to update a pod position by id 

PX.pointCloud = {};				// Main point cloud that displays node colors
PX.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
PX.pointMaterial = {};			// Shader of the point cloud that displays the node colors
PX.pointSprite; 				// String - relative file path to image to represent the point sprite
PX.pointSize = 25;				// The size of each point cloud sprite

PX.mouseX = 0;					// Mouse X & Y sent as mouse uniform object when these are updated
PX.mouseY = 0;

// ****** Constants ******

// Blend Constants
PX.BLEND = {};
PX.BLEND.OFF = 0;
PX.BLEND.Add = 1;
PX.BLEND.Subtract = 2;
PX.BLEND.Darkest = 3;
PX.BLEND.Lightest = 4;
PX.BLEND.Difference = 5;
PX.BLEND.Exclusion = 6;
PX.BLEND.Multiply = 7;
PX.BLEND.Screen = 8;
PX.BLEND.Overlay = 9;
PX.BLEND.HardLight = 10;
PX.BLEND.SoftLight = 11;
PX.BLEND.Dodge = 12;
PX.BLEND.Burn = 13;
PX.BLEND.LinearBurn = 14;
PX.BLEND.LinearLight = 15;
PX.BLEND.VividLight = 16;
PX.BLEND.PinLight = 17;
PX.BLEND.Replace = 18;
PX.BLEND.Ignore = 19;

PX.BLENDS = [ 'Add', 'Subtract', 'Darkest', 'Lightest', 'Difference', 'Exclusion', 'Multiply', 'Screen','Overlay', 
			'HardLight', 'SoftLight', 'Dodge', 'Burn', 'LinearBurn', 'LinearLight', 'VividLight', 'PinLight'];


// PX.Port Type Constants
PX.PORT_TYPE_OFF = 0;
PX.PORT_TYPE_KINET_1 = 1; // strands
PX.PORT_TYPE_KINET_2 = 2; // tiles
PX.PORT_TYPE_KINET_3 = 3; // colorblasts
PX.PORT_TYPE_KINET_4 = 4;
PX.PORT_TYPE_DMX_1 = 5; // Movers, for testing
PX.PORT_TYPE_DMX_2 = 6;
PX.PORT_TYPE_DMX_3 = 7;
PX.PORT_TYPE_LASER_1 = 8;


// PX.Channel Type Constants
PX.CHANNEL_TYPE_OFF = 0;
PX.CHANNEL_TYPE_ADD = 1;
PX.CHANNEL_TYPE_FX = 2;
PX.CHANNEL_TYPE_SCENE = 3;


// Pod Hardware Group Modes Constants
PX.HARDWAREGROUP_OFF = 0;
PX.HARDWAREGROUP_SOLO = 1;
PX.HARDWAREGROUP_EXCLUDE = 2;


// Clip position map Constants
PX.MAP_NORMAL = 0;
PX.MAP_ALT1 = 1;
PX.MAP_ALT2 = 2;


// -------------------------------------------------------

PX.shaderCount = -1;
PX.init = function(scene, renderer, params){

	params = params || {};
	PX.speed = params.speed || PX.speed;
	PX.broadcast = params.broadcast || PX.broadcast;
	PX.readPixels = params.readPixels || PX.readPixels;
	PX.pointSize = params.pointSize || PX.pointSize;
	PX.pointSprite = params.pointSprite || PX.pointSprite;
	PX.useTransforms = params.useTransforms || PX.useTransforms;
	PX.usePodPosUniforms = params.usePodPosUniforms || PX.usePodPosUniforms;

	// Tag each loaded shader with a incremental id, for easy lookup later
	PX.shaderCount = 0;
	for (var property in PX.clips) {
		if (PX.clips.hasOwnProperty(property)) {
			PX.shaderCount++;
			PX.clips[property].id = PX.shaderCount;
		}
	}

	// Maintain the lowest possible power of 2 texture size based on maxNodeCount
	params.maxNodeCount = params.maxNodeCount || Math.pow(128, 2); 	// Default: 16384 (128*128)
	PX.simSize = 4;										// Minimum: 16 (4*4)
	while(Math.pow(PX.simSize, 2) < params.maxNodeCount){
		PX.simSize *= 2;
	}

	PX.ports = new PX.PortManager();
	PX.hardware = new PX.HardwareManager();
	PX.channels = new PX.ChannelManager();
	PX.app = new PX.AppManager(scene, renderer);

	PX.ports.init();
	PX.hardware.init();
	PX.channels.init();
	PX.app.init();

	// If size not yet been defined, do it with some defaults
	if(!PX.appSize){
		PX.setSize(600, 400);
	}


};


PX.shaderNeedsUpdate = false;
PX.updateFresh = false;
PX.updateShaderLimiter = 0;
PX.update = function() {

	if(!PX.ready){return;}

	//if(frameCount % 30 == 1){ // Slow framerate testing

	if(!PX.app){

		console.log("PixelMixer Error: Need to call PX.init before PX.update.");

	}else if(PX.ready){

		// Update everything else if we don't have to update the shader this frame
		if((!PX.shaderNeedsUpdate || PX.updateShaderLimiter < 2) && PX.updateShaderLimiter > 0){

			// ** Main loop update 
			PX.app.update();
			PX.ports.update();
			PX.hardware.update();
			PX.channels.update();

		}else{

			// Shader needs update
			PX.app.updateMainSourceShader();
			PX.app.update();
			PX.ports.update();
			PX.updateShaderLimiter = 0;
			PX.shaderNeedsUpdate = false;
			PX.updateFresh = false;
		}
		PX.updateShaderLimiter++;

	}
};

PX.updateShader = function() {
	PX.shaderNeedsUpdate = true;
};


PX.pointPosition = [0, 0, 0]; // Defaults
PX.setPointPosition = function(x, y, z) {
	PX.pointPosition = [x, y, z];
	if(PX.pointCloud.position){
		PX.pointCloud.position = {x: x, y: y, z: z};
	}
};

PX.appSize;
PX.setSize = function(width, height) {

	PX.appSize = [width, height];

	if(PX.app){

		PX.app.glWidth = width;
		PX.app.glHeight = height;

		if(PX.app.readPixels){
			PX.app.pixels = new Uint8Array(4 * PX.app.glWidth * PX.app.glHeight);
		}

		PX.app.renderer.setSize( PX.app.glWidth, PX.app.glHeight );

		// Reset point size relative to screen resolution
		PX.setPointSize(PX.pointSize);

		if(PX.pointMaterial){
			PX.pointMaterial.uniforms.u_res.value = PX.app.glWidth / PX.app.glHeight;
		}
	}
};


PX.setPointSize = function(v) {

	if(PX.pointSize <= 0){
		PX.pointSize = v;
	}
};


PX.mouseX = 0;
PX.mouseY = 0;
PX.setMouse = function (x, y) {
	PX.mouseX = x;
	PX.mouseY = y;
	PX.material.uniforms.mouse.value = new THREE.Vector2( x, y );
};


PX.importShader = function (name, shaderTxt) {

	PX.app.importShader(name, shaderTxt);

};


PX.generateShader = function () {

	PX.app.updateMainSourceShader();
	
};

// Easy way to add clips to a pod that is fitted to all nodes
// [ids], mix, channel
PX.simpleSetup = function (params) {

	params.mix = params.mix || 1;
	params.channel = params.channel || 1;

	var clips = [];
	for (var i = 0; i < params.ids.length; i++) {
		clips[i] = new PX.Clip({id: params.ids[i]});
	}

	var pods = [];
	pods[0] = new PX.Pod({ clips: clips });

	var channel1 = new PX.Channel({ mix: params.mix, pods: pods });
	PX.channels.setChannel(params.channel, channel1);
};

PX.updateData = function (data1, data2, data3) {

	PX.app.generateDataMap(data1, data2, data3);
};

PX.updateNodePoints = function () {

	PX.app.updateGeometry();
	PX.app.generateCoordsMap();
	PX.app.createNodePointCloud();
};

PX.get = function(uniform, channel, pod, clip) {
	if(!channel){
		return PX.material.uniforms[uniform].value;
	}else{
		return PX.getUniform(uniform, channel, pod, clip).value;
	}
};

PX.set = function(uniform, value, channel, pod, clip) {

	var m = false;
	if(uniform === "mouse.x"){
		PX.mouseX = value; m = true;

	}else if(uniform === "mouse.y"){
		PX.mouseY = value; m = true;

	}else if(uniform === "speed"){
		if(clip){
			PX.getObj(channel, pod, clip).speed = value;
		}else{
			PX.speed = value;
		}
	}else if(!channel){
		PX.material.uniforms[uniform].value = value;
	}else{
		if(uniform === "mix"){
			value = Math.max(0, Math.min(1, value));
		}
		if(PX.material.uniforms){
			PX.getUniform(uniform, channel, pod, clip).value = value;
		}else{
			//record this to get applied when things are ready
			var addy = "_"+channel+"_"+pod+"_"+clip+"_"+uniform;
			if(!PX.app.initialUniforms[addy]){
				PX.app.initialUniforms[addy] = {};
			}
			PX.app.initialUniforms[addy].value = value;
		}
		PX.setObjProperty(uniform, value, channel, pod, clip);
	}
	if(m && PX.material.uniforms){
		PX.material.uniforms.mouse.value = new THREE.Vector2( PX.mouseX, PX.mouseY );
	}
};

PX.getUniform = function(uniform, channel, pod, clip) {
	var addy = "_" + channel;
	if(pod){ addy += "_" + pod; 
	if(clip){ addy += "_" + clip; }}
	return PX.material.uniforms[addy + "_" + uniform];
};

PX.getObj = function(channel, pod, clip) {
	var obj = PX.channels.channels[channel-1];
	if(obj && pod){ obj = obj.pods[pod-1]; 
	if(clip){ obj = obj.clips[clip-1]; }}
	return obj;
};

PX.setObj = function(newObj, channel, pod, clip) {
	if(!pod){
		PX.channels.channels[channel-1] = newObj;
	}else if(!clip){
		PX.channels.channels[channel-1].pods[pod-1] = newObj;
	}else{
		PX.channels.channels[channel-1].pods[pod-1].clips[clip-1] = newObj;
	}
};

PX.getObjProperty = function(property, channel, pod, clip) {
	var obj = PX.getObj(channel, pod, clip);
	return obj[property];
};

PX.setObjProperty = function(property, value, channel, pod, clip) {
	var obj = PX.getObj(channel, pod, clip);
	if(obj){
		obj[property] = value;
	}
};

PX.load = function(json){
	PX.channels.channels = json;
	PX.shaderNeedsUpdate = true;
	PX.updateFresh = true;
};

PX.stringifyChannels = function(){
	return JSON.stringify(PX.channels.channels);
};

PX.stringifyNodes = function(){
	return JSON.stringify(PX.ports.ports);
};


// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* Internal: -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*


PX.material = false;			// Main shader referenced here, set false initially to flag that its not ready


// ****** Platform ******

PX.ready = false;				
PX.simSize;

PX.shaders = {};				// Internal shaders 
PX.clips = {}; 				// Loaded shaders as clips
PX.imported = {}; 				// Currently imported port (and possibly node) data
PX.techs = {};

PX.pixels;


// Temporary Preset Management 
PX.demoClipNames = ["TestFrame", "SolidColor", "ColorSineBar", "ColorSwirls", "LineCosSin", "SimpleSwirl",
"SinSpiral", "SineParticles", "DiSinSwirl", "HexifyRadial", "SinCosTan"];

PX.demoHardware = ["ApHardwareTest", "Grid+zLayer", "RanZGrid"];



// ****** Internal Utils ******

PX.getVariableTypeFromShorthand = function(shorthand){
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
	PX.pointGeometry = new THREE.Geometry();

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
		PX.pointGeometry = new THREE.Geometry();


		// Generate portsMap data texture for all the nodes x,y,z
		var b = new Float32Array( Math.pow(PX.simSize, 2) * 4 );

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
					PX.pointGeometry.vertices.push( vertex );
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

		
		var attributes = { // For each node we pass along it's indenodx value and x, y in relation to the colorMaps
			a_pointSizes:  { type: 'f', value: this.pointSizes },
			a_texId:  		{ type: 'f', value: this.pointTypes },
			a_geoX:        { type: 'f', value: this.geoX },
			a_geoY:        { type: 'f', value: this.geoY }
		};

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
			attributes:     this.merge(attributes, PX.shaders.PointCloudShader.attributes),
			vertexShader:   PX.shaders.PointCloudShader.vertexShader,
			fragmentShader: PX.shaders.PointCloudShader.fragmentShader,
			depthTest:      true
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

		if(PX.pointGeometry.vertices.length > 0){

			if(!PX.ready){
				console.log("PixelMixer v" + PX.version + ", SimSize: " + PX.simSize + "x" +  PX.simSize + ", Nodes: " + PX.pointGeometry.vertices.length);
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
/*
 *
 * Handles the state of all known Channels
 *
 * Channels may contain Pods, which may contain Clips (structured shaders).
 *
 */

PX.ChannelManager = function () {

	this.channels = [];
	this.podpositions = [];

};

PX.ChannelManager.prototype = {

	init: function () {

	},

	update: function () {

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

		// Now create the mixed down output
		for (var i = 0; i < this.channels.length; i++) {

			var channel = this.channels[i];
			channel.address = "_" + (i+1);


			var fxChannel = false;
			if(channel.type === PX.CHANNEL_TYPE_FX){
				fxChannel = true;
			}

			output += "if(_channel_mix>0.){ \n";


			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix };

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];

					if(pod){
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
									if(PX.usePodPosUniforms){
										res = "vec2(getPodSize(" + pod.positionIds[o] + ").x, getPodSize(" + pod.positionIds[o] + ").y);";
									}
									if(lastKnownRes !== res){
										lastKnownRes = res;
										output += "resolution = " + res + " \n";
									}

									// Offset the xyz coordinates with the pod's xy to get content to stretch and offset properly // px_xyz2 is the original real coordinates
									output += "px_xyz = offsetPos(px_xyz2, " + pod.positionIds[o] + ", px_xyz.w);\n";
								}

								// Check to see if the nodes are in the position bounding box, if not don't render these clips // px_xyz2 is the original real coordinates
								output += "if(_pod_mix > 0. && checkBounds(px_xyz2, "+pod.positionIds[o]+") > 0.){ \n";


								fxPod = true; // If the only clips that are in this pod are fx's then treat pod as a fx output and don't blend
								for (u = 0; u < pod.clips.length; u++) {

									var clip = pod.clips[u];
									if(clip){

										var shader = PX.clips[clip.id];
										if(shader){

											if(!fragList[pod.clips[u].id]){
												fragList[pod.clips[u].id] = true;

												// Declare each clips constants, but we can't declare them more than once so record which ones we have declared already
												for (var variable in shader.constants) {

													if(!constants[variable]){ // If we don't already have the constant mark it as in use and include it.
														constants[variable] = 1; 
														fragFuncOutput += shader.constants[variable] + "\n";
													}

												}
												fragFuncOutput += "\n";

												if(shader.fragmentFunctions){
													for (var v = 0; v < shader.fragmentFunctions.length; v++) {

														// Duplicate method checking - right now just checking based off the first 5 words of function
														var name = shader.fragmentFunctions[v].trim();
														
														if(!isFunctionShaderUtil(name)){
															name = nthWord(name, 1) + nthWord(name, 2) + nthWord(name, 3) + nthWord(name, 4) + nthWord(name, 5);
															if(!fragFuncList[name]){
																fragFuncList[name] = true;

																// Add the helper function to be included at the top of the shader
																fragFuncOutput += shader.fragmentFunctions[v] + "\n";
															}
														}
													}
												}
												fragFuncHelpers += "else if(id == " + shader.id + "){\n";
												fragFuncHelpers += shader.fragmentMain.replace("gl_FragColor", "returnColor");
												fragFuncHelpers += "\n";
												fragFuncHelpers = fragFuncHelpers.replace(/gl_FragCoord/g, "px_xyz");
												fragFuncHelpers += "\n}\n";
												//fragFuncHelpers += "////////\n";
											}


											clip.address = pod.address +"_" + (u+1);
											if(clip.id.length > 0 && shader){

												// If the clip defined params transfer default values over to the obj
												for (var param in shader.params) {
													PX.setObjProperty(param, shader.params[param].value, i+1, e+1, u+1);
													
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
												uniforms[clip.address + "_time"] = { type: "f", value: PX.app.time }; 


												// Pass along input param values if they are defined on clip
												var params = ["0.","0.","0.","0.","0.","0.","0.","0.","0."];
												for (var j = 0; j < params.length; j++) {
													if(shader.params && shader.params["p"+(j+1)]){
														params[j] = (clip.address+"_p"+(j+1));
													}
												}

												fragOutput = "";
												if(clip.posMap == PX.MAP_ALT1 && PX.app.altMap1){
													fragOutput += "px_xyz = offsetPos(px_alt1, " + pod.positionIds[o] + ", px_xyz.w);\n";
												}

												fragOutput += "px_rgb2 = superFunction(_clip_mix, "+ shader.id +", _fxIn, _clip_time, "+params[0]+","+params[1]+","+params[2]+","+params[3]+","+params[4]+","+params[5]+","+params[6]+","+params[7]+","+params[8]+");";

												// Replace the standard GL color array with an internal one so that we can mix and merge, and then output to the standard when we are done
												fragOutput = fragOutput.replace(/gl_FragCoord/g, "px_xyz");


												// ------------ Clip Mix Blend & Fx --------------

												var fx = PX.clips[clip.id].fx;
												if(u === 0){
													
													fragOutput += "px_rgb = px_rgb2; \n";
													if(!fx && !fxChannel){
														fxPod = fxChannel;
														fragOutput += "px_rgb = px_rgb * (_clip_mix); \n";  // Clip mix for this shader
													}else{
														fragOutput += "px_rgb = mix(px_p, px_rgb2, _clip_mix); \n";
													}

												}else{

													if(fx || fxChannel){
														// Fx clip: mix the original with the result of fx
														fragOutput += "px_rgb = mix(px_rgb, px_rgb2, _clip_mix); \n";

													}else{
														// Blend in the shader with ongoing mix
														fragOutput += "px_rgb2 = px_rgb2 * (_clip_mix); \n";
														fragOutput += "px_rgb = blend(px_rgb2, px_rgb, _clip_blend); \n"; // Clip mix for this shader
														fxPod = fxChannel;
													}

												}

												// Inject addressing for uniforms that are flagged (i.e. replace "_clip_mix" with "_1_1_1_mix")
												fragOutput = fragOutput.replace(/_clip_/g, clip.address + "_");
												fragOutput = fragOutput.replace(/__/g, clip.address + "_"); // Also detect the clip shorthand '__'
												
												// For use by effects clips: set the incoming value from the last clip, or the last pod if we are the first clip
												if(u === 0){
													fragOutput = fragOutput.replace(/_fxIn/g, "px_p");
												}else{
													fragOutput = fragOutput.replace(/_fxIn/g, "px_rgb");
												}

												// Merge the clip fragment shaders as we move along
												output += fragOutput;
											}
										}else{
											console.log("PixelMixer Error - shader not found: " + clip.id);
										}
									}

								}
							
								//  -------------- Pod Mix Blend & Fx --------------

								if(fxPod){

									// Fx pod: mix the original with the result of fx_rgb, _pod_mix); \n";
									output += "px_p = mix(px_p, px_rgb, _pod_mix); \n";

								}else{

									if(e === 0){

										// If we are the very first pod mix output value, don't blend from previous pod just add
										output += "px_p = (px_rgb * _pod_mix) + px_p; \n"; // This where we can apply different blends per podpos

									}else{

										// Blend in last pod with current pod
										output += "px_rgb = px_rgb * (_pod_mix); \n";
										output += "px_p = blend(px_p, px_rgb, _pod_blend); \n";
									}
								}
								
								output += "}";

								//output += "/////////////////////////////////-------------//-------------- \n";

							}

						}

						output = output.replace(/_pod_/g, pod.address + "_") + "\n";
					}

				}

			}

				
			//  -------------- Channel Mix & Fx --------------

			if(i === 0){

				output += "px_c = px_p = px_p * (_channel_mix); \n";

			}else{

				if(fxChannel){
					output += "px_c = mix(px_c, px_p, _channel_mix); \n";
				}else{
					output += "px_p = px_p * (_channel_mix); \n";
					output += "px_c = blend(px_c, px_p, 1.); \n"; // Channels always blend using 'add'
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
		if(PX.app.altMap1){
			output = "px_alt1 = texture2D( u_altMap1, v_vUv);" + output;
		}
		if(PX.app.altMap2){
			output = "px_alt2 = texture2D( u_altMap2, v_vUv);" + output;
		}


		// Return the nth word of a string http://stackoverflow.com/a/11620169
		function nthWord(str, n) {
			var m = str.match(new RegExp('^(?:\\w+\\W+){' + --n + '}(\\w+)'));
			return m && m[1];
		}
	
		// Functions in shader utils - Don't define these shader util methods more then once
		function isFunctionShaderUtil(msg){
			if(msg.indexOf("rgb2hsv") > -1){return true;}
			if(msg.indexOf("hsv2rgb") > -1){return true;}
			if(msg.indexOf("blend") > -1){return true;}
			return false;
		}
		

		//console.log(uniforms);
		//console.log(fragFuncOutput);
		//console.log(output);

		
		return {uniforms: uniforms, fragmentFunctions: fragFuncOutput, fragmentMain: output + "\n"};
	},

	generateSizingFunctions: function () {
		
		// Pod Position function
		var m = "";
		var pObj = {};
		var dupe = false;
		var e = 0;
		var ms = "";

		if(PX.usePodPosUniforms){
			m += "if(d==u_pos_id){\n";
				m += "p=vec3(u_pos_x, u_pos_y, u_pos_z);\n";
			m += "}";
		}

	//========================================================

	//---Position

		for (var i = 0; i < this.podpositions.length; i++) {

			if(isPosIdInPod(i+1)){
				m += "else if(d==" + (i+1) + "){\n";
				m += "p=vec3("+this.podpositions[i].x+","+this.podpositions[i].y+","+this.podpositions[i].z+");\n";
				m += "}\n";
			}
		}

		if(!PX.usePodPosUniforms){ m = m.slice(5, m.length);} // cut the first 'else' out 
		m = "vec3 p=vec3(0.,0.,0.); \n" + m;
		m += "return p; \n";
		m = "vec3 getPodPos(int d) { \n" + m + "}\n";

		var output = m;
		m = "";

	//---//Position


		if(PX.usePodPosUniforms){
			m += "if(d==u_pos_id){\n";
				m += "p=vec3(u_pos_w, u_pos_h, u_pos_d);\n";
			m += "}";
		}

	//---Size

		// First create a dupe free list of objs that also have a list of any pos id's that have these values
		var podObjs = [];
		for (i = 0; i < this.podpositions.length; i++) {

			if(isPosIdInPod(i+1)){
				pObj = {};
				pObj.w = this.podpositions[i].w;
				pObj.h = this.podpositions[i].h;
				pObj.d = this.podpositions[i].d;
				pObj.s = [];

				dupe = false;
				for (e = 0; e < podObjs.length; e++) {
					if(podObjs[e].w === pObj.w && podObjs[e].h === pObj.h && podObjs[e].d === pObj.d){
						dupe = true;
						podObjs[e].s[podObjs[e].s.length] = i+1;
						break;
					}
				}
				if(!dupe){
					pObj.s[0] = i+1;
					podObjs[podObjs.length] = pObj;
				}
			}
		}

		// Pod Size function
		for (i = 0; i < podObjs.length; i++) {

			m += "else if(";
			ms = "";
			for (var u = 0; u < podObjs[i].s.length; u++) {
				ms += "||d==" + podObjs[i].s[u];
			}

			ms = ms.slice(2, ms.length); // cut the first '||' out 
			m += ms + "){\n";
			m += "p=vec3("+podObjs[i].w+","+podObjs[i].h+","+podObjs[i].d+");\n";
			m += "}\n";
		}

		if(!PX.usePodPosUniforms){ m = m.slice(5, m.length); } // cut the first 'else' out 
		m = "vec3 p = vec3(0.,0.,0.); \n" + m;
		m += "return p; \n";
		m = "vec3 getPodSize(int d) { \n" + m + "}\n";

		output += m;

	//---//Size

	//---Offset (translate)

		if(PX.useTransforms){

			m = "";
			// First create a dupe free list of objs that also have a list of any pos id's that have these values
			podObjs = [];
			for (i = 0; i < this.podpositions.length; i++) {

				if(isPosIdInPod(i+1)){
					pObj = {};
					pObj.xt = this.podpositions[i].xt;
					pObj.yt = this.podpositions[i].yt;
					pObj.zt = this.podpositions[i].zt;
					pObj.s = [];

					dupe = false;
					for (e = 0; e < podObjs.length; e++) {
						if(podObjs[e].xt === pObj.xt && podObjs[e].yt === pObj.yt && podObjs[e].zt === pObj.zt){
							dupe = true;
							podObjs[e].s[podObjs[e].s.length] = i+1;
							break;
						}
					}
					if(!dupe){
						pObj.s[0] = i+1;
						podObjs[podObjs.length] = pObj;
					}
				}
			}

			// Pod Size function
			for (i = 0; i < podObjs.length; i++) {

				m += "else if(";
				ms = "";
				for (e = 0; e < podObjs[i].s.length; e++) {
					ms += "||d==" + podObjs[i].s[e];
				}

				ms = ms.slice(2, ms.length); // cut the first '||' out 
				m += ms + "){\n";
				m += "p=vec3("+podObjs[i].xt+","+podObjs[i].yt+","+podObjs[i].zt+");\n";
				m += "}\n";
			}

			if(!PX.usePodPosUniforms){ m = m.slice(5, m.length); } // cut the first 'else' out 
			m = "vec3 p = vec3(0.,0.,0.); \n" + m;
			m += "return p; \n";
			m = "vec3 getPodOffset(int d) { \n" + m + "}\n";

			output += m;

	//---//Offset (translate)
	
	//---Scale

			m = "";
			// First create a dupe free list of objs that also have a list of any pos id's that have these values
			podObjs = [];
			for (i = 0; i < this.podpositions.length; i++) {

				if(isPosIdInPod(i+1)){
					pObj = {};
					pObj.xs = this.podpositions[i].xs;
					pObj.ys = this.podpositions[i].ys;
					pObj.zs = this.podpositions[i].zs;
					pObj.swapaxis = this.podpositions[i].swapaxis;
					pObj.s = [];

					dupe = false;
					for (e = 0; e < podObjs.length; e++) {
						if(podObjs[e].xs === pObj.xs && podObjs[e].ys === pObj.ys && podObjs[e].zs === pObj.zs && podObjs[e].swapaxis === pObj.swapaxis){
							dupe = true;
							podObjs[e].s[podObjs[e].s.length] = i+1;
							break;
						}
					}
					if(!dupe){
						pObj.s[0] = i+1;
						podObjs[podObjs.length] = pObj;
					}
				}
			}

			// Pod Size function
			for (i = 0; i < podObjs.length; i++) {

				m += "else if(";
				ms = "";
				for (e = 0; e < podObjs[i].s.length; e++) {
					ms += "||d==" + podObjs[i].s[e];
				}

				ms = ms.slice(2, ms.length); // cut the first '||' out 
				m += ms + "){\n";
				m += "p=vec4("+podObjs[i].xs+","+podObjs[i].ys+","+podObjs[i].zs+","+podObjs[i].swapaxis+");\n";
				m += "}\n";
			}

			if(!PX.usePodPosUniforms){ m = m.slice(5, m.length); } // cut the first 'else' out 
			m = "vec4 p = vec4(0.,0.,0.,0.); \n" + m;
			m += "return p; \n";
			m = "vec4 getPodScale(int d) { \n" + m + "}\n";

			output += m;

	//---//Scale
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

			// For performance reasons use a lighter and manual version of Matrix transforms
			if(PX.useTransforms){


				output += "vec3 d = getPodOffset(p);\n";
				output += "vec3 e = getPodSize(p);\n";
				output += "vec4 s = getPodScale(p);\n";

				// scale/flip/mirror: (magnitude of 8)
				output += "x += (b.x - (e.x * .5 + c.x)) * (1.-(s.x * 2.))*8.;\n";
				output += "y += (b.y - (e.y * .5 + c.y)) * (1.-(s.y * 2.))*8.;\n";
				output += "z += (b.z - (e.z * .5 + c.z)) * (1.-(s.z * 2.))*8.;\n";

				// translate: (magnitude of 8)
				output += "x += (e.x * 8. * (d.x - .5));\n";
				output += "y += (e.y * 8. * (d.y - .5));\n";
				output += "z += (e.z * 8. * (d.z - .5));\n";
				
				// swap axis
				output += "float t = x;\n";
				output += "if(s.w == 1.){";
					output += "x=y;y=t;\n";		// swap x-y
				output += "}else if(s.w == 2.){";	
					output += "x=z;z=t;\n";		// swap x-z
				output += "}else if(s.w == 3.){";
					output += "t=y;y=z;z=t;\n";	// swap y-z
				output += "}\n";
			}

			output += "return vec4(x, y, z, w);\n";

		output += "}\n";


		// Check to see if a pod-position-id is in use in any loaded pod
		function isPosIdInPod(posId){

			for (var i = 0; i < PX.channels.channels.length; i++) { var channel = PX.channels.channels[i];
				if(channel && channel.pods){
					for (var e = 0; e < channel.pods.length; e++) { var pod = channel.pods[e];
						if(pod){
							for (var u = 0; u < pod.positionIds.length; u++) { var pos = pod.positionIds[u];
								if(pos === posId){
									return true;
								}
							}
						}
					}
				}
			}
			return false;
		}

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

	// ************* Pods ********************************

	getPod: function (channelId, podId) {
		return this.channels[channelId-1].pods[podId-1];
	},

	// ************* Pod Positions ***********************

	// Create a new pod position that fits the nodes in a list of port(s)
	podPosFromPorts: function (podPositionId, ports) {

		var s = 100000000000;
		var minx = s;
		var maxx = -s;
		var miny = s;
		var maxy = -s;
		var minz = s;
		var maxz = -s;
		var result = false;

		for ( e = 0; e < ports.length; e ++ ) { 

			var port = PX.ports.getPort(ports[e]);

			if(port && port.nodes){
				for ( i = 0; i < port.nodes.length; i ++ ) { 

					var node = port.nodes[i];
					minx = Math.min(minx, node.x);
					maxx = Math.max(maxx, node.x);
					miny = Math.min(miny, node.y);
					maxy = Math.max(maxy, node.y);
					minz = Math.min(minz, node.z);
					maxz = Math.max(maxz, node.z);
					result = true;
				}
			}
		}

		if(result){
			this.podpositions[podPositionId-1] = new PX.PodPosition({x: minx, y: miny, z: minz, w: (maxx - minx) + 1, h: maxy - miny, d: maxz - minz});
		}
	},

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

	duplicatePodPos: function (podPositionId, newId) {
		var obj = this.getPodPos(podPositionId);
		var copy = new PX.PodPosition();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)){
				copy[attr] = obj[attr];
			}
		}
		this.setPodPos(newId, copy);
	},

	clearPodPos: function (podPositionId) {
		delete this.podpositions[podPositionId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPodPos: function () {
		this.podpositions = [];
	},


	setPodPosTransforms: function (params) {

		var pos = this.getPodPos(params.id);
		params = params || {};
		if(params.xt || params.xt < 1){pos.xt = params.xt;}
		if(params.yt || params.yt < 1){pos.yt = params.yt;}
		if(params.zt || params.zt < 1){pos.zt = params.zt;}
		if(params.xs || params.xs < 1){pos.xs = params.xs;}
		if(params.ys || params.ys < 1){pos.ys = params.ys;}
		if(params.zs || params.zs < 1){pos.zs = params.zs;}
		if(params.swapaxis || params.swapaxis < 1){pos.swapaxis = params.swapaxis;}
	},

	resetPodPosTransforms: function (podPositionId) {
		this.setPodPosTransforms({id: podPositionId, 
			xt: .5,
			yt: .5,
			zt: .5,
			xs: .5,
			ys: .5,
			zs: .5,
			swapaxis: 0
		});
	},

	// ************* Clips ***********************

	setClip: function (channel, pod, clip, clipObj) {
		// If channel doesn't exist ignore this request
		if(!this.channels[channel-1]){
			return false;
		}
		// If a pod does not yet exist create a default one with clip obj
		if(!this.channels[channel-1].pods[pod-1]){
			this.channels[channel-1].pods[pod-1] = new Pod(1, 1, PX.BLEND.Add, [clipObj]);
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

PX.HardwareManager = function () {

	this.pointSizes = [PX.pointSize, 50, 15];
	this.pointSprites = [PX.pointSprite];

};

PX.HardwareManager.prototype = {

	init: function () {

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

		// Add node values to 'PX.ports' for each defined port
		for(var unit in imported.hardwareunit){

			var _unit = imported.hardwareunit[unit];

			for(var port in _unit.ports){

				var _port = _unit.ports[port];

				if(!PX.ports[_port.portid-1]){
					// If a port is not defined create a default one
					PX.ports.setPort(_port.portid + portOffset, new PX.Port());
				}

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
				PX.ports.setNodes(_port.portid + portOffset, _port.nodes);
			}
		}
	},


	/*
	* Import nodes using a csv format of [port, x, y, z]
	* 
	* If port is not yet defined it creates a new one
	*
	* @param nodes 			The Array to import
	* @param portOffset 	Optional value to offset the port values from.
	* @param x 				Optional value to offset the x values from.
	* @param y 				Optional value to offset the y values from.
	* @param z 				Optional value to offset the z values from.
	* @param scale 			Optional overwrite value to scale nodes from.
	*/
	importNodeArray: function (params) {

		params = params || {};
		params.portOffset = params.portOffset || 0;
		params.x = params.x || 0;
		params.y = params.y || 0;
		params.z = params.z || 0;
		params.scale = params.scale || 1.0;

		var node;
		var nodes = [];
		for ( var k = 0; k < params.nodes.length; k += 4 ) {

			node = {};
			node.x = (params.nodes[k + 1] * params.scale) + params.x;
			node.y = (params.nodes[k + 2] * params.scale) + params.y;
			node.z = (params.nodes[k + 3] * params.scale) + params.z;
			nodes.push[node];

			PX.ports.addNode(params.nodes[k] + 1, node);
		}

	},

	/*
	* Import nodes using a array of positions [x,y,z]
	*
	* @param port 		The port to load the nodes to.
	* @param vertices 	The array of vertices to create node positions from.
	*/
	importVertices: function (params) {

		var nodes = [];
		var node = {};
		params = params || {};
		if(!PX.ports[params.port-1]){
			// If a port is not defined create a default one
			PX.ports.setPort(params.port, new PX.Port());
		}

		PX.ports.setNodes(params.port, params.vertices);
	},


	/*
	* Create a simple 2D grid of nodes at a pitch distance
	*
	* @param portStart 	The port to load these nodes into.
	* @param x 			Translate position x for grid.
	* @param y 			Translate position y for grid.
	* @param z 			Translate position z for grid.
	* @param width 		How many nodes wide.
	* @param height 	How many nodes tall.
	* @param pitch 		How far the nodes are spaces from each other.
	* @param positionId If specified create position id from the min and max of grid
	*/
	addSimpleNodeGrid: function (params) {

		params = params || {};
		// If a port slot is not defined just add it to the next open one
		if(!params.port){
			params.port = PX.ports.ports.length + 1;
		}

		var s = 100000000000;
		var minx = s;
		var maxx = -s;
		var miny = s;
		var maxy = -s;

		var nodes = [];
		var newPort = true;
		if(PX.ports.getPort(params.port)){
			nodes = PX.ports.getPort(params.port).nodes;
			newPort = false;
		}

		var node = {};
		for ( e = 0; e < params.width; e ++ ) { 
			for ( i = 0; i < params.height; i ++ ) { 

				node = {};
				node.x = ((e * params.pitch) + params.x);
				node.y = ((i * params.pitch) + params.y);
				node.z = params.z;
				nodes.push(node);

				minx = Math.min(minx, node.x);
				maxx = Math.max(maxx, node.x);
				miny = Math.min(miny, node.y);
				maxy = Math.max(maxy, node.y);
			}
		}
		
		if(newPort){
			var port = new PX.Port({name: "Port " + port, nodes: nodes});
			PX.ports.setPort(params.port, port);
		}

		// If we are not the first designated port set the pod position as a default (testing)
		if(params.positionId > 1){
			PX.channels.setPodPos(params.port, new PX.PodPosition({x: minx, y: miny, z: node.z, w: maxx - minx, h: maxy - miny, d: node.z+1}));
		}

	},

	// ----- testing ----

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

		PX.ports.setNodes(port, nodes);
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
			var port = new PX.Port({name: "Port " + port, nodes: nodes});
			PX.ports.setPort(u + portStart, port);

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
			var port = new PX.Port({name: "Port " + port, nodes: nodes});
			PX.ports.setPort(portStart, port);
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
			var port = new PX.Port({name: "Port " + port, nodes: nodes});
			PX.ports.setPort(portStart, port);

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
			port = new PX.Port({name: "Port " + port, nodes: nodes});
			PX.ports.setPort(portStart + 1, port);

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
			port = new PX.Port({name: "Port " + port, nodes: nodes});
			PX.ports.setPort(portStart + 2, port);
	},

	setCustomPointSprite: function (type, path) {
		this.pointSprites[type] = path;
	},

	getCustomPointSprite: function (type) {
		if(type === 0){ return PX.pointSprite; }
		return this.pointSprites[type];
	},

	setCustomPointSize: function (type, size) {
		this.pointSizes[type] = size;
	},

	getCustomPointSize: function (type) {
		if(type === 0){ return PX.pointSize; }
		return this.pointSizes[type];
	}

};

/*
*
* Handles the state of all Ports in the Universe.
*
* 	Ports are a way to organize sets of Nodes.
* 	All Nodes must be associated with a Port.
*
* 	Ports may also define network and addressing data.
* 
* 
*
*/

PX.PortManager = function () {

	this.ports = [];
	this.tests = 0;

};

PX.PortManager.prototype = {

	init: function () {

		// Call init method on techs if they are defined
		for (var tech in PX.techs) {

			if(PX.techs[tech].init){

				PX.techs[tech].init();
			}
		}

	},

	update: function () {

		this.updateTechs();
	},

	updateTechs: function () {

		if(PX.broadcast && PX.readPixels){

			var index = 0;
			for ( e = 0; e < PX.ports.getPorts().length; e ++ ) { 

				var port = PX.ports.getPort(e + 1);
				if(port && port.broadcast && port.type && port.nodes){

					// if we have a defined tech we can use it to broadcast
					var te = PX.techs[port.type];
					if(te && te.broadcast){

						var rgb = [];
						for ( i = 0; i < port.nodes.length; i ++ ) {

							rgb.push(PX.pixels[(index*4)    ]);
							rgb.push(PX.pixels[(index*4) + 1]);
							rgb.push(PX.pixels[(index*4) + 2]);

							index++;
						}

						// Send port object and just the rgb values for this port
						te.broadcastPort(port, rgb);

					}
				}
			}

			for (var attrname in PX.techs) {
				if(PX.techs[attrname].update){
					
					PX.techs[attrname].update();
				}
			}
		}
	},

	// ************* Nodes ***********************

	getNodes: function (portId) {
		return this.ports[portId-1].nodes;
	},

	getNodeCount: function (portId) {
		return this.ports[portId-1].nodes.length;
	},

	setNodes: function (portId, nodes) {
		if(!this.ports[portId-1]){
			this.setPort(portId, new PX.Port({name: "Port " + portId}));
		}
		this.ports[portId-1].nodes = nodes;
	},

	addNode: function (portId, node) {
		if(!this.ports[portId-1]){
			this.setPort(portId, new PX.Port({name: "Port " + portId}));
		}
		this.ports[portId-1].nodes[this.ports[portId-1].nodes.length] = node;
	},

	clearNodes: function (portId) {
		delete  this.ports[portId-1].nodes; // TODO optimize: most likely better to not use 'delete'
	},


	// ************* Ports ***********************

	setPort: function (portId, portObject) {
		portObject.id = portId;
		this.ports[portId-1] = portObject;
	},

	getPort: function (portId) {
		return this.ports[portId-1];
	},

	getPorts: function () {
		return this.ports;
	},

	getPortCount: function () {
		return this.ports.length;
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
* @param type		Int, PX.CHANNEL_TYPE_ADD or PX.CHANNEL_TYPE_FX.
* @param mix		Int, overall mix control for entire Channel.
* @param blend 		Int, 1-17 Blend modes specified in constants.
* @param pods 		Pods[], Array of Pod objects. Pods may also contain Clips.
*
*/

PX.Channel = function (params) {

	params = params || {};
	this.name = params.name;
	this.type = params.type 		|| PX.CHANNEL_TYPE_ADD;
	this.mix = params.mix 			|| 0;
	this.blend = params.blend 		|| PX.BLEND.Add;
	this.pods = params.pods 		|| [];

};
/*
*
* Clips are a internal harness used for each shader.
*
* @param id 		String, name of the shader "SinSpiral".
* @param mix 		Float, 0-1.
* @param blend 		Int, 1-17 Blend modes specified in constants.
* @param posMap 	Int, Position xyz map, default is normal.
* @param speed 		Float, 1 is normal, 0 is no motion.
* @param p1-p9 		Float, assignable uniforms per shader.
*
*/

PX.Clip = function (params) {

	params = params || {};
	this.id = params.id;
	this.mix = params.mix 			|| 1;
	this.blend = params.blend 		|| PX.BLEND.Add;
	this.posMap = params.posMap 	|| PX.MAP_NORMAL;
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

PX.Clip.prototype = {

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


PX.Pod = function (params) {

	params = 			params || {};
	this.positionIds = 	params.positionIds || [1];
	this.mix = 			params.mix || 1;
	this.blend = 		params.blend || PX.BLEND.Add;
	this.clips = 		params.clips || [];

	// TODO - this data should be packed into portsMap, useful for creating specific groups of nodes outside of xyz or port data
	// this.hardwareGroupMode = hardwareGroupMode || PX.HARDWAREGROUP_OFF;			// Off, Exclude, or Solo Mode
	// this.hardwareGroupIds = hardwareGroupIds || [];
};
/*
*
* Pod Positions define coordinates for Pods to associate with.
* Multiple Pods may associate to any amount of Pod Positions.
*
* We use a lightweight and manual version of matrix transforms for performance reasons since we are calling this every fragment. 
*
* @param x 			Number, the x coordinate of the pod.
* @param y 			Number, the y coordinate of the pod.
* @param z 			Number, the z coordinate of the pod.
* @param width 		Number, the width of the pod.
* @param height 	Number, the height of the pod.
* @param depth	 	Number, the depth of the pod.
* @param xt	 		Number, translate (offset) x coordinate of the content inside bounds of the pod.
* @param yt	 		Number, translate (offset) y coordinate of the content inside bounds of the pod.
* @param zt	 		Number, translate (offset) z coordinate of the content inside bounds of the pod.
* @param xs	 		Number, scale x coordinate of the content inside bounds of the pod.
* @param ys	 		Number, scale y coordinate of the content inside bounds of the pod.
* @param zs	 		Number, scale z coordinate of the content inside bounds of the pod.
* @param swapaxis	Number, 0: normal, 1: swap x-y, 2: swap x-z, 3: swap y-z.
*
*/

PX.PodPosition = function (params) { 

	params = params || {};
	this.x = params.x || 0;
	this.y = params.y || 0;
	this.z = params.z || 0;
	this.w = Math.max(.1, params.w) || 1;
	this.h = Math.max(.1, params.h) || 1;
	this.d = Math.max(.1, params.d) || 1;

	this.xt = params.xt || 0.5;
	this.yt = params.yt || 0.5;
	this.zt = params.zt || 0.5;
	this.xs = params.xs || 0.5;
	this.ys = params.ys || 0.5;
	this.zs = params.zs || 0.5;
	this.swapaxis = params.swapaxis || 0;

};
/*
*
* Ports are way to organize sets of Nodes.
* Ports may also define network and addressing data.
* All Nodes must be associated with a Port.
*
* Note: For projects not broadcasting Nodes can all be in the first Port.
*
* @param name			String, Port name (optional)
* @param type			ID
* @param broadcast		Boolean, If true (and PX.broadcast too) broadcast out using type protocol
* @param address		String, Base network address (i.e. 10.0.0.1)
* @param hardwarePort	Number, Port of network address
* @param nodes			Object, Contains x, y, z, position coordinate properties
*
*/

PX.Port = function (params) {

	params = 			params || {};
	this.name = 		params.name || "";
	this.type = 		params.type || "test";
	this.broadcast = 	params.broadcast || false;
	this.address = 		params.address || "";
	this.nodes = 		params.nodes || [];
	this.nodesType = 	params.nodesType || 0;
	this.hardwarePort = params.hardwarePort || 1;
	this.id =			params.id || -1;

};
/**
 *
 * Main Shader that all other shaders get injected into
 *
 */


PX.MainShader = {

	fragmentShader: [
		
		"#INCLUDESHADERUTILS",

		"precision mediump float;",
		"float px_index;",
		"vec4 px_xyz;",
		"vec4 px_xyz2;",
		"vec3 px_lastRgb;",
		"vec3 px_rgb = vec3(0.);",
		"vec3 px_hsv;",
		"vec3 px_rgb2;",
		"vec4 px_rgbV4;",
		"vec3 px_c = vec3(0.);",
		"vec3 px_p = vec3(0.);",
		"vec2 resolution;",
		"vec2 surfacePosition = vec2(0.);",
		"float random;",

		"float px_port;",
		"float px_id;",
		"float px_type;",


		"varying vec2 v_vUv;",
		"uniform float time;",
		"uniform float _random;",
		"uniform float u_mapSize;",
		"uniform vec2 mouse;",
		"uniform sampler2D dataTexture;",
		"uniform sampler2D u_coordsMap;",
		"uniform sampler2D u_prevCMap;",
		"uniform sampler2D u_portsMap;",


		"#INCLUDESHADERFUNCTIONS",

		"void main() {",

			"random = rand(vec2(gl_FragCoord[0] * (gl_FragCoord[2] + 1.), gl_FragCoord[1] * _random) * (time * 0.0001));",

			// Black is default
			
			//********************************************
			
			// px_xyz: coordinates that get overwritten with each pod
			// px_xyz2: original reference coordinates that never get overwritten
			"px_xyz2 = px_xyz = texture2D( u_coordsMap, v_vUv);",
			"if(px_xyz[3] == 0.0){ discard; }",

			"px_index = ((1.0 - v_vUv.y) * u_mapSize * u_mapSize + v_vUv.x * u_mapSize);",
			"px_lastRgb = vec3(texture2D( u_prevCMap, v_vUv));",

			"px_p = vec3(texture2D( u_portsMap, v_vUv));",
			"px_port = px_p.r;",
			"px_id = px_p.g;",
			"px_type = px_p.b;",
			"px_p = vec3(0.);",

			//********************************************

			"#INCLUDESHADERS",

			"gl_FragColor = vec4(px_c, 1.0);",

		"}"

	].join("\n")

};

/**
 *
 * Simple node shader for displaying on ap nodes
 *
 * Overide this class to represent nodes in different ways
 *
 */


PX.shaders.PointCloudShader = {

	vertexShader: [

		"uniform float u_res;",
		"attribute float a_pointSizes;",
		"attribute float a_geoX;",
		"attribute float a_geoY;",
		"attribute float a_texId;",
		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_texId;",

		"void main() {",
			"v_geoX = a_geoX;",
			"v_geoY = a_geoY;",
			"v_texId = a_texId;",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"gl_PointSize = (a_pointSizes * ( 5000. /  length( mvPosition.xyz )  )) / u_res;",
			"gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform int u_useTexture;",
		"uniform sampler2D u_colorMap;",
		"uniform sampler2D u_texArray[ 3 ];",

		"varying float v_geoX;",
		"varying float v_geoY;",
		"varying float v_texId;",

		//"vec4 distBall = vec4(1.0);",

		"void main() {", 

			// TODO, expose ability to use this ball sprite
			//"distBall = 1.- (vec4(sqrt(  pow(.5 - gl_PointCoord.x, 2.) + pow(.5 - gl_PointCoord.y, 2.)  )) * 2.);",

			"if(v_texId > 7.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texArray[2], gl_PointCoord);",
			"}else if(v_texId > 5.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texArray[1], gl_PointCoord);",
			"}else if(v_texId > 3.) {",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * texture2D( u_texArray[0], gl_PointCoord);",
			"}else{",
				"gl_FragColor = texture2D( u_colorMap, vec2( v_geoX, v_geoY )) * vec4(1.);",
			"}",

			"if (gl_FragColor.a < 0.05) {",
	            "discard;",
	        "}",
		"}"

	].join("\n")

};

/**
 * Shader Utils:
 *
 * ** Helper Methods for each imported shader:
 *
 * vec3 rgb2hsv(vec3 c); 						// Convert RGB to HSV
 * vec3 hsv2rgb(vec3 c); 						// Convert HSV to RGB
 * vec3 blend(vec3 c1, vec3 c2, float type);	// Blend Modes (1-17)
 * float rand(vec2 co);							// Random Generator	(vec2)
 *
 */


PX.shaders.ShaderUtils = [

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
		"if(type == 1.){ return c1 + c2; }else					",// Add",
		"if(type == 2.){ return c1 - c2; }else					",// Subtract",
		"if(type == 3.){ return min(c1, c2); }else				",// Darkest",
		"if(type == 4.){ return max(c1, c2); }else				",// Lighest",
		"if(type == 5.){ return abs(c2 - c1); }else			",// DIFFERENCE",
		"if(type == 6.){ return c1 + c2 - 2.0 * c1 * c2; }else	",// EXCLUSION",
		"if(type == 7.){ return c1 * c2; }else					",// Multiply",
		"if(type == 8.){ return (c1 + c2) - (c1 * c2); }else	",// Screen",
		//"													// Overlay",
		"if(type == 9.){ return vec3((c2.r <= 0.5) ? (2.0 * c1.r * c2.r) : (1.0 - 2.0 * (1.0 - c2.r) * (1.0 - c1.r)),(c2.g <= 0.5) ? (2.0 * c1.g * c2.g) : (1.0 - 2.0 * (1.0 - c2.g) * (1.0 - c1.g)),(c2.b <= 0.5) ? (2.0 * c1.b * c2.b) : (1.0 - 2.0 * (1.0 - c2.b) * (1.0 - c1.b))); }else",
		//"													// HARD LIGHT",
		"if(type == 10.){ return vec3((c1.r <= 0.5) ? (2.0 * c1.r * c2.r) : (1.0 - 2.0 * (1.0 - c1.r) * (1.0 - c2.r)),(c1.g <= 0.5) ? (2.0 * c1.g * c2.g) : (1.0 - 2.0 * (1.0 - c1.g) * (1.0 - c2.g)),(c1.b <= 0.5) ? (2.0 * c1.b * c2.b) : (1.0 - 2.0 * (1.0 - c1.b) * (1.0 - c2.b))); }else",
		//"												// SOFT LIGHT",
		"if(type == 11.){ return vec3((c1.r <= 0.5) ? (c2.r - (1.0 - 2.0 * c1.r) * c2.r * (1.0 - c2.r)) : (((c1.r > 0.5) && (c2.r <= 0.25)) ? (c2.r + (2.0 * c1.r - 1.0) * (4.0 * c2.r * (4.0 * c2.r + 1.0) * (c2.r - 1.0) + 7.0 * c2.r)) : (c2.r + (2.0 * c1.r - 1.0) * (sqrt(c2.r) - c2.r))),(c1.g <= 0.5) ? (c2.g - (1.0 - 2.0 * c1.g) * c2.g * (1.0 - c2.g)) : (((c1.g > 0.5) && (c2.g <= 0.25)) ? (c2.g + (2.0 * c1.g - 1.0) * (4.0 * c2.g * (4.0 * c2.g + 1.0) * (c2.g - 1.0) + 7.0 * c2.g)) : (c2.g + (2.0 * c1.g - 1.0) * (sqrt(c2.g) - c2.g))),(c1.b <= 0.5) ? (c2.b - (1.0 - 2.0 * c1.b) * c2.b * (1.0 - c2.b)) : (((c1.b > 0.5) && (c2.b <= 0.25)) ? (c2.b + (2.0 * c1.b - 1.0) * (4.0 * c2.b * (4.0 * c2.b + 1.0) * (c2.b - 1.0) + 7.0 * c2.b)) : (c2.b + (2.0 * c1.b - 1.0) * (sqrt(c2.b) - c2.b)))); }else",
		//"												// DODGE",
		"if(type == 12.){ return vec3((c1.r == 1.0) ? 1.0 : min(1.0, c2.r / (1.0 - c1.r)),(c1.g == 1.0) ? 1.0 : min(1.0, c2.g / (1.0 - c1.g)),(c1.b == 1.0) ? 1.0 : min(1.0, c2.b / (1.0 - c1.b))); }else",
		//"													// Burn",
		"if(type == 13.){ return vec3((c1.r == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.r) / c1.r)),(c1.g == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.g) / c1.g)), (c1.b == 0.0) ? 0.0 : (1.0 - ((1.0 - c2.b) / c1.b))); }else",
		"if(type == 14.){ return (c1 + c2) - 1.0; }else",//			// LINEAR BURN",
		"if(type == 15.){ return 2.0 * c1 + c2 - 1.0; }else",//		// LINEAR LIGHT	",	
		//"													// VIVID LIGHT",
		"if(type == 16.){ return vec3((c1.r <= 0.5) ? (1.0 - (1.0 - c2.r) / (2.0 * c1.r)) : (c2.r / (2.0 * (1.0 - c1.r))),(c1.g <= 0.5) ? (1.0 - (1.0 - c2.g) / (2.0 * c1.g)) : (c2.g / (2.0 * (1.0 - c1.g))),(c1.b <= 0.5) ? (1.0 - (1.0 - c2.b) / (2.0 * c1.b)) : (c2.b / (2.0 * (1.0 - c1.b)))); }else",
		//"												// PIN LIGHT",
		"if(type == 17.){ return vec3((c1.r > 0.5) ? max(c2.r, 2.0 * (c1.r - 0.5)) : min(c2.r, 2.0 * c1.r), (c1.r > 0.5) ? max(c2.g, 2.0 * (c1.g - 0.5)) : min(c2.g, 2.0 * c1.g),(c1.b > 0.5) ? max(c2.b, 2.0 * (c1.b - 0.5)) : min(c2.b, 2.0 * c1.b)); }else",
		"if(type == 18.){return c1; }else						",// Replace",
		"if(type == 19.){return c2; }else",						// Off / Ignore
		"{ return c1 + c2; }								",  // Add (default)",
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
 *
 * Simple shader for displaying a texture
 *
 * Currently only used for testing source textures to display planes
 *
 */
 

PX.shaders.SimpleTextureShader = {

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
