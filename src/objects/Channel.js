/*
*
* Channels are a mixable collection of Pods.
* Pods may also contain a set of Clips (shaders).
*
* @param name		String, Optional name.
* @param type		Int, pm.CHANNEL_TYPE_ADD or pm.CHANNEL_TYPE_FX.
* @param mix		Int, overall mix control for entire Channel.
* @param blend 		Int, 1-17 Blend modes specified in constants.
* @param pods 		Pods[], Array of Pod objects. Pods may also contain Clips.
*
*/

pm.Channel = function (params) {

	this.name = params.name;
	this.type = params.type 		|| pm.CHANNEL_TYPE_ADD;
	this.mix = params.mix 			|| 0;
	this.blend = params.blend 		|| pm.BLEND.Add;
	this.pods = params.pods 		|| [];

};