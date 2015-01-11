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

	},

	addTestNode: function () {


		nodeShaderMaterial = new THREE.ShaderMaterial( {

			//uniforms:       uniforms,
			//attributes:     attributes,
			vertexShader:   document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragment_shader_pass_1' ).textContent,

			depthTest:      false,
			transparent:    true

		});


		this.nodeGeo = new THREE.Geometry();

		for ( e = 0; e < 12; e ++ ) {
			for ( i = 0; i < 12; i ++ ) { 

				var vertex = new THREE.Vector3();

				vertex.x = e * 2;
				vertex.y = i * 2; 

				this.nodeGeo.vertices.push( vertex );
			}
		}

		var vertex = new THREE.Vector3();
		this.nodeGeo.vertices.push( vertex );


		this.nodeMesh = new THREE.PointCloud( this.nodeGeo, nodeShaderMaterial );
		this.nodeMesh.sortParticles = true;
		this.nodeMesh.name = 'ApNodes';


		//this.nodeGeo.vertices.push( vertex );
		//this.nodeMesh.geometry.verticesNeedUpdate = true;

		this.editor.addObject( this.nodeMesh );
		this.editor.select( this.nodeMesh );

	}

}
