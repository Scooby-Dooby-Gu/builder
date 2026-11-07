// @ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
// This SVG file import will be handled by webpack's raw-text loader.
// This means that imageIcon will hold the source SVG.
import dragIcon from './drag.svg'


import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver'
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';

import { IndicatorView } from './context/context.ts'
import { ModelElement, ViewElement } from 'ckeditor5-custom-build';
import { View } from '@ckeditor/ckeditor5-ui';
import Rect from './utils/rect';
import { modelToDOMElement, viewToModel } from './utils/mapping';
const toPx = toUnit('px');

class DropParentIndicatorView extends View {
    type: string
    context: Dragger
    placement: Placement


    constructor(locale, type, dragger) {
        super(locale);

        this.dragger = dragger;

        this.bind('placement').to(this.dragger, 'placement');
        this.on('change:placement', (event, prop, placement) => {
            this.position(placement, this.dragger.rect, this.dragger.coords);
        })

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
                    bind.if('placement', 'ck-hidden', value => !value),
                    this.type
                ]
            },
            children: []
        };
    }

    position(placement, parent, coords) {
        if (placement) {
            const parentBox = this.dragger.modelToBox(placement.parent);
            this.element.style.top = parseInt(parentBox.top - parent.top + coords.top) + 'px'
            this.element.style.left = parseInt(parentBox.left - parent.left + coords.left) + 'px'
            this.element.style.width = parseInt(parentBox.width) + 'px'
            this.element.style.height = parseInt(parentBox.height) + 'px'
        }
    }
}
class DropPlacementIndicatorView extends View {
    type: string
    dragger: Dragger
    placement: Placement

    constructor(locale, type, dragger) {
        super(locale);

        this.dragger = dragger;

        this.bind('placement').to(this.dragger, 'placement');
        this.on('change:placement', (event, prop, placement) => {
            this.position(placement, this.dragger.rect, this.dragger.coords);
        })

        this.set('type', type)

        this.setTemplate(this.getTemplate());

    }

    getTemplate() {
        const bind = this.bindTemplate;

        return {
            tag: 'div',

            attributes: {
                class: [
                    'ck-indicator-line',
                    bind.if('placement', 'ck-hidden', value => !value),
                    this.type
                ]
            },
            children: []
        };
    }

    position(placement, parent, coords) {
        if (placement) {
            const parentBox = this.dragger.modelToBox(placement.parent);
            const parentStyle = window.getComputedStyle(modelToDOMElement(this.dragger.editor, placement.parent));

            // draw vertical line
            if (this.dragger.isHorizontal()) {
                let targetHeight = parentBox.height
                    - (parseInt(parentStyle['padding-top'], 10) || 0)
                    - (parseInt(parentStyle['padding-bottom'], 10) || 0);

                let targetTop = parentBox.top
                    + (parseInt(parentStyle['padding-top'], 10) || 0);
                let targetLeft = placement.box.left;

                if (placement.box === parentBox) {
                    targetLeft += parseInt(parentStyle['padding-left'], 10) || 0;
                }
                // we don't want a line shorter than 5px, so use full parent height including paddings
                if (targetHeight < 5) {
                    targetHeight = Math.max(5, parentBox.height);
                    targetTop = parentBox.top;
                }
                Object.assign(this.element.style, {
                    display: 'block',
                    height: `${targetHeight}px`,
                    left: `${targetLeft - parent.left + coords.left}px`,
                    top: `${targetTop - parent.top + coords.top}px`,
                    width: '1px',
                    zIndex: 1,
                });
                // draw horizontal line
            } else {
                let targetWidth = parentBox.width
                    - (parseInt(parentStyle['padding-left'], 10) || 0)
                    - (parseInt(parentStyle['padding-right'], 10) || 0);

                let targetLeft = parentBox.left
                    + (parseInt(parentStyle['padding-left'], 10) || 0);
                let targetTop = placement.box.top;

                if (placement.box === parentBox) {
                    targetTop += parseInt(parentStyle['padding-top'], 10) || 0;
                }
                if (this.dragger.dragged.rootName) {
                    targetTop -= 36;
                }
                // we don't want a line narrower than 5px, so use full parent width including paddings
                if (targetWidth < 5) {
                    targetWidth = Math.max(5, parentBox.width);
                    targetLeft = parentBox.left;
                }
                Object.assign(this.element.style, {
                    display: 'block',
                    height: '2px',
                    left: `${targetLeft - parent.left + coords.left}px`,
                    top: `${targetTop - 1 - parent.top + coords.top}px`,
                    width: `${targetWidth}px`,
                    zIndex: 1,
                });
            }
        } else if (this.element) {
            Object.assign(this.element.style, {
                display: 'none',
            });
        }
    }

}

