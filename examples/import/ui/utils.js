
/*
* Trigger a clip type change - demo and testing for now // TODO dynamic UI listing
*/
function uniformClipTypeChange(clipName, channel, pod, clip) {

	var clipId = 0;

	if(clipName !== "OFF"){
		clipId = PX.clips[clipName];
	}

	var clipObj = new PX.Clip({id: clipName});
	PX.channels.setClip(channel, pod, clip, clipObj);

	PX.updateShader();
}
