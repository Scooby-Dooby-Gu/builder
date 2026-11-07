//@ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AppendCommand from './appendcommand';
import appendText from './appendtext.svg';
import appendContainer from './appendcontainer.svg';
import { ButtonView } from '@ckeditor/ckeditor5-ui';


export default class AppendPlugin extends Plugin {

    init() {
        this.editor.commands.add( 'appendParagraph', new AppendCommand( this.editor ) );

		this.editor.ui.componentFactory.add( 'appendText', locale => {
			const button = new ButtonView( locale );
			const appendCommand = this.editor.commands.get( 'AppendCommand' );

			button.set( {
				isEnabled: true,
				label: locale.t( 'Text' ),
				icon: appendText,
				tooltip: true,
			} );

			this.listenTo( button, 'execute', () => {
				this.editor.execute('appendElement', 'paragraph')
			} );

			return button;
		} );

		this.editor.ui.componentFactory.add( 'appendContainer', locale => {
			const button = new ButtonView( locale );
			const appendCommand = this.editor.commands.get( 'AppendCommand' );

			button.set( {
				isEnabled: true,
				label: locale.t( 'Container' ),
				icon: appendContainer,
				tooltip: true,
			} );

			this.listenTo( button, 'execute', () => {
				this.editor.execute('appendElement', 'container', {
					class: 'card',
				})
			} );

			return button;
		} );
    }
}