interface Box {
    top: number,
    left: number,
    right: number,
    bottom: number,
    width: number,
    height: number,
    model: ModelElement
}

interface Placement {
    box: Box
    target: ModelElement
    parent: ModelElement
}

class Dragger extends Plugin {
    static pluginName = 'Dragger'

    selfDrag: boolean = false
    dragged: ModelElement
    target: ModelElement

    placement: Placement
    parentIndicatorView: DropParentIndicatorView
    placementIndicatorView: DropPlacementIndicatorView

    lastDragOver: ModelElement

    init() {
        this.parentIndicatorView = new DropParentIndicatorView(undefined, 'drop', this)
        this.placementIndicatorView = new DropPlacementIndicatorView(undefined, 'drop', this)

        this.set('isEnabled', false);

        this.on('change:target', (evt, prop, target : ModelElement) => {
            if (target) {
                this.editor.ui.fire('focusEditableForNode', target);
            }
        })

        this.editor.ui.view.body.add(this.parentIndicatorView)
        this.editor.ui.view.body.add(this.placementIndicatorView)
    }

    startSelfDrag(domEvent) {
        const node = domEvent.target.closest ? domEvent.target : domEvent.target.parentElement;
        if ( node.closest('figure.image, figure.media') ) {
            this.set('isEnabled', true);
            this.selfDrag = true;
            return true;
        }
    }

    stopSelfDrag() {
        if (this.selfDrag) {
            this.set('isDisabled', false);
            this.selfDrag = false;
        }
    }
    
    afterInit() {
        const editor = this.editor;
        const model = editor.model;
        const modelDocument = model.document;
        const view = editor.editing.view;
        const viewDocument = view.document;
        this.boxes = new Map;

        this.listenTo(viewDocument, 'dragstart', (event, data) => {
            if (this.startSelfDrag(data.domEvent)) {
                event.stop()
            }
            if (!this.isEnabled) return;
            this.fire('dragstart', data.domEvent, data)
        }, { priority: 'high' })
        this.listenTo(viewDocument, 'dragover', (event, data) => {
            if (!this.isEnabled) return;
            this.lastDragOver = data.target;
            this.fire('dragover', data.domEvent, data)
        }, { priority: 'lowest' })
        this.listenTo(viewDocument, 'dragleave', (event, data) => {
            if (!this.isEnabled) return;
            this.fire('dragleave', data.domEvent, data)
        }, { priority: 'lowest' })
        this.listenTo(viewDocument, 'dragenter', (event, data) => {
            if (!this.isEnabled) return;
            this.fire('dragover', data.domEvent, data)
        }, { priority: 'lowest' })
        this.listenTo(viewDocument, 'drop', (event, data) => {
            if (!this.isEnabled) return;
            this.lastDragOver = null;
            this.stopSelfDrag();
            event.stop();
            this.fire('drop', data.domEvent, data)
        }, { priority: 'highest' })
        this.listenTo(viewDocument, 'dragend', (event, data) => {
            if (!this.isEnabled) return;
            this.stopSelfDrag();
            this.lastDragOver = null;
            this.fire('dragend', data.domEvent, data)
        }, { priority: 'high' })

        // when dragging root repeat last dragover target
        this.editor.config.get('container').addEventListener('dragover', (event) => {
            if (!this.isEnabled || !this.dragged || !this.dragged.rootName) return;
            this.fire('dragover', event, { target: this.lastDragOver || this.dragged})
        })

        // when dragging root repeat last dragover target
        this.editor.config.get('container').addEventListener('drop', (event) => {
            if (!this.isEnabled || !this.dragged || !this.dragged.rootName) return;
            this.fire('drop', event, { target: this.lastDragOver || this.dragged})
        })

        const blankCanvas = document.createElement('canvas');
        blankCanvas.style.width = '1px'
        blankCanvas.style.height = '1px'
        blankCanvas.style.bottom = 0;
        blankCanvas.style.position = 'absolute'
        blankCanvas.style.pointerEvents = 'none'
        
        document.body.appendChild(blankCanvas)

        this.on('dragstart', (event, domEvent, { target }) => {
            
            domEvent.dataTransfer.setDragImage(blankCanvas, 0, 0);
            domEvent.dataTransfer.effectAllowed = 'copyMove'
            domEvent.dataTransfer.setData('text/plain', '')
            this.onDragStart(viewToModel(this.editor, target), domEvent)
            this.editor.ui.view.editables.forEach((e) => e.element.parentNode.parentNode?.setAttribute('draggable', 'true'));
        })
        this.on('dragend', (event, domEvent) => {
            this.clientX = -1;
            this.clientY = -1;
            this.editor.plugins.get('DragDrop').set('isEnabled', true);
            this.editor.ui.view.editables.forEach((e) => e.element.parentNode.parentNode?.removeAttribute('draggable'));
            this.onDragEnd()
        })
        this.on('dragover', (event, domEvent, { target }) => {
            if (!(!this.left && domEvent.clientX == this.clientX && domEvent.clientY == this.clientY && this.target == target)) {
                this.clientX = domEvent.clientX;
                this.clientY = domEvent.clientY;
                this.onDragOver(viewToModel(this.editor, this.getClosestView(target)), this.clientX, this.clientY)
            }
            if (this.placement) {
                domEvent.stopImmediatePropagation();
                domEvent.dataTransfer.dropEffect =domEvent.altKey ? 'copy' : 'move';
                domEvent.preventDefault();
            }
            clearTimeout(this.left);
            this.left = 0;
        })
        this.on('drop', (event, domEvent) => {
            console.log('drop', domEvent.altKey ? 'copy' : 'move')
            domEvent.stopImmediatePropagation();
            domEvent.preventDefault();
            this.onDrop(domEvent.altKey)
        })
        this.on('dragleave', (event, domEvent) => {
            domEvent.stopImmediatePropagation();
            domEvent.preventDefault();
            clearTimeout(this.left);
            this.left = setTimeout(() => {
                if (this.left) {
                    this.set('placement', null);
                    this.set('target', null);
                }
            }, 50)
        })
    }

