

pm.speed = 0.07;				// How much we increase 'global time' per 'animation frame'
pm.useTransforms = false;		// Pod transforms (swap axis, translate, scale)
pm.usePodUniforms = false;		// Allow u_pos_id uniforms to update a pod position by id 

pm.pointCloud = {};				// Main point cloud that displays node colors
pm.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
pm.pointMaterial = {};			// Shader of the point cloud that displays the node colors
pm.pointSize = 20;				// The size of each point cloud sprite


pm.material = false;			// Main shader referenced here, set false initially to flag that its not ready
pm.shaderCount = -1;


pm.init = function(scene, renderer, maxNodeCount){

	// Tag each shader with a incremental id, for easy lookup later
	pm.shaderCount = 0;
	for (var property in pm.clips) {
		if (pm.clips.hasOwnProperty(property)) {
			pm.shaderCount++;
			pm.clips[property].id = pm.shaderCount;
		}
	}

	// Maintain the lowest possible power of 2 texture size based on maxNodeCount
	maxNodeCount = maxNodeCount || Math.pow(128, 2); 	// Default: 16384 (128*128)
	pm.simSize = 4;										// Minimum: 16 (4*4)
	while(Math.pow(pm.simSize, 2) < maxNodeCount){
		pm.simSize *= 2;
	}

	pm.ports = new pm.PortManager();
	pm.hardware = new pm.HardwareManager();
	pm.channels = new pm.ChannelManager();
	pm.app = new pm.AppManager(scene, renderer);

	pm.ports.init();
	pm.hardware.init();
	pm.channels.init();
	pm.app.init();

	// If size not yet been defined, do it with some defaults
	if(!pm.appSize){
		pm.setSize(600, 400);
	}


};


// Set this to store a [uniform float array] with specified length
// Can be referenced later in shaders, and pm.set/get as 'data'
pm.dataSetLength = null;


pm.updateShader = false;
pm.updateFresh = false;
pm.updateShaderLimiter = 0;
pm.update = function() {

	//if(frameCount % 30 == 1){ // Slow framerate testing

	if(!pm.app){

		console.log("AP Error: Need to call pm.init before pm.update.");

	}else if(pm.ready){

		// Update everything else if we don't have to update the shader this frame
		if((!pm.updateShader || pm.updateShaderLimiter < 4) && pm.updateShaderLimiter > 0){

			// ** Main loop update 
			pm.app.update();
			pm.ports.update();
			pm.hardware.update();
			pm.channels.update();

		}else{

			// Shader needs update
			pm.app.updateMainSourceShader();
			pm.app.update();
			pm.updateShaderLimiter = 0;
			pm.updateShader = false;
			pm.updateFresh = false;
		}
		pm.updateShaderLimiter++;

	}
};


pm.pointPosition = [-400, -400, 0]; // Defaults
pm.setPointPosition = function(x, y, z) {
	pm.pointPosition = [x, y, z];
	if(pm.pointCloud.position){
		pm.pointCloud.position = {x: x, y: y, z: z};
	}
};

pm.appSize;
pm.setSize = function(width, height) {

	pm.appSize = [width, height];

	if(pm.app){

		pm.app.glWidth = width;
		pm.app.glHeight = height;

		if(pm.app.readPixels){
			pm.app.pixels = new Uint8Array(4 * pm.app.glWidth * pm.app.glHeight);
		}

		pm.app.renderer.setSize( pm.app.glWidth, pm.app.glHeight );

		// Set point size relative to screen resolution
		var v = pm.pointSize;
		v *= ((width * height) * .00001);
		pm.pointMaterial.uniforms.u_pointSize.value = v;

	}
};


pm.importShader = function (name, shaderTxt) {

	pm.app.importShader(name, shaderTxt);

};


pm.generateShader = function () {

	pm.app.updateMainSourceShader();
	
};

// Easy way to add clips to a pod that is fitted to all nodes
// [ids], mix, channel
pm.simpleSetup = function (params) {

	params.mix = params.mix || 1;
	params.channel = params.channel || 1;

	var clips = [];
	for (var i = 0; i < params.ids.length; i++) {
		clips[i] = new pm.Clip({id: params.ids[i]});
	};

	var pods = [];
	pods[0] = new pm.Pod({ clips: clips });

	var channel1 = new pm.Channel({ mix: params.mix, pods: pods });
	pm.channels.setChannel(params.channel, channel1);

	pm.generateShader();

};


pm.updateNodePoints = function () {

	pm.app.updateGeometry();
	pm.app.generateCoordsMap();
	pm.app.createNodePointCloud();

};

pm.get = function(uniform, channel, pod, clip) {
	if(!channel){
		return pm.material.uniforms[uniform].value;
	}else{
		return pm.getUniform(uniform, channel, pod, clip).value;
	}
};

pm.set = function(uniform, value, channel, pod, clip) {
	if(!channel){
		pm.material.uniforms[uniform].value = value;
	}else{
		pm.getUniform(uniform, channel, pod, clip).value = value;
		pm.setObjProperty(uniform, value, channel, pod, clip);
	}
};

pm.getUniform = function(uniform, channel, pod, clip) {
	var addy = "_" + channel;
	if(pod){ addy += "_" + pod; 
	if(clip){ addy += "_" + clip; }}
	return pm.material.uniforms[addy + "_" + uniform];
};

pm.getObj = function(channel, pod, clip) {
	var obj = pm.channels.channels[channel-1];
	if(pod){ obj = obj.pods[pod-1]; 
	if(clip){ obj = obj.clips[clip-1]; }}
	return obj;
};

pm.setObj = function(newObj, channel, pod, clip) {
	if(!pod){
		pm.channels.channels[channel-1] = newObj;
	}else if(!clip){
		pm.channels.channels[channel-1].pods[pod-1] = newObj;
	}else{
		pm.channels.channels[channel-1].pods[pod-1].clips[clip-1] = newObj;
	}
};

pm.getObjProperty = function(property, channel, pod, clip) {
	var obj = pm.getObj(channel, pod, clip);
	return obj[property];
};

pm.setObjProperty = function(property, value, channel, pod, clip) {
	var obj = pm.getObj(channel, pod, clip);
	obj[property] = value;
};

pm.load = function(json){
	pm.channels.channels = json;
	pm.updateShader = true;
	pm.updateFresh = true;
};

pm.stringify = function(){
	return JSON.stringify(pm.channels.channels);
};