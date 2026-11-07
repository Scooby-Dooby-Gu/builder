// @ts-nocheck
import { icons, Plugin } from "@ckeditor/ckeditor5-core";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { Model, createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { StyleGroup, StyleMode, StyleGroupOption } from "./classes";

export default class ClassesUI extends Plugin {
    static pluginName = 'ClassesUI'    

    init() {
		const editor = <EditorWithUI> this.editor;
        const groups = editor.config.get('classes');

        for (const key in groups) {
            this.defineGroup(key, groups[key])
        }
    }

    defineGroup(key: string, group: StyleGroup) {

		const editor = <EditorWithUI> this.editor;
		const t = editor.t;
		const options = []
		const defaultTitle = t( 'Choose heading' );
		const dropdownTooltip = t( 'Heading' );

		// Register UI component.
		editor.ui.componentFactory.add( 'classes:' + key, locale => {
			const titles = {};
			const itemDefinitions = new Collection();

			const classesCommand = editor.commands.get( 'classes:' + key );

			
             for ( const option of group.options ) {
				const def = {
					type: 'button',
					model: new Model( {
						label: option.title,
						class: option.class,
						withText: true
					} )
				};

                def.model.bind( 'isOn' ).to( classesCommand, 'value', value => value === option.class );
                def.model.set({
                    commandName: 'classes:' + key,
                    commandValue: option.class
                });

				itemDefinitions.add( def );

                if (option.class)
                    titles[ option.class ] = option.title;
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, itemDefinitions );

			dropdownView.buttonView.set( {
				isOn: false,
				withText: !group.optional,
                icon: group.icon,
                toolbar: false
//				tooltip: dropdownTooltip
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-heading-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( classesCommand, 'isEnabled');
			dropdownView.buttonView.bind( 'label' ).to( classesCommand, 'value', ( value : string ) => {
				return titles[ value ] || group.placeholder;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute(evt.source.commandName , evt.source.commandValue ? evt.source.commandValue : undefined );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
    }
}
