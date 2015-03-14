

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
ap.CHANNEL_TYPE_BLEND = 1;
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