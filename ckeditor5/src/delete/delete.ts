//@ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DeleteCommand from './deletecommand';
import deleteSvg from './delete.svg';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Command } from '@ckeditor/ckeditor5-core';



export default class DeletePlugin extends Plugin {
	command : Command
    init() {
		this.command = new DeleteCommand( this.editor );
        this.editor.commands.add( 'deleteElement',this.command );
		this.editor.keystrokes.set( 'Alt+Backspace', (evt, cancel) => {
			this.editor.execute('deleteElement' )
			cancel();
		}, {priority: 'highest'});

		this.editor.on('change:context', () => this.command.refresh())
			
		this.editor.ui.componentFactory.add( 'deleteElement', locale => {
			const button = new ButtonView( locale );

			button.set( {
				isEnabled: true,
				label: locale.t( 'Delete element' ),
				icon: deleteSvg,
				tooltip: true,
				//keystroke: 'Alt+Backspace',
			} );

			button.bind('label').to(this.command, 'isRoot', (r) => r ? locale.t('Delete variant') : locale.t('Delete element'))
			button.bind('isEnabled').to(this.command, 'isEnabled')
			
			
			this.listenTo( button, 'execute', () => {
				this.editor.execute('deleteElement')
			} );

			return button;
		} );
    }
}