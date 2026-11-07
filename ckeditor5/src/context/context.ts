// @ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { findOptimalInsertionRange } from '@ckeditor/ckeditor5-widget/src/utils';
import { Command, EditorUI } from '@ckeditor/ckeditor5-core';

import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver'
import MouseObserver from '@ckeditor/ckeditor5-engine/src/view/observer/mouseobserver'

import { default as ViewMutationObserver } from "@ckeditor/ckeditor5-engine/src/view/observer/mutationobserver";

import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element'
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element'
import EventInfo from '@ckeditor/ckeditor5-utils/src/eventinfo'
import { request } from 'http';
import { addToolbarToDropdown, ButtonView, createDropdown, DropdownButtonView, IconView, normalizeToolbarConfig, Template, ToolbarView, View } from '@ckeditor/ckeditor5-ui';
import Rect from '../utils/rect';

import backSvg from './icons/back.svg'
import addSvg from './icons/add.svg'
import dragSvg from './icons/drag.svg'
import moreSvg from './icons/more.svg'
import pilcrowSvg from './icons/pilcrow.svg'
import settingsSvg from './icons/settings.svg'
import styleSvg from './icons/style.svg'
import immediate from 'setimmediate';


import StyleToolbarView from './styletoolbarview.ts'
import type Editor from '../multiroot/editor';
import { modelToDOMElement, viewToModelContext, modelToView } from '../utils/mapping';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';
import { getContextModel } from '../utils/getters';
import { ResizeObserver } from '@ckeditor/ckeditor5-utils';
export class IndicatorView extends View {
    targetModel: ModelElement
    rect: Rect
    type: string
    context: Context
    isVisible: boolean

    constructor(locale, type, context) {
        super(locale);

        this.context = context;

        this.bind('isVisible').to(this.context, 'isVisible')

        // Views define their interface (state) using observable attributes.
        this.set('rect', { left: 0, top: 0, width: 0, height: 0 });
        this.set('type', type)

        this.setTemplate(this.getTemplate());

    }

    getTemplate() {
        const bind = this.bindTemplate;

        return {
            tag: 'div',

            attributes: {
                class: [
                    'ck-indicator',
                    bind.if('isVisible', 'ck-hidden', value => !value),
                    this.type
                ]
            },
            children: []
        };
    }

    measure() {
        const element = modelToDOMElement(this.context.editor, this.targetModel);
        if (element) {
            this.set('rect', new Rect(element));
        } else {
            this.set('rect', new Rect({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }))
        }
    }

    position(parent, coords) {
        if (this.rect.width > 0) {
            this.element.style.display = 'block'
            this.element.style.top = 0;
            this.element.style.left = 0;
            this.element.style.top = Math.ceil(this.rect.top - parent.top + coords.top) + 'px'
            this.element.style.left = this.rect.left - parent.left + coords.left + 'px'
            this.element.style.width = this.rect.width + 'px'
            this.element.style.height = Math.ceil(this.rect.height) + 'px'
        } else {
            this.element.style.display = 'none'
        }
    }

}


class ContextIndicatorView extends IndicatorView {

