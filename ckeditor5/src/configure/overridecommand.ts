import { Command } from "@ckeditor/ckeditor5-core"
import { ModelElement, ModelText } from "build/ckeditor";
import { cleanCollectionBit, getHumanizedLabel } from "../preview/preview";

function isDefaultPlaceholder (context: ModelElement) {
    return context.getAttribute('data-path-placeholder') == 'Click to edit'
    || (context.getAttribute('data-path') && 
        context.getAttribute('data-path-placeholder') == getHumanizedLabel(context.getAttribute('data-path')))
}

export default class OverrideCommand extends Command {
    
    execute(attribute, value, context : ModelElement = this.editor['context']) {
        this.editor.model.change((writer) => {
            if (attribute == 'linkHref') {
                writer.setSelection(writer.createRangeOn(context), 0)
                this.editor.execute('link', value || null)
                return;
            } else if (attribute == 'data-child-caption') {
                if (context.name == 'imageBlock') {
                    if (!context.getChild(0)) {
                        writer.setSelection(writer.createRangeOn(context));
                        this.editor.execute( 'toggleImageCaption' );
                    }
                    context = <ModelElement> context.getChild(0);
                } else {
                //    throw new Error('Caption can only be set on block images')
                }
                if (value == '' || value == null) {
                    writer.remove(context);
                } else {
                    writer.remove(writer.createRangeIn(context));
                    writer.insertText(value, context);
                    writer.setSelection(writer.createSelection(context, 'end'))
                }
            } else if (attribute == 'hidden') {
                value = !!value ? true : null;
            }
            if (value != null) {
                writer.setAttribute(attribute, value, context);
            } else {
                writer.removeAttribute(attribute, context)
            }
        })
    }
}