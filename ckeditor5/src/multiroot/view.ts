import EditorUIView from '@ckeditor/ckeditor5-ui/src/editorui/editoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import Template from '@ckeditor/ckeditor5-ui/src/template';

/**
 * The multi-root editor UI view. It is a virtual view providing an inline editable, but without
 * any specific arrangement of the components in the DOM.
 *
 * @extends module:ui/editorui/editoruiview~EditorUIView
 */
class MultirootEditorUIView extends EditorUIView {
    editable: InlineEditableUIView
    editables: InlineEditableUIView[]
    toolbar: ToolbarView
    editingView : EditorUIView

    /**
     * Creates an instance of the multi-root editor UI view.
     *
     * @param {module:utils/locale~Locale} locale The locale instance.
     * @param {module:engine/view/view~View} editingView The editing view instance this view is related to.
     * @param {Object.<String,HTMLElement>} editableElements The list of editable elements, containing name and html element
     * for each editable.
     */
    constructor( locale, editingView ) {
        super( locale );

        this.editingView = editingView

        /**
         * The editables of the multi-root editor UI.
         *
         * @readonly
         * @member {Array.<module:ui/editableui/inline/inlineeditableuiview~InlineEditableUIView>}
         */
        this.editables = [];
        this.editable = null;

    }

    addEditable(name, element) {
        const editable = new InlineEditableUIView( this.locale, this.editingView, element );
        editable.name = name;
        this.editables.push( editable );

        this.registerChild([editable])
    }

    removeEditable(name) {
        const editable = this.editables.find((e) => e.name == name);
        this.editables.splice(this.editables.indexOf(editable), 1);
        this.deregisterChild([editable])
    }

}

export default MultirootEditorUIView;