    contextToolbarView: ToolbarView
    back: ButtonView
    drag: ButtonView
    blockDropdown: DropdownView
    stylesDropdown: DropdownView
    actionsDropdown: DropdownView
    appendDropdown: DropdownView
    configureDropdown: DropdownView
    lastContextElement: HTMLElement | null;
    constructor(locale, type, context) {
        this.set('nodeName', '');
        this.set('isRoot', false);

        this.contextToolbarView = new ToolbarView(locale);
        this.contextToolbarView.set('class', 'left')
        this.back = new ButtonView(locale);
        this.back.set({
            'label': 'Select parent',
            tooltip: true,
            tooltipPosition: 'n',
            keystroke: 'Alt+ArrowUp',
            withText: false,
            icon: backSvg
        })
        this.back.extendTemplate({
            attributes: {
                class: [
                    'back',
                    this.back.bindTemplate.if('isDisabled', 'ck-disabled'),
                ],
            },
            on: {
                click: this.bindTemplate.to('clickedback')
            }
        });
        this.back.on('execute', () => {
            context.editor.execute('setContext', context.context.parent);
        })



        this.drag = new IconView(locale)
        this.drag.set({
            content: dragSvg
        })
        this.drag.extendTemplate({
            attributes: {
                class: [
                    'drag',
                    this.drag.bindTemplate.if('isDisabled', 'ck-disabled'),
                ],
            }
        });

        this.actionsDropdown = createDropdown(locale);
        this.actionsDropdown.set('class', 'actions')
        this.actionsDropdown.buttonView.set({
            icon: moreSvg,
            label: 'More element actions',
            tooltipPosition: 'n',
            tooltip: true
        })
        addToolbarToDropdown(this.actionsDropdown, [])
        this.actionsDropdown.toolbarView.isVertical = true;


        this.stylesDropdown = createDropdown(locale);
        this.stylesDropdown.set({
            class: 'styles',
            panelPosition: 'ne'
        })
        this.stylesDropdown.set('isOpen', true)
        this.stylesDropdown.buttonView.set({
            icon: styleSvg,
            class: 'label',
            withText: true,
            tooltipPosition: 'n',
            tooltip: 'Configure element attributes and data configure',
        })

        addToolbarToDropdown(this.stylesDropdown, [])
        this.stylesDropdown.toolbarView.set({
            class: 'styles',
        })

        this.blockDropdown = createDropdown(locale);
        this.blockDropdown.set({
            class: 'block',
            panelPosition: 'se'
        })
        this.blockDropdown.buttonView.set({
            icon: pilcrowSvg,
            class: 'label',
            withText: false,
            label: 'Edit block',
            tooltip: true
        })

        addToolbarToDropdown(this.blockDropdown, [])
        this.blockDropdown.toolbarView.set({
            class: 'styles'
        })
        this.blockDropdown.toolbarView.isVertical = true;


        this.appendDropdown = createDropdown(locale);
        this.appendDropdown.set('class', 'append')
        this.appendDropdown.buttonView.set({
            icon: addSvg,
            label: 'Add new element',
            tooltipPosition: 'n',
            tooltip: true
        })
        addToolbarToDropdown(this.appendDropdown, [])
        this.appendDropdown.toolbarView.isVertical = true;


        this.configureDropdown = createDropdown(locale);
        this.configureDropdown.set('class', 'configure')
        this.configureDropdown.buttonView.set({
            icon: settingsSvg,
            label: 'Configure data configure',
            tooltipPosition: 'n',
            tooltip: true
        });


        const dropdowns = [this.actionsDropdown, this.configureDropdown, this.appendDropdown, this.stylesDropdown, this.blockDropdown];
        const balloon = context.editor.plugins.get('ContextualBalloon');
        
        balloon.decorate('updatePosition')
        /*
        balloon.decorate('showStack')
        balloon.on('showStack', (e) => {
            if (dropdowns.some((d) => d.isOpen)) {
                e.stop();
            }
        }, {priority: 'highest'}) */
        balloon.on('updatePosition', (e) => {
            if (dropdowns.some((d) => d.isOpen)) {
                e.stop();
            }
        }, {priority: 'highest'})
        dropdowns.forEach((dropdown) => {
            dropdown.on('change:isOpen', (evt, prop, value) => {
                if (value) {
                    balloon.view.hide();
                } else if (balloon.visibleView) {
                    setTimeout(() => {
                        if (balloon.visibleView && !dropdowns.some((d) => d.isOpen))
                            balloon.view.show();
                    }, 300)
                }
            })
        });


        this.stylesDropdown.buttonView.bind('label').to(this, 'nodeName')

        this.contextToolbarView.items.addMany([this.back, this.stylesDropdown, this.configureDropdown, this.appendDropdown, this.actionsDropdown]);

        super(locale, type, context);
        this.assignDOMListeners();

        // changing block type does keeps old model object
        //context.editor.model.document.selection.on('change:range', this.updateNodeName);
        //context.editor.model.document.selection.on('change:attribute', this.updateNodeName);
        this.on('change:targetModel', this.updateNodeName)
        this.actionsDropdown.buttonView.set('withText', false);
        context.editor.model.document.on('change:data', this.updateNodeName);

        this.context.editor.ui.componentFactory.add('moreStyles', locale => {
            const button = new ButtonView(locale);
            button.set({
                isEnabled: true,
                label: locale.t('Advanced styles...'),
                withText: true,
                tooltip: false,
            });

            this.listenTo(button, 'execute', () => {
            });

            return button;
        });
    }

