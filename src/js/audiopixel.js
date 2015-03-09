

// ****** Platform ******

var ap = { REVISION: '1' };		// Global object
ap.shaders = {};				// Internal shaders 
ap.clips = {}; 					// Loaded shaders as clips
ap.register = {}; 				// Loaded shaders get referenced here internally for quick lookup

// TODO this should be a list of objects that we load at runtime, hardcoded for now
ap.imported = {}; 				// Currently imported port (and possibly node) data

ap.ready = false;


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
ap.demoClipNames = ["SolidColor", "ColorSineBar", "ColorSwirls", "LineCosSin", "SimpleSwirl",
"SinSpiral", "SineParticles", "DiSinSwirl", "HexifyRadial", "SinCosTan"];

ap.demoHardware = ["ApHardwareTest", "Grid+zLayer", "RanZGrid"];



// ****** Main Init ****** 

ap.init = function(scene, renderer){

	// Register all clips by their id's for easy lookup later
	for (var property in ap.clips) {
		if (ap.clips.hasOwnProperty(property)) {
			ap.register[ap.clips[property].id] = property;
		}
	}

	ap.ports = new PortManager();
	ap.hardware = new HardwareManager();
	ap.channels = new ChannelManager();
	ap.app = new AppManager(scene, renderer);

	ap.ports.init();
	ap.hardware.init();
	ap.channels.init();
	ap.app.init();
}


// ****** Runtime Loop ****** 

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