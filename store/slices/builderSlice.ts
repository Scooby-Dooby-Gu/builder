import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { ComponentVariant } from 'models/builder';



type BuilderState = {
    contextPath: Number[] | null;
    status: string;
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
    previewBreakpointId: string | null
}


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
    variants: [
        {
            id: '0',
            isDeleted: false,
            isValid: true,
            state: 'published',
            name: 'Example of empty variant and its name is so long it doesnt fit. Just too long!',
            content: '',
        },
        {
            id: '1',
            name: 'Simple flat variant',
            isDeleted: false,
            isValid: true,
            state: 'published',
            content: `<h1>Hello world</h1>
            <p>Just a simple text here. But also variable <var data-path="0.broken_path" data-path-placeholder="Product.Title"></var>. That is tricky. Should DOM root elements attributes be converted to the view and, possibly, to model? On the one hand attributes like contenteditable should be, to init editor in the read only mode if the value of the contenteditable is false. On the other hand, there will be some  related attributes, like styles, which should not be converted to view. Note that there is no way to filter these attributes in the DOM - View conversion.</p>
            <figure class="image">
              <img src="https://www.robin-noorda.com/uploads/1/6/8/3/16830688/9466078_orig.jpg" />
            </figure>`
        },
        {
            id: '3',
            name: 'Variant with data mapping',
            isDeleted: false,
            isValid: true,
            state: 'draft',
            content:`<h2>Repeating product list</h2>
            <div class="container">
                <div class="container" style="border: 2px solid orange" data-path-scope="0.store.books.*">
                    <figure class="image image-style-side">
                        <img data-path-src="0.store.books.*.image" src="https://www.robin-noorda.com/uploads/1/6/8/3/16830688/9466078_orig.jpg" />
                    </figure>
                    <h2><var data-path="0.store.books.*.title" data-path-placeholder="Product name"></var></h2>
                    <ul>
                        <li data-path-scope="0.store.books.*.tags.*" class="tag">
                          <var data-path="0.store.books.*.tags.*" data-path-placeholder="Tag"></var>
                        </li>
                    </ul>
                    <p>$<var data-path="0.store.books.*.price" data-path-placeholder="Price"></var>
                       by <em><var data-path="0.store.books.*.author.name" data-path-placeholder="Author"></var></em>
                    </p>
                    <p>Has <strong><var data-path="0.store.books.*.reviews.length" data-path-placeholder="Count"></var></strong>&nbsp;reviews</p>
                    <div class="container" style="border-top: 1px solid dotted" data-path-scope="0.store.books.*.reviews.*">
                      <h3><var data-path="0.store.books.*.reviews.*.user" data-path-placeholder="User name"></var></h3>
                      <p><var data-path="0.store.books.*.reviews.*.comment" data-path-placeholder="Comment"></var></p>
                    <div>
                </div>
            </div>`
        },
        {
            id: '2',
            name: 'Variant with a container',
            isDeleted: false,
            isValid: true,
            state: 'draft',
            content:`<h2>How about some container?</h2>
            <div class="container" style="border: 2px solid orange">
              <p>Yeah <i>why not? This one has custom padding and border.</i></p>
              <blockquote>
                <p>The path is in the way. <var data-path="0.broken_path">Product.Title</var></p>
                <strong>Nice little quote</strong>
              </blockquote>
            </div>`
        }
    ],
    isHiddenDisplayed: true,
    isDataDisplayed: true,
    isDataRepeated: true,
    hasData: true,
    hasRepeating: true,
    previewBreakpointId: null
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
        setStatus: (state, action: PayloadAction<string>) => {
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
    setPreviewBreakpoint
} = builderSlice.actions;

export default builderSlice.reducer;