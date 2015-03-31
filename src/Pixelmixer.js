
var PX = { REVISION: '1' };	// Global object


// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
// *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* Api: -*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*


PX.readPixels = false;			// Turn this on if you need to receive color values of all the pixels
PX.broadcast = false;			// Update any defined techs to broadcast with the lastest pixels

PX.speed = 0.07;				// How much we increase 'global time' per 'animation frame'
PX.useTransforms = false;		// Pod transforms (swap axis, translate, scale)
PX.usePosUniforms = false;		// Allow u_pos_id uniforms to update a pod position by id 

PX.pointCloud = {};				// Main point cloud that displays node colors
PX.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
PX.pointMaterial = {};			// Shader of the point cloud that displays the node colors
PX.pointSprite; 				// String - relative file path to image to represent the point sprite
PX.pointSize = 20;				// The size of each point cloud sprite


// -------------------------------------------------------

PX.shaderCount = -1;
PX.init = function(scene, renderer, maxNodeCount){

	// Tag each shader with a incremental id, for easy lookup later
	PX.shaderCount = 0;
	for (var property in PX.clips) {
		if (PX.clips.hasOwnProperty(property)) {
			PX.shaderCount++;
			PX.clips[property].id = PX.shaderCount;
		}
	}

	// Maintain the lowest possible power of 2 texture size based on maxNodeCount
	maxNodeCount = maxNodeCount || Math.pow(128, 2); 	// Default: 16384 (128*128)
	PX.simSize = 4;										// Minimum: 16 (4*4)
	while(Math.pow(PX.simSize, 2) < maxNodeCount){
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


// Set this to store a [uniform float array] with specified length
// Can be referenced later in shaders, and PX.set/get as 'data'
PX.dataSetLength = null;


PX.updateShader = false;
PX.updateFresh = false;
PX.updateShaderLimiter = 0;
PX.update = function() {

	if(!PX.ready){return;}

	//if(frameCount % 30 == 1){ // Slow framerate testing

	if(!PX.app){

		console.log("AP Error: Need to call PX.init before PX.update.");

	}else if(PX.ready){

		// Update everything else if we don't have to update the shader this frame
		if((!PX.updateShader || PX.updateShaderLimiter < 4) && PX.updateShaderLimiter > 0){

			// ** Main loop update 
			PX.app.update();
			PX.ports.update();
			PX.hardware.update();
			PX.channels.update();

		}else{

			// Shader needs update
			PX.app.updateMainSourceShader();
			PX.app.update();
			PX.updateShaderLimiter = 0;
			PX.updateShader = false;
			PX.updateFresh = false;
		}
		PX.updateShaderLimiter++;

	}
};


PX.pointPosition = [-400, -400, 0]; // Defaults
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
	}
};


PX.setPointSize = function(v) {
	v *= ((PX.app.glWidth * PX.app.glHeight) * .00001);
	PX.pointMaterial.uniforms.u_pointSize.value = v;
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
	if(!channel){
		PX.material.uniforms[uniform].value = value;
	}else{
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
	PX.updateShader = true;
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
PX.BLEND.Fx = 1; // Use 'add' if this happens to get passed, all fx 'blending' happens outside blend()

PX.BLENDS = [ 'Add', 'Substract', 'Darkest', 'Lightest', 'Difference', 'Exclusion', 'Multiply', 'Screen','Overlay', 
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