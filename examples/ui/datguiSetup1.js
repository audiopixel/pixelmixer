/*
*
* One possible View & Controller state of the MVC application
*
*/


function initUi(){

	var guiData;

	var gui = new dat.GUI({
		load: ap.datguiJson,
		preset: 'ApHLineBar'
	});
	

	// -------Temporary: Create some Channels/Pods/Clips for testing----------

	// Let's create some test channels for now (TODO: this should be loaded from current project settings)
	var mix = 1;
	var mix2 = 1;
	var pods = [];

	//pods[3] = new ap.Pod(1, mix, ap.BLEND.Add, [new ap.Clip(2, mix, ap.BLEND.Add), new ap.Clip(5, mix, ap.BLEND.Fx)]);
	//pods[2] = new ap.Pod(3, mix, ap.BLEND.Add, [new ap.Clip(3, mix2, ap.BLEND.Add), new ap.Clip(5, 1, ap.BLEND.Fx)]);
	pods[1] = new ap.Pod([2], mix, ap.BLEND.LinearLight, [new ap.Clip("LineCosSin", mix, ap.BLEND.Add), new ap.Clip("TestFx", 1, ap.BLEND.Fx)]);
	pods[0] = new ap.Pod([1], mix, ap.BLEND.Add, [new ap.Clip("ColorSineBar", mix2, ap.BLEND.Add), new ap.Clip("TestFx", 1, ap.BLEND.Fx)]);

	ap.channels.setChannel(1, new ap.Channel("TestChannel1", ap.CHANNEL_TYPE_BLEND, mix, ap.BLEND.Add, pods));


	var pods2 = [];
	pods2[0] = new ap.Pod([1], mix, ap.BLEND.Add, [new ap.Clip("HueFx", 1, ap.BLEND.Fx)]);

	ap.channels.setChannel(2, new ap.Channel("Post FX1", ap.CHANNEL_TYPE_FX, mix, ap.BLEND.Add, pods2));

	// Tell the shader to update after we set some new state
	ap.updateShader = true;


	// The list of state that the UI is representing (V) and setting (C)
	guiData  = {
		Channel1Mix:  1,
		/*
		S3Blend:  'Add',
		S3ClipId:  0,
		S3Mix:  1,
		S3Scale:  1,
		Hue3Mix:  1,
		*/
		S2Blend:  "LinearLight",
		S2ClipId:  ap.demoClipNames[5],
		S2Mix:  1,
		S2Scale:  0.7,
		S2HueTint:  1,

		S1Mix:  1,
		S1ClipId:  ap.demoClipNames[3],
		S1Scale:  0.7,
		S1HueTint:  1,

		Hue:  1,
		Saturation:  1,
		HueClamp:  1,
		SatClamp:  1,
		Smooth:  0.5,
		PreAmp:  1,
		//Threshold:  1,
		//Noise:  0,

		Speed: ap.speed,
		PointSize: 80,
		Hardware: ap.demoHardware[0]

	};

	// Add preset controls
	gui.remember(guiData);


	// =========Event listeners===============


	gui.add( guiData, "Channel1Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { ap.set("mix", v, 1);  });

	gui.add( { SnapToFront:function(){
		controls.reset();
		f2.close();
		f3.close();
		f5.close();
	} } ,'SnapToFront');

	//var f1 = gui.addFolder('Shader 1');       f1.open();
	var f2 = gui.addFolder('Shader 1');    //  f2.open();
	var f3 = gui.addFolder('Shader 2');    //  f3.open();
	var f4 = gui.addFolder('Post FX');         //  f4.open();
	var f5 = gui.addFolder('Settings');    //  f5.open();

	/*
	// Pod 3
	f1.add( guiData, 'S3Blend', ap.BLENDS )     .onChange(function () { uniformBlendChange( guiData.S3Blend, "_1_3"); });
	f1.add( guiData, 'S3ClipId', ap.demoClipNames).onChange(function () { uniformClipTypeChange( guiData.S3ClipId, 1, 3, 1 ); });
	f1.add( guiData, "S3Mix", 0.0, 1.0, 1.0 )   .onChange(function () { ap.set("", 1_3_1_mix.value = guiData.S3Mix; });
	f1.add( guiData, "S3Scale", 0.0, 1.0, 1.0 ) .onChange(function () { ap.set("", 1_3_1_p1.value = guiData.S3Scale; });
	f1.add( guiData, "Hue3Mix", 0.0, 1.0, 1.0 ) .onChange(function () { ap.set("", 1_3_2_p1.value = guiData.Hue3Mix; });
	*/
	// Pod 2
	f2.add( guiData, 'S2ClipId', ap.demoClipNames).onChange(function (v) { uniformClipTypeChange(v, 1, 2, 1 ); });
	f2.add( guiData, "S2Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { ap.set("mix", v, 1, 2, 1);  });
	f2.add( guiData, "S2Scale", 0.1, 1.0, 1.0 )    .onChange(function (v) { ap.set("p1", v, 1, 2, 1);  });
	f2.add( guiData, "S2HueTint", 0.0, 1.0, 1.0 )  .onChange(function (v) { ap.set("p1", v, 1, 2, 2);  });
	f2.add( guiData, 'S2Blend', ap.BLENDS )        .onChange(function (v) { uniformBlendChange(v, 1, 2); });

	// Pod 1
	f3.add( guiData, 'S1ClipId', ap.demoClipNames).onChange(function (v) { uniformClipTypeChange(v, 1, 1, 1 ); });
	f3.add( guiData, "S1Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { ap.set("mix", v, 1, 1, 1);  });
	f3.add( guiData, "S1Scale", 0.1, 1.0, 1.0 )    .onChange(function (v) { ap.set("p1", v, 1, 1, 1);  });
	f3.add( guiData, "S1HueTint", 0.0, 1.0, 1.0 )  .onChange(function (v) { ap.set("p1", v, 1, 1, 2);  });

	// Post Fx
	f4.add( guiData, "Hue", 0.0, 1.0, 1.0 )    .onChange(function (v) { ap.set("p1", v, 2, 1, 1);  });
	f4.add( guiData, "HueClamp", 0.0, 1.0, 1.0 )   .onChange(function (v) { ap.set("p2", v, 2, 1, 1);  });
	f4.add( guiData, "Saturation", 0.0, 1.0, 1.0 ) .onChange(function (v) { ap.set("p3", v, 2, 1, 1);  });
	f4.add( guiData, "SatClamp", 0.0, 1.0, 1.0 )   .onChange(function (v) { ap.set("p4", v, 2, 1, 1);  });
	f4.add( guiData, "Smooth", 0.0, 0.98, 1.0 )    .onChange(function (v) { ap.set("p5", v, 2, 1, 1);  });
	f4.add( guiData, "PreAmp", 0.0, 1.0, 0.0 ) .onChange(function (v) { ap.set("p6", v, 2, 1, 1);  });



	//f4.add( guiData, "Threshold", 0.0, 1.0, 1.0 ).onChange(function (v) { ap.set("", 2, 1, 1);  });
	//f4.add( guiData, "Noise", 0.0, 1.0, 1.0 ).onChange(function (v) { ap.set("", 2, 1, 1);  });

	// Global Settings (temporary for demo)
	f5.add( guiData, 'Hardware', ap.demoHardware).onChange(function (v) {

		ap.ports.clearAllPorts();

		switch(v){
			case ap.demoHardware[0]:

				ap.channels.setPodPos(2, new ap.PodPosition(-190, 140, -1000, 1070, 575, 2000));
				ap.hardware.importNodes(ap.imported, 1, 0, 0, 0);
				break;
			case ap.demoHardware[1]:

				ap.channels.setPodPos(2, new ap.PodPosition(-339, 30, -1000, 1378, 738, 2000));
				ap.hardware.addTestPortsGrid3(1, 0, 0);
				break;

			case ap.demoHardware[2]:

				ap.channels.setPodPos(2, new ap.PodPosition(-190, 286, -1000, 1070, 242, 2000));
				ap.hardware.addTestPortsGrid(1, 0, 0);
				break;


			default: 
				ap.hardware.importNodes(ap.imported, 1, 0, 0, 0);
			break;
		}
		ap.app.updateNodePoints(); // only need to call this when we add nodes aftervit
		ap.app.updateMainSourceShader();

		updateShader = true;

	});
	f5.add( guiData, "Speed", 0.025, 0.4, 1.0 ).onChange(function (v) { ap.speed = v; });
	f5.add( guiData, "PointSize", 45.0, 90.0, 1.0 ).onChange(function (v) { ap.pointMaterial.uniforms.u_pointSize.value = v;  });
	//f5.add( guiData, "PointSize", 45.0, 90.0, 1.0 ).onChange(function (v) { ap.set("pointSize");  });



	// Close folders on startup by default
	f2.close();
	f3.close();
	//f4.close();
	f5.close();

}

/*
* Trigger a blend change on a defined address
*/
function uniformBlendChange(guiItem, channel, pod, clip) { 
	for (var i = 0; i < 17; i++) {
		if(guiItem === ap.BLENDS[i]){
			ap.set("blend", (i+1) + ".", channel, pod, clip);
			return;
		}
	};
}


/*
* Trigger a clip type change - demo and testing for now // TODO dynamic UI listing
*/
function uniformClipTypeChange(clipName, channel, pod, clip) {

	var clipId = 0;

	if(clipName !== "OFF"){
		clipId = ap.clips[clipName];
	}

	ap.channels.setClip(channel, pod, clip, new ap.Clip(clipName + "", 1.0, ap.BLEND.Add));

	ap.updateShader = true;
}
