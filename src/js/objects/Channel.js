/*
*
* Channels are a mixable collection of Pods.
* Pods may also contain a set of Clips (shaders).
*
*/

ap.Channel = function (name, type, mix, blend, pods) {

	this.name = name;
	this.type = type 		|| ap.CHANNEL_TYPE_BLEND;
	this.mix = mix 			|| 0;
	this.blend = blend 		|| ap.BLEND.Add;
	this.pods = pods 		|| [];

};

ap.Channel.prototype = {

};