    assignDOMListeners = () => {
        this.on('dragstart', (evt, domEvent) => {
            context.editor.plugins.get('Dragger').set('isEnabled', true);
            context.editor.plugins.get('Dragger').fire(domEvent.type, domEvent, { target: modelToView(this.context.editor, this.targetModel) });
            this.set('isDragged', true);
        })
        this.on('dragend', (evt, domEvent) => {
            context.editor.plugins.get('Dragger').fire(domEvent.type, domEvent);
            this.set('isDragged', false);
            context.editor.plugins.get('Dragger').set('isEnabled', false);
        })
        this.on('drop', (evt, domEvent) => {
            context.editor.plugins.get('Dragger').fire(domEvent.type, domEvent);
            context.editor.plugins.get('Dragger').set('isEnabled', false);
            this.set('isDragged', false);
        })
        this.on('drag', (evt, domEvent) => {
            context.editor.plugins.get('Dragger').fire(domEvent.type, domEvent);
        })
        this.on('dragenter', (evt, domEvent) => {
            domEvent.dataTransfer.dropEffect = 'copy';
            domEvent.preventDefault();
            //context.editor.plugins.get('Dragger').fire(domEvent.type, domEvent);
        })
        this.on('dragover', (evt, domEvent) => {
            domEvent.dataTransfer.dropEffect = 'copy';
            domEvent.preventDefault();
            //context.editor.plugins.get('Dragger').fire(domEvent.type, domEvent);
        })
    }

    updateNodeName = () => {
        if (this.targetModel) {
            this.set('nodeName', this.targetModel.name == '$root' ? this.targetModel['data'].name : this.targetModel.name);
            this.set('isRoot', this.targetModel.name == '$root')
            this.back.set('isDisabled', this.targetModel.name == '$root');
            //this.drag.set('isDisabled', this.targetModel.name == '$root');
            this.set('isSymbol', this.targetModel.getAttribute('symbol-ref'))
        }
    }

    getTemplate() {
        const template = super.getTemplate();
        return {
            ...template,
            attributes: {
                ...template.attributes,
                class: template.attributes.class.concat(
                    this.bindTemplate.if('isDragged', 'ck-dragged'),
                    this.bindTemplate.if('isRoot', 'ck-root'),
                    this.bindTemplate.if('isSymbol', 'ck-symbol')
                )
            },
            children: [

                {
                    tag: 'div',
                    attributes: {
                        class: [
                            'ck-tag',
                            // this.bindTemplate.if('isRoot', 'ck-hidden'),
                            this.bindTemplate.if('isDragged', 'ck-dragged'),
                        ],
                        tabindex: -1,
                        draggable: true
                    },
                    children: [
                        this.drag,
                        this.contextToolbarView,
                    ],
                    on: {
                        dragstart: this.bindTemplate.to('dragstart'),
                        dragend: this.bindTemplate.to('dragend'),
                        drop: this.bindTemplate.to('drop'),
                        drag: this.bindTemplate.to('drag'),
                        dragover: this.bindTemplate.to('dragover'),
                        dragenter: this.bindTemplate.to('dragenter'),
                        //dragenter: this.bindTemplate.to('dragenter')
                    }
                },
                this.blockDropdown,
            ]
        }
    }

    position(...args) {
        super.position(...args)
        if (this.context.context && modelToDOMElement(this.context.editor, this.context.context) != this.lastContextElement) {
            this.lastContextElement = modelToDOMElement(this.context.editor, this.context.context);
            if (this.rect.top > window.innerHeight || this.rect.bottom < 0) {
                this.lastContextElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                })
            }
        }
    }
}

class Context extends Plugin {
    static pluginName = 'Context'

    rect: Rect
    coords: Rect

    hovered: ModelElement | null
    selected: ModelElement | null
    lastSelectedElement: HTMLElement | null
    context: ModelElement | null
    chosen: ModelElement | null
    clicked: ModelElement | null
    lastParents: ModelElement[] = []