    getClosestView (view: ViewElement) {
        // skip symbol contents
        for (var p = view; p; p = p.parent) {
            if (p.getAttribute('data-symbol-ref')) {
                return p;
            }
        }
        return view;
    }

    onDragStart = (model, domEvent) => {
        console.log('start')
        this.editor.plugins.get('DragDrop').set('isEnabled', false);
        this.set('dragged', model)

        const wrapper = this.editor.config.get('container')
        this.set('rect', new Rect(wrapper));
        this.set('coords', new Rect({
            left: wrapper.offsetLeft,
            top: wrapper.offsetTop,
            width: wrapper.offsetWidth,
            height: wrapper.offsetHeight
        }))
        this.editor.config.get('container').classList.add('ck-dragging');
    }
    
    onDragEnd = () => {
        console.log('dragend')
        this.reset();
    }
    
    reset = () => {
        this.set('placement', null);
        this.set('target', null);
        this.set('dragged', null);
        this.editor.config.get('container').classList.remove('ck-dragging');
        this.boxes = new Map;
    }

    onDrop = (shouldCopy) => {
        if (this.placement) {
            if (this.dragged.rootName) {
                this.editor.fire('rootMoved', [
                    this.dragged.rootName, 
                    this.placement.box.model && this.placement.box.model != this.placement.parent 
                        ? this.placement.box.model.rootName 
                        : null
                ]);
            } else {
                if (this.placement.box.model && this.placement.box.model != this.placement.parent) {
                    var pos = this.editor.model.createPositionAt(this.placement.box.model, 'before')
                } else {
                    var pos = this.editor.model.createPositionAt(this.placement.parent, 'end');
                }
                this.editor.model.document.fire('beforeMove', this.dragged)
                this.editor.model.change((writer) => {
                    if (shouldCopy) {
                        const copy = writer.cloneElement( this.dragged, true );;
                        this.editor.model.insertContent(copy, pos, 'after')
                        //writer.setSelection(copy, 'start')
                    } else {
                        writer.move(this.editor.model.createRangeOn(this.dragged), pos, 'after')
                    }
                })
            }
        }
        this.reset();
        this.editor.focus()
    }

    onDragOver = (target, x, y) => {
        this.set('target', target);
        this.set('placement', this.getSnappedTargetPlacement(this.dragged, target, x, y));
    }

    modelToBox(model: ModelElement): Box {
        var box = this.boxes.get(model);
        if (box) {
            return box;
        }
        var element = modelToDOMElement(this.editor, model);
        if (element) {
            box = new Rect(element)
            box.model = model;
            this.boxes.set(model, box);
            return box;
        } else {
            return null;
        }
    }

    isHorizontal() {
        return false
    }

