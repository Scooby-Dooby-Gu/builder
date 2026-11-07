
import type { ModelElement } from 'ckeditor5-custom-build';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { write } from 'fs';
import { getContextModel } from '../../src/utils/getters';

export default class VariableCommand extends Command {
    execute( path = null, placeholder = 'Click to edit', context = getContextModel(this.editor)) {
        const editor = this.editor;
        const selection = editor.model.document.selection;
        editor.model.change( writer => {
            var attrs = {
                'data-path-placeholder': 'Click to edit'
            };
            if (path != null)
                attrs['path'] = path

            // add caption to image 
            var target = context;
            if (context.name == 'imageBlock') {
                if (!context.getChild(0)) {
                    writer.setSelection(writer.createRangeOn(context));
                    editor.execute( 'toggleImageCaption' );
                }
                target = <ModelElement> context.getChild(0);
            } else if (!this.editor.model.schema.checkChild(context, '$text')) {
                target = writer.createElement('paragraph');
                writer.insert(target, writer.createPositionAt(context, 'end'));
            }
                
            const variable = writer.createElement( 'var', attrs);
            writer.insert(variable, writer.createPositionAt(target, 'end'))
            writer.setSelection(writer.createRangeOn(variable));
        } );
    }
}