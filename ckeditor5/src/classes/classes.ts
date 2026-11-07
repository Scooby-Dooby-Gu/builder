// @ts-nocheck
import { ContextPlugin, Plugin } from "@ckeditor/ckeditor5-core";
import ClassesUI from "./classesui";
import ClassesCommand from "./classescommand";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";

export declare interface StyleGroupOption {
    class: string | null,
    title: string
}
export declare interface StyleGroup {
    icon: string,
    placeholder: string,
    optional: boolean,
    check: (context: ModelElement) => boolean
    options: StyleGroupOption[]
}
export declare interface StyleMode {
    commandName: string,
    commandValue: string
}


export default class Classes extends Plugin {
    static pluginName = 'Classes'
    
    static get requires() {
        return [ClassesUI]
    }

    init () {
		const editor = <EditorWithUI> this.editor;
        const groups = editor.config.get('classes');

        for (const key in groups) {
            const command =  new ClassesCommand(this.editor, key, groups[key])
            this.editor.commands.add('classes:' + key , command)
            // fixme
            this.editor.on('change:context', () =>command.refresh())
        }
    }


}
