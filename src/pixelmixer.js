

// ****** Platform ******

var PX = { REVISION: '1' };	// Global object
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