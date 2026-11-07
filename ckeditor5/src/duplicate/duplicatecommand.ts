//@ts-nocheck
import Command from '@ckeditor/ckeditor5-core/src/command';
import { getContextModel } from '../utils/getters';

export default class DuplicatePlugin extends Command {
    execute(element = getContextModel(this.editor)) {
        this.editor.model.change( writer => {
            const copy = writer.cloneElement(element, true );;
            this.editor.model.insertContent(copy, this.editor.model.createPositionAt(element, 'before'))
        } );
    }
}
