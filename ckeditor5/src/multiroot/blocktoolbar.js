/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/block/blocktoolbar
 */

/* global window */
import { BlockToolbar } from '@ckeditor/ckeditor5-ui';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';

export default class MultirootBlockToolbar extends BlockToolbar {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MultirootBlockToolbar';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Hides panel on a direct selection change.
		this.listenTo( editor.model.document.selection, 'change:range', ( evt, data ) => {
			if ( data.directChange ) {
				this._hidePanel();
			}
		} );

		this.listenTo( editor.ui, 'update', () => this._updateButton() );
		// `low` priority is used because of https://github.com/ckeditor/ckeditor5-core/issues/133.
		this.listenTo( editor, 'change:isReadOnly', () => this._updateButton(), { priority: 'low' } );
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => this._updateButton() );

		// Reposition button on resize.
		this.listenTo( this.buttonView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Keep correct position of button and panel on window#resize.
				this.buttonView.listenTo( window, 'resize', () => this._updateButton() );
			} else {
				// Stop repositioning button when is hidden.
				this.buttonView.stopListening( window, 'resize' );

				// Hide the panel when the button disappears.
				this._hidePanel();
			}
		} );
	}

	/*
	_attachButtonToElement( targetElement ) {
		const contentStyles = window.getComputedStyle( targetElement );

		const editableRect = new Rect( this.editor.ui.getEditableElement() );
		const contentPaddingTop = parseInt( contentStyles.paddingTop, 10 );
		// When line height is not an integer then thread it as "normal".
		// MDN says that 'normal' == ~1.2 on desktop browsers.
		const contentLineHeight = parseInt( contentStyles.lineHeight, 10 ) || parseInt( contentStyles.fontSize, 10 ) * 1.2;

		const position = getOptimalPosition( {
			element: this.buttonView.element,
			target: targetElement,
			positions: [
				( contentRect, buttonRect ) => {
					let left;

					if ( this.editor.locale.uiLanguageDirection === 'ltr' ) {
						left = editableRect.left - buttonRect.width;
					} else {
						left = editableRect.right;
					}

					return {
						top: contentRect.top + contentPaddingTop + ( contentLineHeight - buttonRect.height ) / 2,
						left
					};
				}
			]
		} );

		this.buttonView.top = position.top;
		this.buttonView.left = position.left;
	} */
	
	/**
	 * Fills the toolbar with its items based on the configuration.
	 *
	 * **Note:** This needs to be done after all plugins are ready.
	 *
	 * @inheritDoc
	 */
	afterInit() {
		const factory = this.editor.ui.componentFactory;
		const config = this._blockToolbarConfig;
		this.toolbarView.fillFromConfig( config, factory );

		// Hide panel before executing each button in the panel.
		for ( const item of this.toolbarView.items ) {
			item.on( 'execute', () => this._hidePanel( true ), { priority: 'high' } );
		}

		if ( !config.shouldNotGroupWhenFull ) {
			this.listenTo( this.editor, 'ready', () => {
                return;
				const editableElement = this.editor.ui.view.editable.element;

				// Set #toolbarView's max-width just after the initialization and update it on the editable resize.
				this._resizeObserver = new ResizeObserver( editableElement, () => {
					this.toolbarView.maxWidth = this._getToolbarMaxWidth();
				} );
			} );
		}
	}
}
