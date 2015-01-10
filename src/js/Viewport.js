/**
 * @author mrdoob / http://mrdoob.com/ (original author)
 * @author hepp / http://audiopixel.com/ (refactored by)
 *
 * Based on the Three.js Editor's Viewport
 * Additional logic and viewing capabilities added for AudioPixel
 *
 */

var Viewport = function ( ap ) {

	var signals = ap.editor.signals;

	var container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new Viewport.Info( ap.editor ) );

	var scene = ap.editor.scene;
	var sceneHelpers = ap.editor.sceneHelpers;

	var objects = [];

	// helpers

	var grid = new THREE.GridHelper( 500, 25 );
	sceneHelpers.add( grid );

	//

	var camera = ap.editor.camera;
	camera.position.fromArray( ap.editor.config.getKey( 'camera/position' ) );
	camera.lookAt( new THREE.Vector3().fromArray( ap.editor.config.getKey( 'camera/target' ) ) );

	//

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			if ( ap.editor.helpers[ object.id ] !== undefined ) {

				ap.editor.helpers[ object.id ].update();

			}

		}

		render();

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		signals.objectChanged.dispatch( transformControls.object );
		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );


	// object picking

	var raycaster = new THREE.Raycaster();

	// events

	var getIntersects = function ( point, object ) {

		var vector = new THREE.Vector3();
		vector.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1, 0.5 );
		vector.unproject( camera );

		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

		if ( object instanceof Array ) {

			return raycaster.intersectObjects( object );

		}

		return raycaster.intersectObject( object );

	};

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	var getMousePosition = function ( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	};

	var handleClick = function () {

		if ( onDownPosition.distanceTo( onUpPosition ) == 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					ap.editor.select( object.userData.object );

				} else {

					ap.editor.select( object );

				}

			} else {

				ap.editor.select( null );

			}

			render();

		}

	};

	var onMouseDown = function ( event ) {

		event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	};

	var onMouseUp = function ( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	};

	var onTouchStart = function ( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	};

	var onTouchEnd = function ( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	};

	var onDoubleClick = function ( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	};

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.center.fromArray( ap.editor.config.getKey( 'camera/target' ) );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.cameraChanged.dispatch( camera );

	} );

	// signals

	signals.themeChanged.add( function ( value ) {

		switch ( value ) {

			case 'css/light.css':
				grid.setColors( 0x444444, 0x888888 );
				clearColor = 0xaaaaaa;
				break;
			case 'css/dark.css':
				grid.setColors( 0xbbbbbb, 0x888888 );
				clearColor = 0x222222;
				break;

		}

		renderer.setClearColor( clearColor );

		render();

	} );

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	var saveTimeout;

	signals.cameraChanged.add( function () {

		if ( saveTimeout !== undefined ) {

			clearTimeout( saveTimeout );

		}

		/*

		saveTimeout = setTimeout( function () {

			ap.editor.config.setKey(
				'camera/position', camera.position.toArray(),
				'camera/target', controls.center.toArray()
			);

		}, 1000 );*/

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null ) {

			if ( object.geometry !== undefined &&
				 object instanceof THREE.Sprite === false ) {

				selectionBox.update( object );
				selectionBox.visible = true;

			}

			if ( object instanceof THREE.PerspectiveCamera === false ) {

				transformControls.attach( object );

			}

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( render );

	signals.objectAdded.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.push( child );

		} );

	} );

	signals.objectChanged.add( function ( object ) {

		transformControls.update();

		if ( object !== camera ) {

			if ( object.geometry !== undefined ) {

				selectionBox.update( object );

			}

			if ( ap.editor.helpers[ object.id ] !== undefined ) {

				ap.editor.helpers[ object.id ].update();

			}

		}

		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		var materialsNeedUpdate = false;

		object.traverse( function ( child ) {

			if ( child instanceof THREE.Light ) materialsNeedUpdate = true;

			objects.splice( objects.indexOf( child ), 1 );

		} );

	} );

	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );

	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.windowResize.add( function () {

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

	var animations = [];

	signals.playAnimation.add( function ( animation ) {

		animations.push( animation );

	} );

	signals.stopAnimation.add( function ( animation ) {

		var index = animations.indexOf( animation );

		if ( index !== -1 ) {

			animations.splice( index, 1 );

		}

	} );

	//

	var createRenderer = function ( type, antialias ) {

		if ( type === 'WebGLRenderer' && System.support.webgl === false ) {

			type = 'CanvasRenderer';

		}

		var renderer = new THREE[ type ]( { antialias: antialias } );
		renderer.autoClear = false;
		renderer.autoUpdateScene = false;

		return renderer;

	};

	var clearColor;
	var renderer = createRenderer( ap.editor.config.getKey( 'renderer' ), ap.editor.config.getKey( 'renderer/antialias' ) );
	container.dom.appendChild( renderer.domElement );

	//


	// Update logic triggered through platform
	ap.signals.moduleUpdate.add( function () {

		//animate(); // not needed to update everyframe since it's updated per operation

	} );


	function animate() {

		// animations

		if ( THREE.AnimationHandler.animations.length > 0 ) {

			THREE.AnimationHandler.update( 0.016 );

			for ( var i = 0, l = sceneHelpers.children.length; i < l; i ++ ) {

				var helper = sceneHelpers.children[ i ];

				if ( helper instanceof THREE.SkeletonHelper ) {

					helper.update();

				}

			}

			render();

		}

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		renderer.render( scene, camera );

		renderer.render( sceneHelpers, camera );

	}

	return container;

}
