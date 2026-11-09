import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { ComponentVariant } from 'models/builder';
import { documentReducer, DocumentEvent, DocumentState, initialDocument, PublishedInfo } from 'lib/machines/document';
import { variantFingerprints } from 'lib/machines/componentStatus';

// The editor engine's lifecycle, set by EditorWatchdog.
export type EditorStatus = 'unloaded' | 'starting' | 'initialized' | 'ready';



type BuilderState = {
    contextPath: Number[] | null;
    status: EditorStatus;
    focusedEditableName: string | null;
    contextEditableName: string | null;
    isPropertiesPanelOpen: boolean,
    isFocused: boolean,
    structureChangeCount: number,
    variants: ComponentVariant[],
    styles: string,
    datasourceIds: string[],
    isHiddenDisplayed: boolean,
    isDataDisplayed: boolean,
    isDataRepeated: boolean,
    hasData: boolean,
    hasRepeating: boolean,
    // Style guide breakpoint the canvas previews at; null fits the default width.
    previewBreakpointId: string | null,
    // The component being edited, and its save/publish lifecycle (lib/machines/document.ts).
    componentId: string | null,
    document: DocumentState
}


// Starting content for a new component that has no saved draft yet.
export const SEED_VARIANTS: ComponentVariant[] = [
    {
        id: 'default',
        name: 'Default',
        state: 'new',
        isDeleted: false,
        isValid: true,
        content: '<h2>New component</h2><p>Use the + button on an element to add headings, text, buttons, columns and more.</p>',
    },
];

const initialState: BuilderState = {
    contextPath: [],
    status: 'unloaded',
    focusedEditableName: null,
    contextEditableName: null,
    isPropertiesPanelOpen: false,
    isFocused: false,
    structureChangeCount: 0,
    datasourceIds: [
        '0'
    ],
    styles: `
    .container {
        border: 1px solid #eaeaea;
        padding: 20px;
      }
  .card-promo {
    background: rgb(131,58,180);
    background: linear-gradient(90deg, rgba(131,58,180,.5) 0%, rgba(253,29,29,.5) 50%, rgba(252,176,69,1) 100%);
    border-radius: 5px;
  }
  .card-minimal {
    background: rgba(255,255,255,0.2);
    border-radius: 5px;
    margin: 0 0 10px;
  }
  .card-horizontal {
    display: flex;
    justify-content:stretch;
    padding: 5px !important;
  }
  .card-horizontal > * {
    margin: 0 10px !important;
  }
  .card-lavish {
    background: rgb(63,94,251);
    background: radial-gradient(circle, rgba(63,94,251,.5) 0%, rgba(252,70,107,.5) 100%);
    border-radius: 5px;
    color: #fff;
  }

  .boxshadow-light {
    box-shadow: 0 4px 4px rgba(0,0,0,0.06);
  }
  .boxshadow-medium {
    box-shadow: 0 4px 8px rgba(0,0,0,0.06);
  }
  .boxshadow-huge {
    box-shadow: 0 8px 8px rgba(0,0,0,0.16);
  }



  .spacing-light {
    box-shadow: 0 4px 4px rgba(0,0,0,0.06);
  }
  .boxshadow-medium {
    box-shadow: 0 4px 8px rgba(0,0,0,0.06);
  }
  .boxshadow-huge {
    box-shadow: 0 8px 8px rgba(0,0,0,0.16);
  }



  .typography-heading {
    font: 32px Georgia;
  }
  .typography-copy{
    font: 16px Georgia;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .typography-accent {
    display: table;
    padding: 0 10px;
    font: 15px/30px Arial;
    color: #fff;
    font-weight: bold;
    background: rgba(131,58,180,.5);
    font-variant: small-caps;
  }

  .spacing-compact {
    padding: 5px;
  }
  .spacing-regular {
    padding: 10px;
  }
  .spacing-large {
    padding: 20px;
    margin: 20px 0 ;
  }

  .tag.tag.tag.tag.tag {
    display: inline-block;
    margin: 0 30px 10px -20px;
    background: rgba(150,100,50,0.3);
    border-radiis: 2px;
    padding: 0 10px;
    border-radius: 2px;
  }

  a:not(.tag) {
    text-decoration: underline;
  }
    `,
    variants: SEED_VARIANTS,
    isHiddenDisplayed: true,
    isDataDisplayed: true,
    isDataRepeated: true,
    hasData: true,
    hasRepeating: true,
    previewBreakpointId: null,
    componentId: null,
    document: initialDocument
}

