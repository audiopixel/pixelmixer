/*
 * ************* CHANNEL MANAGER *************** 
 * Handles the state of all Channels running in the Universe.
 * Channels may contain Pods, which may contain Clips (structured shaders).
 *
 */

var ChannelManager = function () {

	this.channels = [];
	this.podpositions = [];

	/*

	--hold state:
	---------------------------------------

	pod objects stored on channel objects

		channels = [];
		channels[0] = new Channel(); // 0 is the address. associative/holey arrays ok, its only looped once when we regenerate shader 
		channels[0].type = "content"; // or 'fx' and 'scenefx' eventually
		channels[0].pods = [];
		channels[0].pods[0] = new Pod(); // '0.0' is the 'channel.pod' address
		channels[0].pods[0].mix = 1;
		channels[0].pods[0].clips = [];
		channels[0].pods[0].clips[0] = new Clip(); // '0.0.0' is the 'channel.pod.clip' address
		channels[0].pods[0].clips[0].id = 12; // colorwash clip for example



	any number of channel objects
		type (content, fx, or scene)
		mix value
		mod values (just for mix)

		any number of pod objects
			mix value
			blend value
			mod values (just for mix)
			position group id (that this pod references position data from)
			hardware group id (up to 3 of them)
				exclude or solo mode (for all hardware groups)

			any number of clip objects
				mix value
				blend value
				param values
				mod values (for mix and params)
				clip id (so we know which shader to grab from library)


	any number of position group objects (each pod must point to one of these) (maybe refactor into seperate manager?)
		id
		position data: xyz, whd


	--responsibilites:
	---------------------------------------

	main responsibility is to build source shader from 'snippets that have pod and clip data baked in'
		the shader gets re-generated anytime
			a pod gets added or deleted
			a pod changes it's hardware group(s), or how it uses the hardware group(s) (exclude or solo) 
			a pod changes which position group it references
			a position group's coordinates change (if actively referenced by a pod)

	define shader uniforms (to be used as clip params and properties)


	when in editor mode, show all the pod position groups, record any coordinate changes


	*/

};

ChannelManager.prototype = {

	init: function () {

	},

	update: function () {

		// For every clip in each pods channel, we call it's update function if it's defined
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];

					if(pod && pod.clips){

						for (var u = 0; u < pod.clips.length; u++) {
							var clip = pod.clips[u];
							if(clip){

								var srcClip = ap.clips[ap.register[clip.clipId]];

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
		var fragList = {};
		var fragFuncList = {};
		var fragFuncOutput = this.generateSizingFunctions();
		var fragFuncHelpers = "";
		var output = "";
		var fragOutput = "";
		var lastKnownPos = {};
		var lastKnownRes = "";



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

							
							// TODO add mirroring support
								// stored on the pod position: flipx, flipy, flipz	
								// switch each ap_xyz axis accordinaly
								// we could also support rotations this way

							fxPod = true; // If the only clips that are in this pod are fx's then treat pod as a fx output and don't blend
							for (u = 0; u < pod.clips.length; u++) {

								var clip = pod.clips[u];
								if(clip){

									var srcClip = ap.clips[ap.register[clip.clipId]];

									if(!fragList[pod.clips[u].clipId]){
										fragList[pod.clips[u].clipId] = true;

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
										fragFuncHelpers += "////////\n";
									}


									clip.address = pod.address +"_" + (u+1);
									if(clip.clipId > 0 && srcClip){

										// If the Clip defined properties define them as addressed uniforms
										for (var property in srcClip.properties) {
											uniforms[clip.address + "_" + property] = srcClip.properties[property];
										}

										// If the clip defined optional init() method call it with addressing
										if(srcClip.init){
											srcClip.init(clip.address, uniforms);
										}

										// Create params with default values
										for (var param in srcClip.params) {
											uniforms[clip.address + "_" + param] = { type: "f", value: srcClip.params[param].value };
										}


										// uniforms 'mix' & 'blend' for the clip
										uniforms[clip.address + "_mix"] = { type: "f", value: clip.mix }; // TODO modulation uniforms 
										uniforms[clip.address + "_blend"] = { type: "f", value: clip.blend }; 


										// Lookup the correct imported clip based on the id stored on the clip object
										fragOutput = srcClip.fragmentMain + "\n";

										// Pass along input param values if they are defined on clip
										var params = ["0.","0.","0.","0.","0.","0."];
										for (var j = 0; j < params.length; j++) {
											if(srcClip.params["p"+(j+1)]){
												params[j] = (clip.address+"_p"+(j+1));
											}
										};

										//fragOutput = "ap_rgb2 = vec3(superFunction("+ clip.clipId +", _fxIn, "+clip.address+"_p1, "+clip.address+"_p2, "+clip.address+"_p3, "+clip.address+"_p4, "+clip.address+"_p5, "+clip.address+"_p6));";
										fragOutput = "ap_rgb2 = superFunction(_clip_mix, "+ clip.clipId +", _fxIn, "+params[0]+","+params[1]+","+params[2]+","+params[3]+","+params[4]+","+params[5]+");";

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

							// If we are the very first pod mix output value, don't blend from previous pod
							if(e === 0){
								output += "ap_p = ap_rgb * (_pod_mix); \n";

							}else{
								if(fxPod){
									// Fx pod: mix the original with the result of fx

									//output += "ap_p = ap_rgb; \n";
									output += "ap_p = mix(ap_p, ap_rgb, _pod_mix); \n";

								}else{
									// Blend in last pod with current pod, if it's not the first pod in this channel
									output += "ap_rgb = ap_rgb * (_pod_mix); \n";
									output += "ap_p = blend(ap_p, ap_rgb, _pod_blend); \n";
									//output += "//-------------=-=- \n";
								}
							}
							
							// If the clips are not in this pod set color value to 0 unless it's a fx and let the value pass }
							output += "}";//output += " else{ ap_rgb = ap_p; } \n";

							if(fxPod){
								// If this is an effects pod don't change values for anything outside the bounding box
								//output += " else{ ap_rgb = ap_p; } \n";
							}else{
								// Otherwise clear any values that are outside the bounding box
								//output += " else{ ap_rgb = vec3(0.0);} \n";
							}
						
							output += "/////////////////////////////////-------------//-------------- \n";

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
		fragFuncHelpers = "vec3 superFunction(float _mi, int id, vec3 _fxIn, float _p1, float _p2, float _p3, float _p4, float _p5, float _p6) { \n" + fragFuncHelpers + "}\n";
		
		fragFuncOutput += fragFuncHelpers;


		//console.log(uniforms);
		//console.log(fragFuncOutput);
		//console.log(output);

		/*
		// TODO regenerate Metamap data: (if any of this changed)

			port id
			node id
			index
			hardware group 1
			hardware group 2
			hardware group 3
			hardware group mode: off, exclude, or solo

		*/


		return new Shader(uniforms, fragFuncOutput, output + "\n");

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
			output += "vec3 s = getPodPos(p);\n",
			output += "return vec4(b.x - s.x, b.y - s.y, b.z - s.z, w);\n";
		output += "}\n";

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
