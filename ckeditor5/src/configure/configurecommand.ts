import { Command } from "@ckeditor/ckeditor5-core"
import { ModelElement, ModelText } from "build/ckeditor";
import { cleanCollectionBit, getHumanizedLabel } from "../preview/preview";

function isDefaultPlaceholder (context: ModelElement) {
    return context.getAttribute('data-path-placeholder') == 'Click to edit'
    || (context.getAttribute('data-path') && 
        context.getAttribute('data-path-placeholder') == getHumanizedLabel(context.getAttribute('data-path')))
}

export default class ConfigureCommand extends Command {
    
    execute(attribute, value, context : ModelElement = this.editor['context']) {
        this.editor.model.change((writer) => {
            // special proxy properties `data-child-*` create a child variable
            // and configure the `data-path` on them
            if (attribute == 'data-child-text' || attribute == 'data-child-caption') {
                var target = context;
                if (context.name == 'imageBlock') {
                    if (!context.getChild(0)) {
                        writer.setSelection(writer.createRangeOn(context));
                        this.editor.execute( 'toggleImageCaption' );
                    }
                    target = <ModelElement> context.getChild(0);
                } 
                if (value) {
                    // use old text node as placeholder
                    const textNode = context.getChild(0);
                    if (textNode && textNode.is('text')) {
                        writer.setSelection(writer.createRangeIn(context))
                        this.editor.execute('removeFormat');
                        const cleanTextNode = context.getChild(0);
                        if (cleanTextNode.is('text')) {
                            var placeholder = cleanTextNode.data
                        }
                    }
                    const variable = writer.createElement('var');
                    writer.setAttribute('data-path', value, variable);
                    writer.setAttribute('data-path-placeholder', placeholder || getHumanizedLabel(value), variable);
                    writer.remove(writer.createRangeIn(target));
                    writer.insert(variable, writer.createPositionAt(target, 'end'));
                    //writer.setSelection(writer.createRangeOn(variable))
                } else {
                    writer.remove(target);
                }
            } else {
                if (attribute == 'data-path-scope' && value) {
                    if (cleanCollectionBit(value) == value) {
                        value += '.*';
                    }
                }
                // ensure there is a link element 
                if (attribute == 'data-path-href') {
                    writer.setSelection(writer.createRangeOn(context), 0)
                    if (value != null) {
                        this.editor.execute('link', '#placeholder');
                    } else {
                        this.editor.execute('unlink');
                    }
                }

                if (attribute == 'data-path') {
                    if (value) {
                        writer.setAttribute('data-path-placeholder', getHumanizedLabel(value), context);
                        writer.setAttribute(attribute, value, context);
                    } else {
                        writer.insertText(
                            String(context.getAttribute('data-path-placeholder')), 
                            writer.createPositionAfter(context));
                        writer.remove(context);
                    }
                } else {
                    if (value) {
                        writer.setAttribute(attribute, value, context);
                    } else {
                        writer.removeAttribute(attribute, context)
                    }
                }

            }
        })
    }
}