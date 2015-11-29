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
		load: PX.datguiJson,
		preset: 'ApHLineBar'
	});
	

	// -------Create some Channels/Pods/Clips----------



	// The list of state that the UI is representing (V) and setting (C)
	guiData  = {
		Channel1Mix:  1,
		
		S2Blend:  "LinearLight",
		S2ClipId:  PX.demoClipNames[5],
		S2Mix:  1,
		S2Scale:  0.7,
		S2HueTint:  1,

		S1Mix:  1,
		S1ClipId:  PX.demoClipNames[3],
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

		Speed: PX.speed,
		PointSize: 80,
		Hardware: PX.demoHardware[0]

	};

	// Add preset controls
	gui.remember(guiData);


	// =========Event listeners===============


	gui.add( guiData, "Channel1Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { PX.set("mix", v, 1);  });

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
	f2.add( guiData, 'S2ClipId', PX.demoClipNames).onChange(function (v) { uniformClipTypeChange(v, 1, 2, 1 ); });
	f2.add( guiData, "S2Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { PX.set("mix", v, 1, 2, 1);  });
	f2.add( guiData, "S2Scale", 0.1, 1.0, 1.0 )    .onChange(function (v) { PX.set("p1", v, 1, 2, 1);  });
	f2.add( guiData, "S2HueTint", 0.0, 1.0, 1.0 )  .onChange(function (v) { PX.set("p1", v, 1, 2, 2);  });
	f2.add( guiData, 'S2Blend', PX.BLENDS )        .onChange(function (v) { uniformBlendChange(v, 1, 2); });

	// Pod 1
	f3.add( guiData, 'S1ClipId', PX.demoClipNames).onChange(function (v) { uniformClipTypeChange(v, 1, 1, 1 ); });
	f3.add( guiData, "S1Mix", 0.0, 1.0, 1.0 )  .onChange(function (v) { PX.set("mix", v, 1, 1, 1);  });
	f3.add( guiData, "S1Scale", 0.1, 1.0, 1.0 )    .onChange(function (v) { PX.set("p1", v, 1, 1, 1);  });
	f3.add( guiData, "S1HueTint", 0.0, 1.0, 1.0 )  .onChange(function (v) { PX.set("p1", v, 1, 1, 2);  });

	// Post Fx
	f4.add( guiData, "Hue", 0.0, 1.0, 1.0 )    .onChange(function (v) { PX.set("p1", v, 2, 1, 1);  });
	f4.add( guiData, "HueClamp", 0.0, 1.0, 1.0 )   .onChange(function (v) { PX.set("p2", v, 2, 1, 1);  });
	f4.add( guiData, "Saturation", 0.0, 1.0, 1.0 ) .onChange(function (v) { PX.set("p3", v, 2, 1, 1);  });
	f4.add( guiData, "SatClamp", 0.0, 1.0, 1.0 )   .onChange(function (v) { PX.set("p4", v, 2, 1, 1);  });
	f4.add( guiData, "Smooth", 0.0, 0.98, 1.0 )    .onChange(function (v) { PX.set("p5", v, 2, 1, 1);  });
	f4.add( guiData, "PreAmp", 0.0, 1.0, 0.0 ) .onChange(function (v) { PX.set("p6", v, 2, 1, 1);  });



	//f4.add( guiData, "Threshold", 0.0, 1.0, 1.0 ).onChange(function (v) { PX.set("", 2, 1, 1);  });
	//f4.add( guiData, "Noise", 0.0, 1.0, 1.0 ).onChange(function (v) { PX.set("", 2, 1, 1);  });

	// Global Settings (temporary for demo)
	f5.add( guiData, 'Hardware', PX.demoHardware).onChange(function (v) {

		PX.ports.clearAllPorts();

		switch(v){
			case PX.demoHardware[0]:

				PX.channels.setPodPos(2, new PX.PodPosition({x: -190, y: 140, z: -1000, w: 1070, h: 575, d: 2000}));
				PX.hardware.importNodes(PX.imported, 1, 0, 0, 0);
				PX.pointSize = 10;
				break;
			case PX.demoHardware[1]:

				PX.channels.setPodPos(2, new PX.PodPosition({x: -339, y: 30, z: -1000, w: 1378, h: 738, d: 2000}));
				PX.hardware.addTestPortsGrid3(1, 0, 0);
				PX.pointSize = 18;
				break;

			case PX.demoHardware[2]:

				PX.channels.setPodPos(2, new PX.PodPosition({x: -190, y: 286, z: -1000, w: 1070, h: 242, d: 2000}));
				PX.hardware.addTestPortsGrid(1, 0, 0);
				PX.pointSize = 20;
				break;

			default: 
				PX.hardware.importNodes(PX.imported, 1, 0, 0, 0);
			break;
		}
		PX.updateNodePoints(); // only need to call this when we add nodes aftervit
		PX.updateShader();

	});
	f5.add( guiData, "Speed", 0.025, 0.4, 1.0 ).onChange(function (v) { PX.speed = v; });
	//f5.add( guiData, "PointSize", 45.0, 90.0, 1.0 ).onChange(function (v) { PX.pointMaterial.uniforms.u_pointSize.value = v;  });



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
		if(guiItem === PX.BLENDS[i]){
			PX.set("blend", (i+1) + ".", channel, pod, clip);
			return;
		}
	};
}