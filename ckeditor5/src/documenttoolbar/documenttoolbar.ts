// @ts-nocheck
import { Plugin } from "@ckeditor/ckeditor5-core";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import { EditorUIView, normalizeToolbarConfig, ToolbarView, View } from "@ckeditor/ckeditor5-ui";

export default class DocumentToolbar extends Plugin {
    static pluginName = 'DocumentToolbar'
    
    toolbar: ToolbarView

    init() {
        const editor = (<EditorWithUI> this.editor);
        const view = (<EditorUIView> editor.ui.view);
        this.toolbar = new ToolbarView(editor.locale);
        this.toolbar.set('class', 'document')
		this.toolbar.fillFromConfig(
            normalizeToolbarConfig( editor.config.get( 'documentToolbar' ) ),
            editor.ui.componentFactory
        );
        this.toolbar.items.map((i) => i.set({tooltipPosition: 'sw'}))
        view.body.add(this.toolbar)
    }
}