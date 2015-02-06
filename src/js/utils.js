
function getVariableTypeFromShorthand(shorthand){
	var type;
	switch ( shorthand ) {
		case "i": type = "int"; break;
		case "f": type = "float"; break;
		case "t": type = "sampler2D"; break;
		case "v2": type = "vec2"; break;
		case "v3": type = "vec3"; break;
		case "v4": type = "vec4"; break;
		// TODO add 'matrix' and 'array support'
	}
	return type;
}

/*
* Returns a cloned an object.
* @param	The object to clone.
* http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
*/
function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
 */
function merge(obj1, obj2){
	var obj3 = {};
	for (var attrname in obj1) {
		if(obj1[attrname]){ obj3[attrname] = obj1[attrname]; }
	}
	for (var attrname in obj2) {
		if(obj2[attrname]){ obj3[attrname] = obj2[attrname]; }
	}
	return obj3;
}


// ******************************************************************************************
// ******************************************************************************************

/*
* AP Specific: Trigger a blend change on ap.app.material based on a defined address
*/
function uniformBlendChange(guiItem, address) { 
	var blend = 1.0;
	if(guiItem === ap.BLENDS[0]){       blend = 1.0;
	}else if(guiItem === ap.BLENDS[1]){ blend = 2.0; 
	}else if(guiItem === ap.BLENDS[2]){ blend = 3.0; 
	}else if(guiItem === ap.BLENDS[3]){ blend = 4.0; 
	}else if(guiItem === ap.BLENDS[4]){ blend = 5.0;
	}else if(guiItem === ap.BLENDS[5]){ blend = 6.0;
	}else if(guiItem === ap.BLENDS[6]){ blend = 7.0; 
	}else if(guiItem === ap.BLENDS[7]){ blend = 8.0;
	}else if(guiItem === ap.BLENDS[8]){ blend = 9.0;
	}else if(guiItem === ap.BLENDS[9]){ blend = 10.0;
	}else if(guiItem === ap.BLENDS[10]){ blend = 11.0;
	}else if(guiItem === ap.BLENDS[11]){ blend = 12.0;
	}else if(guiItem === ap.BLENDS[12]){ blend = 13.0;
	}else if(guiItem === ap.BLENDS[13]){ blend = 14.0;
	}else if(guiItem === ap.BLENDS[14]){ blend = 15.0;
	}else if(guiItem === ap.BLENDS[15]){ blend = 16.0;
	}else if(guiItem === ap.BLENDS[16]){ blend = 17.0;
	}
	ap.app.material.uniforms[address + "_blend"].value = blend;
}


/*
* AP Specific: Trigger a clip type change - demo and testing for now // TODO dynamic UI listing
*/
function uniformClipTypeChange(clipId, channel, pod, clip) {

	ap.channels.setClip(channel, pod, clip, new Clip(clipId, 1.0, ap.BLEND.Add));

	updateShader = true;
}
