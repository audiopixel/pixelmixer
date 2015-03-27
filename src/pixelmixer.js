

// ****** Platform ******

var pm = { REVISION: '1' };		// Global object
pm.ready = false;				
pm.simSize;

pm.shaders = {};				// Internal shaders 
pm.clips = {}; 					// Loaded shaders as clips
pm.imported = {}; 				// Currently imported port (and possibly node) data


// ****** Constants ******

// Blend Constants
pm.BLEND = {};
pm.BLEND.OFF = 0;
pm.BLEND.Add = 1;
pm.BLEND.Subtract = 2;
pm.BLEND.Darkest = 3;
pm.BLEND.Lightest = 4;
pm.BLEND.Difference = 5;
pm.BLEND.Exclusion = 6;
pm.BLEND.Multiply = 7;
pm.BLEND.Screen = 8;
pm.BLEND.Overlay = 9;
pm.BLEND.HardLight = 10;
pm.BLEND.SoftLight = 11;
pm.BLEND.Dodge = 12;
pm.BLEND.Burn = 13;
pm.BLEND.LinearBurn = 14;
pm.BLEND.LinearLight = 15;
pm.BLEND.VividLight = 16;
pm.BLEND.PinLight = 17;
pm.BLEND.Fx = 1; // Use 'add' if this happens to get passed, all fx 'blending' happens outside blend()

pm.BLENDS = [ 'Add', 'Substract', 'Darkest', 'Lightest', 'Difference', 'Exclusion', 'Multiply', 'Screen','Overlay', 
			'HardLight', 'SoftLight', 'Dodge', 'Burn', 'LinearBurn', 'LinearLight', 'VividLight', 'PinLight'];


// pm.Port Type Constants
pm.PORT_TYPE_OFF = 0;
pm.PORT_TYPE_KINET_1 = 1; // strands
pm.PORT_TYPE_KINET_2 = 2; // tiles
pm.PORT_TYPE_KINET_3 = 3; // colorblasts
pm.PORT_TYPE_KINET_4 = 4;
pm.PORT_TYPE_DMX_1 = 5; // Movers, for testing
pm.PORT_TYPE_DMX_2 = 6;
pm.PORT_TYPE_DMX_3 = 7;
pm.PORT_TYPE_LASER_1 = 8;


// pm.Channel Type Constants
pm.CHANNEL_TYPE_OFF = 0;
pm.CHANNEL_TYPE_ADD = 1;
pm.CHANNEL_TYPE_FX = 2;
pm.CHANNEL_TYPE_SCENE = 3;


// Pod Hardware Group Modes Constants
pm.HARDWAREGROUP_OFF = 0;
pm.HARDWAREGROUP_SOLO = 1;
pm.HARDWAREGROUP_EXCLUDE = 2;


// Clip position map Constants
pm.MAP_NORMAL = 0;
pm.MAP_ALT1 = 1;
pm.MAP_ALT2 = 2;


// Temporary Preset Management 
pm.demoClipNames = ["TestFrame", "SolidColor", "ColorSineBar", "ColorSwirls", "LineCosSin", "SimpleSwirl",
"SinSpiral", "SineParticles", "DiSinSwirl", "HexifyRadial", "SinCosTan"];

pm.demoHardware = ["ApHardwareTest", "Grid+zLayer", "RanZGrid"];



// ****** Internal Utils ******

pm.getVariableTypeFromShorthand = function(shorthand){
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