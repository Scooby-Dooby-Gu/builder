import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {mdiFormatLetterCase, mdiMonitorCellphone, mdiPalette} from "@mdi/js";
import {v4 as uuidv4} from 'uuid';

export enum GroupsTitles {
    STYLES = "styles"
}

export enum SectionsTitles {
    FONT = "fonts",
    BREAKPOINT = "breakpoints",
    TYPOGRAPHY = "typography",
    COLORS = "colors"
}

export interface Group {
    title: string,
    sections: Section[]
}

export interface Section {
    title: string,
    icon: any,
    description: string
}

export interface StyleGuideState {
    fonts: Font[],
    colors: Color[],
    groups: Group[],
    activeSection: Section | null,
}

export const initialFont: Font = {
    title: "",
    active: false,
    description: "",
    preview: "",
    name: "",
    id: ""
}

export interface Font {
    title: string,
    active: boolean,
    id: string,
    description: string,
    preview: string,
    name: string
}

export const initialColor: Color = {
    colors: [],
    title: "",
    active: false,
    description: "",
    preview: "",
    name: "",
    id: ""
}

export interface Color {
    colors: string[],
    title: string,
    active: boolean,
    id: string,
    description: string,
    preview: string,
    name: string
}

const initialState: StyleGuideState = {
    fonts: [],
    colors: [],
    activeSection: {title: "", description: "", icon: ""},
    groups: [
        {
            title: GroupsTitles.STYLES,
            sections: [
                {
                    title: SectionsTitles.FONT,
                    icon: mdiFormatLetterCase,
                    description: "Google font + custom css"
                },
                {
                    title: SectionsTitles.COLORS,
                    icon: mdiPalette,
                    description: "Good colors"
                }
            ]
        },
        {
            title: "PRESETS",
            sections: [
                {
                    title: SectionsTitles.TYPOGRAPHY,
                    icon: mdiFormatLetterCase,
                    description: "Good typography"
                }
            ]
        }
    ]
}

export const styleGuideSlice = createSlice({
    name: 'styles',
    initialState,
    reducers: {
        setFonts: (state, action) => {
            state.fonts = action.payload;
        },
        setColors: (state, action) => {
            state.colors = action.payload;
        },
        setActiveSection: (state, action) => {
            state.activeSection = action.payload;
        },
        createFont: (state) => {
            state.fonts.push({...initialFont, id: uuidv4()});
        },
        saveFont: (state, action) => {
            state.fonts.forEach((font, i) => {
                if (font.id === action.payload.id) {
                    state.fonts[i] = {...state.fonts[i], ...action.payload};
                }
            })
        },
        toggleActive: (state, action: PayloadAction<{ type: string, id: string }>) => {
            const {type, id} = action.payload;

            state[type].forEach(item => {
                if (item.id === id) {
                    item.active = !item.active;
                }
            })
        }
    }
});

export const {
    setActiveSection,
    toggleActive,
    createFont,
    saveFont,
    setFonts,
    setColors
} = styleGuideSlice.actions;

export default styleGuideSlice.reducer;