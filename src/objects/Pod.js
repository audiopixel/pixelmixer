/*
*
* Pods contain position and blend data for a group of Clips.
* They allow you to blend multiple Clips, and then blend the result into other Clips.
* They can be associated with multiple position areas.
*
*/

ap.Pod = function (positionIds, mix, blend, clips, hardwareGroupMode, hardwareGroupIds) {

	this.positionIds = positionIds || [];
	this.mix = mix || 0;
	this.blend = blend || ap.BLEND.Add;
	this.clips = clips || [];
	this.hardwareGroupMode = hardwareGroupMode || ap.HARDWAREGROUP_OFF;			// Off, Exclude, or Solo Mode
	this.hardwareGroupIds = hardwareGroupIds || [];
};

ap.Pod.prototype = {

};
