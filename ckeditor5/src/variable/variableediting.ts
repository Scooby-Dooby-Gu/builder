import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget, toWidgetEditable, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import VariableCommand from './variablecommand';
import type { default as ViewText } from '@ckeditor/ckeditor5-engine/src/view/text';
import { DOMToView, viewToDOM, viewToModel } from '../../src/utils/mapping';


export default class VariableEditing extends Plugin {
    static get requires() {
        return [Widget];
    }


    init() {
        console.log('VariableEditing#init() got called');

        //@ts-ignore
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('insertVariable', new VariableCommand(this.editor));

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            (evt, data) => {
                const { mapper, viewPosition } = data;

                const viewParent = mapper.findMappedViewAncestor(viewPosition);
                if (viewParent.name != 'var') {
                    return;
                }

                const modelParent = mapper.toModelElement(viewParent);

                data.modelPosition = this.editor.model.createPositionAt(modelParent, 'after');
            }
        );

        const editor = this.editor;
        const view = editor.editing.view;
        const viewDocument = view.document;
        this.listenTo(viewDocument, 'mousedown', (evt, data) => {
            if (data.target && data.target.parent && data.target.parent.name == 'var') {
                const model = viewToModel(editor, data.target.parent, true);
                if (!model && editor.model.document.selection.getFirstRange()?.getItems()[0] != model) return;
                this.editor.model.change((writer) => {
                    writer.setSelection(writer.createRangeOn(model));
                })
                evt.stop();
                data.preventDefault();
            }
        });
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('var', {
            // Allow wherever text is allowed:
            allowWhere: '$text',
            //allowChildren: ['$text'],

            // The variable will act as an inline node:
            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and can be selected:
            isObject: true,
            isSelectable: true,

            // The inline widget can have the same attributes as text (for example linkHref, bold).
            allowAttributesOf: '$text',

            allowAttributes: ['data-path', 'data-path-placeholder', 'data-path-hidden', 'hidden']
        });
    }

    _defineConverters() {



        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'var',
            },
            model: (viewElement, { writer: modelWriter }) => {
                return modelWriter.createElement('var', {
                    'data-path': viewElement.getAttribute('data-path'),
                    'data-path-placeholder': viewElement.getAttribute('data-path-placeholder')
                });
            }
        });

        conversion.attributeToAttribute({
            view: 'data-path-placeholder',
            model: 'data-path-placeholder'
        });
        conversion.attributeToAttribute({
            view: 'data-path-placeholder',
            model: 'data-path-placeholder'
        });
        /*
        this.editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
            console.log(context, attributeName)
            if ( context.endsWith( '$text' ) && attributeName.startsWith('data-') ) {
                return false;
            }
        }); */
        conversion.for('editingDowncast').elementToElement({
            model: 'var',
            view: (modelItem, { writer: viewWriter, consumable }) => {
                consumable.consume(modelItem, 'insert')
                consumable.consume(modelItem.getChild(0), 'insert')
                const widgetElement = createVariableView(modelItem, viewWriter);
                viewWriter.setAttribute('data-path-placeholder', String(modelItem.getAttribute('data-path-placeholder')), widgetElement);

                const innerElement = viewWriter.createUIElement('span', {})


                viewWriter.insert(viewWriter.createPositionAt(widgetElement, 0), innerElement)
                // Enable widget handling on a variable element inside the editing view.
                const widget = toWidget(widgetElement, viewWriter);
                viewWriter.removeAttribute('contenteditable', widget);
                return widget;
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'var',
            view: (modelItem, { writer: viewWriter }) => createVariableView(modelItem, viewWriter)
        });

        // Helper method for both downcast converters.
        function createVariableView(modelItem, viewWriter) {

            const variableView = viewWriter.createContainerElement('var', {
                class: 'var',
                'data-path': modelItem.getAttribute('data-path')
            });

            return variableView;
        }
    }
}