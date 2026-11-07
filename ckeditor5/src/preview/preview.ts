import { Plugin, } from "@ckeditor/ckeditor5-core";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import { viewToModelPositionOutsideModelElement } from "@ckeditor/ckeditor5-widget";
import { request } from "http";
import { JSONPath } from "jsonpath-plus";
import Observer from "src/observer/observer";
import { isModelNotDeleted } from "../../src/utils/model";
import { ModelElement, RootElement, ViewElement, ViewText } from "../../build/ckeditor";
import { sanitizeElement, sanitizeElementContents, syncElement } from "../utils/dom";
import { DOMToView, modelToDOMElement, modelToView, viewToDOMElement } from "../utils/mapping";

export function cleanCollectionBit(path) {
    return path.replace(/(\[[^\]\[]+\]|\.\*)$/g, '');
}

export function getLastPathBit(path) {
    return cleanCollectionBit(path).split('.').pop();
}
// books.*.something.big.author.name => Big Author Name
// books.*.author.name => Author Name
export function getHumanizedLabel(path) {
    var bits = cleanCollectionBit(path).split(/]\.|\.\*\./g).pop().split(/\./g).slice(-3);
    bits = bits.filter((b) => isNaN(parseInt(b)));
    return bits.map((bit) => bit.charAt(0).toUpperCase() + bit.slice(1)).join(' ')
}
export function normalizeCollectionScope(path) {
    return cleanCollectionBit(path) + '.*';
}

export default class Preview extends Plugin {
    static pluginName = 'Preview'

    clonesByModel: Map<ModelElement, ViewElement[]> = new Map
    modelByClone: Map<ViewElement, ModelElement> = new Map
    scopeModels: ModelElement[] = []
    context: ModelElement

    variableModels: ModelElement[] = []
    variableModelsTop: ModelElement[] = []

    dataByView: Map<ViewElement, any> = new Map
    datasources: any[]
    dataroot: Record<string, any> = {}

    updatingDOM = false

    isDataRepeated: boolean
    isDataDisplayed: boolean
    needsDOMUpdate: boolean = false
    needsViewUpdate: boolean = false

    observer: Observer

    init() {
        this.set('datasources', []);
        this.set('isDataRepeated', false);
        this.set('isDataDisplayed', false);
        this.observer = <Observer>this.editor.plugins.get('Observer');

        function findRepeatedNode(node) {
            if (node && node.getAttribute && node.getAttribute('data-path-scope') && (node.getAttribute('class') || '').includes('ck-repeated')) {
                return node;
            }
        }

        this.observer.onAttributeChange('data-path-scope', (item: ModelElement, attribute: 'string', newValue: any, oldValue: any) => {
            if (newValue && !oldValue) {
                this.addScopeModel(item);
            }
            if (!newValue && oldValue) {
                this.removeScopeModel(item);
            }
            this.updateTopVariables();
            this.needsViewUpdate = true;
            this.needsDOMUpdate = true;
        });

        this.observer.onAttributeChange('data-path', this.onAttributeChanged);
        this.observer.onAttributeChange('data-path-href', this.onAttributeChanged);
        this.observer.onAttributeChange('data-path-src', this.onAttributeChanged);
        this.observer.onAttributeChange('data-path-alt', this.onAttributeChanged);
        this.observer.onAttributeChange('data-path-hidden', this.onAttributeChanged);
        this.observer.onAttributeChange('data-path-placeholder', this.onAttributeChanged);


        this.editor.on('change:datasources', (evt, name, datasources) => {
            this.set('datasources', datasources)
            this.dataroot = datasources.reduce((result, datasource) =>
                Object.assign(result, { [datasource.id]: datasource.sample })
                , {});
            this.forceUpdate()
        })

        this.on('change:isDataRepeated', (evt, name, isDataRepeated) => {
            this.forceUpdate()
        })
        this.on('change:isDataDisplayed', (evt, name, isDataDisplayed) => {
            this.forceUpdate()
            this.updateDOM();
        })

        this.editor.editing.view.on('render', () => {
            if (this.needsDOMUpdate) {
                this.scopeModels.forEach((model) => this.observer.onModelDomChange(model, this.onScopeMutated))
                this.updateDOM();
                this.needsDOMUpdate = false;
            }
        })

        this.ensureSafeEditing();

        this.editor.on('change:visibleContext', (evt, name, context) => {
            this.context = context;
            this.clonesByModel.forEach((copies, model) => {
                copies.forEach((copy) => {
                    this.updateViewState(model, copy, context);
                })
            })
        });

        // Redirect context selection to original element
        this.editor.editing.mapper.on('viewToModelContext', (evt, viewElement) => {
            evt.return = this.modelByClone.get(viewElement);
        })

        // Move selection out of a cloned element into a real element
        this.editor.editing.mapper.on('viewToModelPosition', (evt, data) => {
            var item = findRepeatedNode(data.viewPosition.nodeBefore) ||
                findRepeatedNode(data.viewPosition.nodeAfter);

            if (!item)
                for (var p = data.viewPosition.parent; p; p = p.parent) {
                    if ((item = findRepeatedNode(p))) {
                        break;
                    }
                }

            if (item) {
                for (var p = item; p = p.previousSibling;) {
                    if (p && !findRepeatedNode(p)) {
                        const modelElement = data.mapper.toModelElement(p);
                        data.modelPosition = this.editor.model.createPositionAt(modelElement, 'end');
                        evt.stop();
                        break;
                    }
                }
            }
        }, { priority: 'high' })


    }

