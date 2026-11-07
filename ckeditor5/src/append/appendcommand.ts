//@ts-nocheck
import Command from '@ckeditor/ckeditor5-core/src/command';
import { getContextModel } from '../utils/getters';

export default class AppendPlugin extends Command {
    execute(element = getContextModel(this.editor), ...args) {

        this.editor.model.change(writer => {
            const model = writer.createElement(...args);
            this.editor.model.insertContent(model,
                writer.createPositionAt(element, 'end'))

            const newPosition = writer.createPositionAt(model, 'end');
            const newRange = writer.createRange(newPosition);
            writer.setSelection(newRange, 0)
        });
    }
}
