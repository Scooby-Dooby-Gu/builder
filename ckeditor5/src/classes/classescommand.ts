import { Command, Editor } from "@ckeditor/ckeditor5-core";
import { getContextModel } from "../utils/getters";
import { StyleGroup } from "./classes";

export default class ClassesCommand extends Command {
    key: string
    group: StyleGroup

    constructor(editor : Editor, key: string, group: StyleGroup) {
        super(editor)
        this.key = key;
        this.group = group;
    }

    refresh() {
        const context = getContextModel(this.editor);
        const isEnabled = context && this.group.check(context);
        this.set('isEnabled', isEnabled)
        if (context) {
            const className = context.getAttribute('class');
            const classes = className ? String(className).split(/\s+/g).filter(Boolean) : []
            const option = this.group.options.find((o) => classes.includes(o.class))
            var value =  isEnabled && option && option.class || null;
        }
        this.set('value', value || null)
    }

    execute(value) {
        const context = getContextModel(this.editor);
        if (!context) return;
        const className = context.getAttribute('class');
        const oldClasses = className ? String(className).split(/\s+/g).filter(Boolean) : []
        const newClasses = oldClasses.filter((c) => {
            return !this.group.options.find((o) => o.class == c)
        }).concat(value ? value : []).join(' ')
        this.editor.model.change((writer) => {
            writer.setAttribute('class', newClasses || null, context)
        })
    }
}