    onAttributeChanged = (model: ModelElement, attribute: string, newValue: any, oldValue: any) => {
        if (oldValue != null) {
            this.variableModels = this.variableModels.filter((m) => m != model);
        }
        if (newValue != null) {
            this.variableModels.push(model);
        }
        // reset attribute directly
        if (oldValue != null && newValue == null) {
            this.setDOMAttribute(modelToDOMElement(this.editor, model), attribute, null)
        }
        this.updateTopVariables();
        this.needsDOMUpdate = true;
    }

    updateTopVariables() {
        this.variableModelsTop = this.variableModels.filter((m) => {
            for (var p = m; m; m = <ModelElement>m.parent) {
                if (m.getAttribute('data-path-scope')) {
                    return false;
                }
            }
            return true;
        })
    }

    onScopeMutated = (model: ModelElement, mutations) => {
        if (!this.updatingDOM) {
            //@ts-ignore
            this.editor.plugins.get('Observer').supressDomObserver()
            console.info('! Update scope %O', model)

            this.updateScopeDOM(model, true);
        }
    }

    forceUpdate() {
        this.editor.editing.view.change((writer) => {
            return this.updateView(writer);
        });
    }

    updateViewState(model: ModelElement, clone: ViewElement, context: ModelElement) {
        const element = viewToDOMElement(this.editor, clone);
        if (!element) return;

        if (model === context) {
            if (!element.classList.contains('ck-current'))
                element.classList.add('ck-current');
        } else {
            if (element.classList.contains('ck-current'))
                element.classList.remove('ck-current');
        }
    }

    // Remove extra elements before undo/redo or move operation
    // To avoid confusing editor about positions
    ensureSafeEditing() {
        this.listenTo(this.editor.model, '_beforeChanges', () => {
            if (this.needsViewUpdate) {
                this.removeClonesFromView()
            }
        }, { priority: 'highest' });

        //['undo', 'redo', 'enter', 'deleteElement', 'appendElement', 'duplicate', 'link', 'unlink'].forEach((commandName) => {
        /*['undo', 'redo', 'enter'].forEach((commandName) => {
            const command = this.editor.commands.get(commandName);
            command.on('execute', eventInfo => {
                this.needsViewUpdate = true;
            }, { priority: 'highest' });
        });*/
        this.editor.model.document.on('change', () => {
            const changes = this.editor.model.document.differ.getChanges({
                //includeChangesInGraveyard: true
            });

            var modifiedScopes = [];
            for (const change of changes) {
                if (change.type == 'insert' || change.type == 'remove') {
                    const parent = change.position.parent;
                    this.scopeModels.forEach((s) => {
                        if (s.parent == parent && !modifiedScopes.includes(s)) {
                            modifiedScopes.push(s)
                        }
                    });
                }
            }
            if (modifiedScopes.length) {
                this.editor.editing.view.change((w) => {
                    modifiedScopes.map((scope) => {
                        (this.clonesByModel.get(scope) || []).forEach((clone) => {
                            w.remove(clone);
                        })
                    })
                })
                this.needsViewUpdate = true;
            }
        })
        this.editor.model.document.on('beforeMove', () => {
            this.needsViewUpdate = true;
        }, { priority: 'highest' });
        this.editor.model.document.on('rootAdded', () => {
            this.needsViewUpdate = true;
        }, { priority: 'highest' });
        this.editor.model.document.on('rootRemoved', () => {
            this.needsViewUpdate = true;
        }, { priority: 'highest' });

        this.editor.editing.view.document.registerPostFixer(writer => {
            if (this.needsViewUpdate) {
                this.needsViewUpdate = false;
                if (this.updateView(writer)) {
                    this.needsDOMUpdate = true;
                    return true;
                }
            }
        });
    }

