/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat.js';
import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage.js';
import AutoLink from '@ckeditor/ckeditor5-link/src/autolink.js';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import DataFilter from '@ckeditor/ckeditor5-html-support/src/datafilter.js';
import DataSchema from '@ckeditor/ckeditor5-html-support/src/dataschema.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline.js';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import { ImageToolbar } from '@ckeditor/ckeditor5-image';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
import MediaEmbedToolbar from '@ckeditor/ckeditor5-media-embed/src/mediaembedtoolbar.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import Widget from '@ckeditor/ckeditor5-widget/src/widget.js'
import theme from '@ckeditor/ckeditor5-theme-custom'

import Dragger from './dragger.ts'
import Observer from './observer/observer.ts'
import Preview from './preview/preview'
import Duplicate from './duplicate/duplicate'
import Configure from './configure/configure.ts'
import Delete from './delete/delete'
import Variable from './variable/variable.ts'
import InsertContent from './elements'
import Append from './append/append.ts'
import CustomEnter from './customenter/customenter.ts'
import Context from './context/context.ts'
import Classes from './classes/classes.ts'
import { WidgetTypeAround } from '@ckeditor/ckeditor5-widget';
import MultirootEditor from './multiroot/editor';
import MultirootBalloonToolbar from './multiroot/balloontoolbar';
import { ContextualBalloon } from '@ckeditor/ckeditor5-ui';
import DocumentToolbar from './documenttoolbar/documenttoolbar.ts';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';

import cardSvg from './classes/icons/card.svg'
import typographySvg from './classes/icons/typography.svg'
import spacingSvg from './classes/icons/spacing.svg'
import boxshadowSvg from './classes/icons/boxshadow.svg'
import { ImageTextAlternativeUI } from '@ckeditor/ckeditor5-image';
import { HeadingButtonsUI } from '@ckeditor/ckeditor5-heading';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import './patches.tsx'

class Editor extends MultirootEditor {
}

Editor.builtinPlugins = [
	Alignment,
	Autoformat,
	AutoImage,
	AutoLink,
	Autosave,
	BlockQuote,
	Delete,
	Duplicate,
	Bold,
	CKFinder,
	CKFinderUploadAdapter,
	CloudServices,
	DataFilter,
	DataSchema,
	Essentials,
	FontColor,
	FontFamily,
	FontSize,
	GeneralHtmlSupport,
	Heading,
	HorizontalLine,
	HtmlEmbed,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageUpload,
	Indent,
	IndentBlock,
	Italic,
	Link,
	List,
	ListProperties,
	LinkImage,
	MediaEmbed,
	MediaEmbedToolbar,
	Classes,
	Paragraph,
	Base64UploadAdapter,
	PasteFromOffice,
	RemoveFormat,
	SpecialCharacters,
	SpecialCharactersText,
	Table,
	TableCaption,
	TableCellProperties,
	TableProperties,
	TableToolbar,
	TextTransformation,
	Underline,
	
	ParagraphButtonUI,
	HeadingButtonsUI,
	
	ContextualBalloon,
	MultirootBalloonToolbar,

	Observer,
	Configure,
	Variable,
	Dragger,
	InsertContent,
	Context,
	Widget,
	DocumentToolbar,
//	WidgetTypeAround,
	Duplicate,
	ImageTextAlternativeUI,
	Append,
	Preview,
	CustomEnter
];
// Editor configuration.
Editor.defaultConfig = {
	toolbar: {
		items: [
			'bold',
			'italic',
			'link',
			'removeFormat'
		],
		shouldNotGroupWhenFull: true
	},
	language: 'en',
	blockToolbar: [
		'paragraph', 'heading1', 'heading2',
		//'alignment',
		'numberedList',
		'bulletedList',
		'blockQuote',
		//'imageUpload',
		//'mediaEmbed'
	],
	mediaEmbed: {
		// configuration...
	},
	styleToolbar: [
		'image',
		'classes:image',
		'classes:card',
		'classes:spacing',
		'classes:typography',
		'classes:boxshadow',
		'alignment',
		'|',
		'moreStyles'
		//'mediaEmbed'
	],
	appendToolbar: [
		'appendContainer',
		'appendText',
		'insertVariable',
		'horizontalLine',
		'imageUpload',
		'mediaEmbed',
		'table',
		'insertTable',
	],
	nodeToolbar: [
		'duplicate',
		'duplicateLinked',
		'|',
		'deleteElement',
		//'mediaEmbed'
	],
	documentToolbar: [
		'undo',
		'redo',
	],
	variableToolbar: [
		'mappingPlaceholder',
		'mappingChange',
		'mappingRemove',
	],
	image: {
		toolbar: [
			'imageTextAlternative',
			'imageStyle:block',
			'imageStyle:side',
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableCellProperties',
			'tableProperties'
		]
	},
	classes: {
		card: {
			placeholder: 'Card style',
			icon: cardSvg,
			check: (context) => context.name == 'container',
			options: [
				{class: null, title: 'No card style'},
				{class: 'card-promo', title: 'Promo card'},
				{class: 'card-minimal', title: 'Minimal card'},
				{class: 'card-horizontal', title: 'Horizontal card'},
				{class: 'card-lavish', title: 'Lavish card'}
			]
		},
		image: {
			placeholder: 'Image style',
			icon: cardSvg,
			check: (context) => context.name == 'imageBlock',
			options: [
				{class: null, title: 'Block image'},
				{class: 'image-style-side', title: 'Image on the right'},
			]
		},
		spacing:  {
			placeholder: 'Spacing',
			icon: spacingSvg,
			optional: true,
			check: (context) => context.name == 'container',
			options: [
				{class: null, title: 'No spacing'},
				{class: 'spacing-compact', title: 'Compact spacing'},
				{class: 'spacing-regular', title: 'Regular spacing'},
				{class: 'spacing-large', title: 'Large spacing'}
			],
		},
		boxshadow:  {
			placeholder: 'Shadow',
			icon: boxshadowSvg,
			optional: true,
			check: (context) => context.name == 'container',
			options: [
				{class: null, title: 'No shadow'},
				{class: 'boxshadow-light', title: 'Light shadow'},
				{class: 'boxshadow-medium', title: 'Medium shadow'},
				{class: 'boxshadow-huge', title: 'Huge shadow'}
			],
		},
		typography: {
			placeholder: 'Typography',
			icon: typographySvg,
			//optional: true,
			check: (context) => context.name != 'container' && context.name != 'imageBlock' && !context.rootName,
			options: [
				{class: null, title: 'Default typography'},
				{class: 'typography-heading', title: 'Heading'},
				{class: 'typography-copy', title: 'Copy'},
				{class: 'typography-accent', title: 'Accent'}
			]
		},
	}
};
export default Editor; 