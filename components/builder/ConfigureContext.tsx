import { Icon, LinkIcon, RepeatIcon, ViewIcon } from "components/ui";
import Editor, { ModelElement } from "ckeditor5/build/ckeditor";
import { useState } from "react";
import { useAppSelector } from "store/hooks";
import Configure from "./Configure";
import { useEditorValue } from "./EditorWatchdog";


export type AttributeCallback = (context: ModelElement, attribute: string, value: string | boolean | null) => void;

export function getAttributeSet(editor : Editor, context : ModelElement, {linkContext = context, textContext = context, onConfigure, onChange} : 
    {linkContext? : ModelElement,
     textContext? : ModelElement, 
     onChange: AttributeCallback, 
     onConfigure: AttributeCallback}) {
         
    
    return [
        editor.model.schema.checkAttribute(context, 'data-path-scope') &&
        {
            key: 0,
            name: 'data-path-scope',
            label: 'Repeating',
            icon: <RepeatIcon width="24px" height="24px" />,
            value: null,
            jsonpath: context.getAttribute('data-path-scope'),
            type: "context" as const,
            onConfigure: (datapath) => {
                onConfigure(context, 'data-path-scope', datapath)
            },
            labels: {
                configure: 'For each in collection',
                remove: context.getAttribute('data-path-scope') ? 'Remove repeating' : null
            }
        },

        context.name.includes('image') &&
        {
            key: 1,
            name: 'data-path-src',
            label: 'Image source',
            icon: <Icon width="24px" height="24px" path="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />,
            value: (editor.utils.getCustomAttribute(context, 'src') || ''),
            jsonpath: context.getAttribute('data-path-src'),
            type: 'url' as const,
            onConfigure: (datapath) => {
                onConfigure(context, 'data-path-src', datapath)
            },
            onChange: (value) => {
                onChange(context, 'data-path-src', value)
            },
            labels: {
                set: context.getAttribute('data-path-src') ? 'Placeholder' : 'Static image'

            }
        },

        (context.name != 'caption' && editor.model.schema.checkChild(context, '$text') ||
        context.name == 'var' && !context.parent.is('element', 'caption')) &&
        {
            key: 2,
            name: context.name == 'var' ? 'data-path': 'data-child-text',
            label: 'Text data',
            icon: <Icon width="24px" height="24px" path="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z" />,
            value: editor.utils.getCustomAttribute(textContext, 'data-path-placeholder'),
            jsonpath: textContext.getAttribute('data-path'),
            //qualifier: textContext != context ? 'Child: ' : '',
            type: 'text' as const,
            onConfigure: (datapath) => {
                onConfigure(textContext, textContext.name == 'var'  ? 'data-path' : 'data-child-text', datapath);
            },
            onChange: (value) => {
                onChange(context, 'data-path-placeholder', value)
            },
            labels: {
                set: textContext.name == 'var' ? 'Placeholder' : null,
            }
        },

        (context.name.includes('image')||
        context.name == 'caption' ||
        context.name == 'var' && context.parent.is('element', 'caption')) &&
        {
            key: 3,
            name: 'data-child-caption',
            label: 'Caption',
            icon: <Icon width="24px" height="24px" path="M4,9H20V11H4V9M4,13H14V15H4V13Z" />,
            value: editor.utils.getCustomAttribute(textContext, 'data-child-caption'),
            jsonpath: textContext.getAttribute('data-path'),
            //qualifier: textContext != context ? 'Child: ' : '',
            
            type: 'text' as const,
            onConfigure: (datapath) => {
                onConfigure(textContext, textContext.name == 'var'  ? 'data-path' : 'data-child-caption', datapath);
            },
            onChange: (value) => {
                onChange(textContext,  textContext.name == 'var'  ? 'data-path-placeholder' : 'data-child-caption', value)
            },
            labels: {
                set: textContext.getAttribute('data-path') ? 'Placeholder' : 'Static caption',
                remove: 'Remove caption',
                clear: 'Disable caption',
                hasData: 'This image has caption assigned to it'
            }
        },

        (editor.model.schema.checkChild(context, '$text') ||
        editor.model.schema.checkChild(context, '$block') ||
            context.name.includes('image')||
            context.name == 'var')  && 
        {
            key: 4,
            name: 'data-path-href',
            label: 'Link',
            icon: <LinkIcon width="24px" height="24px" />,
            value: editor.utils.getCustomAttribute(linkContext, 'linkHref'),
            jsonpath: linkContext.getAttribute('data-path-href'),
            qualifier: linkContext != context ? 'Parent: ' : '',
            type: 'url' as const,
            onConfigure: (datapath) => {
                onConfigure(linkContext, 'data-path-href', datapath);
            },
            onChange: (value) => {
                if (linkContext.getAttribute('data-path-href'))
                    onConfigure(linkContext, 'data-path-href', null);
                onChange(linkContext, 'linkHref', value);
            },
            labels: {
                set: linkContext.getAttribute('data-path-href') ? 'Placeholder' : 'Explicit URL',
                remove: 'Remove link',
                clear: 'Clear link',
                hasData: 'This image has caption assigned to it'
            }
        },

        {
            key: 5,
            name: 'data-path-hidden',
            label: 'Visiblity',
            icon: <ViewIcon width="24px" height="24px" />,
            value: editor.utils.getCustomAttribute(context, 'hidden'),
            jsonpath: context.getAttribute('data-path-hidden'),
            type: 'boolean' as const,
            onConfigure: (datapath) => {
                onConfigure(context, 'data-path-hidden', datapath);
            },
            onChange: (value) => {
                if (context.getAttribute('data-path-hidden'))
                    onConfigure(context, 'data-path-hidden', null);
                onChange(context, 'hidden', !value)
            },
            labels: {
                set: 'Manual control',
            }
        }
    ].filter(Boolean)
}

