//@ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ConfigureCommand from './configurecommand.ts';
import OverrideCommand from './overridecommand';
import datavg from './data.svg';
import { ButtonView, Model } from '@ckeditor/ckeditor5-ui';
import { Command } from '@ckeditor/ckeditor5-core';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import { modelElementToPlainText} from "@ckeditor/ckeditor5-word-count/src/utils";
import ConfigureUI from './configureui';



export default class ConfigurePlugin extends Plugin {
	command : ConfigureCommand
	
	static pluginName = 'Configure'

    static get requires() {
        return [ConfigureUI];
    }

    init() {
		this.command = new ConfigureCommand( this.editor );
        this.editor.commands.add( 'configure',this.command );
		//this.editor.on('change:context', () => this.command.refresh());

		this.override = new OverrideCommand( this.editor );
        this.editor.commands.add( 'override',this.override );

        

		['$text', '$container', '$block', 'imageBlock'].forEach((name) => {
			this.editor.model.schema.extend(name, { 
				allowAttributes: ['data-path-href', 'data-path-hidden']
			})
		});
		
		['$block', '$container', 'imageBlock'].forEach((name) => {
			this.editor.model.schema.extend(name, { 
				allowAttributes: ['data-path-scope', 'data-path']
			})
		});
		
		['imageBlock', 'media'].forEach((name) => {
			this.editor.model.schema.extend(name, { 
				allowAttributes: [ 'data-path-src', 'data-path-caption', 'data-path-alt']
			})
		});

		['data-path-scope', 
		'data-path', 
		'data-path-href', 
		'data-path-src', 
		'data-path-alt', 
		'data-path-caption', 
		'data-path-hidden'].forEach((attribute) => {
			this.editor.model.schema.setAttributeProperties( attribute, {
				//isFormatting: false,
				copyOnEnter: false
			} );
			this.editor.conversion.attributeToAttribute({
				view: attribute,
				model: attribute,
				converterPriority: 'low'
			})
		})

    }
}

export function getCustomAttribute (context : ModelElement, attribute : string) {
    if (attribute == 'src') {
        return context.getAttribute('src') && !String(context.getAttribute('src')).includes('data:') ? context.getAttribute('src') : null
    }
	if (attribute == 'data-child-text') {
		return modelElementToPlainText(context);
	}
    if (attribute == 'data-child-caption') {
        return context.getAttribute('data-path-placeholder') || modelElementToPlainText(context) || null;
    }
    if (attribute == 'hidden') {
        return context.getAttribute('hidden') == null && 
                  !context.getAttribute('data-path-hidden')
    }
    return context.getAttribute(attribute)
}

