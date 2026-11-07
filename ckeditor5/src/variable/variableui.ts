import { EditorWithUI } from '@ckeditor/ckeditor5-core/src/editor/editorwithui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { BalloonPanelView, ButtonView, View } from '@ckeditor/ckeditor5-ui';

//@ts-ignore
import variableSvg from './icons/variable.svg';
import { ReactView } from '../../src/utils/react';

export default class VariableUI extends Plugin {
	view: ReactView

	static pluginName = 'VariableUI'

    init() {
        const editor = <EditorWithUI> this.editor;

        // moveme
        BalloonPanelView.defaultPositions.northArrowSouth =  BalloonPanelView.defaultPositions.southArrowNorth
        BalloonPanelView.defaultPositions.northArrowSouthWest =  BalloonPanelView.defaultPositions.southArrowNorth
        BalloonPanelView.defaultPositions.northArrowSouthEast =  BalloonPanelView.defaultPositions.southArrowNorth
        BalloonPanelView.defaultPositions.northArrowSouth =  BalloonPanelView.defaultPositions.southArrowNorth
        BalloonPanelView.defaultPositions['viewportStickyNorth'] =  BalloonPanelView.defaultPositions.southArrowNorth

		const widgetTypeAroundPlugin = editor.plugins.get( 'WidgetTypeAround' );
		// Disable the WidgetTypeAround plugin.
		widgetTypeAroundPlugin.forceDisabled( 'MyApplication' );
        
        this.view = new ReactView(this.editor.locale, (element) => {
            return this.editor.config.get('render').configureVariable(element, this.editor, {isOpen: true})
        });
		

		editor.ui.componentFactory.add('insertVariable', locale => {
			const button = new ButtonView(locale);
			const duplicateCommand = editor.commands.get('InsertVariableCommand');

			button.set({
				isEnabled: true,
				label: locale.t('Text variable'),
				icon: variableSvg,
				tooltip: true,
			});

			this.listenTo(button, 'execute', () => {
				editor.execute('insertVariable')
			});

			return button;
		});

    }
}