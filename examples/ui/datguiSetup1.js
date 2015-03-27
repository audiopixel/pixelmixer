/*
*
* One possible way to use UI layer to control the API.
* 
* Webdemo setup
*
*/


function initUi(){

	var guiData;

	var gui = new dat.GUI({
		load: PMX.datguiJson,
		preset: 'ApHLineBar'
	});
	

	// -------Create some Channels/Pods/Clips----------


	// ** Channel 1

	var clip1 = new PMX.Clip({id: "LineCosSin"});
	var clipfx1 = new PMX.Clip({id: "TestFx", blend: PMX.BLEND.Fx});

	var clip2 = new PMX.Clip({id: "ColorSineBar"});
	var clipfx2 = new PMX.Clip({id: "TestFx", blend: PMX.BLEND.Fx});

	// Create two pods each with a content clip and a fx clip inside it
	var pods = [];
	pods[1] = new PMX.Pod({positionIds: [2], blend: PMX.BLEND.LinearLight, clips: [clip1, clipfx1]});
	pods[0] = new PMX.Pod({positionIds: [1], clips: [clip2, clipfx2]});

	// Add them both to the first channel
	var channel1 = new PMX.Channel({name: "TestChannel1", mix: 1, pods: pods});
	PMX.channels.setChannel(1, channel1);


	// ** Channel 2 - Post FX Channel
	
	var pods2 = [];
	var clipfx3 = new PMX.Clip({id: "HueFx", blend: PMX.BLEND.Fx});

	pods2[0] = new PMX.Pod({positionIds: [1], clips: [clipfx3]});

	var channel2 = new PMX.Channel({name: "Post FX1", type: PMX.CHANNEL_TYPE_FX, mix: 1, pods: pods2});
	PMX.channels.setChannel(2, channel2);



	// Tell the shader to update after we set some new state
	PMX.updateShader = true;

	// The list of state that the UI is representing (V) and setting (C)
	guiData  = {
		Channel1Mix:  1,
		
		S2Blend:  "LinearLight",
		S2ClipId:  PMX.demoClipNames[5],
		S2Mix:  1,
		S2Scale:  0.7,
		S2HueTint:  1,

		S1Mix:  1,
		S1ClipId:  PMX.demoClipNames[3],
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

		Speed: PMX.speed,
		PointSize: 80,
		Hardware: PMX.demoHardware[0]

	};

	// Add preset controls
	gui.remember(guiData);


	// =========Event listeners===============


	gui.add( guiData, "Channel1Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { PMX.set("mix", v, 1);  });

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

	// Pod 2
	f2.add( guiData, 'S2ClipId', PMX.demoClipNames).onChange(function (v) { uniformClipTypeChange(v, 1, 2, 1 ); });
	f2.add( guiData, "S2Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { PMX.set("mix", v, 1, 2, 1);  });
	f2.add( guiData, "S2Scale", 0.1, 1.0, 1.0 )    .onChange(function (v) { PMX.set("p1", v, 1, 2, 1);  });
	f2.add( guiData, "S2HueTint", 0.0, 1.0, 1.0 )  .onChange(function (v) { PMX.set("p1", v, 1, 2, 2);  });
	f2.add( guiData, 'S2Blend', PMX.BLENDS )        .onChange(function (v) { uniformBlendChange(v, 1, 2); });

	// Pod 1
	f3.add( guiData, 'S1ClipId', PMX.demoClipNames).onChange(function (v) { uniformClipTypeChange(v, 1, 1, 1 ); });
	f3.add( guiData, "S1Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { PMX.set("mix", v, 1, 1, 1);  });
	f3.add( guiData, "S1Scale", 0.1, 1.0, 1.0 )    .onChange(function (v) { PMX.set("p1", v, 1, 1, 1);  });
	f3.add( guiData, "S1HueTint", 0.0, 1.0, 1.0 )  .onChange(function (v) { PMX.set("p1", v, 1, 1, 2);  });

	// Post Fx
	f4.add( guiData, "Hue", 0.0, 1.0, 1.0 )    .onChange(function (v) { PMX.set("p1", v, 2, 1, 1);  });
	f4.add( guiData, "HueClamp", 0.0, 1.0, 1.0 )   .onChange(function (v) { PMX.set("p2", v, 2, 1, 1);  });
	f4.add( guiData, "Saturation", 0.0, 1.0, 1.0 ) .onChange(function (v) { PMX.set("p3", v, 2, 1, 1);  });
	f4.add( guiData, "SatClamp", 0.0, 1.0, 1.0 )   .onChange(function (v) { PMX.set("p4", v, 2, 1, 1);  });
	f4.add( guiData, "Smooth", 0.0, 0.98, 1.0 )    .onChange(function (v) { PMX.set("p5", v, 2, 1, 1);  });
	f4.add( guiData, "PreAmp", 0.0, 1.0, 0.0 ) .onChange(function (v) { PMX.set("p6", v, 2, 1, 1);  });



	//f4.add( guiData, "Threshold", 0.0, 1.0, 1.0 ).onChange(function (v) { PMX.set("", 2, 1, 1);  });
	//f4.add( guiData, "Noise", 0.0, 1.0, 1.0 ).onChange(function (v) { PMX.set("", 2, 1, 1);  });

	// Global Settings (temporary for demo)
	f5.add( guiData, 'Hardware', PMX.demoHardware).onChange(function (v) {

		PMX.ports.clearAllPorts();

		switch(v){
			case PMX.demoHardware[0]:

				PMX.channels.setPodPos(2, new PMX.PodPosition(-190, 140, -1000, 1070, 575, 2000));
				PMX.hardware.importNodes(PMX.imported, 1, 0, 0, 0);
				break;
			case PMX.demoHardware[1]:

				PMX.channels.setPodPos(2, new PMX.PodPosition(-339, 30, -1000, 1378, 738, 2000));
				PMX.hardware.addTestPortsGrid3(1, 0, 0);
				break;

			case PMX.demoHardware[2]:

				PMX.channels.setPodPos(2, new PMX.PodPosition(-190, 286, -1000, 1070, 242, 2000));
				PMX.hardware.addTestPortsGrid(1, 0, 0);
				break;

			default: 
				PMX.hardware.importNodes(PMX.imported, 1, 0, 0, 0);
			break;
		}
		PMX.updateNodePoints(); // only need to call this when we add nodes aftervit
		PMX.updateShader = true;

	});
	f5.add( guiData, "Speed", 0.025, 0.4, 1.0 ).onChange(function (v) { PMX.speed = v; });
	f5.add( guiData, "PointSize", 45.0, 90.0, 1.0 ).onChange(function (v) { PMX.pointMaterial.uniforms.u_pointSize.value = v;  });



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
		if(guiItem === PMX.BLENDS[i]){
			PMX.set("blend", (i+1) + ".", channel, pod, clip);
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
		clipId = PMX.clips[clipName];
	}

	var clipObj = new PMX.Clip({id: clipName});
	PMX.channels.setClip(channel, pod, clip, clipObj);

	PMX.updateShader = true;
}
