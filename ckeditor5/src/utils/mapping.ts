import type { Editor } from "@ckeditor/ckeditor5-core";
import type { default as ModelElement }  from '@ckeditor/ckeditor5-engine/src/model/element';
import type { default as ModelDocument }  from '@ckeditor/ckeditor5-engine/src/model/document';
import type { default as ViewElement }  from '@ckeditor/ckeditor5-engine/src/view/element';

export function viewToDOM(editor: Editor, view: ViewElement) {
    return editor.editing.view.domConverter.mapViewToDom(view)
}
export function DOMToView(editor: Editor, element: HTMLElement, tryParent = true) : ViewElement | null{
    // @ts-ignore htmlelement type is incorrect resolved to ModelELement
    if (tryParent == false) {
        return (editor.editing.view.domConverter['_domToViewMapping']).get(element) || null
    }
    // @ts-ignore htmlelement type is incorrect resolved to ModelELement
    return editor.editing.view.domConverter.mapDomToView(element) || null
}

export function modelToDOMElement(editor: Editor, model: ModelElement | ModelDocument) {
    if (model && (<ModelDocument> model).getRoot) {
        return editor.config.get('container');;
    }
    return viewToDOMElement(editor, editor.editing.mapper.toViewElement(<ModelElement> model));
}

export function modelToView(editor: Editor, model: ModelElement) {
    return editor.editing.mapper.toViewElement(model);
}

export function viewToModel(editor: Editor, view: ViewElement, allowInline: boolean = false) {
    for (var v = view; v; v = <ViewElement> v.parent) {
        const model = editor.editing.mapper.toModelElement(v);
        if (model && (allowInline || !editor.model.schema.isInline(model))) {
            return model;
        }
    }
}
export function viewToModelContext(editor: Editor, view: ViewElement) {
    // allow plugins to provide their own logic
    const model = editor.editing.mapper.fire('viewToModelContext', view);
    if (model) {
        return model;
    }
    for (var v = view; v; v = <ViewElement> v.parent) {
        const model = editor.editing.mapper.toModelElement(v);
        if (model && (!editor.model.schema.isInline(model))) {
            return model;
        }
    }
}

export function viewToDOMElement(editor: Editor, view: ViewElement): HTMLElement | null {
    const fragment = viewToDOM(editor, view);
    if (fragment && fragment.nodeType == 1) {
        return <HTMLElement>fragment;
    }
    return null;
}
