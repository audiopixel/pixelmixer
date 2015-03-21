/*
*
* Clips are a internal harness used for each shader.
*
* @param id 		String, name of the shader "SinSpiral".
* @param mix 		Float, 0-1.
* @param blend 		Int, 1-17 Blend modes specified in constants.
* @param posMap 	Int, Position xyz map, default is normal.
* @param speed 		Float, 1 is normal, 0 is no motion.
* @param p1-p9 		Float, assignable uniforms per shader.
*
*/

ap.Clip = function (params) {

	this.id = params.id;
	this.mix = params.mix 			|| 1;
	this.blend = params.blend 		|| ap.BLEND.Add;
	this.posMap = params.posMap 	|| ap.MAP_NORMAL;
	this.speed = params.speed 		|| 1;

	this.p1 = params.p1 || 0;
	this.p2 = params.p2 || 0;
	this.p3 = params.p3 || 0;
	this.p4 = params.p4 || 0;
	this.p5 = params.p5 || 0;
	this.p6 = params.p6 || 0;
	this.p7 = params.p7 || 0;
	this.p8 = params.p8 || 0;
	this.p9 = params.p9 || 0;
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
