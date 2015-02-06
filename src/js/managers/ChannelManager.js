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
		var variables = {};
		var fragmentFunctions = {};
		var fragmentFunctionOutput = "";
		var output = "";
		var fragOutput = ""

		var lastKnownPos = {};

		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			channel.address = "_" + (i+1);

			var fxChannel = false;
			if(channel.type === ap.CHANNEL_TYPE_FX){
				fxChannel = true;
			}

			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix }; // TODO modulation uniforms 

			if(channel && channel.pods){

				for (var e = 0; e < channel.pods.length; e++) {
					var pod = channel.pods[e];
					pod.address = channel.address + "_" + (e+1);

					// uniforms 'mix' & 'blend' for the pod
					uniforms[pod.address + "_mix"] = { type: "f", value: pod.mix }; // TODO modulation uniforms 
					uniforms[pod.address + "_blend"] = { type: "f", value: pod.blend };


					// Set pod position data for use by all the clips in this pod
					if(pod.clips && pod.clips.length){

						// TODO account for resolution to use 3D if there is depth data
						var podPos = this.getPodPos(pod.positionId);

						// Set the resolution (if it's changed) for the next set of nodes to be the current pods position bounding box
						if(lastKnownPos !== podPos){
							output += "resolution = vec2(" + podPos.w + ", " + podPos.h + "); \n"
							lastKnownPos = podPos;

							// Offset the xyz coordinates with the pod's xy to get content to stretch and offset properly // ap_xyz2 is the original real coordinates
							
						} output += "ap_xyz.x = ap_xyz2.x - " + podPos.x.toFixed(1) + "; \n"
							output += "ap_xyz.y = ap_xyz2.y - " + podPos.y.toFixed(1) + "; \n"

						// Declare each clips variables, but we can't declare them more than once so record which ones we have declared already
						for (var u = 0; u < pod.clips.length; u++) {

							if(pod.clips[u]){

								var sourceShader = ap.clips[ap.register[pod.clips[u].clipId]];
								if(sourceShader){
									for (var variable in sourceShader.variables) {

										if(!variables[variable]){ // If we don't already have the variable mark it as in use and include it.
											variables[variable] = 1; 
											var type = getVariableTypeFromShorthand(sourceShader.variables[variable].type);
											output += type + " " + variable + ";";
										}
									}output += "\n";
									for (var fragmentFunction in sourceShader.fragmentFunctions) {
										if(!fragmentFunctions[fragmentFunction]){ // If we don't already have the function mark it as in use and include it.
											fragmentFunctions[fragmentFunction] = 1; 
											fragmentFunctionOutput += sourceShader.fragmentFunctions[fragmentFunction] + " \n";
										}
									}
								}
							}
						}output += "\n";

						// Check to see if the nodes are in the position bounding box, if not don't render these clips // ap_xyz2 is the original real coordinates
						output += "if(ap_xyz2.x >= " + podPos.x.toFixed(1) + " && ap_xyz2.y >= " + podPos.y.toFixed(1) + " && ap_xyz2.x <= " + (podPos.w + podPos.x).toFixed(1) + " && ap_xyz2.y <= " + (podPos.h + podPos.y).toFixed(1) + ") { \n";


						var fxPod = true; // If the only clips that are in this pod are fx's then treat pod as a fx output and don't blend
						for (var u = 0; u < pod.clips.length; u++) {

							var clip = pod.clips[u];
							if(clip){

								var srcClip = ap.clips[ap.register[clip.clipId]];
								clip.address = pod.address +"_" + (u+1);
								if(srcClip){

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

									// Replace the standard GL color array with an internal one so that we can mix and merge, and then output to the standard when we are done
									fragOutput = fragOutput.replace(/gl_FragColor/g, "ap_rgbV4");
									fragOutput = fragOutput.replace(/ap_fxOut/g, "ap_rgbV4");
									fragOutput = fragOutput.replace(/gl_FragCoord/g, "ap_xyz");

									// Normalize into Vector3
									fragOutput += "ap_rgb2 = vec3(ap_rgbV4.r, ap_rgbV4.g, ap_rgbV4.b); \n"; // vec4 -> vec3
									fragOutput += "ap_rgb2 = max(min(ap_rgb2, vec3(1.0)), vec3(0.0)); \n";



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
									
									if(fx){
										// If we are an effects clip set the incoming value from the last clip, or the last pod if we are the first clip
										if(u === 0){
											fragOutput = fragOutput.replace(/ap_fxIn/g, "ap_p");
										}else{
											fragOutput = fragOutput.replace(/ap_fxIn/g, "ap_rgb");
										}
									}

									// Merge the clip fragment shaders as we move along
									output += fragOutput;
								}
							}
						};
						
						// If the clips are not in this pod set color value to 0 unless it's a fx and let the value pass }
						output += "}";

						if(fxPod){
							// If this is an effects pod don't change values for anything outside the bounding box
							output += " else{ ap_rgb = ap_p; } \n";
						}else{
							// Otherwise clear any values that are outside the bounding box
							output += " else{ ap_rgb = vec3(0.0);} \n";
						}
					}

					
					//  -------------- Pod Mix Blend & Fx --------------

					// If we are the very first pod mix output value, don't blend from previous pod
					if(e === 0){
						output += "ap_rgb = ap_rgb * (_pod_mix); \n";
						output += "ap_p = ap_rgb; \n";

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

					output = output.replace(/_pod_/g, pod.address + "_") + "\n";
				}

			};

				
			//  -------------- Channel Mix & Fx --------------

			if(i === 0){
				output += "ap_p = ap_p * (_channel_mix); \n";
				output += "ap_c = ap_p; \n";
			}else{

				if(fxChannel){
					output += "ap_c = mix(ap_c, ap_p, _channel_mix); \n";
				}else{
					output += "ap_p = ap_p * (_channel_mix); \n";
					output += "ap_c = blend(ap_c, ap_p, 1.0); \n"; // Channels always blend using 'add'
				}
			}

			output = output.replace(/_channel_/g, channel.address + "_") + "\n";
		};

		//console.log(uniforms);
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


		return new Shader(uniforms, fragmentFunctionOutput, output + "\n");

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
			return this.podpositions[0]
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
		// Clear clip if obj is null or .id is 0
		if(!clipObj || clipObj.id === 0){
			clearClip(channel, pod, clip);
		}
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

}
