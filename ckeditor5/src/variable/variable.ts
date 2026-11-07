// @ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import VariableEditing from './variableediting';
import VariableUI from './variableui';

import SelectionObserver from '@ckeditor/ckeditor5-engine/src/view/observer/selectionobserver'
import { WidgetToolbarRepository } from '@ckeditor/ckeditor5-widget';
import { viewToModel } from '../../src/utils/mapping';
import { ModelElement } from 'build/ckeditor';

function isVariable(element) {
    return element.name == 'var'
}

function getClosestSelectedVariable( selection ) {
    const viewElement = selection.getSelectedElement();
    // fixme: maybe not needed? happens inside the symbol is dom is changed
    // selected element gets detached
    if (viewElement && !viewElement.root.rootName) return;

    for (let l = viewElement; l; l = l.parent) {

        if ( l.getAttribute && l.getAttribute('data-symbol-ref') ) {
            return null;
        }
    }

    if ( viewElement && isVariable( viewElement ) ) {
        return viewElement;
    }

    const firstPosition = selection.getFirstPosition();
    if (firstPosition) {

        let parent = selection.getFirstPosition().parent;

        while ( parent ) {
            if ( parent.is( 'element' ) && isVariable( parent ) ) {
                return parent;
            }
    
            parent = parent.parent;
        }
    
    }

    return null;
}

export default class Variable extends Plugin {
    static pluginName = 'Variable'

    static get requires() {
        return [ VariableEditing, VariableUI ];
    }

    variable: ModelElement
    
    init() {
        this.set('variable', null);
    }

    afterInit() {
        const editor = this.editor;
        const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

        widgetToolbarRepository._toolbarDefinitions.set( 'variable', {
            view: this.editor.plugins.get('VariableUI').view,
            getRelatedElement: getClosestSelectedVariable,
			balloonClassName: 'variable-configure'
        } );

        this.editor.editing.view.document.selection.on('change', () => {
            if (!this.editor.editing.view.document.selection) return;
            const relatedElement = getClosestSelectedVariable( this.editor.editing.view.document.selection );
            this.set('variable', relatedElement ? viewToModel(this.editor, relatedElement, true) : null);
        } );

            

    }
}