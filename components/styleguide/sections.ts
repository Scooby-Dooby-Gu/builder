import {
    mdiArrowExpandHorizontal,
    mdiCardOutline,
    mdiCodeBraces,
    mdiFormatFont,
    mdiFormatSize,
    mdiGestureTapButton,
    mdiLinkVariant,
    mdiMonitorCellphone,
    mdiPalette,
    mdiPaletteSwatchOutline,
} from "@mdi/js";

export type SectionId = "colors" | "fonts" | "spacing" | "breakpoints" | "text" | "buttons" | "links" | "cards" | "themes" | "css";

export interface SectionInfo {
    id: SectionId,
    label: string,
    icon: string,
    description: string,
}

export interface Layer {
    id: string,
    label: string,
    hint: string,
    sections: SectionInfo[],
}

export const LAYERS: Layer[] = [
    {
        id: "primitives",
        label: "Primitives",
        hint: "Raw values everything else is built from.",
        sections: [
            {id: "colors", label: "Colors", icon: mdiPalette, description: "The palette. Text styles and elements pick their colors from here."},
            {id: "fonts", label: "Fonts", icon: mdiFormatFont, description: "Font families, loaded from Google Fonts or the system."},
            {id: "spacing", label: "Spacing & radii", icon: mdiArrowExpandHorizontal, description: "Scales for padding and corner rounding, used by elements."},
            {id: "breakpoints", label: "Breakpoints", icon: mdiMonitorCellphone, description: "Screen widths where layouts change. Text styles can resize at each one, and the builder previews components at these widths."},
        ],
    },
    {
        id: "presets",
        label: "Presets",
        hint: "Combinations of primitives, reused by elements.",
        sections: [
            {id: "text", label: "Text styles", icon: mdiFormatSize, description: "A font, size, weight, line height and color, saved as one reusable style."},
        ],
    },
    {
        id: "elements",
        label: "Elements",
        hint: "Real UI pieces composed from presets and primitives.",
        sections: [
            {id: "buttons", label: "Buttons", icon: mdiGestureTapButton, description: "Button variants built from a text style, colors, a radius and padding."},
            {id: "links", label: "Links", icon: mdiLinkVariant, description: "Inline link styles with their hover state."},
            {id: "cards", label: "Cards", icon: mdiCardOutline, description: "Containers with a surface, border, radius and shadow, plus title and body text styles."},
        ],
    },
    {
        id: "themes",
        label: "Themes",
        hint: "Everything combined into a look you apply to a component.",
        sections: [
            {id: "themes", label: "Themes", icon: mdiPaletteSwatchOutline, description: "A complete look built from the layers below. Apply a theme to a component in the builder to style all of it."},
        ],
    },
    {
        id: "output",
        label: "Output",
        hint: "",
        sections: [
            {id: "css", label: "CSS", icon: mdiCodeBraces, description: "The stylesheet generated from everything above, as CSS variables and classes."},
        ],
    },
];

export const SECTIONS: SectionInfo[] = LAYERS.flatMap(layer => layer.sections);

export function layerOf(sectionId: SectionId) {
    return LAYERS.find(layer => layer.sections.some(s => s.id === sectionId));
}
