import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import DataApiMixin, { DataApi } from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

import MultirootEditorUI from './ui';
import MultirootEditorUIView from './view';
import { BalloonToolbar, EditorUIView } from '@ckeditor/ckeditor5-ui';
import { EditorWithUI } from '@ckeditor/ckeditor5-core/src/editor/editorwithui';
import { EditorUI } from '@ckeditor/ckeditor5-core';
import { modelToView, viewToModel } from '../../src/utils/mapping';
import { ModelElement, ModelRange, ViewElement } from '../../build/ckeditor';
import { getCustomAttribute } from '../../src/configure/configure';

/**
 * The multi-root editor implementation. It provides inline editables and a single toolbar.
 *
 * Unlike other editors, the toolbar is not rendered automatically and needs to be attached to the DOM manually.
 *
 * This type of an editor is dedicated to integrations which require a customized UI with an open
 * structure, allowing developers to specify the exact location of the interface.
 *
 * @mixes module:core/editor/utils/dataapimixin~DataApiMixin
 * @implements module:core/editor/editorwithui~EditorWithUI
 * @extends module:core/editor/editor~Editor
 */

class MultirootEditor extends Editor implements EditorWithUI, DataApi {
    container: HTMLElement
    ui: MultirootEditorUI

    /**
     * Creates an instance of the multi-root editor.
     *
     * **Note:** Do not use the constructor to create editor instances. Use the static `MultirootEditor.create()` method instead.
     *
     * @protected
     * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
     * for the created editor (on which the editor will be initialized).
     * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
     */
    utils = {
        getCustomAttribute: getCustomAttribute
    }
    
    constructor(editable, config) {
        super(config);

        const plugins = this.config.get('plugins');
        //plugins.push( BalloonToolbar );

        this.config.define('balloonToolbar', this.config.get('toolbar'));

        this.container = config.container;

        const uiView = new MultirootEditorUIView(this.locale, this.editing.view);
        this.ui = new MultirootEditorUI(this, uiView);

        for (var rootName in editable) {
            this.addRoot(rootName, editable[rootName].element)
        }
        

        // clear up placeholder
        var lastParent: ModelElement = null;
        var leftParents : ModelElement[] = [];

        this.editing.model.document.selection.on('change:range', (evt, oldRange, data) => {
            const start = this.editing.model.document.selection.getFirstRange().start;
            if (lastParent && lastParent.parent && lastParent.parent.is('element')) {
                leftParents.push(lastParent.parent);
            }
            if (start.parent.is('element')) {
                lastParent = start.parent;
            }
        }, { priority: 'highest' })

        this.editing.model.document.registerPostFixer((writer) => {
            const el = <ModelElement> this.editing.model.document.selection.getFirstRange().start.parent;
            var removingElements = [];
            if (leftParents.length) {
                leftParents.map((lastParent) => {
                    const children = Array.from(lastParent.getChildren());
                    for (const child of children) {
                        if (!child.is('element')) continue;

                        // check if selection is not in that element
                        var isSelectionIn = false;
                        for (var p = el; p; p = <ModelElement> p.parent) {
                            if (p == child) {
                                isSelectionIn = true;
                                break;
                            }
                        }

                        if (isSelectionIn) continue;

                        if (!removingElements.includes(child) &&
                            !child.is('rootElement') && 
                            (child.root.is('rootElement') && child.root.rootName != '$graveyard') &&
                            (this.editing.model.schema.isBlock(child) || child.name == 'caption') &&
                            !this.editing.model.schema.isObject(child) &&
                            (child.parent != child.root || children.length > 1) &&
                            !this.editing.model.hasContent(child, {
                                ignoreWhitespaces: true
                            })
                        ) {
                            removingElements.push(child)
                        }
                    }
                });

                if (removingElements.length) {
                    console.log("CLEAR", removingElements)
                    removingElements.map((change) => writer.remove(change));
                    return true;
                }
                leftParents = [];
            }
        })
    }

    getActiveRootNames(name) {
        return this.model.document.getRootNames().filter((name) => {
            const root = this.model.document.getRoot(name);
            return !root.getAttribute('hidden')
        })
    }

    addRoot(rootName: string, element: HTMLElement) {
        const root = this.model.document.createRoot('$root', rootName);
        this.model.document.fire('rootAdded', rootName, element, root)

    }

    setRootContent(rootName: string, content: string) {

        const root = this.model.document.getRoot(rootName);

        this.model.enqueueChange({ isUndoable: false }, writer => {
            writer.remove(writer.createRangeIn(root))
            writer.insert(
                this.data.parse(content, root), root, 0);
        });
    }

    removeRoot(rootName: string, element: HTMLElement) {
        this.model.change((writer) => {
            writer.setAttribute('hidden', true, this.model.document.getRoot(rootName))
        });

        this.model.document.fire('rootRemoved', rootName, element)
    }

    /**
     * @inheritDoc
     */
    destroy() {
        // Cache the data and editable DOM elements, then destroy.
        // It's safe to assume that the model->view conversion will not work after super.destroy(),
        // same as `ui.getEditableElement()` method will not return editables.
        const data = {};
        const editables = {};
        const editablesNames = Array.from(this.ui.getEditableElementsNames());

        for (const rootName of editablesNames) {
            data[rootName] = this.getData({ rootName });
            editables[rootName] = this.ui.getEditableElement(rootName);
        }

        this.ui.destroy();

        return super.destroy()
            .then(() => {
                for (const rootName of editablesNames) {
                    setDataInElement(editables[rootName], data[rootName]);
                }
            });
    }

    /**
     * Creates a multi-root editor instance.
     *
     * @param {Object.<String,HTMLElement>} sourceElements The list of DOM elements that will be the source
     * for the created editor (on which the editor will be initialized).
     * @param {module:core/editor/editorconfig~EditorConfig} config The editor configuration.
     * @returns {Promise} A promise resolved once the editor is ready. The promise returns the created multi-root editor instance.
     */
    static createRoots(sourceElements, config) {
        return new Promise(resolve => {
            const editor = new this(sourceElements, config);
            resolve(
                editor.initPlugins()
                    .then(() => editor.ui.init())
                    .then(() => editor.fire('ready'))
                    .then(() => editor)
            );
        });
    }

    setData = DataApiMixin.setData
    getData = DataApiMixin.getData
}


export default MultirootEditor;