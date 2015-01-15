/*
 * ************* POD MANAGER *************** 
 * Handles the state of all Pods running in the universe
 * Pods are organized in Channels, and may contain a clips
 *
 */

var PodManager = function () {

	/*

	// TODO

	--hold state:
	---------------------------------------

	any number of pod objects
		id
		address info: channel, pod
		position group id (that this pod references position data from)
		any number of clip objects
			address info: clip
			clip id
			param values
			mod values

	any number of position group objects (each pod must point to one of these)
		id
		position data: xyz, whd


	--responsibilites:
	---------------------------------------

	main responsibility is to provide shader snippets with pod and clip data
		this is re-generated to shader anytime a pod/channel gets added or deleted, or position or address change

	when in editor mode, show all the pod position groups, record any changes


	*/

};

PodManager.prototype = {

	init: function () {


	},

	update: function () {


	}

}
