

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