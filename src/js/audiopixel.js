

// ****** Platform ******

var ap = { REVISION: '1' };		// Global object
ap.shaders = {};				// Internal shaders 
ap.clips = {}; 					// Loaded shaders as clips



ap.BLEND = {}; 					// Blend Constants

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

ap.PORT_TYPE_OFF = 0;
ap.PORT_TYPE_KINET_1 = 1; // strands
ap.PORT_TYPE_KINET_2 = 2; // tiles
ap.PORT_TYPE_KINET_3 = 3; // colorblasts
ap.PORT_TYPE_KINET_4 = 4;
ap.PORT_TYPE_DMX_1 = 5; // Movers, for testing
ap.PORT_TYPE_DMX_2 = 6;
ap.PORT_TYPE_DMX_3 = 7;
ap.PORT_TYPE_LASER_1 = 8;