
ap.speed = 0.07;				// How much we increase 'global time' per 'animation frame'

ap.simSize = 256;				// Power of 2 texture size that should contain maximum node count
ap.useTransforms = false;		// By default pixel transforms are ignored (swap axis, translate, scale)

ap.material = false;			// Main shader referenced here, set false initially to flag that its not ready

ap.pointCloud = {};				// Main point cloud that displays node colors
ap.pointGeometry = {};			// The geometry of the point cloud that displays the node colors
ap.pointMaterial = {};			// Shader of the point cloud that displays the node colors
								

// TODO this should be a list of objects that we load at runtime, hardcoded for now
ap.imported = {}; 				// Currently imported port (and possibly node) data



ap.init = function(scene, renderer){

	// Register all clips by their id's for easy lookup later
	for (var property in ap.clips) {
		if (ap.clips.hasOwnProperty(property)) {
			ap.register[ap.clips[property].id] = property;
		}
	}

	ap.ports = new ap.PortManager();
	ap.hardware = new ap.HardwareManager();
	ap.channels = new ap.ChannelManager();
	ap.app = new ap.AppManager(scene, renderer);

	ap.ports.init();
	ap.hardware.init();
	ap.channels.init();
	ap.app.init();
}


ap.updateShader = false;
ap.updateShaderLimiter = 0;
ap.update = function() {

	//if(frameCount % 30 == 1){ // Slow framerate testing

	if(!ap.app){

		console.log("AP Error: Need to call ap.init before ap.update.")

	}else if(ap.ready){

		// Update everything else if we don't have to update the shader this frame
		if((!ap.updateShader || ap.updateShaderLimiter < 4) && ap.updateShaderLimiter > 0){

			// ** Main loop update 
			ap.app.update();
			ap.ports.update();
			ap.hardware.update();
			ap.channels.update();

		}else{

			// We detected the shader needs update, only do that this frame
			ap.app.updateMainSourceShader();
			ap.app.update();
			ap.updateShaderLimiter = 0;
			ap.updateShader = false;
		}
		ap.updateShaderLimiter++;

	}
}

ap.setSize = function(width, height) {

	if(!ap.app){

		console.log("AP Error: Need to call ap.init before ap.setSize.")

	}else{

		ap.app.glWidth = width;
		ap.app.glHeight = height;

		if(ap.app.readPixels){
			ap.app.pixels = new Uint8Array(4 * ap.app.glWidth * ap.app.glHeight);
		}

		ap.app.renderer.setSize( ap.app.glWidth, ap.app.glHeight );

	}
}

ap.get = function(uniform, channel, pod, clip) {
	return ap.getUniform(uniform, channel, pod, clip).value;
}

ap.set = function(value, uniform, channel, pod, clip) {
	ap.getUniform(uniform, channel, pod, clip).value = value;
	ap.setObjProperty(value, uniform, channel, pod, clip);
}

ap.getUniform = function(uniform, channel, pod, clip) {
	var addy = "_" + channel;
	if(pod){ addy += "_" + pod; 
	if(clip){ addy += "_" + clip; }}
	return ap.material.uniforms[addy + "_" + uniform];
}

ap.getObj = function(channel, pod, clip) {
	var obj = ap.channels.channels[channel-1];
	if(pod){ obj = obj.pods[pod-1]; 
	if(clip){ obj = obj.clips[clip-1]; }}
	return obj;
}

ap.setObj = function(newObj, channel, pod, clip) {
	ap.getObj(channel, pod, clip) = newObj;
}

ap.getObjProperty = function(property, channel, pod, clip) {
	var obj = ap.getObj(channel, pod, clip);
	return obj[property];
}

ap.setObjProperty = function(value, property, channel, pod, clip) {
	var obj = ap.getObj(channel, pod, clip);
	obj[property] = value;
}