import enableToolbarKeyboardFocus from '@ckeditor/ckeditor5-ui/src/toolbar/enabletoolbarkeyboardfocus';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { EditorUI } from '@ckeditor/ckeditor5-core';
import MultirootEditorUIView from './view';
import type MultirootEditor from './editor';
import { EditorWithUI } from '@ckeditor/ckeditor5-core/src/editor/editorwithui';

/**
 * The multi-root editor UI class.
 *
 * @extends module:core/editor/editorui~EditorUI
 */
class MultirootEditorUI extends EditorUI {
    view: MultirootEditorUIView
    lastFocusedEditableElement: HTMLElement
    editor: MultirootEditor

    /**
     * Creates an instance of the multi-root editor UI class.
     *
     * @param {module:core/editor/editor~Editor} editor The editor instance.
     * @param {module:ui/editorui/editoruiview~EditorUIView} view The view of the UI.
     */
    lastFocusedEditableName = null

    constructor(editor: MultirootEditor, view: MultirootEditorUIView) {
        super(editor);

        /**
         * The main (top–most) view of the editor UI.
         *
         * @readonly
         * @member {module:ui/editorui/editoruiview~EditorUIView} #view
         */
        this.view = view;

        const editingView = editor.editing.view;

        this.editor.model.document.on('rootRemoved', (evt, name) => {
            editor.editing.view.detachDomRoot(name);
            this.view.removeEditable(name);
        })

        this.editor.model.document.on('rootAdded', (evt, name, element, data) => {
            this.view.addEditable(name, element);

            const editable = this.view.editables.find((e) => e.name == name);

            // Register each editable UI view in the editor.
            this.setEditableElement(name, element);

            // Let the global focus tracker know that the editable UI element is focusable and
            // belongs to the editor. From now on, the focus tracker will sustain the editor focus
            // as long as the editable is focused (e.g. the user is typing).
            this.focusTracker.add(element);

            // Let the editable UI element respond to the changes in the global editor focus
            // tracker. It has been added to the same tracker a few lines above but, in reality, there are
            // many focusable areas in the editor, like balloons, toolbars or dropdowns and as long
            // as they have focus, the editable should act like it is focused too (although technically
            // it isn't), e.g. by setting the proper CSS class, visually announcing focus to the user.
            // Doing otherwise will result in editable focus styles disappearing, once e.g. the
            // toolbar gets focused.
            editable.bind('isFocused').to(this.focusTracker, 'isFocused', this.focusTracker, 'focusedElement',
                (isFocused, focusedElement) => {
                    // When the focus tracker is blurred, it means the focus moved out of the editor UI.
                    // No editable will maintain focus then.
                    if (!isFocused) {
                        return false;
                    }

                    // If the focus tracker says the editor UI is focused and currently focused element
                    // is the editable, then the editable should be visually marked as focused too.
                    if (focusedElement === element) {
                        return true;
                    }
                    // If the focus tracker says the editor UI is focused but the focused element is
                    // not an editable, it is possible that the editable is still (context–)focused.
                    // For instance, the focused element could be an input inside of a balloon attached
                    // to the content in the editable. In such case, the editable should remain _visually_
                    // focused even though technically the focus is somewhere else. The focus moved from
                    // the editable to the input but the focus context remained the same.
                    else {
                        return this.lastFocusedEditableElement === element;
                    }
                });

            // Bind the editable UI element to the editing view, making it an end– and entry–point
            // of the editor's engine. This is where the engine meets the UI.
            editingView.attachDomRoot(element, editable.name);

            this.initPlaceholder(name, element);
            this.editor.model.enqueueChange({isUndoable: false}, (w) => {
                w.setSelection(this.editor.model.document.getRoot(name), 'in')
            })
            
        })

    }

    /**
     * Initializes the UI.
     */
    init() {
        const view = this.view;
        const editor = this.editor;
        const editingView = editor.editing.view;


        view.render();

        // Keep track of the last focused editable element. Knowing which one was focused
        // is useful when the focus moves from editable to other UI components like balloons
        // (especially inputs) but the editable remains the "focus context" (e.g. link balloon
        // attached to a link in an editable). In this case, the editable should preserve visual
        // focus styles.
        this.focusTracker.on('change:focusedElement', (evt, name, focusedElement) => {
            for (const editable of this.view.editables) {
                if (editable.element === focusedElement) {
                    this.lastFocusedEditableName = editable.element.id;
                    this.view.editable = this.view.editables.find((e) => e.name == this.lastFocusedEditableName)
                    this.set('lastFocusedEditableElement', editable.element);
                }
            }
        });

        // If the focus tracker loses focus, stop tracking the last focused editable element.
        // Wherever the focus is restored, it will no longer be in the context of that editable
        // because the focus "came from the outside", as opposed to the focus moving from one element
        // to another withing the editor UI.
        this.focusTracker.on('change:isFocused', (evt, name, isFocused) => {
            if (!isFocused) {
                this.set('lastFocusedEditableElement', null);
            }
        });

        this.on('focusEditableForNode', (evt, node) => {
            const editableElement = this.editor.ui.getEditableElement(node.root.rootName);
            if (editableElement != this.lastFocusedEditableElement) {
                editableElement.focus();
            }
        })

        this.on('change:lastFocusedEditableElement', (evt, prop, element, old) => {
            if (old) {
                old.parentNode.parentNode.classList.remove('ck-current')
            }
            if (element) {
                element.parentNode.parentNode.classList.add('ck-current')
            }
            
        })
        this.fire('ready');
    }

    getEditableElement(name = this.lastFocusedEditableName || this.editor.model.document.getRootNames()[0]) {
        return super.getEditableElement(name);
    }

    /**
     * @inheritDoc
     */
    destroy() {
        const view = this.view;

        view.destroy();
        super.destroy();
    }

    initPlaceholder(name, element, placeholderText = null) {
        enablePlaceholder({
            view: this.editor.editing.view,
            element: this.editor.editing.view.document.getRoot(name),
            text: element.getAttribute('placeholder') || '',
            isDirectHost: false,
            keepOnFocus: true
        });
    }
}

export default MultirootEditorUI;