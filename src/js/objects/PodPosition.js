
var PodPosition = function (x, y, z, width, height, depth, transform) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	this.w = width || 0;
	this.h = height || 0;
	this.d = depth || 0;
	this.transform = transform || [];
};

PodPosition.prototype = {

};
