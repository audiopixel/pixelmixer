/*
 * ************* CHANNEL MANAGER *************** 
 * Handles the state of all Channels running in the Universe.
 * Channels may contain Pods, which may contain Clips (structured shaders).
 *
 */

var ChannelManager = function () {

	this.channels = [];

	/*

	// TODO

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

		var mix = 1;

		// Let's create some test clips and for now (TODO: this should be loaded from current project settings or channel preset)
		var clips = [new Clip(1, mix, ap.BLEND.Add)];

		// Let's create some test pods for now (TODO: this should be loaded from current project settings or channel preset)
		var pods = [new Pod(1, mix, ap.BLEND.Add, clips)];

		// Let's create some test channels for now (TODO: this should be loaded from current project settings)
		this.channels[0] = new Channel("TestChannel", ap.CHANNEL_TYPE_BLEND, mix, ap.BLEND.Add, pods);

		//console.log(this.generateSourceShader());

	},

	update: function () {


	},

	generateSourceShader: function () {

		uniforms = {};
		output = "";

		var address;
		for (var i = 0; i < this.channels.length; i++) {
			var channel = this.channels[i];
			channel.address = "_" + (i+1);

			// uniform 'mix' for the channel
			uniforms[channel.address + "_mix"] = { type: "f", value: channel.mix }; // TODO modulation uniforms 


			for (var e = 0; e < channel.pods.length; e++) {
				var pod = channel.pods[e];
				pod.address = channel.address + "_" + (e+1);

				// uniforms 'mix' & 'blend' for the pod
				uniforms[pod.address + "_mix"] = { type: "f", value: pod.mix }; // TODO modulation uniforms 
				uniforms[pod.address + "_blend"] = { type: "f", value: pod.blend };

				// TODO pull pod position data and add as baked in snippets
				

				for (var u = 0; u < pod.clips.length; u++) {
					var clip = pod.clips[u];
					clip.address = pod.address + "_" + (u+1);

					// uniforms 'mix' & 'blend' for the clip
					uniforms[clip.address + "_mix"] = { type: "f", value: clip.mix }; // TODO modulation uniforms 
					uniforms[clip.address + "_blend"] = { type: "f", value: clip.blend }; 

					// TODO 'clip params as well as xyz offset/scale ', as well as modulation values for each
					// TODO add conversion logic for rgb/hsv for each clip (if needed)


					// Lookup the correct imported clip based on the id stored on the clip object
					var fragOutput = ap.clips[ap.register[clip.clipId]].fragmentShader;

					// Inject addressing for uniforms that are flagged with "__". (i.e. replace with "-1-1-1_")
					fragOutput = fragOutput.replace("__", clip.address + "_");

					// Merge the clip fragment shaders as we move along
					output += fragOutput;
				};
			};
		};





		/*
		// TODO

		-for each channel
				
			*uniforms: mix, blend (i.e, -1_mix)

			-for each pod
				
				*uniforms: mix, blend (i.e, -1-1_mix)
				snippets: pod position data from position group

				-for each clip

					*uniforms: params, properties, mix, blend, clip pos offset/scale
					grab shader snippet
					replace '__p1' with '-1-1-1_p1' (address data)

		*/

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


		return new Shader(uniforms, output);

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
	}

}
