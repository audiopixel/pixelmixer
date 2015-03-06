
var PodPosition = function (x, y, z, width, height, depth, xt, yt, zt, xs, ys, zs, flipmode) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = width || 0;
	this.h = height || 0;
	this.d = depth || 0;

	this.xt = xt || 0.5;
	this.yt = yt || 0.5;
	this.zt = zt || 0.5;
	this.xs = xs || 0.5;
	this.ys = ys || 0.5;
	this.zs = zs || 0.5;
	this.flipmode = flipmode || 0;
};

PodPosition.prototype = {

};
