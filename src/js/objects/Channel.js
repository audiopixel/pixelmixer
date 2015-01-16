
var Channel = function (name, type, mix, blend, pods) {

	this.name = name;
	this.type = type 		|| ap.CHANNEL_TYPE_BLEND;
	this.mix = mix 			|| 0;
	this.blend = blend 		|| ap.BLEND.Add;
	this.pods = pods 		|| [];

};

Channel.prototype = {

}
