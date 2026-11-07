// Type definitions for @ckeditor/ckeditor5-build-balloon-block 29.1
// Project: https://ckeditor.com/docs/ckeditor5/latest/builds/index.html
// Definitions by: Federico Panico <https://github.com/fedemp>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// Minimum TypeScript Version: 4.3

import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver'
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver'

import { getCustomAttribute } from 'src/configure/configure';


import type { default as ViewElement }  from '@ckeditor/ckeditor5-engine/src/view/element';
import type { default as ViewText }  from '@ckeditor/ckeditor5-engine/src/view/text';
import type { default as ModelElement }  from '@ckeditor/ckeditor5-engine/src/model/element';
import type { default as ModelText }  from '@ckeditor/ckeditor5-engine/src/model/text';
import type { default as ModelRange }  from '@ckeditor/ckeditor5-engine/src/model/range';
import type { default as Position }  from '@ckeditor/ckeditor5-engine/src/model/position';
import type { default as Range }  from '@ckeditor/ckeditor5-engine/src/model/range';
import type { default as RootElement }  from '@ckeditor/ckeditor5-engine/src/model/rootelement';
import type { default as ModelDocumentFragment }  from '@ckeditor/ckeditor5-engine/src/model/documentfragment';

export type  {ViewElement, ViewText, ModelRange, ModelElement, ModelElement, ModelText, Position, Range, RootElement, ModelDocumentFragment};

export class Editor extends BalloonEditorBase {
    context: ModelElement
    visibleContext: ModelElement
    
    static ClickObserver = class extends ClickObserver { }
    static MouseObserver = class extends MouseObserver { }
    static UI =  { Button, Icon }

    static createRoots(sourceElements  : HTMLElement[], config : any)
    addRoot(rootName : string, element : HTMLElement)
    removeRoot(rootName : string, element : HTMLElement)
    setRootContent(rootName : string, content : string)


    getCustomAttribute(context : ModelElement, attribute: string)

    utils = {
        getCustomAttribute: getCustomAttribute
    }

    static builtinPlugins: [
        typeof Essentials,
        typeof UploadAdapter,
        typeof Autoformat,
        typeof BlockToolbar,
        typeof Bold,
        typeof Italic,
        typeof BlockQuote,
        typeof CKFinder,
        typeof CloudServices,
        typeof EasyImage,
        typeof Heading,
        typeof Image,
        typeof ImageCaption,
        typeof ImageStyle,
        typeof ImageToolbar,
        typeof ImageUpload,
        typeof Indent,
        typeof Link,
        typeof List,
        typeof MediaEmbed,
        typeof Paragraph,
        typeof PasteFromOffice,
        typeof Table,
        typeof TableToolbar,
        typeof TextTransformation,
    ];

    static defaultConfig: {
        blockToolbar: [
            'heading',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'uploadImage',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            '|',
            'undo',
            'redo',
        ];
        toolbar: {
            items: ['bold', 'italic', 'link'];
        };
        image: {
            toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'toggleImageCaption',
                'imageTextAlternative',
            ];
        };
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'];
        };
        language: string;
    };
    
}

export default  Editor;