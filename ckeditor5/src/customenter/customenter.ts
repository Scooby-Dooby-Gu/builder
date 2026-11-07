import { Plugin } from "@ckeditor/ckeditor5-core";
import ModelTreeWalker from "@ckeditor/ckeditor5-engine/src/model/treewalker";
import Editor, { ModelElement } from "build/ckeditor";
import { getCopyOnEnterAttributes } from '@ckeditor/ckeditor5-enter/src/utils';
import { keyCodes, env } from 'ckeditor5/src/utils';

function splitBlock( writer, splitPos ) {
	writer.split( splitPos );
	writer.setSelection( splitPos.parent.nextSibling, 0 );
}


function handleBackspace(editor: Editor) {
    const walker = new ModelTreeWalker({
        startPosition: editor.model.document.selection.getFirstRange().start,
        direction: 'backward'
    })
    // needs to be at the start of the element
    if (walker.next()?.value.type == 'elementStart') {
        const {item, nextPosition} = walker.next()?.value || {};
        if (item && item.is('element') && editor.model.schema.isLimit(item)) {
            editor.model.change((writer) => {
                // hitting backspace at the start of the first block of a container
                // create paragraph before container
                const paragraph = writer.createElement('paragraph');
                writer.insert(paragraph, nextPosition, 'before');
                writer.setSelection(paragraph, 0);

                // if that block was empty, and the only one in container, 
                // remove the container it
                if (Array.from(item.getChildren()).length == 1
                && !editor.model.hasContent(<ModelElement> item.getChild(0), {
                    ignoreMarkers: true,
                    ignoreWhitespaces: true
                })) {
                    writer.remove(item);
                }
            })
            return true;
        }
    }
}

function handleDelete(editor: Editor) {
    const walker = new ModelTreeWalker({
        startPosition: editor.model.document.selection.getFirstRange().start,
        direction: 'forward'
    })
    // needs to be at the end of the element
    if (walker.next()?.value.type == 'elementEnd') {
        const {item, nextPosition} = walker.next()?.value || {};
        if (item && item.is('element') && editor.model.schema.isLimit(item)) {
            editor.model.change((writer) => {
                // hitting delete in the empty block of an empty container
                // removes the container
                if (!editor.model.hasContent(<ModelElement> item.getChild(0))) {
                    writer.setSelection(nextPosition);
                    writer.remove(item);
                    return true;
                }
            })
        }
    }
}

export default class CustomEnter extends Plugin {
    static pluginName = 'CustomEnter'

    init() {
        const editor = <Editor> this.editor;
		const viewDocument = this.editor.editing.view.document;

        // Modifier+delete/backspace removes context element
        this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			const hasBackspacePressed = data.domEvent.keyCode === keyCodes.backspace;
            const doc = this.editor.model.document;
            if ((data.domEvent.metaKey || data.domEvent.ctrlKey || data.domEvent.altKey || data.domEvent.shiftKey)) {
                if (!editor.context.is('rootElement')) {
                    editor.model.change((writer) => {
                        const context = editor.context;
                        const next = context.previousSibling || context.nextSibling || context.parent
                        writer.remove(editor.context);
                        writer.setSelection(writer.createPositionAt(next, 0));
                        editor.execute('setContext', next, true);
                    })
                    data.preventDefault();
                    evt.stop();
                }
            } else {
                if (doc.selection.isCollapsed) {
                    if (hasBackspacePressed ? handleBackspace(editor) : handleDelete(editor)) {
                        data.preventDefault();
                        evt.stop();
                    }
                }
            }
        //@ts-ignore
        }, { priority: 'highest', context: '$capture' } )

		// If Enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			const doc = this.editor.model.document;
			const positionParent = doc.selection.getLastPosition().parent;
            const isAtStart = doc.selection.isCollapsed && doc.selection.getFirstRange().start.offset == 0;
            const parentModel = <ModelElement> positionParent.parent;

            if (positionParent.is('element')) {
                const selectedItems = Array.from(doc.selection.getFirstRange().getItems())
                const selectedObject = selectedItems[0];
                // when inside image, jump to caption initially
                if (selectedItems.length == 1 && selectedObject.is('element', 'imageBlock')){
                    this.editor.model.change((writer) => {
                        if (!selectedObject.getChild(0)) {
                            writer.setSelection(writer.createRangeOn(selectedObject));
                            this.editor.execute( 'toggleImageCaption' );
                        }
                        writer.setSelection(<ModelElement> selectedObject.getChild(0), 0);
                    })
                // when in caption create paragraph after
                } else if (positionParent.name == 'caption') {
                    this.editor.model.change((writer) => {
                        const paragraph = writer.createElement('paragraph');
                        writer.insert(paragraph, parentModel, 'after');
                        writer.setSelection(paragraph, 0);
                    })
                    
                // override splitting logic
                } else if (isAtStart && positionParent.name != 'listItem') {
                    // when cursor is at the beginning of a block,
                    // create a new paragraph before it
                    if (editor.model.hasContent(positionParent, {
                        ignoreMarkers: true,
                        ignoreWhitespaces: true
                    })) {
                        this.editor.model.change((writer) => {
                            const paragraph = writer.createElement('paragraph');
                            writer.insert(paragraph, positionParent, 'before');
                            writer.setSelection(paragraph, 0);
                        })
                    // when hitting enter inside last block of a container that is empty
                    // move block outside 
                    } else if (editor.model.schema.isLimit(parentModel) 
                    && !positionParent.nextSibling
                    && !parentModel.is('rootElement')){
                        this.editor.model.change((writer) => {
                            writer.move(
                                writer.createRangeOn(positionParent), 
                                writer.createPositionAfter(parentModel)
                            )
                        })
                    } else {
                        const walker = new ModelTreeWalker({
                            startPosition: this.editor.model.document.selection.getFirstRange().start,
                            direction: 'forward'
                        })
                        if (walker.next()?.value.type == 'elementEnd') {
                            const {item, nextPosition} = walker.next()?.value || {};
                            if (item && item.is('element') 
                            && editor.model.schema.isLimit(item) 
                            && !editor.model.schema.isObject(item)) {
                                this.editor.model.change((writer) => {
                                    // hitting enter in empty block following by the start of a container
                                    // create paragraph inside container
                                    const paragraph = writer.createElement('paragraph');
                                    writer.insert(paragraph, nextPosition, 'after');
                                    writer.setSelection(paragraph, 0);
                                })
                            }
                        }

                        // dont allow hitting enter inside empty blocks
                    }
                    
                // fall back to default logic
                } else {
                    return;
                }

                data.preventDefault();
                evt.stop();
            }
		}, { priority: 'high' } );



    }
}