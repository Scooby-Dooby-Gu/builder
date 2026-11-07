import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DuplicateCommand from './duplicatecommand';
import SymbolCommand from './symbolcommand';
//@ts-ignore
import duplicateSvg from './duplicate.svg';
//@ts-ignore
import duplicateLinkSvg from './duplicate_link.svg';
import { ButtonView, EditorUIView } from '@ckeditor/ckeditor5-ui';
import { EditorWithUI } from '@ckeditor/ckeditor5-core/src/editor/editorwithui';
import { node } from 'webpack';
import { modelToDOMElement, modelToView } from '../utils/mapping';
import { write } from 'fs';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget';
import { syncElement } from '../utils/dom';
import { ModelElement } from 'build/ckeditor';
import Observer from '../../src/observer/observer';


export default class DuplicatePlugin extends Plugin {

    observer : Observer
	symbolModels: ModelElement[] = []
	needsDOMUpdate = false
	refs: Map<ModelElement, ModelElement[]> = new Map

	init() {
		const editor = <EditorWithUI>this.editor;


        this.observer = <Observer> this.editor.plugins.get('Observer');

		// dont allow nesting into symbol refs
		editor.model.schema.addChildCheck((context) => {
			if (context.last.getAttribute('symbol-ref')) {
				return false;
			}
		})

		// dont allow inline attributes on symbol widgets
		editor.model.schema.addAttributeCheck( ( context, attributeName ) => {
			//@ts-ignore
			if (context._items.find((e) => e.getAttribute('symbol-ref'))) {
				return false;
			}
		} );

		// dont let symbol be nested into its own original


        this.observer.onAttributeChange('symbol-id', (item: ModelElement, attribute: 'string', newValue: any, oldValue: any) => {
            if (newValue && !oldValue) {
				this.addSymbolModel(item);
            }
            if (!newValue && oldValue) {
				this.removeSymbolModel(item);
            }
            this.needsDOMUpdate = true;
        });

        this.observer.onAttributeChange('symbol-ref', (item: ModelElement, attribute: 'string', newValue: any, oldValue: any) => {
            if (newValue) {
				this.addSymbolRef(item, newValue)
            }
            if (oldValue) {
				this.removeSymbolRef(item, oldValue);;
            }
            this.needsDOMUpdate = true;
        });


        this.editor.editing.view.on('render', () => {
            if (this.needsDOMUpdate) {
                this.symbolModels.forEach((model) => this.observer.onModelDomChange(model, this.onSymbolMutated))
                this.updateSymbols();
                this.needsDOMUpdate = false;
            }
        })

		editor.conversion.for('upcast').attributeToAttribute({
			view: 'data-symbol-id',
			model: 'symbol-id',
			converterPriority: 'low'
		})
		editor.conversion.for('downcast').attributeToAttribute({
			view: 'data-symbol-id',
			model: 'symbol-id',
			converterPriority: 'low'
		})
		editor.conversion.for('upcast').attributeToAttribute({
			view: 'data-symbol-ref',
			model: 'symbol-ref',
			converterPriority: 'low'
		})
		editor.conversion.for('downcast').attributeToAttribute({
			view: 'data-symbol-ref',
			model: 'symbol-ref',
			converterPriority: 'low'
		})
		editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement(editor.model, viewElement => {
				return !!viewElement.getAttribute('data-symbol-ref');
			})
		);
		editor.conversion.for('downcast').add(dispatcher => {
			dispatcher.on('insert', (evt, data, conversionApi) => {
				// replace original would-be view element with the empty raw element copy
				if (data.item.getAttribute('symbol-ref') && data.item.is('element') && data.item.name) {
					const pos = conversionApi.mapper.toViewPosition( data.range.start );;
					const original = conversionApi.mapper.toViewElement(data.item);
					if (!original || original.hasClass('ck-symbol')) return;
					conversionApi.consumable.consume( data.item, evt.name )
					
					//@ts-ignore
					const copy = conversionApi.writer.createRawElement(original.name, Object.fromEntries(original.getAttributes()), () => {
						//this.updateSymbol(data.item.getAttribute('symbol-ref'))
					})
					conversionApi.writer.setAttribute('contenteditable', 'false', copy);
					conversionApi.writer.addClass('ck-symbol', copy)
					conversionApi.writer.removeClass('ck-widget', copy)
					conversionApi.mapper.bindElements(data.item, copy);
					conversionApi.writer.insert(pos, copy)
					conversionApi.writer.remove(original);
				}
			}, {priority: 'low'});
		});



		editor.conversion.for('downcast').elementToElement({
			view: {
				name: 'div',
				classes: ['clone']
			},
			model: 'clone',
			converterPriority: 'high'
		})
		editor.conversion.for('upcast').elementToElement({
			view: {
				name: 'div',
				classes: ['clone']
			},
			model: 'clone',
			converterPriority: 'high'
		})



		editor.commands.add('duplicate', new DuplicateCommand(editor));
		editor.commands.add('symbol', new SymbolCommand(editor));

		editor.ui.componentFactory.add('duplicate', locale => {
			const button = new ButtonView(locale);
			const duplicateCommand = editor.commands.get('DuplicateCommand');

			button.set({
				isEnabled: true,
				label: locale.t('Duplicate element'),
				icon: duplicateSvg,
				tooltip: true,
			});

			this.listenTo(button, 'execute', () => {
				editor.execute('duplicate')
			});

			return button;
		});


		editor.ui.componentFactory.add('duplicateLinked', locale => {
			const button = new ButtonView(locale);
			const duplicateCommand = editor.commands.get('DuplicateCommand');

			button.set({
				isEnabled: true,
				label: locale.t('Make symbol'),
				icon: duplicateLinkSvg,
				tooltip: true,
			});

			this.listenTo(button, 'execute', () => {
				editor.execute('symbol')
			});

			return button;
		});
	}

	onSymbolMutated = (model: ModelElement) => {
		this.updateSymbol(model)
	}

    addSymbolModel(model: ModelElement) {
        this.symbolModels.push(model);
        this.needsDOMUpdate = true;
    }

    removeSymbolModel(model: ModelElement) {
        this.needsDOMUpdate = true;
        this.observer.offModelDomChange(model);
        this.editor.model.change((writer) => {
            (this.refs.get(model) || []).slice().forEach((clone) => {
                this.removeSymbolRef(clone, String(model.getAttribute('symbol-id')));
				writer.remove(clone);
            })
        })
        this.symbolModels = this.symbolModels.filter((m) => m != model);
    }

	addSymbolRef(model : ModelElement, id : string) {
		const symbol = this.symbolModels.find((s) => s.getAttribute('symbol-id') == id);
		if (symbol) {
			if (!this.refs.get(symbol))
				this.refs.set(symbol, []);
			this.refs.get(symbol).push(model)
			this.needsDOMUpdate = true;
		}
	}

	removeSymbolRef(model: ModelElement, id : string) {
		const symbol = this.symbolModels.find((s) => s.getAttribute('symbol-id') == id);
		if (symbol) {
			this.refs.set(symbol, this.refs.get(symbol).filter((c) => c != model))
			this.needsDOMUpdate = true;
		}
	}

	updateSymbols() {
		this.symbolModels.map((s) => this.updateSymbol(s))
	}

	updateSymbol(model: ModelElement) {
		const collection = this.refs.get(model);
		const origin = modelToDOMElement(this.editor, model);
		if (!origin) return;
		collection.forEach((refModel) => {
			const ref = modelToDOMElement(this.editor, refModel)
			syncElement(origin, ref);
			ref.classList.add('ck-symbol');
		})
	}
}