    mouseDown = false
    selectionChanged = false
    justClicked = false
    justChangedEditable = false

    contextIndicatorView: ContextIndicatorView
    selectedIndicatorView: IndicatorView
    hoverIndicatorView: IndicatorView

    nextUpdate: number
    resizeObserver: ResizeObserver

    refocusing: number

    init() {
        this.set('hovered', null);
        this.set('selected', null);
        this.set('context', null);
        this.set('clicked', null);
        this.set('chosen', null);
        this.editor.editing.view.addObserver(ClickObserver)
        this.editor.editing.view.addObserver(MouseObserver)
        this.editor.listenTo(this.editor.editing.view.document, 'mouseup', this.onMouseUp)
        this.editor.listenTo(this.editor.editing.view.document, 'mouseover', this.onMouseOver)
        this.editor.listenTo(this.editor.editing.view.document, 'mousedown', this.onMouseDown,)
        this.editor.listenTo(this.editor.editing.view.document, 'mousemove', this.onMouseMove,)
        this.editor.model.document.selection.on('change', this.onSelectionChange);

        this.on('change:context', (evt, prop, context) => this.observeElement(context))
        this.editor.ui.on('update', this.refresh)
        
        this.editor.on('rootMoved', this.refresh);

        this.editor.ui.focusTracker.on('change:isFocused', (evt, prop, value) => {
            clearTimeout(this.refocusing)
            if (!value) return this.set('isVisible', false);
            this.refocusing = setTimeout(() => {
                this.set('isVisible', true);
            }, 50)
        });

        this.editor.bind('visibleContext').to(this, 'isVisible', this.editor, 'context', (isVisible, context) => {
            if (isVisible) {
                return context;
            } else {
                return null;
            }
        })

        const command = new Command(this.editor);
        this.editor.commands.add('setContext', command);
        command.on('execute', (event, [newContext, force]) => {
            this.editor.model.change((writer) => {
                const oldContext = getContextModel(this.editor);
                if (!force && (!oldContext || newContext.getCommonAncestor(oldContext, { includeSelf: true }) != newContext)) {
                    writer.setSelection(
                        newContext,
                        0
                    )
                } else {
                    this.set('chosen', newContext);
                    this.refresh();
                }
            })
        })

        this.contextIndicatorView = new ContextIndicatorView(this.editor.locale, 'context', this);
        this.selectedIndicatorView = new IndicatorView(this.editor.locale, 'focus', this);
        this.hoverIndicatorView = new IndicatorView(this.editor.locale, 'hover', this);
        this.editor.ui.view.body.add(this.contextIndicatorView);
        this.editor.ui.view.body.add(this.selectedIndicatorView)
        this.editor.ui.view.body.add(this.hoverIndicatorView)

        this.contextIndicatorView.configureDropdown.on('change:isOpen', (evt, prop, value) => {
            this.editor.plugins.get('ConfigureUI').set('isOpen', value);
        })
        
        this.contextIndicatorView.configureDropdown.panelView.children.add( this.editor.plugins.get('ConfigureUI').view );
    }

    afterInit(): void | Promise<void> {
        this.contextIndicatorView.contextToolbarView.fillFromConfig(
            normalizeToolbarConfig(this.editor.config.get('contextToolbar')),
            this.editor.ui.componentFactory
        );
        this.contextIndicatorView.stylesDropdown.toolbarView.fillFromConfig(
            normalizeToolbarConfig(this.editor.config.get('styleToolbar')),
            this.editor.ui.componentFactory
        );
        this.contextIndicatorView.blockDropdown.toolbarView.fillFromConfig(
            normalizeToolbarConfig(this.editor.config.get('blockToolbar')),
            this.editor.ui.componentFactory
        );
        this.contextIndicatorView.actionsDropdown.toolbarView.fillFromConfig(
            normalizeToolbarConfig(this.editor.config.get('nodeToolbar')),
            this.editor.ui.componentFactory
        );
        this.contextIndicatorView.appendDropdown.toolbarView.fillFromConfig(
            normalizeToolbarConfig(this.editor.config.get('appendToolbar')),
            this.editor.ui.componentFactory
        );
        this.contextIndicatorView.appendDropdown.toolbarView.items.map((i) => {
            (i.buttonView || i).set({
                withText: true,
                tooltip: false
            })
        })
        this.contextIndicatorView.actionsDropdown.toolbarView.items.map((i) => i.set({
            withText: true,
            tooltip: false
        }))
        this.contextIndicatorView.blockDropdown.toolbarView.items.map((i) => (i.buttonView || i).set({
            withText: true,
            tooltip: false
        }))
        //this.editor.ui.on('change:lastFocusedEditableElement', this.onVariantChange)
        this.editor.ui.focusTracker.add(this.contextIndicatorView.element)
    }

