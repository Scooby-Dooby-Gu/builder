//@ts-nocheck
import Command from '@ckeditor/ckeditor5-core/src/command';
import next from 'next';
import { getContextModel } from '../utils/getters';

export default class DeleteElementCommand extends Command {
    execute(element = getContextModel(this.editor)) {
        if (this.isRoot) {
            this.editor.removeRoot(element.rootName)
        } else {
            const next = element.previousSibling || element.nextSibling || element.parent
            this.editor.model.change(writer => {
                   writer.remove(element);
                   //this.editor.model.enqueueChange((writer) => {
                        writer.setSelection(
                            next,
                            0
                        )
                        this.refresh()
                   //})
            });
        }
    }

    refresh() {
        const context = getContextModel(this.editor);
        this.set('isEnabled', true);
        this.set('isRoot', context && context.rootName);
    }
}