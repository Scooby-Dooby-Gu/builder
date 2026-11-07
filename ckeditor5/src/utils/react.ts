import { View } from "@ckeditor/ckeditor5-ui";


export class ReactView extends View {
    renderer: (HTMLElement, props?: {}) => void

    constructor(locale, renderer) {
        super(locale)
        this.setTemplate( {
            tag: 'div',

			attributes: {
                class: ['ck-reset_all-excluded']
            }
        } );
        this.renderer = renderer
    }
    render() {
        super.render();
        this.renderer(this.element)
    }
}