    observeElement(context) {
        if (this.resizeObserver) {
            this.resizeObserver.destroy();
            this.resizeObserver = null;
        }
        if (context) {
            const element = modelToDOMElement(this.editor, context);
            if (element) {
                this.resizeObserver = new ResizeObserver(element, this.refresh);
            }
        }
    }

    onVariantChange = (event, element) => {
        //this.refresh();
    }

    onSelectionChange = (event, data) => {
        requestAnimationFrame(() => {
            this.refresh();
        })
    }

    onDataChange = (event, data) => {
        //this.refresh();
    }

    onMouseUp = (event, data) => {
        this.mouseDownX = null;
        this.mouseDownY = null;
        this.mouseMoveX = null;
        this.mouseMoveY = null;
        clearTimeout(this.holdTimeout);
    }

    onMouseMove = (event, data) => {
        this.mouseMoveX = data.domEvent.clientX;
        this.mouseDownY = data.domEvent.clientY;
    }

    onContextMenu = (event, data) => {
        alert(1)
        data.domEvent.preventDefault();
    }

    onMouseDown = (event, data) => {
        event.stop()
        const model = viewToModelContext(this.editor, data.target);
        this.mouseDownX = data.domEvent.clientX;
        this.mouseDownY = data.domEvent.clientY;
        this.mouseMoveX = data.domEvent.clientX;
        this.mouseMoveY = data.domEvent.clientY;
        if (this.clicked == model ||
            data.domEvent.which == 3 || 
            //this.selected == model || 
            !this.chosen ||
            model && model.getAttribute('datasource') ||
            this.chosen.root == this.chosen ||
            this.chosen.getCommonAncestor(model, { includeSelf: true }) != this.chosen) {
            this.set('chosen', model)
        }
        // holding for 500ms selects element
        clearTimeout(this.holdTimeout);
        this.holdTimeout = setTimeout(() => {
            if (Math.sqrt(
                Math.pow(this.mouseDownX - this.mouseMoveX, 2) +
                Math.pow(this.mouseDownY - this.mouseMoveY, 2)
            ) < 15) {
                this.set('chosen', model);
                this.refresh();
            }
        }, 300);
        this.set('clicked', model)
        this.justClicked = true;
        setTimeout(() => {
            this.justClicked = false;
        }, 50)
        this.refresh();
    }

    onMouseOut = (event, data) => {
        if (data.target == this.hovered) {
            this.set('hovered', null);
        }
    }

    onMouseOver = (event: EventInfo, data: any) => {
        this.set('hovered', viewToModelContext(this.editor, data.target));
    }

    setIndicatorTarget(model: ModelElement, indicator: IndicatorView) {
        indicator.set('targetModel', model);
    }


    // run context refresh in stage
    refresh = () => {
        if (typeof immediate === 'undefined') {
            return;
        }
        // 1. schedule the update after everything else runs
        clearImmediate(this.nextUpdate);
        this.nextUpdate = setImmediate(() => {
            // 2. re-compute selection and context elements
            var invalidated = this.invalidateModel('selected')
            + this.invalidateModel('context')
            + this.invalidateModel('clicked')
            + this.invalidateModel('hovered')
            + this.invalidateModel('chosen');

            this.set('selected', this.getSelected());
            this.set('context', this.getContext())

            // 3. restart if any indicators are outdated (elements are removed/deleted)
            if (invalidated) {
                this.refresh();
                // 4. notify document of change of context and restart
            } else if (this.editor.context != this.context) {
                this.lastParents = this.context.getAncestors({
                    parentFirst: true,
                    includeSelf: true
                });
                console.log('Context change %O', this.context)
                this.editor.set('context', this.context);
                this.refresh();
                // 5. finally render changes
            } else if (this.context) {
                this.updateUI();
            }
        });
    }