export default function ConfigureContext({ editor, type, isOpen= false }: { editor: Editor, type: "element" | "variable", isOpen: boolean }) {
    const datasources = useAppSelector((state) => state.datasources.filter((datasource) => state.builder.datasourceIds.includes(datasource.id)));

    const [renders, render] = useState(0);

    const contextArgs = type == 'variable' 
        ? [editor.plugins.get("Variable"), 'variable']
        : [editor, 'context']
    const context: ModelElement = useEditorValue(contextArgs[0], contextArgs[1]);
    if (!context) return null;



    const scopes = context.getAncestors({ includeSelf: true }).reduce((scopes, el: ModelElement) => {
        if (el.getAttribute('data-path-scope') == null) return scopes;
        return [el.getAttribute('data-path-scope')].concat(scopes)
    }, [])

    const onConfigure : AttributeCallback = (context, attribute, value) => {
        editor.execute('configure', attribute, value, context);
        render((z) => z + 1)
    }
    const onChange : AttributeCallback = (context, attribute, value) => {
        if (context.is('element', 'caption') && !value) {
            var nextContext = context.parent;
        }

        editor.model.change((writer) => {
            editor.execute('override', attribute, value, context);
            if (nextContext) {
                writer.setSelection(writer.createPositionAt(nextContext, 0));
            }
        })
        render((z) => z + 1)
    }


    // dive into image caption
    var generalContext = context;
    if (type == 'element') {
        for (var c of context.getChildren()) {
            if (c.is('element') && (c.name == 'caption')) {
                generalContext = c;
                break;
            }
        }
    }

    // elements scan for the first variables and manage the text for them
    var textContext = generalContext;
    if (type == 'element') {
        for (var c of generalContext.getChildren()) {
            if (c.is('element') && c.name == 'var') {
                textContext = c;
                break;
            }
        }
    }

    // find parent link context
    var linkContext = context;
    if (type == 'variable') {
        for (var p of context.getAncestors()) {
            if (p.is('element') && (p.getAttribute('linkHref') != null || p.getAttribute('data-path-href'))) {
                linkContext = p;
            }
        }
    }

    return isOpen && <Configure
        datasources={datasources}
        scopes={scopes}
        attributes={getAttributeSet(editor, context, {textContext, onChange, onConfigure})}
    />;
}