interface moveVariant {
    before: string,
    variant: string
}
export const builderSlice = createSlice({
    name: 'builder',
    initialState,
    reducers: {
        moveVariant: (state, action: PayloadAction<moveVariant>) => {
            const variant = state.variants.find((v) => v.id == action.payload.variant);
            const newVariants = state.variants.filter((v) => v != variant);
            const index = action.payload.before ? newVariants.findIndex((v) => v.id == action.payload.before) : newVariants.length
            newVariants.splice(index, 0, variant);
            state.variants = newVariants;
        },
        deleteVariant: (state, action: PayloadAction<string>) => {
            state.variants.find((v) => v.id == action.payload).isDeleted = true;
        },
        restoreVariant: (state, action: PayloadAction<string>) => {
            state.variants.find((v) => v.id == action.payload).isDeleted = false;
        },
        duplicateVariant: (state, action: PayloadAction<string>) => {
            const oldVariant = state.variants.find((variant) => variant.id == action.payload);
            const index = state.variants.indexOf(oldVariant);
            const newVariant = JSON.parse(JSON.stringify(oldVariant));
            newVariant.id = String(Math.random());
            state.variants.splice(index + 1, 0, newVariant)
        },
        addVariant: (state) => {
            state.variants.push({
                id: String(Math.random()),
                name: 'Name of a new variant',
                state: 'new',
                isDeleted: false,
                isValid: true,
                content: ''
            })
        },
        setStatus: (state, action: PayloadAction<EditorStatus>) => {
            state.status = action.payload
        },
        setFocusedEditableName: (state, action: PayloadAction<string>) => {
            state.focusedEditableName = action.payload
        },
        setContextEditableName: (state, action: PayloadAction<string>) => {
            state.contextEditableName = action.payload
        },
        setIsFocused: (state, action: PayloadAction<boolean>) => {
            state.isFocused = action.payload;
        },
        setContextPath: (state, action: PayloadAction<number[]>) => {
            state.contextPath = action.payload;
        },
        setDocumentVersion: (state, action: PayloadAction<number|undefined>) => {
            state.structureChangeCount ++;
        },
        setDataRepeated: (state, action: PayloadAction<boolean>) => {
            state.isDataRepeated = action.payload;
        },
        setDataDisplayed: (state, action: PayloadAction<boolean>) => {
            state.isDataDisplayed = action.payload;
        },
        setHiddenDisplayed: (state, action: PayloadAction<boolean>) => {
            state.isHiddenDisplayed = action.payload;
        },
        setPreviewBreakpoint: (state, action: PayloadAction<string | null>) => {
            state.previewBreakpointId = action.payload;
        },
        // Load a component's saved draft (or the starter content) before the editor starts.
        loadComponent: (state, action: PayloadAction<{ id: string, variants: ComponentVariant[], savedAt: string | null, published: PublishedInfo | null }>) => {
            const { id, variants, savedAt, published } = action.payload;
            state.componentId = id;
            state.variants = variants;
            state.status = 'unloaded';
            state.document = documentReducer(state.document, {
                type: 'LOADED',
                savedAt,
                saved: variantFingerprints(variants),
                published,
            });
        },
        // Every save/publish change goes through the document state machine.
        documentEvent: (state, action: PayloadAction<DocumentEvent>) => {
            state.document = documentReducer(state.document, action.payload);
        }
    },
    extraReducers: (builder) => {
    },
})
export const {
    moveVariant,
    deleteVariant,
    restoreVariant,
    duplicateVariant,
    addVariant,
    setStatus,
    setFocusedEditableName,
    setIsFocused,
    setContextPath,
    setContextEditableName,
    setDocumentVersion,
    setDataRepeated,
    setDataDisplayed,
    setHiddenDisplayed,
    setPreviewBreakpoint,
    loadComponent,
    documentEvent
} = builderSlice.actions;

export default builderSlice.reducer;