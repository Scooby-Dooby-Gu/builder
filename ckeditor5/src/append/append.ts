//@ts-nocheck
// The "+" (add element) menu in the element toolbar.
//
// Each entry inserts a ready-to-edit structure at the end of the current context:
// a heading, a button (a link in a paragraph styled by the Button picker), a list,
// a quote, columns or a card. Content is pre-filled and selected, so typing
// replaces it.
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AppendCommand from './appendcommand';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import appendText from './appendtext.svg';
import appendContainer from './appendcontainer.svg';
import headingIcon from './heading.svg';
import buttonIcon from './button.svg';
import listIcon from './list.svg';
import quoteIcon from './quote.svg';
import columnsIcon from './columns.svg';
import cardIcon from './card.svg';

export default class AppendPlugin extends Plugin {

    init() {
        this.editor.commands.add( 'appendParagraph', new AppendCommand( this.editor ) );

        this.addEntry( 'appendText', 'Text', appendText, () => {
            this.editor.execute( 'appendElement', 'paragraph' );
        } );

        this.addEntry( 'appendHeading', 'Heading', headingIcon, () => {
            this.appendWith( 'heading1', {}, ( writer, element ) => this.fill( writer, element, 'Heading' ) );
        } );

        this.addEntry( 'appendButton', 'Button', buttonIcon, () => {
            this.appendWith( 'paragraph', { class: 'button' }, ( writer, element ) =>
                this.fill( writer, element, 'Get started', { linkHref: '#' } ) );
        } );

        this.addEntry( 'appendList', 'List', listIcon, () => {
            this.appendWith( 'listItem', { listType: 'bulleted', listIndent: 0 }, ( writer, element ) =>
                this.fill( writer, element, 'List item' ) );
        } );

        this.addEntry( 'appendQuote', 'Quote', quoteIcon, () => {
            this.appendWith( 'blockQuote', {}, ( writer, element ) => {
                const paragraph = writer.createElement( 'paragraph' );
                writer.append( paragraph, element );
                this.fill( writer, paragraph, 'Quote' );
            } );
        } );

        this.addEntry( 'appendContainer', 'Container', appendContainer, () => {
            this.editor.execute( 'appendElement', 'container', {} );
        } );

        this.addEntry( 'appendColumns', 'Columns', columnsIcon, () => {
            this.appendWith( 'container', { class: 'layout-columns-2' }, ( writer, element ) => {
                let first;
                for ( const label of [ 'First column', 'Second column' ] ) {
                    const column = writer.createElement( 'container' );
                    const paragraph = writer.createElement( 'paragraph' );
                    writer.append( column, element );
                    writer.append( paragraph, column );
                    writer.insertText( label, paragraph, 0 );
                    first = first || paragraph;
                }
                writer.setSelection( writer.createRangeIn( first ) );
            } );
        } );

        this.addEntry( 'appendCard', 'Card', cardIcon, () => {
            this.appendWith( 'container', { class: 'card' }, ( writer, element ) => {
                const title = writer.createElement( 'heading2' );
                const text = writer.createElement( 'paragraph' );
                writer.append( title, element );
                writer.append( text, element );
                writer.insertText( 'Describe it in a sentence or two.', text, 0 );
                this.fill( writer, title, 'Card title' );
            } );
        } );
    }

    addEntry( name, label, icon, onExecute ) {
        this.editor.ui.componentFactory.add( name, locale => {
            const button = new ButtonView( locale );
            button.set( {
                isEnabled: true,
                label: locale.t( label ),
                icon,
                tooltip: true,
                withText: true,
            } );
            this.listenTo( button, 'execute', onExecute );
            return button;
        } );
    }

    // Insert an element at the end of the current context, then fill it in the same
    // change so the whole insertion is a single undo step.
    appendWith( name, attributes, build ) {
        const editor = this.editor;
        editor.model.change( writer => {
            editor.execute( 'appendElement', name, attributes );
            let element = editor.model.document.selection.getFirstPosition().parent;
            while ( element && element.name !== name && element.parent ) {
                element = element.parent;
            }
            if ( element && element.name === name ) {
                build( writer, element );
            }
        } );
    }

    // Put starter text in an element and select it, so typing replaces it.
    fill( writer, element, text, attributes = {} ) {
        writer.insertText( text, attributes, element, 0 );
        writer.setSelection( writer.createRangeIn( element ) );
    }
}
