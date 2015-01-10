/*
* Editor Controller
* 
* Support for adding in PointClouds and Planes
* That apply AudioPixel textures
*
*/

var EditorController = function ( ap ) {

	this.ap = ap;
	this.editor = this.ap.editor;

	this.meshCount = 0;

};

EditorController.prototype = {

	addTestPlane: function () {

		var width = 200;
		var height = 200;

		var widthSegments = 1;
		var heightSegments = 1;

		var geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );
		var material = new THREE.MeshPhongMaterial();
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'ApPlane ' + ( ++ this.meshCount );

		this.editor.addObject( mesh );
		this.editor.select( mesh );

	}

}
