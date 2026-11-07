/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/block/blocktoolbar
 */

/* global window */

import { ToolbarView } from "@ckeditor/ckeditor5-ui";

export default class StyleToolbarView extends ToolbarView {

}

/**
 * The block toolbar configuration. Used by the {@link module:ui/toolbar/block/blocktoolbar~BlockToolbar}
 * feature.
 *
 *		const config = {
 *			styleToolbar: [ 'paragraph', 'heading1', 'heading2', 'bulletedList', 'numberedList' ]
 *		};
 *
 * You can also use `'|'` to create a separator between groups of items:
 *
 *		const config = {
 *			styleToolbar: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ]
 *		};
 *
 * ## Configuring items grouping
 *
 * You can prevent automatic items grouping by setting the `shouldNotGroupWhenFull` option:
 *
 *		const config = {
 *			styleToolbar: {
 *				items: [ 'paragraph', 'heading1', 'heading2', '|', 'bulletedList', 'numberedList' ],
 *				shouldNotGroupWhenFull: true
 *			},
 *		};
 *
 * Read more about configuring the main editor toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>|Object} module:core/editor/editorconfig~EditorConfig#blockToolbar
 */