    updateUI = () => {
        this.setIndicatorTarget(this.hovered, this.hoverIndicatorView);
        this.setIndicatorTarget(this.context, this.contextIndicatorView);
        this.setIndicatorTarget(this.selected, this.selectedIndicatorView);
        if (!this.editor.ui.getEditableElement(this.context.root.rootName))
            return;
        const wrapper = this.editor.ui.getEditableElement(this.context.root.rootName).parentNode;
        this.set('rect', new Rect(wrapper));
        this.set('coords', new Rect({
            left: wrapper.offsetLeft,
            top: wrapper.offsetTop,
            width: wrapper.offsetWidth,
            height: wrapper.offsetHeight
        }))
        this.contextIndicatorView.measure();
        this.selectedIndicatorView.measure();
        this.hoverIndicatorView.measure();
        const el = modelToDOMElement(this.editor, this.selected);
        if (el) {
            const contentStyles = window.getComputedStyle(el)
            const lineHeight = parseInt(contentStyles.lineHeight, 10) || parseInt(contentStyles.fontSize, 10) * 1.2
            var offset = (lineHeight - 20) / 2
        }
        clearImmediate(this.nextUpdate);


        this.highlightedVariables
        this.nextUpdate = setImmediate(() => {
            this.editor.plugins.get('Observer').supressDomObserver();
            if (!this.selected || !this.lastSelectedElement || this.lastSelectedElement != modelToDOMElement(this.editor, this.selected)) {
                if (this.lastSelectedElement && this.lastSelectedElement.classList.contains('ck-selected')) {
                    this.lastSelectedElement.classList.remove('ck-selected');
                }
                if (this.selected) {
                    this.lastSelectedElement = modelToDOMElement(this.editor, this.selected);
                    if (this.lastSelectedElement && !this.lastSelectedElement.classList.contains('ck-selected')) {
                        this.lastSelectedElement.classList.add('ck-selected');
                    }
                }
            }
            this.nextUpdate = 0;
            this.contextIndicatorView.position(this.rect, this.coords);
            this.selectedIndicatorView.position(this.rect, this.coords);
            this.hoverIndicatorView.position(this.rect, this.coords);
            this.contextIndicatorView.blockDropdown.element.style.display = el && this.contextIndicatorView.blockDropdown.toolbarView.items['_items'].some((c) => c.isEnabled) ? 'block' : 'none';
            this.contextIndicatorView.blockDropdown.element.style.top = parseInt(this.selectedIndicatorView.element.style.top) - parseInt(this.contextIndicatorView.element.style.top) + (offset || 0) + 'px';
        })
    }

    getContext() {
        const dragged = this.editor.plugins.get('Dragger').dragged;
        if (dragged) {
            return dragged;
        }

        if (!this.chosen && !this.selected) {
            return this.lastParents.find((p) => this.isModelValid(p));
        }

        if (!this.chosen) {
            return this.selected;
        }
        if (!this.selected) {
            return this.chosen;
        }
        // if cursor is inside chosen element, retain parent element selection
        // but if user just clicked unselectable element (like symbol), 
        // the selection got moved away. We need to keep using the clicked element instead
        if ((this.justClicked || this.chosen.getCommonAncestor(this.selected, { includeSelf: true }) == this.chosen)) {
            return this.chosen;
        }
        // if cursor moved out of the parent, move it to a new place
        return this.selected;
    }


    getSelected() {
        const selected = this.editor.model.document.selection.getSelectedBlocks().next().value
            || this.editor.model.document.selection.getSelectedElement();
        if (selected && selected.getAttribute('symbol-ref')) {
            return null;
        }
        if (this.isModelValid(selected)) {
            return selected;
        }
        return null;
    }


    // check if model is still in the dom and not deleted
    isModelValid(model) {
        return modelToDOMElement(this.editor, model) // rendered in DOM
            && model.root.rootName != '$graveyard'  // not deleted
            && model.root.rootName // not in fragment;
    }

    invalidateModel(key) {
        if (this[key] && !this.isModelValid(this[key])) {
            this.set(key, null);
            return true;
        }
    }


}

export default Context