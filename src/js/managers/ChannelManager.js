/*
 *
 * Handles the state of all known Channels
 *
 * Channels may contain Pods, which may contain Clips (structured shaders).
 *
 */

ap.ChannelManager = function () {

	this.channels = [];
	this.podpositions = [];

};

ap.ChannelManager.prototype = {

	init: function () {

	},

	update: function () {

		// For every clip in each pods channel, we call it's update function if it's defined
		for (var i = 0; i < this.channels.length; i++) { var channel = this.channels[i];

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) { var pod = channel.pods[e];

					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) { var clip = pod.clips[u];

							if(clip){ var srcClip = ap.clips[ap.register[clip.clipId]];

								// If the clip defined update function call it with proper clip addressing
								if(srcClip && srcClip.update && ap.app.material){
									srcClip.update("_" + (i+1) + "_" + (e+1) + "_" + (u+1), ap.app.material.uniforms);
								}
							}
						}
					}
				}
			}
		}
	},

	generateSourceShader: function () {

		var uniforms = {};
		var constants = {};
		var fragList = {};
		var fragFuncList = {};
		var fragFuncOutput = this.generateSizingFunctions();
		var fragFuncHelpers = "";
		var output = "";
		var fragOutput = "";
		var lastKnownPos = {};
		var lastKnownRes = "";

		// Return the nth word of a string http://stackoverflow.com/a/11620169
		function nthWord(str, n) {
			var m = str.match(new RegExp('^(?:\\w+\\W+){' + --n + '}(\\w+)'));
			return m && m[1];
		}

		// Now create the mixed down output
		for (var i = 0; i < this.channels.length; i++) {

			var channel = this.channels[i];
			channel.address = "_" + (i+1);


			var fxChannel = false;
			if(channel.type === ap.CHANNEL_TYPE_FX){
				fxChannel = true;
			}

			output += "if(_channel_mix>0.){ \n";


			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix }; // TODO modulation uniforms 

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];
					pod.address = channel.address + "_" + (e+1);

					// uniforms 'mix' & 'blend' for the pod
					uniforms[pod.address + "_mix"] = { type: "f", value: pod.mix }; // TODO modulation uniforms 
					uniforms[pod.address + "_blend"] = { type: "f", value: pod.blend };

					var fxPod = false;
					if(pod.clips && pod.clips.length){

						for (var o = 0; o < pod.positionIds.length; o++) {

							output += "/////////////////////////////////------------------------------ \n";

							// TODO account for resolution to use 3D if there is depth data
							var podPos = this.getPodPos(pod.positionIds[o]);

							// Set the resolution (if it's changed) for the next set of nodes to be the current pods position bounding box
							if(lastKnownPos !== podPos){
								lastKnownPos = podPos;

								// Only update the res if we need to
								var res = "vec2(" + podPos.w + ", " + podPos.h + ");";
								if(lastKnownRes !== res){
									lastKnownRes = res;
									output += "resolution = " + res + " \n";
								}

								// Offset the xyz coordinates with the pod's xy to get content to stretch and offset properly // ap_xyz2 is the original real coordinates
								output += "ap_xyz = offsetPos(ap_xyz2, " + pod.positionIds[o] + ", ap_xyz.w);\n";
							}

							// Check to see if the nodes are in the position bounding box, if not don't render these clips // ap_xyz2 is the original real coordinates
							output += "if(_pod_mix > 0. && checkBounds(ap_xyz2, "+pod.positionIds[o]+") > 0.){ \n";


							fxPod = true; // If the only clips that are in this pod are fx's then treat pod as a fx output and don't blend
							for (u = 0; u < pod.clips.length; u++) {

								var clip = pod.clips[u];
								if(clip){

									var srcClip = ap.clips[ap.register[clip.clipId]];


									if(!fragList[pod.clips[u].clipId]){
										fragList[pod.clips[u].clipId] = true;

										// Declare each clips constants, but we can't declare them more than once so record which ones we have declared already
										for (var variable in srcClip.constants) {

											if(!constants[variable]){ // If we don't already have the constant mark it as in use and include it.
												constants[variable] = 1; 
												var type = ap.getVariableTypeFromShorthand(srcClip.constants[variable].type);
												fragFuncOutput += type + " " + variable + " = " + srcClip.constants[variable].value + ";";
											}
										}fragFuncOutput += "\n";

										if(srcClip.fragmentFunctions){
											for (var v = 0; v < srcClip.fragmentFunctions.length; v++) {

												// Duplicate method checking - right now just checking based off the first 5 words of function
												var name = srcClip.fragmentFunctions[v].trim();
												name = nthWord(name, 1) + nthWord(name, 2) + nthWord(name, 3) + nthWord(name, 4) + nthWord(name, 5);
												if(!fragFuncList[name]){
													fragFuncList[name] = true;

													// Add the helper function to be included at the top of the shader
													fragFuncOutput += srcClip.fragmentFunctions[v] + "\n";
												}
											}
										}
										fragFuncHelpers += "else if(id == " + srcClip.id + "){\n";
										fragFuncHelpers += srcClip.fragmentMain.replace("gl_FragColor", "returnColor"); + "\n";
										fragFuncHelpers = fragFuncHelpers.replace(/gl_FragCoord/g, "ap_xyz"); + "\n";
										fragFuncHelpers += "\n}\n";
										//fragFuncHelpers += "////////\n";
									}


									clip.address = pod.address +"_" + (u+1);
									if(clip.clipId > 0 && srcClip){

										// If the clip defined params transfer default values over to the obj
										for (var param in srcClip.params) {
											ap.setObjProperty(param, srcClip.params[param].value, i+1, e+1, u+1);
											
											// Create params with default values
											uniforms[clip.address + "_" + param] = { type: "f", value: srcClip.params[param].value };
										}

										// If the clip defined properties define them as addressed uniforms
										for (var property in srcClip.properties) {
											uniforms[clip.address + "_" + property] = srcClip.properties[property];
										}

										// If the clip defined optional init() method call it with addressing
										if(srcClip.init){
											srcClip.init(clip.address, uniforms);
										}


										// Define uniforms for each clip
										uniforms[clip.address + "_mix"] = { type: "f", value: clip.mix }; // TODO modulation uniforms 
										uniforms[clip.address + "_blend"] = { type: "f", value: clip.blend }; 
										uniforms[clip.address + "_time"] = { type: "f", value: ap.app.time }; 


										// Pass along input param values if they are defined on clip
										var params = ["0.","0.","0.","0.","0.","0.","0.","0.","0."];
										for (var j = 0; j < params.length; j++) {
											if(srcClip.params["p"+(j+1)]){
												params[j] = (clip.address+"_p"+(j+1));
											}
										};

										fragOutput = "ap_rgb2 = superFunction(_clip_mix, "+ clip.clipId +", _fxIn, _clip_time, "+params[0]+","+params[1]+","+params[2]+","+params[3]+","+params[4]+","+params[5]+","+params[6]+","+params[7]+","+params[8]+");";

										// Replace the standard GL color array with an internal one so that we can mix and merge, and then output to the standard when we are done
										//fragOutput = fragOutput.replace(/ap_fxOut/g, "ap_rgbV4");
										fragOutput = fragOutput.replace(/gl_FragCoord/g, "ap_xyz");


										// ------------ Clip Mix Blend & Fx --------------

										var fx = ap.clips[ap.register[clip.clipId]].fx;
										if(u === 0){
											
											fragOutput += "ap_rgb = ap_rgb2; \n";
											if(!fx && !fxChannel){
												fxPod = fxChannel;
												fragOutput += "ap_rgb = ap_rgb * (_clip_mix); \n";  // Clip mix for this shader
											}else{
												fragOutput += "ap_rgb = mix(ap_p, ap_rgb2, _clip_mix); \n";
											}

										}else{

											if(fx || fxChannel){
												// Fx clip: mix the original with the result of fx
												fragOutput += "ap_rgb = mix(ap_rgb, ap_rgb2, _clip_mix); \n";

											}else{
												// Blend in the shader with ongoing mix
												fragOutput += "ap_rgb2 = ap_rgb2 * (_clip_mix); \n";
												fragOutput += "ap_rgb = blend(ap_rgb2, ap_rgb, _clip_blend); \n"; // Clip mix for this shader
												fxPod = fxChannel;
											}

										}

										// Inject addressing for uniforms that are flagged (i.e. replace "_clip_mix" with "_1_1_1_mix")
										fragOutput = fragOutput.replace(/_clip_/g, clip.address + "_");
										fragOutput = fragOutput.replace(/__/g, clip.address + "_"); // Also detect the clip shorthand '__'
										
										// For use by effects clips: set the incoming value from the last clip, or the last pod if we are the first clip
										if(u === 0){
											fragOutput = fragOutput.replace(/_fxIn/g, "ap_p");
										}else{
											fragOutput = fragOutput.replace(/_fxIn/g, "ap_rgb");
										}

										// Merge the clip fragment shaders as we move along
										output += fragOutput;
									}
								}

							}
						
							//  -------------- Pod Mix Blend & Fx --------------


							if(fxPod){

								// Fx pod: mix the original with the result of fx_rgb, _pod_mix); \n";
								output += "ap_p = mix(ap_p, ap_rgb, _pod_mix); \n";

							}else{

								if(e === 0){

									// If we are the very first pod mix output value, don't blend from previous pod
									output += "ap_p = ap_rgb * (_pod_mix); \n";

								}else{

									// Blend in last pod with current pod
									output += "ap_rgb = ap_rgb * (_pod_mix); \n";
									output += "ap_p = blend(ap_p, ap_rgb, _pod_blend); \n";
								}
							}
							
							output += "}";

							//output += "/////////////////////////////////-------------//-------------- \n";

						}

					}

					output = output.replace(/_pod_/g, pod.address + "_") + "\n";

				}

			}

				
			//  -------------- Channel Mix & Fx --------------

			if(i === 0){
				output += "ap_c = ap_p = ap_p * (_channel_mix); \n";
			}else{

				if(fxChannel){
					output += "ap_c = mix(ap_c, ap_p, _channel_mix); \n";
				}else{
					output += "ap_p = ap_p * (_channel_mix); \n";
					output += "ap_c = blend(ap_c, ap_p, 1.); \n"; // Channels always blend using 'add'
				}
			}
			output += "}";

			output = output.replace(/_channel_/g, channel.address + "_") + "\n";
		}

		fragFuncHelpers = fragFuncHelpers.slice(5, fragFuncHelpers.length); // cut the first 'else' out 
		fragFuncHelpers = "vec4 returnColor = vec4(0.,0.,0.,0.); if(_mi == 0.){return vec3(0.,0.,0.);} \n" + fragFuncHelpers;
		fragFuncHelpers += "return max(min(vec3(returnColor.x, returnColor.y, returnColor.z), vec3(1.0)), vec3(0.0)); \n";
		fragFuncHelpers = "vec3 superFunction(float _mi, int id, vec3 _fxIn, float time, float _p1, float _p2, float _p3, float _p4, float _p5, float _p6, float _p7, float _p8, float _p9) { \n" + fragFuncHelpers + "}\n";
		
		fragFuncOutput += fragFuncHelpers;


		//console.log(uniforms);
		//console.log(fragFuncOutput);
		//console.log(output);


		return {uniforms: uniforms, fragmentFunctions: fragFuncOutput, fragmentMain: output + "\n"};
	},

	generateSizingFunctions: function () {
		
		// Pod Position function
		var m = "";
		for (var i = 0; i < this.podpositions.length; i++) {
			m += "else if(d == " + (i+1) + "){\n";
			m += "p = vec3("+this.podpositions[i].x+","+this.podpositions[i].y+","+this.podpositions[i].z+");\n";
			m += "}\n";
		}
		m = m.slice(5, m.length); // cut the first 'else' out 
		m = "vec3 p = vec3(0.,0.,0.); \n" + m;
		m += "return p; \n";
		m = "vec3 getPodPos(int d) { \n" + m + "}\n";

		// Pod Size function
		var output = m;
		m = "";
		for (var i = 0; i < this.podpositions.length; i++) {
			m += "else if(d == " + (i+1) + "){\n";
			m += "p = vec3("+this.podpositions[i].w+","+this.podpositions[i].h+","+this.podpositions[i].d+");\n";
			m += "}\n";
		}
		m = m.slice(5, m.length); // cut the first 'else' out 
		m = "vec3 p = vec3(0.,0.,0.); \n" + m;
		m += "return p; \n";
		m = "vec3 getPodSize(int d) { \n" + m + "}\n";

		output += m;

		if(ap.useTransforms){

			// Pod Offset (translation)
			m = "";
			for (var i = 0; i < this.podpositions.length; i++) {
				m += "else if(d == " + (i+1) + "){\n";
				m += "p = vec3("+this.podpositions[i].xt+","+this.podpositions[i].yt+","+this.podpositions[i].zt+");\n";
				m += "}\n";
			}
			m = m.slice(5, m.length); // cut the first 'else' out 
			m = "vec3 p = vec3(0.,0.,0.); \n" + m;
			m += "return p; \n";
			m = "vec3 getPodOffset(int d) { \n" + m + "}\n";

			output += m;

			// Pod Scale & Flipmode
			m = "";
			for (var i = 0; i < this.podpositions.length; i++) {
				m += "else if(d == " + (i+1) + "){\n";
				m += "p = vec4("+this.podpositions[i].xs+","+this.podpositions[i].ys+","+this.podpositions[i].zs+","+this.podpositions[i].flipmode+");\n";
				m += "}\n";
			}
			m = m.slice(5, m.length); // cut the first 'else' out 
			m = "vec4 p = vec4(0.,0.,0.,0.); \n" + m;
			m += "return p; \n";
			m = "vec4 getPodScale(int d) { \n" + m + "}\n";

			output += m;
		}

		// Method to check xyz+whd against another // TODO account for non rectangular shapes
		output += ["float checkBounds(vec4 b, int p)",
		"{",										
			"vec3 s = getPodPos(p);",
			"if(b.x >= s.x && b.y >= s.y && b.z >= s.z){ ",
				"vec3 e = getPodSize(p);",
				"if(b.x <= (e.x + s.x) && b.y <= (e.y + s.y) && b.z <= (e.z + s.z)) {",
				"	return 1.;",
			"}}",			
		"	return 0.;",
		"}"].join("\n");

		// Offset xyz from pod position id
		output += "vec4 offsetPos(vec4 b, int p, float w){\n";

			output += "vec3 c = getPodPos(p);\n";
			output += "float x = b.x - c.x;\n";
			output += "float y = b.y - c.y;\n";
			output += "float z = b.z - c.z;\n";
			output += "float t = x;\n";

			if(ap.useTransforms){

				// swap axis
				output += "vec4 s = getPodScale(p);\n";
				output += "if(s.w == 1.){";
					output += "x=y;y=t;\n";		// swap x-y
				output += "}else if(s.w == 2.){";	
					output += "x=z;z=t;\n";		// swap x-z
				output += "}else if(s.w == 3.){";
					output += "t=y;y=z;z=t;\n";	// swap y-z
				output += "}\n";

				output += "vec3 d = getPodOffset(p);\n";
				output += "vec3 e = getPodSize(p);\n";

				// translate: (magnitude of 8)
				output += "x += (e.x * 8. * (d.x - .5));\n";
				output += "y += (e.y * 8. * (d.y - .5));\n";
				output += "z += (e.z * 8. * (d.z - .5));\n";

				// scale/flip/mirror: (magnitude of 8)
				output += "x += (b.x - (e.x * .5 + c.x)) * (1.-(s.x * 2.))*8.;\n";
				output += "y += (b.y - (e.y * .5 + c.y)) * (1.-(s.y * 2.))*8.;\n";
				output += "z += (b.z - (e.z * .5 + c.z)) * (1.-(s.z * 2.))*8.;\n";

			}

			output += "return vec4(x, y, z, w);\n";

		output += "}\n";

		//console.log(output);
		return output;
	},

	// ************* Channels ***********************


	setChannel: function (channelId, channelObject) {
		this.channels[channelId-1] = channelObject;
	},

	getChannel: function (channelId) {
		return this.channels[channelId-1];
	},

	getChannels: function () {
		return this.channels;
	},

	clearChannel: function (channelId) {
		delete this.channels[channelId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllChannels: function () {
		this.channels = [];
	},

	clearAllPodsInChannel: function (channelId) {
		delete this.channels[channelId-1].pods; // TODO optimize: most likely better to not use 'delete'
	},

	// ************* Pod Positions ***********************

	setPodPos: function (podPositionId, podPositionObject) {
		this.podpositions[podPositionId-1] = podPositionObject;
	},

	getPodPos: function (podPositionId) {
		if(!this.podpositions[podPositionId-1]){
			// If pod position doesn't exist default to the first main pod sized to everything
			//console.log("Warning: Cannot find pod position (" + podPositionId + "), using default (1).");
			return this.podpositions[0];
		}
		return this.podpositions[podPositionId-1];
	},

	clearPodPos: function (podPositionId) {
		delete this.podpositions[podPositionId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPodPos: function () {
		this.podpositions = [];
	},

	// ************* Clips ***********************

	setClip: function (channel, pod, clip, clipObj) {
		// If channel doesn't exist ignore this request
		if(!this.channels[channel-1]){
			return false;
		}
		// If a pod does not yet exist create a default one with clip obj
		if(!this.channels[channel-1].pods[pod-1]){
			this.channels[channel-1].pods[pod-1] = new Pod(1, 1, ap.BLEND.Add, [clipObj]);
		}else{
			// Todo transfer over existing data like mix, if it's not defined on new clip obj
			this.channels[channel-1].pods[pod-1].clips[clip-1] = clipObj;
		}
	},

	clearClip: function (channel, pod, clip) {
		delete this.channels[channel-1].pods[pod-1].clips[clip-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllClipsInPod: function (channel, pod) {
		delete this.channels[channel-1].pods[pod-1].clips;  // TODO optimize: most likely better to not use 'delete'
	}

};