    // Foolproof escape latch to prevent bugs: 
    // Remove clones from view before doing big model changes
    // so that they will be re-injected back via post fixing
    // Curently used for handling drag & drop that may cause issue in case:
    //  <draggedTo>
    //  repeatedItem
    //  repeatedItemClone
    //  repeatedItemClone
    //  draggedFrom
    // which somehow causes view duplicate of dragged item. 
    // TODO: Needs better investigation
    removeClonesFromView() {
        this.editor.editing.view.change((w) => {
            this.clonesByModel.forEach((clones, model) => {
                clones.forEach((clone) => {
                    w.remove(clone);
                })
            })
        })
    }

    addScopeModel(model: ModelElement) {
        this.scopeModels.push(model);
        this.needsViewUpdate = true;
    }

    removeScopeModel(model: ModelElement) {
        this.scopeModels = this.scopeModels.filter((m) => m != model);
        this.needsViewUpdate = true;
        this.observer.offModelDomChange(model);
        this.setScopeData(modelToView(this.editor, model), null);
        this.editor.editing.view.change((writer) => {
            (this.clonesByModel.get(model) || []).slice().forEach((clone) => {
                this.removeScopeClone(model, clone, writer)
            })
        })
    }


    addScopeClone(model: ModelElement, writer: DowncastWriter) {
        const original = modelToView(this.editor, model);
        const copy = writer.createUIElement(original.name, <Record<string, string>>Object.fromEntries(original.getAttributes()))
        writer.setAttribute('contenteditable', 'false', copy);
        writer.addClass('ck-repeated', copy)
        writer.removeClass('ck-widget', copy)
        this.modelByClone.set(copy, model);
        if (!this.clonesByModel.get(model))
            this.clonesByModel.set(model, []);
        this.clonesByModel.get(model).push(copy);
        return copy;
    }

    updateScopeClone(model: ModelElement, clone: ViewElement, previous: ViewElement, writer: DowncastWriter) {
        var changes = false;

        // update datascope attribute
        if (clone.getAttribute('data-path-scope') != model.getAttribute('data-path-scope')) {
            writer.setAttribute('data-path-scope', String(model.getAttribute('data-path-scope')), clone);
            changes = true;
        }

        // insert the element initially
        if (!clone.isAttached()) {
            writer.insert(
                writer.createPositionAfter(previous),
                clone
            );
            changes = true;

            // move element to the right place
        } else if (clone.previousSibling != previous) {
            const oldParent = <ViewElement>clone.parent;
            writer.move(writer.createRangeOn(clone), writer.createPositionAfter(previous));
            this.cleanParent(oldParent, writer)
            changes = true;
        }

        return changes;
    }

    // do post-fix after moving a clone out of a parent element
    cleanParent(parent: ViewElement, writer: DowncastWriter) {
        if (!parent.getChild(0) && parent.name == 'ul') {
            writer.remove(parent);
        }
    }

    removeScopeClone(model: ModelElement, clone: ViewElement, writer: DowncastWriter) {
        var changed = false;

        if (clone.isAttached()) {
            const oldParent = <ViewElement>clone.parent;
            writer.remove(clone);
            this.cleanParent(oldParent, writer)
            changed = true;
        }

        const collection = this.clonesByModel.get(model);
        const index = collection.indexOf(clone);
        if (index > -1) {
            collection.splice(index, 1);
        }

        this.modelByClone.delete(clone);

        return changed;
    }

    shouldRepeat(model: ModelElement) {
        return isModelNotDeleted(model) && this.getRepeatPath(model)
    }

