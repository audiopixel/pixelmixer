



PMX.broadcast = true;	
PMX.readPixels = true;	

PMX.speed = 0.07;				// How much we increase 'global time' per 'animation frame'
PMX.useTransforms = false;		// Pod transforms (swap axis, translate, scale)
PMX.usePodUniforms = false;		// Allow u_pos_id uniforms to update a pod position by id 

PMX.pointCloud = {};			// Main point cloud that displays node colors
PMX.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
PMX.pointMaterial = {};			// Shader of the point cloud that displays the node colors
PMX.pointSize = 20;				// The size of each point cloud sprite

PMX.material = false;			// Main shader referenced here, set false initially to flag that its not ready






// -------------------------------------------------------

PMX.shaderCount = -1;
PMX.init = function(scene, renderer, maxNodeCount){

	// Tag each shader with a incremental id, for easy lookup later
	PMX.shaderCount = 0;
	for (var property in PMX.clips) {
		if (PMX.clips.hasOwnProperty(property)) {
			PMX.shaderCount++;
			PMX.clips[property].id = PMX.shaderCount;
		}
	}

	// Maintain the lowest possible power of 2 texture size based on maxNodeCount
	maxNodeCount = maxNodeCount || Math.pow(128, 2); 	// Default: 16384 (128*128)
	PMX.simSize = 4;										// Minimum: 16 (4*4)
	while(Math.pow(PMX.simSize, 2) < maxNodeCount){
		PMX.simSize *= 2;
	}

	PMX.ports = new PMX.PortManager();
	PMX.hardware = new PMX.HardwareManager();
	PMX.channels = new PMX.ChannelManager();
	PMX.app = new PMX.AppManager(scene, renderer);

	PMX.ports.init();
	PMX.hardware.init();
	PMX.channels.init();
	PMX.app.init();

	// If size not yet been defined, do it with some defaults
	if(!PMX.appSize){
		PMX.setSize(600, 400);
	}


};


// Set this to store a [uniform float array] with specified length
// Can be referenced later in shaders, and PMX.set/get as 'data'
PMX.dataSetLength = null;


PMX.updateShader = false;
PMX.updateFresh = false;
PMX.updateShaderLimiter = 0;
PMX.update = function() {

	//if(frameCount % 30 == 1){ // Slow framerate testing

	if(!PMX.app){

		console.log("AP Error: Need to call PMX.init before PMX.update.");

	}else if(PMX.ready){

		// Update everything else if we don't have to update the shader this frame
		if((!PMX.updateShader || PMX.updateShaderLimiter < 4) && PMX.updateShaderLimiter > 0){

			// ** Main loop update 
			PMX.app.update();
			PMX.ports.update();
			PMX.hardware.update();
			PMX.channels.update();

		}else{

			// Shader needs update
			PMX.app.updateMainSourceShader();
			PMX.app.update();
			PMX.updateShaderLimiter = 0;
			PMX.updateShader = false;
			PMX.updateFresh = false;
		}
		PMX.updateShaderLimiter++;

	}
};


PMX.pointPosition = [-400, -400, 0]; // Defaults
PMX.setPointPosition = function(x, y, z) {
	PMX.pointPosition = [x, y, z];
	if(PMX.pointCloud.position){
		PMX.pointCloud.position = {x: x, y: y, z: z};
	}
};

PMX.appSize;
PMX.setSize = function(width, height) {

	PMX.appSize = [width, height];

	if(PMX.app){

		PMX.app.glWidth = width;
		PMX.app.glHeight = height;

		if(PMX.app.readPixels){
			PMX.app.pixels = new Uint8Array(4 * PMX.app.glWidth * PMX.app.glHeight);
		}

		PMX.app.renderer.setSize( PMX.app.glWidth, PMX.app.glHeight );

		// Set point size relative to screen resolution
		var v = PMX.pointSize;
		v *= ((width * height) * .00001);
		PMX.pointMaterial.uniforms.u_pointSize.value = v;

	}
};


PMX.importShader = function (name, shaderTxt) {

	PMX.app.importShader(name, shaderTxt);

};


PMX.generateShader = function () {

	PMX.app.updateMainSourceShader();
	
};

// Easy way to add clips to a pod that is fitted to all nodes
// [ids], mix, channel
PMX.simpleSetup = function (params) {

	params.mix = params.mix || 1;
	params.channel = params.channel || 1;

	var clips = [];
	for (var i = 0; i < params.ids.length; i++) {
		clips[i] = new PMX.Clip({id: params.ids[i]});
	};

	var pods = [];
	pods[0] = new PMX.Pod({ clips: clips });

	var channel1 = new PMX.Channel({ mix: params.mix, pods: pods });
	PMX.channels.setChannel(params.channel, channel1);

	PMX.generateShader();

};


PMX.updateNodePoints = function () {

	PMX.app.updateGeometry();
	PMX.app.generateCoordsMap();
	PMX.app.createNodePointCloud();

};

PMX.get = function(uniform, channel, pod, clip) {
	if(!channel){
		return PMX.material.uniforms[uniform].value;
	}else{
		return PMX.getUniform(uniform, channel, pod, clip).value;
	}
};

PMX.set = function(uniform, value, channel, pod, clip) {
	if(!channel){
		PMX.material.uniforms[uniform].value = value;
	}else{
		PMX.getUniform(uniform, channel, pod, clip).value = value;
		PMX.setObjProperty(uniform, value, channel, pod, clip);
	}
};

PMX.getUniform = function(uniform, channel, pod, clip) {
	var addy = "_" + channel;
	if(pod){ addy += "_" + pod; 
	if(clip){ addy += "_" + clip; }}
	return PMX.material.uniforms[addy + "_" + uniform];
};

PMX.getObj = function(channel, pod, clip) {
	var obj = PMX.channels.channels[channel-1];
	if(pod){ obj = obj.pods[pod-1]; 
	if(clip){ obj = obj.clips[clip-1]; }}
	return obj;
};

PMX.setObj = function(newObj, channel, pod, clip) {
	if(!pod){
		PMX.channels.channels[channel-1] = newObj;
	}else if(!clip){
		PMX.channels.channels[channel-1].pods[pod-1] = newObj;
	}else{
		PMX.channels.channels[channel-1].pods[pod-1].clips[clip-1] = newObj;
	}
};

PMX.getObjProperty = function(property, channel, pod, clip) {
	var obj = PMX.getObj(channel, pod, clip);
	return obj[property];
};

PMX.setObjProperty = function(property, value, channel, pod, clip) {
	var obj = PMX.getObj(channel, pod, clip);
	obj[property] = value;
};

PMX.load = function(json){
	PMX.channels.channels = json;
	PMX.updateShader = true;
	PMX.updateFresh = true;
};

PMX.stringifyChannels = function(){
	return JSON.stringify(PMX.channels.channels);
};

PMX.stringifyNodes = function(){
	return JSON.stringify(PMX.ports.ports);
};