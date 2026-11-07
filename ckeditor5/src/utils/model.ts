import { Editor } from "@ckeditor/ckeditor5-core";
import { ModelElement, RootElement } from "build/ckeditor";

export function walkModel(element : ModelElement, callback : (element : ModelElement) => void) {
    callback(element);
    for (const child of element.getChildren()) {
        if (child.is('element')) {
            walkModel(child, callback);
        }
    }
}

export function isModelNotDeleted(model : ModelElement) {
    return model.isAttached() && (<RootElement> model.root).rootName != '$graveyard';
}