
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
	if (null === obj || "object" != typeof obj) return obj;
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
	for (var attrname2 in obj2) {
		if(obj2[attrname2]){ obj3[attrname2] = obj2[attrname2]; }
	}
	return obj3;
}