    // find the best position for given cursor position
    getClosestBox(target: ModelElement, parent: ModelElement, x, y): Box {
        // measure boxes of all children in parent
        
        const children = parent.getRootNames ? this.editor.getActiveRootNames().map((name) => {
            return parent.getRoot(name)
        }) : parent.getChildren()

        const boxes = Array.from(children).map((child) => {
            return this.modelToBox(child)
        }).filter(Boolean)

        // add synthetic box representing position after the last child
        if (boxes.length) {
            // need to sort boxes in for roots, since their order is dictated from react

            boxes.sort((a, b) => isHorizontal ? a.left - b.left : a.top - b.top)
            const lastBox = boxes[boxes.length - 1];
            const isHorizontal = this.isHorizontal(parent) ;
            boxes.push(new Rect({
                height: isHorizontal ? lastBox.height : 0,
                left: isHorizontal ? lastBox.left + lastBox.width : lastBox.left,
                top: isHorizontal ? lastBox.top : lastBox.top + lastBox.height,
                width: isHorizontal ? 0 : lastBox.width,
            }));
        // if parent is empty, use its own box
        } else {
            boxes.push(this.modelToBox(parent))
        }

        // sort elements by proximity to cursor
        boxes.sort((a, b) => this.getDistanceToTopLeft(a, x, y, parent) - this.getDistanceToTopLeft(b, x, y, parent));

        return boxes[0];
    }

    // compute closest on element's perimeter,
    // from x,y and then distance to it
    getDistanceToClosestEdge(box, x, y) {
        const right = box.left + box.width;
        const bottom = box.top + box.height;
        // clamp point to edges
        const cx = Math.max(box.left, Math.min(right, x));
        const cy = Math.max(box.top, Math.min(bottom, y));
        // find distance to each edge
        const dl = Math.abs(cx - box.left);
        const dr = Math.abs(cx - right);
        const dt = Math.abs(cy - box.top);
        const db = Math.abs(cy - bottom);
        // find minimum distance
        const m = Math.min(dl, dr, dt, db);
        let px = null;
        let py = null;
        // clamp on axis that has the minimal distance
        if (m === dt) {
            px = cx;
            py = box.top;
        } else if (m === db) {
            px = cx;
            py = bottom;
        } else if (m === dl) {
            px = box.left;
            py = cy;
        } else {
            px = right;
            py = cy;
        }
        // find distance to that point
        return Math.sqrt(((x - px) ** 2) + ((y - py) ** 2));
    }

    // compute element's top left corner distance towards cursor
    getDistanceToTopLeft(box, x: number, y: number, parent: ModelElement) {
        if (this.isHorizontal(parent)) {
            return Math.abs(box.left - x);
        }
        return Math.abs(box.top - y);
    }

    // find parent node that can host the child
    getSuitableParent(child: ModelElement, potentialParent: ModelElement) {
        const commonAncestor = child.getCommonAncestor(potentialParent, { includeSelf: true });
        var startingParent = commonAncestor == child ? child.parent : potentialParent;
        
        if (child.rootName) {
            return this.editor.model.document
        }

        // dont allow nesting symbol into its definition
        const ref = child.getAttribute('symbol-ref');
        if (ref) {
            for (let parent = startingParent; parent; parent = parent.parent) {
                if (parent.getAttribute('symbol-id') == ref) {
                    startingParent = parent.parent;
                    break;
                }
            }
        }

        for (let parent = startingParent; parent; parent = parent.parent) {
            if (this.editor.model.schema.checkChild(parent, child)) {
                return parent;
            }
        }
        return null;
    }

    // get drop target, its context and anchor based on DOM element and cursor
    getTargetPlacement(dragged: ModelElement, target: ModelElement, x: number, y: number): Placement {
        if (target) {
            const parent = this.getSuitableParent(dragged, target);
            if (parent) {
                return { target, parent, box: this.getClosestBox(target, parent, x, y) };
            }
        }
        return null;
    }

    // set/indicate context & position for drag & drop
    getSnappedTargetPlacement(dragged: ModelElement, target: ModelElement, x: number, y: number) {
        let placement = this.getTargetPlacement(dragged, target, x, y);
        if (placement) {
            // if cursor is <5px away from edges of targetted element
            // try targetting its their parent, so it's possible
            // to move nodes between two tightly adjacent siblings
            // or first/last children at exact container boundaries
            if (this.getDistanceToClosestEdge(this.modelToBox(placement.target), x, y) < 5) {
                while (true) {
                    const snapped = this.getTargetPlacement(dragged, placement.target.parent, x, y);
                    //console.log('snapping to', snapped && snapped.target, snapped && this.getDistanceToClosestEdge(snapped.box, x, y))
                    // only snap if snapped target is at most 15 px away
                    if (snapped && this.getDistanceToClosestEdge(snapped.box, x, y) < 15) {
                        placement = snapped;
                    } else {
                        break;
                    }
                }
            }
            return placement;
        }

        return null;
    }
}

export default Dragger