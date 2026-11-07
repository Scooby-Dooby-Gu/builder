import { Plugin } from "@ckeditor/ckeditor5-core";
import { ModelElement, RootElement } from "build/ckeditor";
import { modelToDOMElement } from "../../src/utils/mapping";
import { walkModel } from "../../src/utils/model";
import { default as ViewMutationObserver } from "@ckeditor/ckeditor5-engine/src/view/observer/mutationobserver";

export declare type AttributeCallback = (element: ModelElement, attribute: string, newValue: any, oldValue: any) => void;

const config = { attributes: true, childList: true, subtree: true, characterData: true, attributeOldValue: true };

const old = ViewMutationObserver.prototype['_isBogusBrMutation'];
ViewMutationObserver.prototype['_isBogusBrMutation'] = function (mutation) {

    if (mutation.target.tagName == 'VAR' || ViewMutationObserver['supressed']) {
        return true;
    }

    return old.call(this, mutation);
}

declare type MutationCallback = (model : ModelElement, mutations? : MutationRecord[]) => void;

export default class Observer extends Plugin {
    static pluginName = 'Observer'

    attributeCallbacks : Record<string, AttributeCallback[]> = {}

    mutationObservers: Map<ModelElement, MutationObserver> = new Map
    mutationObserverRoots: Map<ModelElement, HTMLElement> = new Map

    mutatedModels: [ModelElement, MutationCallback][] = []
    mutationSchedule: any

    supression: any

    init() {
        // downcaster doesnt have access to removed node
        // so we scan changes that insert into graveyards 
        this.editor.model.document.on('change', () => {
            const changes = this.editor.model.document.differ.getChanges({
                includeChangesInGraveyard: true
            });
            for (const change of changes) {
                if (change.type == 'insert' && change.name != "$text" && change.position.nodeAfter.is('element')) {
                    const isRemoved = (<RootElement>change.position.root).rootName == '$graveyard';
                    
                    walkModel(change.position.nodeAfter, (item) => {
                        for (var attribute in this.attributeCallbacks) {
                            const value = item.getAttribute(attribute);
                            if (value != null) {
                                const from = isRemoved ? value : null;
                                const to = isRemoved ? null : value;
                                this.fireAttributeChange(item, attribute, to, from)
                            }
                        }
                    })
                }
                if (change.type == 'attribute') {
                    if (this.attributeCallbacks[change.attributeKey]) {
                        for (const { item } of change.range.getWalker()) {
                            this.fireAttributeChange(item, change.attributeKey, change.attributeNewValue, change.attributeOldValue)
                        }
                    }
                }
            }
        })
    }

    supressDomObserver() {
        ViewMutationObserver['supressed'] = true;
        this.supression = setImmediate(() => {
            this.supression = null;
            ViewMutationObserver['supressed'] = false;
        })
    }

    fireAttributeChange(item, attribute, to, from) {
        console.log(item, attribute, to, from)
        this.attributeCallbacks[attribute].forEach((callback) => callback(item, attribute, to, from));
    }

    // subscribe to attribute changes directly via downcaster
    onAttributeChange(attributeName : string, callback: AttributeCallback) {
        if (!this.attributeCallbacks[attributeName]) {
            this.attributeCallbacks[attributeName] = [];
        }
        this.attributeCallbacks[attributeName].push(callback)
    }

    addMutatedModel(model :ModelElement, callback : MutationCallback) {
        const current = this.mutatedModels.find((tuple) => tuple[0] == model);
        if (current) return;
        this.mutatedModels.push([model, callback]);
        if (!this.mutationSchedule) {
            this.mutationSchedule = setImmediate(() => {
                this.mutatedModels.sort((b, a) => a[0].getPath().length - b[0].getPath().length)
                clearImmediate(this.mutationSchedule);
                this.mutationSchedule = null;
                console.info('Mutated scopes %O', this.mutatedModels.map((m) => m[0]))
                this.mutatedModels.map(([model, callback]) => {
                    callback(model, []);
                })
                this.mutatedModels = []
                
            });
        }
    }

    onModelDomChange(model: ModelElement, callback : MutationCallback) {
        const element = modelToDOMElement(this.editor, model);
        if (this.mutationObserverRoots.get(model) && 
            this.mutationObserverRoots.get(model) != element) {
            this.offModelDomChange(model);
        }
        if (!this.mutationObservers.get(model)) {
            if (!document.contains(element)) return;
            const mutationObserver = new MutationObserver((mutations) => {
                const elements = Array.from(this.mutationObserverRoots.values());
                const models = Array.from(this.mutationObserverRoots.keys());

                if (ViewMutationObserver['supressed']) {
                    console.log('Supressed mutations %O', mutations)
                    return;
                }
                // ignore empty text nodes manipulation
                const filteredMutations = mutations.filter((mutation) => {
                    // @ts-ignore
                    if (mutation.removedNodes && mutation.removedNodes.length && mutation.removedNodes[0].data == '') {
                        return false;
                    }
                    // @ts-ignore
                    if (mutation.addedNodes && mutation.addedNodes.length && mutation.addedNodes[0].data == '') {
                        return false;
                    }
                    return true;
                })
                if (!filteredMutations.length) {
                    return;
                }
                console.log('Observed mutations %O', filteredMutations)

                filteredMutations.forEach((mutation) => {
                    for (var p = mutation.target; p; p = p.parentElement) {
                        const index = elements.indexOf(<HTMLElement> p);
                        if (index > -1) {
                            this.addMutatedModel(models[index], callback);
                        }
                    }
                })
            })
            this.mutationObserverRoots.set(model, element);
            this.mutationObservers.set(model, mutationObserver);
            mutationObserver.observe(element, config);
            return true;
        }
        return false;
    }

    offModelDomChange(model: ModelElement) {
        if (this.mutationObservers.get(model)) {
            this.mutationObservers.get(model).disconnect();
            this.mutationObservers.delete(model);
            this.mutationObserverRoots.delete(modelToDOMElement(this.editor, model))
        }
    }
}
