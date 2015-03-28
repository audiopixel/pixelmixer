/*
*
* Pod Positions define coordinates for Pods to associate with.
* Multiple Pods may associate to any amount of Pod Positions.
*
* We use a lightweight and manual version of matrix transforms for performance reasons since we are calling this every fragment. 
*
* @param x 			Number, the x coordinate of the pod.
* @param y 			Number, the y coordinate of the pod.
* @param z 			Number, the z coordinate of the pod.
* @param width 		Number, the width of the pod.
* @param height 	Number, the height of the pod.
* @param depth	 	Number, the depth of the pod.
* @param xt	 		Number, translate (offset) x coordinate of the content inside bounds of the pod.
* @param yt	 		Number, translate (offset) y coordinate of the content inside bounds of the pod.
* @param zt	 		Number, translate (offset) z coordinate of the content inside bounds of the pod.
* @param xs	 		Number, scale x coordinate of the content inside bounds of the pod.
* @param ys	 		Number, scale y coordinate of the content inside bounds of the pod.
* @param zs	 		Number, scale z coordinate of the content inside bounds of the pod.
* @param flipmode	Number, 0: normal, 1: swap x-y, 2: swap x-z, 3: swap y-z.
*
*/

PX.PodPosition = function (x, y, z, width, height, depth, xt, yt, zt, xs, ys, zs, flipmode) {

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