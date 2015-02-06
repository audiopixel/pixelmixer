
var Pod = function (positionId, mix, blend, clips, hardwareGroupMode, hardwareGroupIds) {

	this.positionId = positionId || 1;
	this.mix = mix || 0;
	this.blend = blend || ap.BLEND.Add;
	this.clips = clips || [];
	this.hardwareGroupMode = hardwareGroupMode || ap.HARDWAREGROUP_OFF;			// Off, Exclude, or Solo Mode
	this.hardwareGroupIds = hardwareGroupIds || [];
};

Pod.prototype = {

}
