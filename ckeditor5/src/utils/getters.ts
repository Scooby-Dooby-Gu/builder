// @ts-nocheck
import { Editor } from "@ckeditor/ckeditor5-core";
import type { default as ModelElement }  from '@ckeditor/ckeditor5-engine/src/model/element';
export function getContextModel(editor: Editor) : ModelElement {
    return editor.context;
}