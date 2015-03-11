
ap.Clip = function (clipId, mix, blend, speed) {

	this.clipId = clipId;
	this.mix = mix 			|| 0;
	this.blend = blend 		|| ap.BLEND.Add;
	this.speed = speed 		|| 1;

};

ap.Clip.prototype = {

};
