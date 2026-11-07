import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget/src/utils';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import { Command } from '@ckeditor/ckeditor5-core';
import insertObject from '@ckeditor/ckeditor5-engine/src/model/utils/insertobject'
import { getContextModel } from './utils/getters';


class InsertContent extends Plugin {
  init() {
    const editor = this.editor;


    
    const command = new Command(editor);
    editor.commands.add('insertElement', command);
    command.on('execute', (evt, [tag, attributes]) => {
      editor.model.change((writer) => {
        const model = writer.createElement(tag, attributes);
        const current = editor.model.document.selection.getSelectedBlocks().next().value
        // blocks will insert one after another
        if (current && !editor.model.schema.checkChild(current, model)) {
          editor.model.insertContent(model, writer.createPositionAt(current, 'after'), 0)
          var outside = true;
        } else {
          const range = findOptimalInsertionRange(editor.model.document.selection, editor.model);
          editor.model.insertContent(model, range.start, 0)

          // inserting inside image borks, walk through parent to paste
          if (!model.parent) {
            for (var p = range.start.parent; p; p = p.parent) {
              if (editor.model.schema.checkChild(p.parent, model)) {
                editor.model.insertContent(model, writer.createPositionAt(p, 'after'))
                break;
              }
            }
          }
        }
        writer.setSelection(writer.createPositionAt(model, 0))
        if (model.parent == model.root || outside) {
          editor.execute('setContext', model, true)
        }
      });
    })


    const moveToContextEndCommand = new Command(editor);
    editor.commands.add('moveToContextEnd', moveToContextEndCommand);
    moveToContextEndCommand.on('execute', (evt) => {
      editor.model.change((writer) => {
        writer.setSelection(getContextModel(this.editor), 'end')
      });
    })
    const appendElementCommand = new Command(editor);
    editor.commands.add('appendElement', appendElementCommand);
    appendElementCommand.on('execute', (evt, [tag, attributes]) => {
      editor.model.change((writer) => {
        editor.execute('moveToContextEnd');
        editor.execute('insertElement', tag, attributes)
      });
    })

    editor.model.schema.addChildCheck((context, child) => {
      if (child.name == 'imageBlock' && context._items.find((c) => c.name == 'blockQuote')) {
        return false;
      }
    });

    ['class', '__style'].map((attribute) => {
			this.editor.model.schema.setAttributeProperties( attribute, {
				//isFormatting: false,
				copyOnEnter: false
			} );
    })

    editor.model.schema.extend('$container', {
      allowAttributes: 'class'
    });

    editor.model.schema.extend('listItem', {
      allowAttributes: 'class'
    });
    editor.model.schema.extend('$container', {
      allowAttributes: ['__style', 'symbol-id', 'symbol-ref', 'symbol-version'],
    });
    editor.model.schema.register('container', {
      inheritAllFrom: '$container',
      allowChildren: ['$container', "$block", 'container'],
      allowIn: ['tableCell', '$container'],
      isObject: false,
      isContent: true,
      isSelectable: false,
      isBlock: false,
      isLimit: true
    });

    ['$block', '$container'].forEach((schemaTarget) => {
      editor.model.schema.extend(schemaTarget, { 
        allowAttributes: ['__style', 'hidden']
       })
    });

    editor.conversion.attributeToAttribute({
      view: 'hidden',
      model: 'hidden',
      converterPriority: 'low'
    })
    editor.conversion.attributeToAttribute({
      view: '__style',
      model: '__style',
      converterPriority: 'low'
    })
    editor.conversion.for('downcast').add(dispatcher => {
      dispatcher.on('attribute:__style', (evt, data, conversionApi) => {
        conversionApi.consumable.consume(data.item, evt.name);

        const viewElement = conversionApi.mapper.toViewElement(data.item);

        conversionApi.writer.setAttribute('style', data.attributeNewValue, viewElement);
      });
    });

    editor.conversion.for('downcast').elementToElement({

      view: {
        name: 'div',
        classes: ['container']
      },
      model: 'container',
      converterPriority: 'high'
    })
    editor.conversion.for('upcast').elementToElement({
      view: {
        name: 'div',
        classes: ['container']
      },
      model: 'container',
      converterPriority: 'high'
    })

    /*
    editor.conversion.for('downcast').elementToElement({
      view: {
        class: 'component'
      },
      model: 'component',
      converterPriority: 'low'
    })
    editor.conversion.for('upcast').elementToElement({
      view: {
        class: 'component'
      },
      model: 'component',
      converterPriority: 'low'
    }) */

    editor.conversion.for('upcast').attributeToAttribute({
      view: 'class',
      model: 'class',
      converterPriority: 'low'
    })

    editor.conversion.for('downcast').attributeToAttribute({
      view: 'class',
      model: 'class',
      converterPriority: 'low'
    })
    /*
            this.editor.conversion.for('editingDowncast').elementToElement({
                view: ( modelItem, { writer } ) => {
                                    const div = writer.createContainerElement( 'div', { class: 'widget container', contenteditable: 'true' } );
                                    const widget = toWidgetEditable( div, writer, { label: 'some widget' } );;
                                    writer.setCustomProperty('widget', true, widget);
                                    writer.setCustomProperty('widget', true, widget);
                                    return toWidgetEditable( div, writer, { label: 'some widget' } );
                                },
                model: 'container',
            }) */

  }
}

export default InsertContent