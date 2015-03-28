

// ****** Platform ******

var PMX = { REVISION: '1' };	// Global object
PMX.ready = false;				
PMX.simSize;

PMX.shaders = {};				// Internal shaders 
PMX.clips = {}; 				// Loaded shaders as clips
PMX.imported = {}; 				// Currently imported port (and possibly node) data
PMX.techs = {};

PMX.pixels;
	
// ****** Constants ******

// Blend Constants
PMX.BLEND = {};
PMX.BLEND.OFF = 0;
PMX.BLEND.Add = 1;
PMX.BLEND.Subtract = 2;
PMX.BLEND.Darkest = 3;
PMX.BLEND.Lightest = 4;
PMX.BLEND.Difference = 5;
PMX.BLEND.Exclusion = 6;
PMX.BLEND.Multiply = 7;
PMX.BLEND.Screen = 8;
PMX.BLEND.Overlay = 9;
PMX.BLEND.HardLight = 10;
PMX.BLEND.SoftLight = 11;
PMX.BLEND.Dodge = 12;
PMX.BLEND.Burn = 13;
PMX.BLEND.LinearBurn = 14;
PMX.BLEND.LinearLight = 15;
PMX.BLEND.VividLight = 16;
PMX.BLEND.PinLight = 17;
PMX.BLEND.Fx = 1; // Use 'add' if this happens to get passed, all fx 'blending' happens outside blend()

PMX.BLENDS = [ 'Add', 'Substract', 'Darkest', 'Lightest', 'Difference', 'Exclusion', 'Multiply', 'Screen','Overlay', 
			'HardLight', 'SoftLight', 'Dodge', 'Burn', 'LinearBurn', 'LinearLight', 'VividLight', 'PinLight'];


// PMX.Port Type Constants
PMX.PORT_TYPE_OFF = 0;
PMX.PORT_TYPE_KINET_1 = 1; // strands
PMX.PORT_TYPE_KINET_2 = 2; // tiles
PMX.PORT_TYPE_KINET_3 = 3; // colorblasts
PMX.PORT_TYPE_KINET_4 = 4;
PMX.PORT_TYPE_DMX_1 = 5; // Movers, for testing
PMX.PORT_TYPE_DMX_2 = 6;
PMX.PORT_TYPE_DMX_3 = 7;
PMX.PORT_TYPE_LASER_1 = 8;


// PMX.Channel Type Constants
PMX.CHANNEL_TYPE_OFF = 0;
PMX.CHANNEL_TYPE_ADD = 1;
PMX.CHANNEL_TYPE_FX = 2;
PMX.CHANNEL_TYPE_SCENE = 3;


// Pod Hardware Group Modes Constants
PMX.HARDWAREGROUP_OFF = 0;
PMX.HARDWAREGROUP_SOLO = 1;
PMX.HARDWAREGROUP_EXCLUDE = 2;


// Clip position map Constants
PMX.MAP_NORMAL = 0;
PMX.MAP_ALT1 = 1;
PMX.MAP_ALT2 = 2;


// Temporary Preset Management 
PMX.demoClipNames = ["TestFrame", "SolidColor", "ColorSineBar", "ColorSwirls", "LineCosSin", "SimpleSwirl",
"SinSpiral", "SineParticles", "DiSinSwirl", "HexifyRadial", "SinCosTan"];

PMX.demoHardware = ["ApHardwareTest", "Grid+zLayer", "RanZGrid"];



// ****** Internal Utils ******

PMX.getVariableTypeFromShorthand = function(shorthand){
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