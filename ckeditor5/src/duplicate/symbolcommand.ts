//@ts-nocheck
import Command from '@ckeditor/ckeditor5-core/src/command';
import { getContextModel } from '../utils/getters';

export default class SymbolPlugin extends Command {
    execute(element = getContextModel(this.editor)) {
        this.editor.model.change( writer => {
            const symbol = element.getAttribute('symbol-id') || String(Math.random());
            if (!element.getAttribute('symbol-id'))
                writer.setAttribute('symbol-id', symbol, element)
            const copy = writer.cloneElement(element, true );;
            writer.setAttribute('symbol-ref', symbol, copy)
            writer.removeAttribute('symbol-id', copy)
            writer.insert(copy, element, 'after')
        } );
    }
}