    getRepeatPath(model: ModelElement) {
        return model.getAttribute('data-path-scope');
    }

    getViewDataScopes(view: ViewElement) {
        const datascopes = {
            ...this.dataroot
        };
        for (var v = view; v; v = <ViewElement>v.parent) {
            const data = this.dataByView.get(v);
            if (data) {
                datascopes[normalizeCollectionScope(v.getAttribute('data-path-scope'))] = data
            }
        }
        return datascopes
    }

    queryScopes(scopes: {}, datapath: string, singleValue = false, json = this.dataroot) {
        var path = datapath;
        // find closest parent scope
        const keys = Object.keys(scopes).sort((b, a) => a.length - b.length);
        for (const scope of keys) {
            if (datapath.startsWith(scope) && 'ends with it') {
                if (scope == datapath) {
                    if (singleValue) {
                        return scopes[scope];
                    } else {
                        continue;
                    }
                }
                path = datapath.substring(scope.length + 1);
                json = scopes[scope];
                break;
            }
        }

        const collection = JSONPath({
            path: path,
            json: json
        });
        if (singleValue && collection) {
            return collection[0]
        } else {
            return collection;
        }
    }

    queryView(view: ViewElement, path: string): any[] {
        return this.queryScopes(this.getViewDataScopes(view), path)
    }

    queryModel(model: ModelElement, path: string): any[] {
        return this.queryView(modelToView(this.editor, model), path)
    }

    setScopeData(view: ViewElement, data: any) {
        if (data == null) {
            this.dataByView.delete(view)
        } else {
            this.dataByView.set(view, data);
        }
    }

    updateView(writer: DowncastWriter) {
        var changes = false;

        this.scopeModels = this.scopeModels
            // outer first, nested later
            .sort((a, b) => a.getPath().length - b.getPath().length)
            .filter((model) => {
                const original = modelToView(this.editor, model);
                const isRepeated = this.shouldRepeat(model);
                const dataCollection = isRepeated && this.queryModel(<ModelElement>model.parent, String(model.getAttribute('data-path-scope'))) || [];
                const count = original && isRepeated && dataCollection.length && this.isDataRepeated ? dataCollection.length - 1 : 0;
                var previous = original;

                this.setScopeData(original, dataCollection[0]);

                const collection = (this.clonesByModel.get(model) || []).slice();
                for (var i = 0; i < count; i++) {
                    const clone = collection[i] || this.addScopeClone(model, writer);
                    this.setScopeData(clone, dataCollection[i + 1]);
                    if (this.updateScopeClone(model, clone, previous, writer)) {
                        changes = true;
                    }
                    previous = clone;
                }
                for (; i < collection.length; i++) {
                    this.setScopeData(collection[i], null);
                    if (this.removeScopeClone(model, collection[i], writer)) {
                        changes = true;
                    }
                }
                return isRepeated;
            })
        if (changes) {
            this.needsDOMUpdate = true;
        }

        return changes;
    }

    updateDOM() {
        console.info('! Update all scopes %O', this.scopeModels)
        this.scopeModels.sort((b, a) => a.getPath().length - b.getPath().length);
        this.scopeModels.forEach((scope) => {
            this.updateScopeDOM(scope, true);
        })
        this.variableModelsTop.forEach((model) => {
            this.populateDOM(modelToDOMElement(this.editor, model), this.dataroot)
        })
    }

    populateView(view: ViewElement, syncDom = false) {
        const element = viewToDOMElement(this.editor, view);
        this.populateDOM(element, this.getViewDataScopes(view));
    }

    getDOMCollectionIndex(element: HTMLElement) {
        const datascope = element.getAttribute('data-path-scope');
        var index = 0;
        for (var p = element; p = <HTMLElement>p.previousElementSibling;) {
            if (p.getAttribute('data-path-scope') == datascope) {
                index++;
            }
        }
        return index;
    }

    updateDOMClones(element: HTMLElement, datascopes: {}, targetCount: number | null) {
        const datascope = element.getAttribute('data-path-scope');
        if (targetCount == null) {
            const collection = this.queryScopes(datascopes, datascope);
            targetCount = collection.length;
        }
        var index = this.getDOMCollectionIndex(element);
        if (index != 0) {
            return;
        }
        var count = index + 1;
        var last = element;
        for (var n = element; n = <HTMLElement>n.nextElementSibling;) {
            if (n.getAttribute('data-path-scope') == datascope) {
                count++;
                last = n;
            }
        }
        for (var i = count; i < targetCount; i++) {
            last.parentElement.insertBefore(last.cloneNode(true), last);
        }
        for (var i = targetCount; i < count; i++) {
            last = <HTMLElement>last.previousElementSibling;
            last.parentElement.removeChild(last.nextElementSibling);
        }
    }

