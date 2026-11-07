import { ReactElement, useCallback, useEffect, useState } from "react";
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

import Editor, { ModelElement, ViewElement } from 'ckeditor5-custom-build';
import EditorWatchdog from '@ckeditor/ckeditor5-watchdog/src/editorwatchdog';
import * as ReactDOM from 'react-dom/client'
import { useAppDispatch, useAppSelector } from "store/hooks";
import { setContextEditableName, setContextPath, setIsFocused, setStatus, setFocusedEditableName, setDocumentVersion, moveVariant, deleteVariant } from "store/slices/builderSlice";
import { AppProviders } from "pages/_app";
import { cleanCollectionBit, getLastPathBit } from "./Configure";
import ConfigureContext from "./ConfigureContext";
import { ComponentVariant } from "models/builder";



const watchdog = new EditorWatchdog();

watchdog.setCreator((elementOrData, editorConfig) => {
    return Editor
        .createRoots(elementOrData, editorConfig)
        .then((editor) => {
            editor['watchdog'] = watchdog;

            editorConfig.setEditor(editor);

            editor.ui.on('change:lastFocusedEditableElement', (evt, name, focusedElement) => {
                if (focusedElement) {
                    editorConfig.dispatch(setFocusedEditableName(focusedElement.id));
                    editorConfig.dispatch(setIsFocused(true));
                } else {
                    editorConfig.dispatch(setIsFocused(false));
                }
            })
            editor.model.document.on('change:data', (evt, batch) => {
                const op = batch.operations.find((operation) => {
                    // detect inserted blocks and containers
                    return Array.from(operation.nodes || []).find((node : ModelElement) => {
                        return !node.is('$text')
                    }) ||
                        operation.type == 'split' ||
                        operation.type == 'move' ||
                        operation.type == 'rename' ||
                        operation.type == 'remove'
                })
                if (op) {
                    editorConfig.dispatch(setDocumentVersion())
                }
            });
            editor.on('change:context', (evt, name, context) => {
                if (!context) return;
                editorConfig.dispatch(setContextPath(context.getPath()))
                editorConfig.dispatch(setContextEditableName(context.root.rootName))
            })
            editorConfig.dispatch(setStatus('initialized'))
            //CKEditorInspector.attach(editor);
            setTimeout(() => {
                editorConfig.dispatch(setStatus('ready'))
            }, 50)

            return editor;
        })
});

export function useEditorValue(editorObject, key) {
    const [value, setValue] = useState(editorObject[key]);

    useEffect(() => {
        const onChange = (evt, name, newValue) => {
            return setValue(newValue);
        };
        editorObject.on('change:' + key, onChange);
        return () => {
            editorObject.off('change:' + key, onChange);
        }
    }, [editorObject, key]);

    return value;
}

function renderEditorComponent(Component, parentProps?) {
    var root;
    return (element: HTMLElement, editor: Editor, props: any) => {
        if (!root) {
            if (!editor.ui.focusTracker['_elements'].has( element ))
                editor.ui.focusTracker.add(element);
            root = ReactDOM.createRoot(element);
        }

        root.render(
            <AppProviders>
                <Component editor={editor} {...parentProps} {...props} />
            </AppProviders>);

        return () => {
            editor.ui.focusTracker.remove(element);
            root.unmount();
        }
        
    }
}


export default function EditorWatchdogComponent({ node, editor, variants, setEditor } : { editor: Editor, node: HTMLElement, variants: ComponentVariant[], setEditor: any}) {
    const builderStatus = useAppSelector((state) => state.builder.status);
    const focusedEditableName = useAppSelector((state) => state.builder.focusedEditableName);
    const datasources = useAppSelector((state) => state.datasources);
    const isDataDisplayed = useAppSelector((state) => state.builder.isDataDisplayed);
    const isDataRepeated = useAppSelector((state) => state.builder.isDataRepeated);
  
    const dispatch = useAppDispatch()

    // initialize editor watchdog that captures crashes
    useEffect(() => {
        if (node) {
            dispatch(setStatus('starting'));

            watchdog.create({}, {
                container: node,
                setEditor,
                dispatch,
                // pass react components factories
                render: {
                    configureElement: renderEditorComponent(ConfigureContext, { type: 'element'}),
                    configureVariable: renderEditorComponent(ConfigureContext, { type: 'variable'})
                }
            })

        }
    }, [node, dispatch, setEditor]);

    // destroy editor when component is unloaded
    useEffect(() => {
        console.log('Editor init')
        if (!editor) return;
        return () => {
            editor.destroy();
        }
    }, [editor]);

    // pass options from UI to editor
    useEffect(() => {
        if (editor) {
            editor.plugins.get('Preview').set('isDataRepeated', isDataRepeated);
            editor.plugins.get('Preview').set('isDataDisplayed', isDataDisplayed);
        }
    }, [editor, isDataDisplayed, isDataRepeated])


    // hand down variants to the editor, each variant creates editable root
    useEffect(() => {
        if (node && editor) {
            editor.model.enqueueChange({isUndoable: false}, () => {
                const roots = editor.model.document.getRootNames();
                for (var variant of variants) {
                    if (roots.indexOf(variant.id) == -1) {
                        const element = node.querySelector<HTMLElement> (`[id="${variant.id}"]`);
                        editor.addRoot(variant.id, element)
                        const content = variant.content.replace(/(<[^>]+)style=("[^"]+")([^>]*>)/g, '$1__style=$2 style=$2$3');
                        editor.setRootContent(variant.id, content)
                    }
                    editor.model.document.getRoot(variant.id)['data'] = variant
                }
            })
        }
    }, [node, editor, variants])

    // pass datasource updates to editor
    useEffect(() => {
        if (editor) {
            editor.set('datasources', datasources);
        }
    }, [editor, datasources])

    // sync variant drag & drop back to the store
    useEffect(() => {
        const onVariantMoved = (evt, [rootName, beforeName]) => {
            dispatch(moveVariant({variant: rootName, before: beforeName }))
        }
    
        const onVariantRemoved = (evt, rootName) => {
            dispatch(deleteVariant(rootName));
        }

        if (editor) {
          editor.on('rootMoved', onVariantMoved)
          editor.on('rootRemoved', onVariantRemoved)
          return () => {
            editor.off('rootMoved', onVariantMoved)
            editor.off('rootRemoved', onVariantRemoved)
          }
        }
    }, [editor, dispatch])

/*
    useEffect(() => {
        if (editor && builderStatus == 'initialized' && editor.ui.view && editor.ui.view.getEditable) {
            if (focusedEditableName) {
                editor.execute('focusEditableForNode', editor.ui.view.getEditable(focusedEditableName))
            }
        }
    }, [editor, focusedEditableName, builderStatus]) */
}