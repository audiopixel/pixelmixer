

ap.speed = 0.07;				// How much we increase 'global time' per 'animation frame'
ap.useTransforms = false;		// Pod transforms (swap axis, translate, scale)
ap.usePodUniforms = false;		// Allow u_pos_id uniforms to update a pod position by id 

ap.pointCloud = {};				// Main point cloud that displays node colors
ap.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
ap.pointMaterial = {};			// Shader of the point cloud that displays the node colors
								


ap.material = false;			// Main shader referenced here, set false initially to flag that its not ready
ap.shaderCount = 0;


ap.init = function(scene, renderer, maxNodeCount){

	 // Tag each shader with a incremental id, for easy lookup later
	for (var property in ap.clips) {
		if (ap.clips.hasOwnProperty(property)) {
			ap.shaderCount++;
			ap.clips[property].id = ap.shaderCount;
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


// Set this to store a [uniform float array] with specified length
// Can be referenced later in shaders, and ap.set/get as 'data'
ap.dataSetLength = null;


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
		ap.pointCloud.position = {x: x, y: y, z: z};
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


ap.importShader = function (name, shaderTxt) {
	
	ap.app.importShader(name, shaderTxt);

};


ap.generateShader = function () {

	ap.app.updateMainSourceShader();
	
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