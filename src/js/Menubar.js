/**
 * @author mrdoob / http://mrdoob.com/
 */

var Menubar = function ( ap ) {

	var container = new UI.Panel();
	container.setId( 'menubar' );

	container.add( new Menubar.File( ap.editor ) );
	container.add( new Menubar.Edit( ap.editor ) );
	container.add( new Menubar.Add( ap.editor ) );


	return container;

};
