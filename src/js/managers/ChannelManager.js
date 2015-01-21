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

		// -------Temporary channel contents for testing----------

		var mix = 1;

		// Let's create some test clips for now (TODO: this should be loaded from current project settings or channel preset)
		//var clips = [new Clip(1, mix, ap.BLEND.Add), new Clip(2, mix, ap.BLEND.Add)];

		// Let's create some test pods for now (TODO: this should be loaded from current project settings or channel preset)
		
		//var pods = [new Pod(1, mix, ap.BLEND.Add, [new Clip(2, mix, ap.BLEND.Add), new Clip(4, mix, ap.BLEND.Fx)])];
		var pods = [new Pod(1, mix, ap.BLEND.Add, [new Clip(2, mix, ap.BLEND.Add)]), new Pod(2, mix, ap.BLEND.Add, [new Clip(4, mix, ap.BLEND.Fx)])];

		
		// Let's create some test channels for now (TODO: this should be loaded from current project settings)
		this.channels[0] = new Channel("TestChannel1", ap.CHANNEL_TYPE_BLEND, mix, ap.BLEND.Add, pods);
		//this.channels[1] = new Channel("TestChannel2", ap.CHANNEL_TYPE_BLEND, mix, ap.BLEND.Add, pods2);

		//console.log(this.generateSourceShader());

	},

	update: function () {


	},

	generateSourceShader: function () {

		var uniforms = {};
		var variables = {};
		var output = "";
		var fragOutput = ""
		var rgbTarget;

		var firstMixChannel = true;
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			channel.address = "_" + (i+1);

			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix }; // TODO modulation uniforms 


			var firstMixPod = true;
			for (var e = 0; e < channel.pods.length; e++) {
				var pod = channel.pods[e];
				pod.address = channel.address + "_" + (e+1);

				// uniforms 'mix' & 'blend' for the pod
				uniforms[pod.address + "_mix"] = { type: "f", value: pod.mix }; // TODO modulation uniforms 
				uniforms[pod.address + "_blend"] = { type: "f", value: pod.blend };


				// Set pod position data for use by all the clips in this pod
				if(pod.clips.length){

					// TODO account for resolution to not just be 2d axis of w and h (3D setup might use depth also)
					var podPos = this.getPodPos(pod.positionId);

					// Set the resolution for the next set of nodes to be the current pods position bounding box
					output += "resolution = vec2(" + podPos.w + ", " + podPos.h + "); \n"

					// Offset the xyz coordinates with the pod's xy to get content to stretch and offset properly // ap_xyz2 is the original real coordinates
					output += "ap_xyz.x = ap_xyz2.x - " + podPos.x.toFixed(1) + "; \n"
					output += "ap_xyz.y = ap_xyz2.y - " + podPos.y.toFixed(1) + "; \n"

					// Declare each clips variables, but we can't declare them more than once so record which ones we have declared already
					for (var u = 0; u < pod.clips.length; u++) {
						var sourceShader = ap.clips[ap.register[pod.clips[u].clipId]];
						for (var variable in sourceShader.variables) {

							if(!variables[variable]){ // If we don't already have the variable mark it as in use.
								variables[variable] = 1; 
								var type = getVariableTypeFromShorthand(sourceShader.variables[variable].type);
								output += type + " " + variable + ";";
							}
						}
					}output += "\n";

					// Check to see if the nodes are in the position bounding box, if not don't render these clips // ap_xyz2 is the original real coordinates
					output += "if(ap_xyz2.x >= " + podPos.x.toFixed(1) + " && ap_xyz2.y >= " + podPos.y.toFixed(1) + " && ap_xyz2.x <= " + (podPos.w + podPos.x).toFixed(1) + " && ap_xyz2.y <= " + (podPos.h + podPos.y).toFixed(1) + ") { \n";

				

					var firstMix = true;
					for (var u = 0; u < pod.clips.length; u++) {

						var clip = pod.clips[u];
						clip.address = pod.address + "_" + (u+1);

						// uniforms 'mix' & 'blend' for the clip
						uniforms[clip.address + "_mix"] = { type: "f", value: clip.mix }; // TODO modulation uniforms 
						uniforms[clip.address + "_blend"] = { type: "f", value: clip.blend }; 


						//output += "ap_xyz.x -= 80.0; \n" // offset without tiling

						// TODO 'clip params as well as xyz offset/scale ', as well as modulation values for each
						// TODO add conversion logic for rgb/hsv for each clip (if needed)


						// Lookup the correct imported clip based on the id stored on the clip object
						fragOutput = ap.clips[ap.register[clip.clipId]].fragmentMain + "\n";

						// Replace the standard GL color array with an internal one so that we can mix and merge, and then output to the standard when we are done
						fragOutput = fragOutput.replace(/gl_FragColor/g, "ap_rgbV4");
						fragOutput = fragOutput.replace(/gl_FragCoord/g, "ap_xyz");

						// Normalize into Vector3
						fragOutput += "ap_rgb2 = vec3(ap_rgbV4.r, ap_rgbV4.g, ap_rgbV4.b); \n"; // vec4 -> vec3
						fragOutput += "ap_rgb2 = max(min(ap_rgb2, vec3(1.0)), vec3(0.0)); \n";


						// ---------------------------

						// -- Clip mix & Fx / blend -- 

						if(firstMix){
							fragOutput += "ap_rgb = ap_rgb2; \n";
							firstMix = false;
							fragOutput += "ap_rgb = ap_rgb * (_clip_mix); \n";  // Clip mix for this shader

						}else{
							rgbTarget = "ap_rgb2";

							if(ap.clips[ap.register[clip.clipId]].fx){
								// Fx clip: mix the original with the result of fx
								fragOutput += "ap_rgb = mixT(ap_rgb, ap_rgb2, _clip_mix); \n";
							}else{
								// Blend in the shader with ongoing mix
								fragOutput += "ap_rgb2 = ap_rgb2 * (_clip_mix); \n";
								fragOutput += "ap_rgb = blend(ap_rgb2, ap_rgb, " + Math.floor(clip.blend) + ".); \n"; // Clip mix for this shader
							}

						}

						// ----------------------

						// Inject addressing for uniforms that are flagged (i.e. replace "_clip_mix" with "_1_1_1_mix")
						fragOutput = fragOutput.replace(/_clip_/g, clip.address + "_");

						// Merge the clip fragment shaders as we move along
						output += fragOutput;
					};
					
					output += "}else{ ap_rgb = vec3(0.0); }; \n"; // If the clips are not in this pod set color value to 0 }

				}
				
				//  -------------- Pod Mix --------------

				output += "ap_rgb = ap_rgb * (_pod_mix); \n";

				if(firstMixPod){
					firstMixPod = false;
					output += "ap_p = ap_rgb; \n";

				}else{
					// Blend in last pod with current pod, if it's not the first pod in this channel
					output += "ap_p = blend(ap_p, ap_rgb, " + Math.floor(pod.blend) + ".); \n";
				}

				output = output.replace(/_pod_/g, pod.address + "_") + "\n";
			};


				
			//  -------------- Channel Mix --------------

			output += "ap_p = ap_p * (_channel_mix); \n";

			if(firstMixChannel){
				firstMixChannel = false;
				output += "ap_c = ap_p; \n";

			}else{
				output += "ap_c = blend(ap_c, ap_p, 1.0); \n"; // Channels always blend using 'add'
			}

			output = output.replace(/_channel_/g, channel.address + "_") + "\n";
		};

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


		return new Shader(uniforms, output + "\n");

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

	// ************* Pod Positions ***********************

	setPodPos: function (podPositionId, podPositionObject) {
		this.podpositions[podPositionId-1] = podPositionObject;
	},

	getPodPos: function (podPositionId) {
		return this.podpositions[podPositionId-1];
	},

	clearPodPos: function (podPositionId) {
		delete this.podpositions[podPositionId-1]; // TODO optimize: most likely better to not use 'delete'
	},

	clearAllPodPos: function () {
		this.podpositions = [];
	}

}