    setDOMAttribute(element, attribute, value) {
        if (!element) return;

        var target = element;
        var prop = 'innerHTML';
        var placeholder;
        var originalValue
        if (attribute == 'data-path-src') {
            target = element.querySelector('img, video');
            const view = DOMToView(this.editor, target, false);
            prop = 'src';
            originalValue = view ? view.getAttribute('src') : null;
        } else if (attribute == 'data-path-href') {
            target = element.querySelector('a') || element.closest('a');
            // link can be removed but path is still there. not sure if it needs fixing
            if (!target) return;
            const view = DOMToView(this.editor, target, false);
            prop = 'href';
            originalValue = view ? view.getAttribute('href') : null;
        } else if (attribute == 'data-path-hidden') {
            const view = DOMToView(this.editor, target, false);
            prop = 'hidden';
            originalValue = view ? view.getAttribute('hidden') : null;
        } else if (element.matches('var') && attribute == 'data-path') {
            const view = DOMToView(this.editor, element, false);
            target = element.querySelector('*');
            originalValue = view ? view.getAttribute('data-path-placeholder') : null;
        }
        placeholder = originalValue || element.getAttribute('data-path-placeholder') || target[prop];

        if (value != null) {
            if (prop == 'innerHTML') {
                if (target[prop] != value) {
                    target[prop] = value;
                }
            } else {
                if (target.getAttribute(prop) != value) {
                    target.setAttribute(prop, value);
                }
            }
        } else {
            if (prop == 'innerHTML') {
                target[prop] = placeholder;
            } else {
                if (prop == 'hidden' && placeholder != null) {
                    target.removeAttribute(prop);
                } else {
                    target.setAttribute(prop, placeholder);
                }
            }
        }
    }

    populateDOM(element: HTMLElement, datascopes: {}, syncDOM = false) {
        for (var i = 0; i < element.attributes.length; i++) {
            const { name, value: datapath } = element.attributes[i];
            switch (name) {
                case 'data-path-src':
                case 'data-path-href':
                case 'data-path':
                    var value = this.isDataDisplayed ? this.queryScopes(datascopes, datapath, true) : null;
                    this.setDOMAttribute(element, name, value);
                    break;
                case 'data-path-hidden':
                    var value = this.isDataDisplayed ? this.queryScopes(datascopes, datapath, true) : null;
                    this.setDOMAttribute(element, name, !!value ? true : null);
                    break;
                case 'data-path-scope':
                    // if has view, it is controlled by `updateView`
                    // otherwise it needs to be cloned manually here 
                    const view = DOMToView(this.editor, element, false);
                    var index = this.getDOMCollectionIndex(element);
                    const collection = this.queryScopes(datascopes, datapath) || [];
                    if (!view && index == 0) {
                        this.updateDOMClones(element, datascopes, collection.length);
                    }
                    datascopes = {
                        ...datascopes,
                        [normalizeCollectionScope(datapath)]: collection[index]
                    }
                    break;
            }

        }
        for (var i = 0; i < element.children.length; i++) {
            this.populateDOM(<HTMLElement>element.children[i], datascopes, syncDOM)
        }
    }

    updateScopeDOM(scope: ModelElement, updateSelf = false) {
        if (updateSelf) {
            this.populateView(modelToView(this.editor, scope))
        }
        const modelDOMElement = modelToDOMElement(this.editor, scope);
        if (!this.clonesByModel.get(scope))
            return;
        this.updatingDOM = true;
        this.clonesByModel.get(scope).forEach((clone) => {
            const cloneDOMElement = viewToDOMElement(this.editor, clone);
            syncElement(modelDOMElement, cloneDOMElement, ['ck-repeated'], {
                'contenteditable': 'false'
            })
            this.updateViewState(scope, clone, this.context)
            this.populateView(clone)
        })
        this.updatingDOM = false;
    }
}