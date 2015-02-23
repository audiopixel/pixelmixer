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

		this.numChannels = 1;
		this.numPods = 2;
		this.numClips = 2;

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
									srcClip.update("_"+(i+1)+"_"+(e+1)+"_"+(u+1), ap.app.material.uniforms);
								}
							}
						}
					}
				}
			}
		}
	},
	generateSourceShader: function () {

		var variables = {};
		var fragmentFunctions = {};
		var fragmentFunctionOutput = "";
		var output = "";
		var fragOutput = "";
		var masterFunction = "";

		
		var uniforms = {};

		// ** Allocate pod and clip uniforms per channel

		for (var i = 0; i < this.numChannels; i++) {
			var channel_addy = "_"+(i+1);

			uniforms[channel_addy + "_mix"] = { type: "f", value: 0 };

			for (var e = 0; e < this.numPods; e++) {
				var pod_addy = channel_addy+"_"+(e+1);

				uniforms[pod_addy + "_mix"] = { type: "f", value: 0 };
				uniforms[pod_addy + "_blend"] = { type: "f", value: 0 };
				uniforms[pod_addy + "_posid"] = { type: "i", value: 0, length: 10 };
				uniforms[pod_addy + "_groupid"] = { type: "i", value: 0, length: 10 };
				uniforms[pod_addy + "_groupmode"] = { type: "i", value: 0 };

				for (var o = 0; o < this.numClips; o++) {
					var clip_addy = pod_addy+"_"+(o+1);

					uniforms[clip_addy + "_mix"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_blend"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_clipid"] = { type: "i", value: 0 };
					uniforms[clip_addy + "_p1"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_p2"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_p3"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_p4"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_p5"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_p6"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_f1"] = { type: "f", value: 0 };
					uniforms[clip_addy + "_f2"] = { type: "f", value: 0 };
				}
			}
		}
/*
		// Testing some defaults
		uniforms["_1_mix"].value = 1;

		uniforms["_1_1_mix"].value = 1;
		uniforms["_1_1_blend"].value = -1;
		uniforms["_1_1_posid"].value = [1];


		uniforms["_1_1_1_clipid"].value = 3;
		uniforms["_1_1_1_mix"].value = 1;
		uniforms["_1_1_1_blend"].value = 1;
*/



		// ** Create the masterFunction() function

		// Load the entire clip collection into the master function
		for (var clip in ap.register) {

			var shader = ap.clips[ap.register[clip]];
			if(shader.fragmentFunctions){
				for (var i = 0; i < shader.fragmentFunctions.length; i++) {

					// TODO check if we already have the name and value for the function (dupe check)
					fragmentFunctionOutput += shader.fragmentFunctions[i] + "\n";
				}
			}
			masterFunction += "else if(id == " + shader.id + "){\n";
			masterFunction += shader.fragmentMain.replace("gl_FragColor", "returnColor"); + "\n";
			masterFunction = masterFunction.replace(/gl_FragCoord/g, "ap_xyz"); + "\n";
			masterFunction += "}\n";
			masterFunction += "////////\n";

		}
		masterFunction = masterFunction.slice(5, masterFunction.length); // cut the first 'else' out 
		masterFunction = "vec4 returnColor = vec4(0.,0.,0.,0.); \n" + masterFunction;
		masterFunction += "return max(min(returnColor, vec4(1.0)), vec4(0.0)); \n";
		masterFunction = "vec4 masterFunction(int id, vec3 _fxIn, float _p1, float _p2, float _p3, float _p4, float _p5, float _p6) { \n" + masterFunction + "}\n";
		
		fragmentFunctionOutput += masterFunction;



		// ** Create the getPodPos() function

		masterFunction = "";
		for (var i = 0; i < this.podpositions.length; i++) {
			masterFunction += "else if(posid == " + (i+1) + "){\n";
			masterFunction += "returnPos = vec3("+this.podpositions[i].x+","+this.podpositions[i].y+","+this.podpositions[i].z+");\n";
			masterFunction += "}\n";
		}
		masterFunction = masterFunction.slice(5, masterFunction.length); // cut the first 'else' out 
		masterFunction = "vec3 returnPos = vec3(0.,0.,0.); \n" + masterFunction;
		masterFunction += "return returnPos; \n";
		masterFunction = "vec3 getPodPos(int posid) { \n" + masterFunction + "}\n";

		fragmentFunctionOutput += masterFunction;



		// ** Create the getPodSize() function

		masterFunction = "";
		for (var i = 0; i < this.podpositions.length; i++) {
			masterFunction += "else if(posid == " + (i+1) + "){\n";
			masterFunction += "returnSize = vec3("+this.podpositions[i].w+","+this.podpositions[i].h+","+this.podpositions[i].d+");\n";
			masterFunction += "}\n";
		}
		masterFunction = masterFunction.slice(5, masterFunction.length); // cut the first 'else' out 
		masterFunction = "vec3 returnSize = vec3(0.,0.,0.); \n" + masterFunction;
		masterFunction += "return returnSize; \n";
		masterFunction = "vec3 getPodSize(int posid) { \n" + masterFunction + "}\n";

		fragmentFunctionOutput += masterFunction;


		// ** Mix and blend
		for (var i = 0; i < this.numChannels; i++) {
			var channel_addy = "_"+(i+1);
			output += "ap_p = vec3(0.); \n";

			for (var e = 0; e < this.numPods; e++) {
				var pod_addy = channel_addy+"_"+(e+1);
				output += "///////--------POD----/\n";
				output += "ap_rgb = vec3(0.); \n";
				output += "first = 0; \n";

				// TODO loop all the pod's pos groups
				// TODO add z depth
				output += "ap_xyzT = getPodPos("+ pod_addy +"_posid[0]); \n"; 
				output += "ap_xyz.x = ap_xyz2.x - ap_xyzT.x; \n";
				output += "ap_xyz.y = ap_xyz2.y - ap_xyzT.y; \n";
				output += "ap_xyzT2 = getPodSize("+ pod_addy +"_posid[0]); \n"; 

				output += "if(ap_xyz2.x >= ap_xyzT.x && ap_xyz2.y >= ap_xyzT.y  && ap_xyz2.z >= ap_xyzT.z && ap_xyz2.x <= ap_xyzT2.x + ap_xyzT.x && ap_xyz2.y <= ap_xyzT2.y + ap_xyzT.y && ap_xyz2.z <= ap_xyzT2.z + ap_xyzT.z) { \n";
				
					output += "resolution = vec2(ap_xyzT2.x, ap_xyzT2.y); \n";

					for (var o = 0; o < this.numClips; o++) {
						var clip_addy = pod_addy+"_"+(o+1);

						output += "///// CLIP ///\n";

						output += "ap_t = ap_p;\n";
						output += "if(first > 0){\n";
							output += "ap_t = ap_rgb;\n";
						output += "}\n";

						output += "if("+ clip_addy +"_clipid > 0){\n";
							output += "ap_rgb2 = vec3(masterFunction("+ clip_addy +"_clipid, ap_t, "+clip_addy+"_p1, "+clip_addy+"_p2, "+clip_addy+"_p3, "+clip_addy+"_p4, "+clip_addy+"_p5, "+clip_addy+"_p6));";
							
							output += "if("+ clip_addy +"_blend > 0.){\n";
								output += "ap_rgb2 = ap_rgb2 * ("+ clip_addy +"_mix);\n";
								output += "ap_rgb = blend(ap_rgb, ap_rgb2, "+ clip_addy +"_blend);\n";
							output += "}else{\n";
								output += "ap_rgb = mix(ap_rgb, ap_rgb2, "+ clip_addy +"_mix);\n";
							output += "}\n";

							output += "first++;\n";
						//output += "}else{\n";
							//output += "ap_rgb = vec3(0.);\n";
						output += "}\n";
					}

					output += "if("+ pod_addy +"_blend > 0.){\n";

						output += "ap_rgb2 = ap_rgb * ("+ pod_addy +"_mix); \n";
						output += "ap_p = blend(ap_p, ap_rgb2, "+ pod_addy +"_blend);\n";
					output += "}else{\n";
						output += "ap_p = mix(ap_p, ap_rgb2, "+ pod_addy +"_mix);\n"; // fx
					output += "}\n";

					output += "ap_p = max(min(ap_p, vec3(1.0)), vec3(0.0)); \n";

				output += "}\n";
			}
			output += "ap_p = ap_p * ("+ channel_addy +"_mix); \n";
			output += "ap_c = blend(ap_c, ap_p, 1.0);\n";
		}

		//console.log(fragmentFunctionOutput);
		//console.log(uniforms);
		//console.log(output);



		return new Shader(uniforms, fragmentFunctionOutput, output + "\n");

	},


	// ************* Channels ***********************

	setChannel: function (channelId, channelObj) {
		if(this.channels[channelId-1]){
			console.log("!switching out channel");
		}else{
			console.log("!new channel");


			this.channelToUniforms(channelId, channelObj);

		}
		this.channels[channelId-1] = channelObj;

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
	},


	// ************* Uniforms ***********************

	channelToUniforms: function (channel, channelObj) {

		var addy = "_"+channel+"_";
		this.setUniform(addy, "mix", channelObj.mix);

		var i=1;
		for (var pod in channelObj.pods) {
			this.podToUniforms(channel, i, channelObj.pods[pod]);
			i++;
		};

	},

	podToUniforms: function (channel, pod, podObj) {

		var addy = "_"+channel+"_"+pod+"_";
		this.setUniform(addy, "mix", podObj.mix);
		this.setUniform(addy, "blend", podObj.blend);
		this.setUniform(addy, "posid", podObj.positionId);
		this.setUniform(addy, "groupid", podObj.hardwareGroupIds);
		this.setUniform(addy, "groupmode", podObj.hardwareGroupMode);

		var i=1;
		for (var clip in podObj.clips) {
			this.clipToUniforms(channel, pod, i, podObj.clips[clip]);
			i++;
		};

	},

	clipToUniforms: function (channel, pod, clip, clipObj) {
		var addy = "_"+channel+"_"+pod+"_"+clip+"_";
		this.setUniform(addy, "clipid", clipObj.clipId);
		this.setUniform(addy, "mix", clipObj.mix);
		this.setUniform(addy, "blend", clipObj.blend);

		//console.log(addy +  "blend: " + clipObj.blend);
	},

	setUniform: function (addy, uniform, value) {
		ap.app.material.uniforms[addy + uniform].value = value;
	},
	getUniform: function (addy, uniform) {
		return ap.app.material.uniforms[addy + uniform].value;
	}
};

