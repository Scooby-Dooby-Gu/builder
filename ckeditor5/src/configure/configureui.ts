import { Plugin } from "@ckeditor/ckeditor5-core";
import { ModelDocumentFragment, ModelElement, ViewElement } from "build/ckeditor";
import { viewToModel } from "../../src/utils/mapping";
import { ReactView } from "../../src/utils/react";

export default class ConfigureUI extends Plugin {
    view: ReactView

	static pluginName = 'ConfigureUI'

    init() {
        this.view = new ReactView(this.editor.locale, (element, props) => {
            return this.editor.config.get('render').configureElement(element, this.editor, props)
        });
        
        this.on('change:isOpen', (evt, prop, value) => {
            this.view.renderer(this.view.element, { isOpen: value})
        });


        const isLink = (model : ModelElement) => {
           return model.getAttribute('linkHref') != null || model.getAttribute('data-path-href') != null; 
        }

        const LinkUI = this.editor.plugins.get('LinkUI');
        const _getSelectedLinkElement = LinkUI['_getSelectedLinkElement'];
        LinkUI['_getSelectedLinkElement'] = function() {
            const result : ViewElement = _getSelectedLinkElement.call(this);
            if (result) {
                const model = viewToModel(this.editor, result);
                // dont show standard link UI if:
                // 1: If link is created by variable
                if (result && Array.from(result.getChildren()).length == 1) {
                    const child = result.getChild(0);
                    if (child.is('element')) {
                        const model = viewToModel(this.editor, child, true);
                        if (model.name == 'var' && isLink(model)) {
                            return null;
                        }
                    }
                }

                // 2: Created by parent with href
                if (isLink(model)) {
                    return null;
                }

            }
            return result;
        }
    }
}