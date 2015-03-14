/*
*
* Clips are an internal harness for each shader.
*
*/

ap.Clip = function (clipId, mix, blend, posMap, speed) {

	this.clipId = clipId;
	this.mix = mix 			|| 0;
	this.blend = blend 		|| ap.BLEND.Add;
	this.posMap = posMap 	|| ap.MAP_NORMAL;
	this.speed = speed 		|| 1;

	this.p1 = 0;
	this.p2 = 0;
	this.p3 = 0;
	this.p4 = 0;
	this.p5 = 0;
	this.p6 = 0;
	this.p7 = 0;
	this.p8 = 0;
	this.p9 = 0;
};

ap.Clip.prototype = {

	setParams: function (p1, p2, p3, p4, p5, p6, p7, p8, p9) {
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
		this.p4 = p4;
		this.p5 = p5;
		this.p6 = p6;
		this.p7 = p7;
		this.p8 = p8;
		this.p9 = p9;
	}

};
